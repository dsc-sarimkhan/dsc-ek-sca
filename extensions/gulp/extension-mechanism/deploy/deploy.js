/*jshint esversion: 6 */

var async = require('ns-async')
,	fs = require('fs')
,	{log, colorText, color} = require('ns-logs')
,	PluginError = require('../CustomError')
,	path = require('path')
,	configs = require('../configurations').getConfigs()
,	gulp = require('gulp')
,	glob = require('glob').sync
,	map = require('map-stream')
,	ns = require('../../ns-deploy')
,   deployHelper = require('./deploy-task-helper')
,	_ = require('underscore');

var credentials_inquirer = require('../credentials-inquirer')
    ,	extension_record_helper = require('../extension-record-helper.js')
    ,	skins_record_helper = require('../skin-record-helper.js')
    ,	extension_deploy_inquirer = require('./deploy-inquirer.js')
    ,	prepare_deploy_folder = require('./prepare-deploy-folder.js')
    ,	ConversionTool = require('../conversion-tool');

var extension_deployer = {

    deploy: function deploy(done)
    {
        var manifest_path,
            manifest;

        const passInitialData = function passInitialData(first_cb)
        {
            if(!configs.extensionMode)
            {
                if(manifest.type !== 'theme')
                {
                    first_cb(new Error('Manifest type for theme ' + manifest.name + '-' + manifest.version +
                        ' is not valid. Type must be "extension".'));
                }
            }
            if(!extension_deploy_inquirer.validateExtensionName(manifest.name))
            {
                return first_cb(new Error('Manifest name "' + manifest.name + '" must include only alphanumeric characters, underscores and must start with an alphabetic character.'));
            }

            first_cb(null, {manifest: manifest, manifest_path: manifest_path});
        };

        var waterfall = [
            passInitialData
            ,	credentials_inquirer.getCredentials
            ,	extension_record_helper.checkExtensionBundle
            ,	extension_deploy_inquirer.inquireNewExtensionData
            ,   extension_deployer.getUploaderManifest
            ,	prepare_deploy_folder.prepareDeployFolder
            ,	extension_record_helper.checkExistingExtension
            ,	extension_deployer.uploadExtension
            ,	extension_deployer.getManifestFileId
            ,	extension_record_helper.updateExtensionRecord
            ,	extension_deployer.openActivationWizard
            ,	extension_deployer.updateLocalEnvironment
        ];

        //in extension mode the manifest is the manifest of the extension selected
        if(configs.extensionMode)
        {
            waterfall.splice( 0, 1, extension_deploy_inquirer.inquireDeployExtension);
        }
        else
        {
            //after update theme record update skins records
            manifest_path = path.join(configs.folders.theme_path, 'manifest.json');
            manifest = JSON.parse(fs.readFileSync(manifest_path).toString());
            waterfall.splice( waterfall.length - 2, 0, skins_record_helper.syncSkinsRecords);
        }

        //result contains the credentials and application_manifest
        async.waterfall(waterfall, function (err)
        {
            if (err)
            {
                var error = (err.error && err.error.message) || err;

                if(error === 'ETIMEDOUT')
                {
                    error = 'Network Error. Please check your Internet Connection.';
                }

                var task_name = configs.extensionMode ? 'extension:deploy' : 'theme:deploy';

                done(new PluginError('gulp ' + task_name, error));
                return;
            }

            done(null, {});
            return;
        });
    },

    getUploaderManifest: function(data, cb){
        const {script, deploy } = configs.services.DEPLOY_SERVICE;
        const options = configs.credentials;
        options.script = script;
        options.deploy = deploy;
        options.target_folder = {
            parentId: configs.folders.extmech_parent,
            folderName: configs.folders.extensions_dest_name
        };
        ns.getUploaderManifest({ info: options }, (error, result) => {
            if(error) {
                return cb(error);
            }

            data.uploadManifest = result.uploadManifest;
            cb(null, data);
        });
    },

    uploadExtension: function uploadExtension(data, cb)
    {
        const credentials = configs.credentials;
        const file = credentials_inquirer.nsdeploy_path;
        const files = [];

        const {script, deploy } = configs.services.DEPLOY_SERVICE;

        const deployPath = path.join(process.gulp_init_cwd, configs.folders.deploy);
        const toDeploy = glob(deployPath + '/**/*.*', { nodir: true });
        const chunk = configs.deploy_config.chunk_size || 100;

        for (let i = 0; i < toDeploy.length; i += chunk) {
            files.push(toDeploy.slice(i, i + chunk));
        }

        const tasks = files.map((page, index) => {
            return function(cb)
            {
                const options = {};
                options.chunksTotal = files.length;
                options.chunksNumber = index + 1;
                options.credentials = credentials;
                options.file = file;
                options.scriptId = script;
                options.deployId = deploy;
                options.publicList = [];
                options.backup = false;
                options.target_folder = {
                    parentId: configs.folders.extmech_parent,
                    folderName: configs.folders.extensions_dest_name
                };

                let deployResult;

                return gulp.src(page, {allowEmpty: true, base: deployPath})
                    .pipe(ns.deploy(options))
                    .pipe(
                        map((data, cb) => {
                            if(data.files){
                                deployResult = data;
                            }
                            cb(null, data);
                        })
                    )
                    .on('error', cb)
                    .on('end', () => {
                        cb(null, deployResult);
                    });
            };
        });

        async.series(tasks, (err, deployData) => {
            data.result = { files: [] };
            deployData.forEach(deploy => {
                data.result.files = [...data.result.files, ...deploy.files];
            });

            cb(null, data);
        });
    },

    getManifestFileId: function getManifestFileId(data, cb)
    {
        const { new_manifest } = data;

        log(colorText(color.GREEN, `Getting manifest file id for ${new_manifest.type} ...`));

        const manifestPath = [
            '',
            new_manifest.vendor,
            `${new_manifest.name}@${new_manifest.version}`,
            'manifest.json'
        ].join(path.sep);

        data.result = data.result || {};
        const remoteManifest = _.find(data.result.files || [], function(filepath){return filepath.path.replace('/\\', path.sep) === manifestPath;});

        if(!remoteManifest || !remoteManifest.id){
            cb(new Error(`Could not find new manifest.json uploaded in folder ${manifestPath}`));
            return;
        }

        data.manifest_file_id = remoteManifest.id;
        cb(null, data);
    },

    updateLocalEnvironment: function updateLocalEnvironment(data, cb)
    {
        log(colorText(color.GREEN, `Updating your local environment to continue working with ${data.new_manifest.name}/${data.new_manifest.version}`));

        fs.writeFileSync(data.manifest_path, JSON.stringify(data.new_manifest, null, 4));

        if(data.new_manifest.name !== data.manifest.name)
        {
            var ext_folder = configs.extensionMode ? data.ext_folder : configs.folders.theme_path;

            deployHelper.copyDir(ext_folder, path.join(configs.folders.source.source_path, data.new_manifest.name));
            fs.rmdirSync(ext_folder, { recursive: true });

            if(configs.extensionMode)
            {
                ConversionTool.updateConfigPaths(data.new_manifest,
                    {
                        replace: true
                        ,	replace_path: configs.folders.source.source_path + '/' + data.manifest.name
                    });
            }
            else
            {
                ConversionTool.updateConfigPaths(data.new_manifest);
            }
        }

        cb(null, data);
    },

    openActivationWizard: function openActivationWizard(data, cb)
    {
        // recommends the user to open a browser to finish activation
        var credentials = configs.credentials;
        var domain = credentials.domain || '';
        var deploy_path = 'SuiteScripts/Deploy_Extensions/' + data.new_manifest.vendor + '/' + data.new_manifest.name + '@' + data.new_manifest.version;

        if(data.new_manifest.cct && configs.deploy_config.create)
        {
            var cct = data.new_manifest.cct[data.new_manifest.cct.length -1];

            log(colorText(color.GREEN, 'Finished deploying your Custom Content Type.'));
            log(colorText(color.GREEN, 'To see your CCT in the SMT Panel, you will need to:'));

            log(
                colorText(color.GREEN, '\n\t1- ') + 'Go to Customization -> List,Records & Fields -> Record Types -> New.\n' +
                colorText(color.GREEN, '\t2- ')+ 'Create a custom record with id ' + colorText(color.GREEN,cct.settings_record)+ ' with ACCESS TYPE field set to "No permission required".\n' +
                colorText(color.GREEN, '\t3- ')+ 'Add all the fields your CCT will need.\n' +
                colorText(color.GREEN, '\t4- ')+ 'Go to Lists -> Website -> CMS Content Type -> New.\n' +
                colorText(color.GREEN, '\t5- ')+ 'Create a new CMS Content Type with name ' + colorText(color.GREEN, cct.registercct_id)+ '\n\tand linked it to the custom record you created in the previous steps.\n' +
                colorText(color.GREEN, '\t6- ')+ 'Set the ICON IMAGE PATH field to the absolute url of the icon deployed in: \n\t"' + deploy_path + '/assets/' + cct.icon + '".\n' +
                colorText(color.GREEN, '\t7- ')+ 'Activate the extension for your domain as explained below.\n' +
                colorText(color.GREEN, '\t8- ')+ 'Go to the site, press ESC to go to the SMT Panel, and check that your CCT was added correctly.\n'
            );
        }

        log(
            colorText(color.YELLOW, '\n\n                             IMPORTANT NOTE:                             ' +
                '\n\nThe deploy process is not done until you finished the activation process in the Netsuite ERP.' +
                '\nGo to system.netsuite.com and open the Extension Management Panel in Setup > SuiteCommerce Advanced > Extension Management.' +
                '\n\nPlase follow the next steps:' +
                '\n1- Select Website and domain ' + domain +
                '\n2- Activate the ' + data.new_manifest.type + ': ' + data.new_manifest.name + ' - ' + data.new_manifest.version + '. Vendor ' + data.new_manifest.vendor + '.'+
                '\nThank you.'));
        cb(null, data);
    }
};

module.exports = {
    deploy: extension_deployer.deploy
};
