"use strict";
/* jshint node: true */
/* jshint esversion: 6 */
var request = require('request');
var through = require('through2');
var Progress = require('progress');
var path = require('path');
var Spinner = require('cli-spinner').Spinner;
var fs = require('fs');
var url = require('url');
var args = require('yargs').argv;
var Uploader = require('ns-uploader');
var inquirer = require('inquirer');
var log = console.log;
var OAuth1 = require('oauth1').OAuth1;
var package_manager = require('../package-manager');
if (args.proxy) {
    request = request.defaults({ proxy: args.proxy });
}
var oauth1 = new OAuth1({ molecule: args.m, vm: args.vm, key: args.key, secret: args.secret });
function getAuthorizationHeader(requestConfig, authID) {
    return oauth1.restAuthorize(authID, requestConfig);
}
var net_module = {
    getConfigurationForDomain: function (deploy, cb) {
        var requestUrl = url.format({
            protocol: 'https',
            hostname: deploy.info.hostname,
            pathname: '/app/site/hosting/restlet.nl',
            query: {
                script: deploy.info.script,
                deploy: deploy.info.deploy,
                t: Date.now(),
                get: 'domain-configuration',
                website: deploy.info.website,
                domain: deploy.info.domain,
                folderId: deploy.info.target_folder
            }
        });
        getAuthorizationHeader({ method: 'GET', url: requestUrl }, deploy.info.authID).then(function (headerAuthorization) {
            request.get(requestUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: headerAuthorization
                },
                rejectUnauthorized: false
            }, function (err, request, response_body) {
                if (err) {
                    err.message = "Error in GET " + requestUrl + ": " + err.message;
                    cb(err);
                }
                else {
                    try {
                        var response = JSON.parse(response_body);
                        if (response.error) {
                            if (typeof response.error !== 'object') {
                                response.error = JSON.parse(response.error);
                            }
                            cb(new Error(response.error.message));
                        }
                        else if (!response.domainUnmanagedFolder) {
                            deploy.domainUnmanagedFolderConfigDontExists = true; // so then we know we need to save the folder in the config
                            inquirer
                                .prompt([
                                {
                                    type: 'input',
                                    name: 'domainUnmanagedFolder',
                                    message: 'Please, give a name to the folder to deploy your files',
                                    default: ("" + deploy.info.domain).replace(/\./g, '_'),
                                    validate: function (input) {
                                        if (("" + input).match(/^[\w\d_]+$/i)) {
                                            return true;
                                        }
                                        return 'Invalid folder name - can only contain ';
                                    }
                                }
                            ]).then(function (answers) {
                                deploy.info.domainUnmanagedFolder = answers.domainUnmanagedFolder;
                                cb(null, deploy);
                            });
                            // TODO: save deploy.info.domainUnmanagedFolder in back in config record
                        }
                        else {
                            deploy.info.domainUnmanagedFolder = response.domainUnmanagedFolder;
                            cb(null, deploy);
                        }
                    }
                    catch (e) {
                        cb(new Error("Error parsing response:\n" + response_body + " - " + JSON.stringify(e) + " - " + e.stack));
                    }
                }
            });
        });
    },
    writeConfig: function (deploy, cb) {
        if (!deploy.domainUnmanagedFolderConfigDontExists) {
            cb(null, deploy);
        }
        else {
            var requestUrl = url.format({
                protocol: 'https',
                hostname: deploy.info.hostname,
                pathname: '/app/site/hosting/restlet.nl',
                query: {
                    script: deploy.info.script,
                    deploy: deploy.info.deploy,
                    t: Date.now()
                }
            });
            getAuthorizationHeader({ method: 'PUT', url: requestUrl }, deploy.info.authID).then(function (headerAuthorization) {
                request.put(requestUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: headerAuthorization
                    },
                    rejectUnauthorized: false,
                    body: JSON.stringify({
                        saveConfiguration: true,
                        unmanagedResourcesFolderName: deploy.info.domainUnmanagedFolder,
                        website: deploy.info.website,
                        domain: deploy.info.domain,
                        folderId: deploy.info.target_folder
                    })
                }, function (err, request, response_body) {
                    if (err) {
                        err.message = "Error in GET " + requestUrl + ": " + err.message;
                        cb(err);
                    }
                    else {
                        try {
                            var response = JSON.parse(response_body) || {};
                            if (response.error) {
                                cb(new Error(response.error.message));
                            }
                            else {
                                cb(null, deploy);
                            }
                        }
                        catch (e) {
                            var errorMsg = "Error parsing response:\n" + response_body + " - " + JSON.stringify(e) + " - " + e.stack;
                            cb(new Error(errorMsg));
                        }
                    }
                });
            });
        }
    },
    getWebsitesAndDomains: function (deploy, cb) {
        var requestUrl = url.format({
            protocol: 'https',
            hostname: deploy.info.hostname,
            pathname: '/app/site/hosting/restlet.nl',
            query: {
                script: deploy.info.script,
                deploy: deploy.info.deploy,
                t: Date.now(),
                get: 'list-websites'
            }
        });
        getAuthorizationHeader({ method: 'GET', url: requestUrl }, deploy.info.authID).then(function (headerAuthorization) {
            request.get(requestUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: headerAuthorization
                },
                rejectUnauthorized: false
            }, function (err, request, response_body) {
                if (err) {
                    err.message = "Error in GET " + requestUrl + ": " + err.message;
                    cb(err);
                }
                else {
                    try {
                        var response = JSON.parse(response_body);
                        if (response.error) {
                            cb(new Error(response.error.message));
                        }
                        else {
                            deploy.websitesAndDomains = response;
                            cb(null, deploy);
                        }
                    }
                    catch (e) {
                        cb(new Error("Error parsing response:\n" + response_body));
                    }
                }
            });
        });
    },
    rollback: function (deploy, cb) {
        if (!deploy.rollback_revision) {
            cb(new Error('No backup selected'));
        }
        else {
            var requestUrl = url.format({
                protocol: 'https',
                hostname: deploy.info.hostname,
                pathname: '/app/site/hosting/restlet.nl',
                query: {
                    script: deploy.info.script,
                    deploy: deploy.info.deploy,
                    t: Date.now()
                }
            });
            getAuthorizationHeader({ method: 'PUT', url: requestUrl }, deploy.info.authID).then(function (headerAuthorization) {
                request.put(requestUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: headerAuthorization
                    },
                    rejectUnauthorized: false,
                    body: JSON.stringify({ rollback_to: deploy.rollback_revision.file_id })
                }, function () {
                    cb(null, deploy);
                });
            });
        }
    },
    getVersions: function (deploy, cb) {
        if (deploy.revisions) {
            cb(null, deploy);
        }
        else {
            var requestUrl = url.format({
                protocol: 'https',
                hostname: deploy.info.hostname,
                pathname: '/app/site/hosting/restlet.nl',
                query: {
                    script: deploy.info.script,
                    deploy: deploy.info.deploy,
                    t: Date.now(),
                    get: 'revisions',
                    target_folder: deploy.info.target_folder
                }
            });
            getAuthorizationHeader({ method: 'GET', url: requestUrl }, deploy.info.authID).then(function (headerAuthorization) {
                request.get(requestUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: headerAuthorization
                    },
                    rejectUnauthorized: false
                }, function (err, request, response_body) {
                    if (err) {
                        err.message = "Error in GET " + requestUrl + ": " + err.message;
                        cb(err);
                    }
                    else {
                        var response = JSON.parse(response_body);
                        if (response.error) {
                            cb(new Error(response.error.message));
                        }
                        else {
                            deploy.revisions = response;
                            cb(null, deploy);
                        }
                    }
                });
            });
        }
    },
    authorize: function (deploy, cb) {
        oauth1.issueToken(deploy.info.authID).then(function (info) {
            var account = info.account;
            deploy.info.account = account;
            if (args.vm) {
                deploy.info.hostname = args.vm.replace(/https?:\/\//, '');
            }
            else {
                var molecule = args.m ? args.m + "." : '';
                deploy.info.hostname = account + ".restlets.api." + molecule + "netsuite.com";
            }
            log('Using', "token " + deploy.info.authID + " - Account " + account + ", run with --to to change it");
            cb(null, deploy);
        });
    },
    targetFolder: function (deploy, cb) {
        if (deploy.target_folders) {
            cb(null, deploy);
        }
        else {
            var requestUrl = url.format({
                protocol: 'https',
                hostname: deploy.info.hostname,
                pathname: '/app/site/hosting/restlet.nl',
                query: {
                    script: deploy.info.script,
                    deploy: deploy.info.deploy,
                    t: Date.now(),
                    get: 'target-folders'
                }
            });
            getAuthorizationHeader({ method: 'GET', url: requestUrl }, deploy.info.authID).then(function (authHeaders) {
                request.get(requestUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authHeaders
                    },
                    rejectUnauthorized: false
                }, function (err,  response_body) {
                    if (err) {
                        err.message = "Error in GET " + requestUrl + ": " + err.message;
                        cb(err);
                    }
                    else {
                        var invalid_scriptvar_id_msg = "Please make sure the selected account/molecule have the \"" + deploy
                            .options.distroName + "\" bundle installed.";
                        try {
                            var response = JSON.parse(response_body.body || response_body);
                            if (response.error) {
                                if (response.error.code === 'SSS_INVALID_SCRIPTvar_ID') {
                                    console.log("Error: Deployment scriptvar not found, aborting. \n" + invalid_scriptvar_id_msg);
                                    process.exit(1);
                                }
                                else {
                                    if (response.error.code === 'USER_ERROR') {
                                        console.log('Please check you are pointing to the right molecule/datacenter using the -m argument.');
                                    }
                                    cb(new Error(response.error.message));
                                }
                            }
                            else {
                                deploy.target_folders = response;
                                cb(null, deploy);
                            }
                        }
                        catch (e) {
                            cb(new Error("Error parsing response:\n" + response_body + "\n\n" + invalid_scriptvar_id_msg));
                        }
                    }
                });
            });
        }
    },
    postFiles: function (deploy, cb) {
        net_module.ensureTargetFolder(deploy, function (error) {
            if (error) {
                cb(error);
            }
            if (args.useOldDeploy) {
                net_module._postFilesOld(deploy, function () {
                    cb(null, deploy); /* cb.apply(null, arguments);*/
                });
            }
            else {
                net_module._postFilesNew(deploy, function () {
                    cb(null, deploy); /* cb.apply(null, arguments);*/
                });
            }
        });
    },
    // @method ensureTargetFolder for sclite we only upload the contents of the
    // /tmp folder into the target site folder (info.target_folder). we need to:
    // 1) see if it exists
    // 2) if not, create it.
    // 3) assign info.target_folder to the target folder id.
    ensureTargetFolder: function (deploy, cb) {
        var folder_name = 'site';
        var target_folder = deploy.info.target_folder;
        if (!package_manager.distro.isSCLite && deploy.info.target_folder_ss2) {
            folder_name = deploy.info.target_folder_ss2.folder_name;
            target_folder = deploy.info.target_folder_ss2.parent_id;
        }
        var uploader = net_module.getUploader(deploy);
        var siteFolderInternalId;
        // we get or create the 'site' folder
        uploader
            .getFolderNamed(target_folder, folder_name)
            .then(function (siteFolder) {
            return new Promise(function (resolve) {
                if (!siteFolder) {
                    resolve(uploader.mkdir(target_folder, folder_name));
                }
                else {
                    resolve(siteFolder.$);
                }
            });
        })
            // we get or create the site/something folder
            .then(function (siteFolderRef) {
            siteFolderInternalId = siteFolderRef.internalId;
            if (!package_manager.distro.isSCLite) {
                return null;
            }
            return uploader.getFolderNamed(siteFolderInternalId, deploy.info.domainUnmanagedFolder, false);
        })
            .then(function (folder) {
            if (!package_manager.distro.isSCLite) {
                deploy.info.target_folder_ss2 = siteFolderInternalId;
                cb(null, deploy);
                return;
            }
            if (!folder) {
                uploader
                    .mkdir(siteFolderInternalId, deploy.info.domainUnmanagedFolder)
                    .then(function (folderRef) {
                    deploy.info.target_folder = folderRef.internalId;
                    cb(null, deploy);
                })
                    .catch(function (ex) {
                    cb(ex);
                });
            }
            else {
                deploy.info.target_folder = folder.$.internalId;
                cb(null, deploy);
            }
        })
            .catch(function (ex) {
            cb(ex);
        });
    },
    uploadBackup: function (deploy, cb) {
        var spinner = new Spinner('Uploading backup');
        spinner.start();
        net_module.uploader
            .mkdir(deploy.info.target_folder, 'backup')
            .then(function (recordRef) {
            var sourceFolderPath = path.join(package_manager.distro.folders.deploy, '_Sources');
            if (!fs.existsSync(sourceFolderPath)) {
                spinner.stop();
                cb(null, deploy);
                return;
            }
            net_module.uploader
                .main({
                targetFolderId: recordRef.internalId,
                sourceFolderPath: sourceFolderPath
            })
                .then(function () {
                spinner.stop();
                cb(null, deploy);
            })
                .catch(function (err) {
                cb(err);
            });
        })
            .catch(function (err) {
            cb(err);
        });
    },
    getUploader: function (deploy) {
        if (!net_module.uploader) {
            var credentials = {
                account: deploy.info.account,
                authID: deploy.info.authID,
                user_agent: deploy.info.user_agent || undefined,
                molecule: args.m || undefined,
                nsVersion: args.nsVersion || undefined,
                applicationId: args.applicationId || undefined,
                vm: args.vm || undefined,
                key: args.key,
                secret: args.secret
            };
            var uploader = new Uploader(credentials);
            net_module.uploader = uploader;
        }
        return net_module.uploader;
    },
    _postFilesNew: function (deploy, cb) {
        var sourceFolderPath = package_manager.distro.isSCLite
            ? path.join(package_manager.distro.folders.deploy, 'tmp')
            : package_manager.distro.folders.deploy;
        var config = {
            targetFolderId: deploy.info.target_folder,
            sourceFolderPath: sourceFolderPath,
            cleanManifest: args.cleanManifest,
            publicList: deploy.publicList
        };
        net_module.__postFilesNew(deploy, config, function () {
            var source_path = package_manager.distro.folders.deploy + "SS2";
            if (!fs.existsSync(source_path)) {
                cb(null, deploy);
                return;
            }
            var config = {
                targetFolderId: deploy.info.target_folder_ss2,
                sourceFolderPath: source_path,
                cleanManifest: args.cleanManifest,
                publicList: deploy.publicList
            };
            net_module.__postFilesNew(deploy, config, function (err) { return cb(err, deploy); });
        });
    },
    __postFilesNew: function (deploy, config, cb) {
        if (!fs.existsSync(config.sourceFolderPath)) {
            cb(null, deploy);
            return;
        }
        var uploader = net_module.getUploader(deploy);
        // progress bar and listener
        var bar;
        uploader.addProgressListener(function (actual, total) {
            if (!bar) {
                bar = new Progress('Uploading [:bar] :percent', {
                    compvare: '=',
                    incompvare: ' ',
                    width: 50,
                    total: total
                });
            }
            bar.tick(1);
        });
        var t0 = new Date().getTime();
        uploader
            .main(config)
            .then(function () {
            var took = "" + (new Date().getTime() - t0) / 1000 / 60;
            took = took.substring(0, Math.min(4, took.length)) + " minutes";
            log('Finished', "Deploy website" + (took ? ", took " + took : ''));
            uploader.progressListeners = [];
            cb(null, deploy);
        })
            .catch(function (err) {
            console.log('ERROR in deploy', err, err.stack);
            cb(err);
        });
    },
    _postFilesOld: function (deploy, cb) {
        var t0 = new Date().getTime();
        var payload_path = path.join(process.gulp_init_cwd, 'payload.json');
        fs.stat(payload_path, function (err, stat) {
            if (err) {
                return cb(err);
            }
            var spinner = new Spinner('Processing');
            var bar = new Progress('Uploading [:bar] :percent', {
                compvare: '=',
                incompvare: ' ',
                width: 50,
                total: stat.size,
                callback: function () {
                    spinner.start();
                }
            });
            var requestUrl = url.format({
                protocol: 'https',
                hostname: deploy.info.hostname,
                pathname: '/app/site/hosting/restlet.nl',
                query: {
                    script: deploy.info.script,
                    deploy: deploy.info.deploy
                }
            });
            getAuthorizationHeader({ method: 'POST', url: requestUrl }, deploy.info.authID).then(function (authHeaders) {
                fs
                    .createReadStream(payload_path)
                    .pipe(through(function (buff, type, cb2) {
                    bar.tick(buff.length);
                    this.push(buff);
                    return cb2();
                }))
                    .pipe(request.post(requestUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authHeaders
                    },
                    rejectUnauthorized: false
                }, function (err, request, response_body) {
                    try {
                        if (typeof spinner !== 'undefined') {
                            spinner.stop();
                        }
                        if (typeof process.stdout.clearLine === 'function') {
                            process.stdout.clearLine();
                        }
                        if (typeof process.stdout.cursorTo === 'function') {
                            process.stdout.cursorTo(0);
                        }
                        if (err) {
                            cb(new Error("Response error: " + err), deploy);
                        }
                        else {
                            var result = JSON.parse(response_body);
                            var took = "" + (new Date().getTime() - t0) / 1000 / 60;
                            took = took.substring(0, Math.min(4, took.length)) + " minutes";
                            cb(null, deploy);
                        }
                    }
                    catch (e) {
                        cb(new Error("Error parsing response:\n" + response_body + "\n\n" +
                            "Please make sure that:\n" +
                            "- You uploaded all files in Restlet folder to a location in your account.\n" +
                            "- You have a restlet script pointing to sca_deployer.js with id customscript_sca_deployer and deployment with id customdeploy_sca_deployer\n" +
                            "- You have set the get, post, put, devare methods to _get, _post, _put, _devare respectively in the script.\n" +
                            "- You have added the Deployment.js and FileCabinet.js scripts to the script libraries."));
                    }
                }));
            });
        });
    }
};
module.exports = net_module;