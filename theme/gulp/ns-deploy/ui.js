/* jshint node: true */
'use strict';

const inquirer = require('inquirer');
const _ = require('underscore');
const package_manager = require('../package-manager');
const log = require('fancy-log');
const c = require('ansi-colors');
const { OAuth1 } = require('oauth1');


function alphabeticSort(a, b)
{
    return a.name.localeCompare(b.name);
}

function folderInquirer(options)
{

    return function(deploy, cb)
    {
        //skip inquire if already got the information
        deploy.folder_inquirer = deploy.folder_inquirer || {};
        if (deploy.info.target_folder || deploy.folder_inquirer[options.targetName])
        {
            cb(null, deploy);
            return;
        }

        //build the goback options
        var go_back = [
            new inquirer.Separator(),
            { name: 'Go back', value: 'go_back'},
            new inquirer.Separator()
        ];

        //prompt
        inquirer.prompt([{
            type: 'list'
            ,	name: options.name
            ,	message: options.message
            ,	choices: go_back.concat(options.choices(deploy))
        }])
            .then(function(answer)
            {
                //undo previous selection and apply error
                if(answer[options.name] === 'go_back')
                {
                    options.goBackFx(deploy);
                    cb(true, deploy);
                }
                //set current selection and go
                else
                {
                    deploy.folder_inquirer[options.targetName] = answer;
                    cb(null, deploy);
                }
            });
    };
}

const ui = {

    selectToken: function(deploy, cb)
    {
        if (deploy.info.authID)
        {
            cb(null, deploy);
        }
        else
        {
            const tokens = OAuth1.getAllTokens();
            const tokenList = Object.keys(tokens).map(tokenName => ({
                name: `${tokenName} - Account ${tokens[tokenName].account}`,
                value: tokenName
            }));

            if (!tokenList.length) {
                log(c.yellow('Remember to have TOKEN-BASED AUTHENTICATION feature enabled in the target account.'));
            }

            inquirer.prompt([{
                type: 'list'
                ,	name: 'token'
                ,	default: tokenList[0]
                ,	message: 'Choose a saved token'
                ,	choices: [{value: 'newToken', name: 'New token'}, ...tokenList ]
            }]).then(answers =>
            {
                if (answers.token === 'newToken') {
                    ui.token(deploy, cb);
                } else {
                    deploy.info.authID = answers.token;
                    cb(null, deploy);
                }
            });
        }
    },

    getWebsitesAndDomains: function(deploy, cb)
    {
        if (deploy.info.website && deploy.info.domain)
        {
            cb(null, deploy);
        }
        else if(!deploy.websitesAndDomains.websites)
        {
            cb(new Error('Wrong response. Are you sure the selected account has SuiteCommerce Lite bundle installed ?'));
        }
        else
        {
            inquirer.prompt([{
                type: 'list'
                ,	name: 'website'
                ,	message: 'Choose your website'
                ,	choices: deploy.websitesAndDomains.websites.map(function(ws){return {name: ws.displayname, value: ws.id}; }).sort(alphabeticSort)
            }])
                .then(function(answers)
                {
                    deploy.info.website = answers.website;

                    var domains = _.filter(deploy.websitesAndDomains.websiteDomainData, function(data){return data.ws===deploy.info.website})

                    inquirer.prompt([{
                        type: 'list'
                        ,	name: 'domain'
                        ,	message: 'Choose your domain'
                        ,	choices: domains.map(function(domain){return {name: domain.domain, value: domain.domain}; }).sort(alphabeticSort)
                    }])
                        .then(function(answers)
                        {
                            deploy.info.domain = answers.domain;
                            var domainInfo = _.find(deploy.websitesAndDomains.websiteDomainData, function(data){return data.domain===deploy.info.domain && data.ws===deploy.info.website});
                            deploy.info.webapp = domainInfo.webapp;
                            deploy.info.target_folder = domainInfo.webappFolderId;
                            cb(null, deploy);
                        });
                });
        }
    }

    ,	rollback: function(deploy, cb)
    {
        if (deploy.rollback_revision)
        {
            cb(null, deploy);
        }
        else
        {
            var longest = 0;
            var choices = deploy.revisions
                .sort(function(a, b)
                {
                    return b.deployment_time - a.deployment_time;
                })
                .map(function(revision)
                {
                    var name = '' + new Date(revision.deployment_time).toISOString().slice(0, 19).replace('T', ' ');
                    if (revision.backup_info && revision.backup_info.tag)
                    {
                        name += ' - ' + revision.backup_info.tag;
                    }

                    longest = (longest < name.length) ? name.length : longest;
                    return {
                        name: name
                        ,	value: revision
                    };
                });

            choices.push(new inquirer.Separator(new Array( longest + 1 ).join('-')));

            inquirer.prompt([{
                type: 'list'
                ,	name: 'revision'
                ,	message: 'Choose the backup you want to rollback to'
                ,	choices: choices
            }])
                .then(function(answers)
                {
                    deploy.rollback_revision = answers.revision;
                    cb(null, deploy);
                });
        }

    },

    token: function(deploy, cb) {
        if (deploy.info.authID) {
            cb(null, deploy);
        } else {
            const promp_config = {
                type: 'input',
                name: 'authID',
                message: 'Enter an authentication ID (authID)',
                validate: function(input) {
                    return input.trim().length > 0 || 'Please enter a valid authID';
                }
            };

            inquirer.prompt([promp_config]).then(function(answers) {
                deploy.info.authID = answers.authID;
                log(c.magenta('Continue the authentication process in the prompted browser.'));
                cb(null, deploy);
            });
        }
    },

    targetHostingFolder: folderInquirer({
        name: 'hosting'
        ,	message: 'Choose your Hosting Files folder'
        ,	targetName: 'target_hosting_folder'
        ,	goBackFx: function(deploy)
        {
            deploy.info.account = undefined;
            deploy.target_folders = undefined;
        }
        ,	choices: function(deploy)
        {
            return deploy.target_folders.map(function(hosting) { return {name: hosting.name, value: hosting }; }).sort(alphabeticSort);
        }
    }),

    targetPublisherFolder: folderInquirer({
        name: 'publisher'
        ,	message: 'Choose your Application Publisher'
        ,	targetName: 'target_publisher_folder'
        ,	goBackFx: function(deploy)
        {
            deploy.folder_inquirer.target_hosting_folder = undefined;
        }
        ,	choices: function(deploy)
        {
            return deploy.folder_inquirer.target_hosting_folder.hosting.publishers.map(function(publisher) {
                return {name: publisher.name, value: publisher };
            }).sort(alphabeticSort);
        }
    }),

    targetSSPFolder: folderInquirer({
        name: 'application'
        ,	message: 'Choose your SSP Application'
        ,	targetName: 'target_folder'
        ,	goBackFx: function(deploy)
        {
            deploy.folder_inquirer.target_publisher_folder = undefined;
        }
        ,	choices: function(deploy)
        {
            var applications = deploy.folder_inquirer.target_publisher_folder.publisher.application;
            //Exclude those that its name ends with 2 and there is another one with the same name but the 2
            applications = applications.filter((application) =>
            {
                return !applications.find(app => app.name + '2' === application.name);
            });

            return applications.map((application) =>
            {
                return {name: application.name, value: application.id};
            }).sort(alphabeticSort);
        }
    }),

    backup: function(deploy, cb)
    {
        if (deploy.options.interactive)
        {
            inquirer.prompt([
                {
                    type: 'input'
                    ,	name: 'tag'
                    ,	message: 'Please, name this change'
                    ,	validate: function(input)
                    {
                        return !!input;
                    }
                }
                ,	{
                    type: 'input'
                    ,	name: 'description'
                    ,	message: 'Please enter a description for this change'
                    ,	validate: function(input)
                    {
                        return !!input;
                    }
                }
            ])
                .then(function(answers)
                {
                    deploy.backup_info = answers;
                    cb(null, deploy);
                });
        }
        else if (deploy.options && deploy.options.tag)
        {
            deploy.backup_info = {
                tag: deploy.options.tag
                ,	description: deploy.options.description
            };
            cb(null, deploy);
        }
        else
        {
            cb(null, deploy);
        }
    }

};

module.exports = ui;
