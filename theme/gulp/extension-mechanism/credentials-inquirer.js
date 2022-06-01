/*jshint esversion: 6 */
/* jshint node: true */
/*
	@module credentials_inquirer

	Deals with all the details of getting the credentials from the user to deploy,
	also all the details to get the activation data: domain, subsidiary location and the app_manifest.json file.
*/

const async = require('async');
const fs = require('fs');
const log = require('ns-logs');
const c = require('ansi-colors');
const PluginError = require('../extension-mechanism/CustomError');
const  inquirer = require('inquirer');
const path = require('path');
const _ = require('underscore');

var deploy_task = require('../ns-deploy/index')
    ,	ui = require('../ns-deploy/ui')
    ,	net = require('../ns-deploy/net')
    ,	WebsiteService = require('./website-service');

var configurations = require('./configurations');
var configs = configurations.getConfigs();

var application_manifest_path = path.join(configs.folders.application_manifest, 'application_manifest.json')
    , 	nsdeploy_path = configs.nsdeployPath;

//the only way to identify if we need to ask for subsidiary and location
const SCIS_NAME = 'SCIS';

function alphabeticSort(a, b)
{
    return a.name.localeCompare(b.name);
}

var credentials_inquirer = {

    nsdeploy_path: nsdeploy_path,

    /*
        @method writeCredentials writes the usual deploy credentials in the file .nsdeploy
        and the application manifest and other configuration data relevant to the extension mechanism
        inside the extension_mechanism folder.
    */
    writeCredentials: function writeCredentials(fetch_data, cb)
    {
        var credentials_to_save = _.extend({}, fetch_data.credentials);

        fs.writeFileSync(nsdeploy_path, JSON.stringify({credentials: credentials_to_save }, null, 4));

        configs.credentials = fetch_data.credentials;

        if(fetch_data.application_manifest)
        {
            configs.application.application_manifest = fetch_data.application_manifest;
        }

        cb(null, fetch_data);
    },

    writeApplicationManifest: function writeApplicationManifest()
    {
        fs.writeFileSync(application_manifest_path, JSON.stringify(configs.application.application_manifest, null, 4));
    },
    /*
        @method getCredentials gets all the credentials of the account, password, ssp application folder
        website, and domain and also the application manifest
    */

    getCredentials: function getCredentials(fetch_data, done)
    {
        if(fs.existsSync(application_manifest_path))
        {
            try
            {
                configs.application.application_manifest = JSON.parse(fs.readFileSync(application_manifest_path).toString());
            }
            catch(error)
            {
                configs.application.application_manifest = null;
            }
        }

        var credentials = configs.credentials
            ,	application_manifest = configs.application.application_manifest;

        if(!credentials || !credentials.user_agent)
        {
            var package_json = JSON.parse(fs.readFileSync('./package.json'))
                ,   extensionMode = configs.extensionMode;

            if(!extensionMode){
                package_json.name = package_json.name.replace('extension', 'theme');
            }

            var user_agent = package_json.name + '/' + package_json.version;

            credentials = credentials || {};
            credentials.user_agent = user_agent;
        }

        function handleResult(err, result)
        {
            if (err)
            {
                var error = (err.error && err.error.message) || err;

                if(error === 'ETIMEDOUT')
                {
                    error = 'Network Error. Please check your Internet Connection.';
                }

                var task_name = configs.extensionMode ? 'extension:fetch' : 'theme:fetch';
                done(new PluginError('gulp ' + task_name + ' getCredentials', error));
                return;
            }

            done(null, result);
        }

        const isDomainNeeded = ['extension:deploy', 'theme:deploy'].indexOf(process.argv[2]) >= 0 || credentials.domain;

        if (!configs.ask_credentials &&
            credentials && isDomainNeeded &&
            application_manifest)
        {
            if(!credentials.authID)
            {
                async.waterfall([
                        function passInitialData(first_cb)
                        {
                            var initial_data = {
                                options: {
                                    molecule: credentials.molecule
                                }
                                ,   info: { user_agent: credentials.user_agent }
                                ,   credentials: credentials
                            };

                            if(fetch_data)
                            {
                                initial_data = _.extend(initial_data, fetch_data);
                            }

                            first_cb(null, initial_data);
                        }
                        ,	ui.selectToken
                        ,	credentials_inquirer.transformCredentials
                        ,	credentials_inquirer.writeCredentials
                    ]

                    ,	handleResult
                );
            }
            else
            {
                async.waterfall([
                        function passInitialData(first_cb)
                        {
                            var initial_data = {
                                options: {
                                    molecule: credentials.molecule
                                },
                                info: {
                                    authID: credentials.authID,
                                    key: configs.key,
                                    secret: configs.secret,
                                    user_agent: credentials.user_agent
                                }
                                ,   credentials: credentials
                            };

                            if(fetch_data)
                            {
                                initial_data = _.extend(initial_data, fetch_data);
                            }

                            first_cb(null, initial_data);
                        }
                        ,	credentials_inquirer.transformCredentials
                        ,	credentials_inquirer.writeCredentials
                    ]

                    ,	handleResult
                );
            }
        }
        else
        {
            var waterfall = [
                function passInitialData(first_cb)
                {
                    var initial_data =  {
                        credentials: credentials || {}
                        ,	application_manifest: application_manifest || {}
                        ,	info: {user_agent: credentials.user_agent, authID: credentials.authID, key: configs.key, secret: configs.secret}
                        ,	options: {molecule: credentials && credentials.molecule}
                    };

                    if(fetch_data)
                    {
                        initial_data = _.extend(initial_data, fetch_data);
                    }

                    first_cb(null, initial_data);
                },
                ui.selectToken,
                net.authorize,
                credentials_inquirer.doUntilGetWebsiteAndDomain,
                credentials_inquirer.writeCredentials,
            ];

            //result contains the credentials and application_manifest
            async.waterfall(
                waterfall
                ,	handleResult
            );
        }
    },

    transformCredentials: function transformCredentials(fetch_data, cb)
    {
        if(fetch_data.credentials)
        {
            _.extend(fetch_data.credentials, fetch_data.info);
            configs.credentials = fetch_data.credentials;
        }

        delete fetch_data.info;
        delete fetch_data.options;

        cb(null, fetch_data);
    },

    doUntilGetWebsiteAndDomain: function doUntilGetWebsiteAndDomain(fetch_data, cb)
    {

        var credentials_tasks = [
            async.apply(credentials_inquirer.transformCredentials, fetch_data),
            WebsiteService.getWebsites,
            WebsiteService.getWebsiteDomains,
            credentials_inquirer.selectWebsite
        ];

        //do not ask all the activation data if just deploying
        if (['extension:deploy', 'theme:deploy'].indexOf(process.argv[2]) < 0)
        {
            credentials_tasks = credentials_tasks.concat(
                [
                    credentials_inquirer.selectDomain
                    ,	credentials_inquirer.selectSubsidiary
                    ,	credentials_inquirer.selectLocation
                ]
            );
        }

        async.waterfall(
            credentials_tasks
            ,	function(err)
            {
                if (err)
                {
                    cb(err);
                    return;
                }

                cb(null, fetch_data);
            }
        );

    },

    selectWebsite: function selectWebsite(fetch_data, cb)
    {
        if(!fetch_data.websites)
        {
            cb(new Error('You must have installed in your account the Extension Mechanism Bundle.\nError trying to request available websites and domains.'));
        }
        else
        {
            inquirer.prompt([{
                type: 'list'
                ,	name: 'website'
                ,	message: 'Choose your website'
                ,	choices: _.map(fetch_data.websites, (ws) =>
                {
                    return {
                        name: ws.name
                        ,	value: ws.website_id
                    };

                }).sort(alphabeticSort)
            }])
                .then((answers) =>
                {
                    fetch_data.credentials.website = answers.website;
                    cb(null, fetch_data);
                });
        }
    },

    selectDomain: function selectDomain(fetch_data, cb)
    {
        var domains = fetch_data.websites[fetch_data.credentials.website].domains;

        log(c.yellow('Select the correct options to identify the corresponding activation...'));

        inquirer.prompt([{
            type: 'list'
            ,	name: 'domain'
            ,	message: 'Choose your domain'
            ,	choices: domains.map(function(domain)
            {
                return {
                    name: domain.domain
                    ,	value: domain.domain
                };
            }).sort(alphabeticSort)
        }])
            .then((answers) =>
            {
                fetch_data.credentials.domain = answers.domain;
                var domain_data = _.find(domains, function(data)
                {
                    return data.domain === fetch_data.credentials.domain;
                });

                fetch_data.credentials.webapp_id = domain_data.app_id;
                fetch_data.credentials.ssp_folder = domain_data.folder_id;
                fetch_data.application_manifest = domain_data.manifest;

                fetch_data.credentials.is_scis = fetch_data.application_manifest.type === SCIS_NAME;
                cb(null, fetch_data);
            });
    },

    selectSubsidiary: function selectSubsidiary(fetch_data, cb)
    {
        var subsidiaries = fetch_data.websites[fetch_data.credentials.website].subsidiaries,
            all_sub_choice = {
                name: 'All the subsidiaries',
                value: null
            };

        if(fetch_data.credentials.is_scis)
        {
            inquirer.prompt([{
                type: 'list',
                name: 'subsidiary',
                message: 'Choose the subsidiary',
                choices: [all_sub_choice]
                    .concat(
                        _.map(subsidiaries, (sub) =>
                        {
                            return {
                                name: sub.subsidiary_name,
                                value: sub.subsidiary_id
                            };

                        })
                    )
            }])
                .then((answers) =>
                {
                    fetch_data.credentials.subsidiary = answers.subsidiary;
                    fetch_data.credentials.location = null;
                    cb(null, fetch_data);
                });
        }
        else
        {
            cb(null, fetch_data);
        }
    },

    selectLocation: function selectLocation(fetch_data, cb)
    {
        var all_locations_choice = {
            name: 'All the locations of the subsidiary',
            value: null
        };

        if(fetch_data.credentials.is_scis && fetch_data.credentials.subsidiary)
        {
            WebsiteService.getSubsidiaryLocations(fetch_data)
                .then(() =>
                {
                    return inquirer.prompt([{
                        type: 'list',
                        name: 'location',
                        message: 'Choose the location',
                        choices: [all_locations_choice]
                            .concat(
                                _.map(fetch_data.locations, (loc) =>
                                {
                                    return {
                                        name: loc.location_name,
                                        value: loc.location_id
                                    };

                                })
                            )
                    }]);
                })
                .then((answers)=>{

                    fetch_data.credentials.location = answers.location;
                    cb(null, fetch_data);
                })
                .catch((error) => cb(error));
        }
        else
        {
            cb(null, fetch_data);
        }
    }
};

module.exports  = credentials_inquirer;
