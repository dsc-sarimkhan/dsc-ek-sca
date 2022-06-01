const inquirer = require('inquirer');
const request = require('request');
const _ = require('underscore');
const suitetalk = require('suitetalk');

const Tool = function() {
    this.credentials = {};
    this.config = {
        startFolderId: '-100'
    };
};

module.exports = Tool;

// @module credentials-inquirer @class CredentialsInquirer
_(Tool.prototype).extend({
    // main tool

    // @method main @return {Deferred}
    main: function() {
        const self = this;
        return (
            self
                .resolvedPromise()
                // mocking data for testing
                // .then(function()
                // {
                // 	self.credentials = {"nsVersion":"2016_1","email":"s@gurin.com","password":"Test123$$$","role":{"account":{"internalId":"3690872","name":"Cabo Polonio Store - PSG_Automation"},"role":{"internalId":3,"name":"Administrator"},"dataCenterURLs":{"webservicesDomain":"https://webservices.netsuite.com","restDomain":"https://rest.netsuite.com","systemDomain":"https://system.netsuite.com"}}}
                // 	// console.log(JSON.stringify(self.credentials))
                // 	return self.resolvedPromise()
                // })
                .then(function() {
                    return self.selectFolder(self.config.startFolderId);
                })
                .then(function(selectedFolderRecord) {
                    self.credentials.selectedFolderRecord = selectedFolderRecord;
                })
        );
    },

    selectFolder: function(parentFolder) {
        const self = this;
        return self.selectOneFolder(parentFolder).then(function(folderRecord) {
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'folderAction',
                        message: `Action on selected folder (${folderRecord.name[0]})`,
                        choices: ['Select a child', 'Select this one', 'Go back']
                    }
                ])
                .then(function(answers) {
                    if (answers.folderAction === 'Select this one') {
                        return folderRecord;
                    }
                    if (answers.folderAction === 'Select a child') {
                        var ui = new inquirer.ui.BottomBar();
                        ui.log.write('Getting children...');
                        return self.selectFolder(folderRecord.$.internalId); // recursive!
                    }
                    ui.log.write('Not implemented...');
                    throw new Error('Go Back, not implemented...');
                });
        });
    },
    selectOneFolder: function(parentFolder) {
        const self = this;
        return self.listFolderChildren(parentFolder).then(function(recordList) {
            const choices = _(recordList).map(function(r) {
                return {
                    name: r.name[0],
                    value: r
                };
            });
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'targetFolder',
                        message: 'Select a folder',
                        choices: choices
                    }
                ])
                .then(function(answers) {
                    return answers.targetFolder;
                });
        });
    },

    resolvedPromise: function(val) {
        return new Promise(resolve => {
            resolve(val);
        });
    },

    listFolderChildren: function(parentFolderId) {
        return suitetalk
            .searchBasic({
                recordType: 'folder',
                filters: {
                    parent: {
                        type: 'SearchMultiSelectField',
                        operator: 'anyOf',
                        searchValue: [
                            {
                                type: 'RecordRef',
                                internalId: parentFolderId
                            }
                        ]
                    }
                }
            })
            .then(function(response) {
                const recordList = response.searchResponse[0].searchResult[0].recordList[0].record;
                return recordList;
            })
            .catch(function(error) {
                // the first time we use suitetalk it might fail,
                // for example with invalidApplicationId.
                console.log('ERROR', error, 'Exiting');
                process.exit(1);
                throw new Error(error);
            });
    },

    inquire: function(questions, dontSet) {
        const self = this;
        return new Promise(function(resolve) {
            questions = _.isArray(questions) ? questions : [questions];
            inquirer.prompt(questions).then(function(answers) {
                if (!dontSet) {
                    _(self.credentials).extend(answers);
                }
                resolve(answers);
            });
        });
    }
});

// @class Config
// @property email
// @property password
// @property molecule
