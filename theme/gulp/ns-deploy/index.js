/* jshint node: true */
/*jshint esversion: 6 */

const async = require('async');
const through = require('through');
const PluginError = require('../extension-mechanism/CustomError');
const fs = require('./fs');
const ui = require('./ui');
const net = require('./net');
const args = require('yargs').argv;

const package_manager = require('../package-manager');

const isSCIS = !package_manager.distro.isSCA && !package_manager.distro.isSCLite;

let default_info = {
    distro: package_manager.distro,
    distro_path: package_manager.env.srcDir
};

function deploy(params) {
    const files = [];
    let scriptId;
    let deployId;

    if (args.skipDeploy) {
        setTimeout(function() {
            console.log('Skipping deploy because of the --skip-deploy command line argument. ');
            process.exit(0);
        }, 5000);
    }

    if (isSCIS && args['default-deploy']) {
        scriptId = 'customscript_sca_deployer';
        deployId = 'customdeploy_sca_deployer';
    } else {
        scriptId = args.scriptId || params.scriptId || 'customscript_sca_deployer';
        deployId = args.deployId || params.deployId || 'customdeploy_sca_deployer';
    }

    default_info = {...default_info, ...params.credentials};
    default_info.script = scriptId;
    default_info.deploy = deployId;
    default_info.distroName = params.distroName;
    default_info.user_agent = params.user_agent;
    default_info.target_folder = params.target_folder;

    return through(
        // each callback
        function(file) {
            /* jshint validthis:true */
            if (file.isNull()) {
                this.emit('data', file);
            } else if (file.isStream()) {
                this.emit(
                    'error',
                    new PluginError('gulp-ns-deploy', 'Stream content is not supported')
                );
            } else if (file.isBuffer()) {
                files.push(file);
            }
        },
        // End Callback
        function() {
            const waterfall = [
                function(cb) {
                    cb(null, {
                        info: default_info,
                        options: params,
                        files: files,
                        publicList: params.publicList
                    });
                },
                fs.read,
                ui.selectToken,
                net.authorize,
                package_manager.distro.isSCLite ? doUntilGetWebsiteAndDomain : doUntilGetFolder,
                fs.write,
                ui.backup,
                net.ensureTargetFolder,
                fs.processFiles,
                net.postFiles
            ];

            // --no-backup argument has a preference over distro.json
            // setting that comes in params.backup
            if (
                (args.backup !== undefined && args.backup) ||
                (args.backup === undefined && params.backup)
            ) {
                waterfall.push(fs.processBackup);
                waterfall.push(net.uploadBackup);
            }

            /* jshint validthis:true */
            const self = this;
            async.waterfall(waterfall, function(err, data) {
                if (err) {
                    return self.emit('error', new PluginError('gulp-ns-deploy', err.message));
                }
                self.emit('data', data.result);
                self.emit('end');
            });
        }
    );
}

function getUploaderManifest(deploy, cb){
    const waterfall = [
        function(cb) {
            cb(null, deploy);
        },
        net.ensureTargetFolder,
        net.getManifest
    ];
    async.waterfall(waterfall, cb);
}

function doUntilGetWebsiteAndDomain(deploy, cb) {
    let error;

    async.doUntil(
        // repeat the following function
        function(cb_dountill) {
            async.waterfall(
                [
                    async.apply(net.getWebsitesAndDomains, deploy),
                    ui.getWebsitesAndDomains,
                    net.getConfigurationForDomain
                    // ui.getConfigurationForDomain
                ],
                function(err) {
                    error = err;
                    cb_dountill();
                }
            );
        },
        // until this function returns true
        async function() {
            if (error === null) {
                return true;
            }

            console.log(error);
            return false;
        },
        // and then invoke callback
        function() {
            cb(null, deploy);
        }
    );
}

// repeat get target folder until success
function doUntilGetFolder(deploy, cb) {
    if(deploy.info.target_folder){
        cb(null, deploy);
        return
    }

    let error;

    async.doUntil(
        // repeat the following function
        function(cb_dountill) {
            async.waterfall(
                [
                    async.apply(net.targetFolder, deploy),
                    ui.targetHostingFolder,
                    ui.targetPublisherFolder,
                    ui.targetSSPFolder
                ],
                function(err) {
                    error = err;
                    cb_dountill();
                }
            );
        },
        // until this function returns true
        async function() {
            return error === null;
        },
        // and then invoke callback
        function() {
            // map the correct folder if we came from interactive ui
            if (deploy.folder_inquirer && deploy.folder_inquirer.target_folder) {
                deploy.info.target_folder = deploy.folder_inquirer.target_folder.application;

                const publisher_apps =
                    deploy.folder_inquirer.target_publisher_folder.publisher.application;
                const folder_name = publisher_apps.find(
                    folder => deploy.info.target_folder === folder.id
                ).name;

                deploy.info.target_folder_ss2 = {
                    parent_id: deploy.folder_inquirer.target_publisher_folder.publisher.id,
                    folder_name: `${folder_name}2`
                };

                delete deploy.folder_inquirer;
            }

            cb(null, deploy);
        }
    );
}

function rollback(cb) {
    async.waterfall(
        [
            function(cb) {
                cb(null, {
                    info: default_info
                });
            },
            fs.read,
            net.targetFolder,
            ui.targetFolder,
            fs.write,
            net.getVersions,
            ui.rollback,
            net.rollback
        ],
        cb
    );
}

module.exports = {
    deploy,
    rollback,
    getUploaderManifest
};
