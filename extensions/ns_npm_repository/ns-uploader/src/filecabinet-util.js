const _ = require('underscore');
const suitetalk = require('suitetalk');
var Tool = require('./tool');
// @module suitetalk4node.uploader @class Tool
// TODO: move me to suitetalk4node or to a new suitetalk-easy

function Tool() {}

module.exports = Tool;

_.extend(Tool.prototype, {
    // @method getFileNamed given a folder internalid and a file name
    // it will search for a file with exactly that name.
    // @param parentFolderId @param fileName
    // @param doGet if tru it will first search and then get so the contents will be given
    // @return {Deferred}
    getFileNamed: function(parentFolderId, fileName, doGet, isFolder) {
        const recordType = isFolder ? 'folder' : 'file';
        const filters = {
            folder: {
                type: 'SearchMultiSelectField',
                operator: 'anyOf',
                searchValue: [
                    {
                        type: 'RecordRef',
                        internalId: parentFolderId
                    }
                ]
            },
            name: {
                operator: 'is',
                searchValue: fileName
            }
        };
        if (isFolder) {
            filters.parent = filters.folder;
            delete filters.folder;
        }
        return suitetalk
            .searchBasic({
                recordType: recordType,
                filters: filters
            })
            .then(response => {
                // TODO: check errors
                const records =
                    response.searchResponse[0].searchResult[0].recordList[0].record || [];
                if (records.length !== 0) {
                    if (!doGet) {
                        return records[0];
                    }
                    return suitetalk
                        .get({
                            recordType: recordType,
                            internalId: records[0].$.internalId
                        })
                        .then(result => {
                            const record = result.getResponse[0].readResponse[0].record[0];
                            return record;
                        });
                }
            });
    },

    // @method getFileNamed equivalent to getFileNamed but for getting a folder.
    // @param parentFolderId @param fileName
    // @param doGet if tru it will first search and then get so the contents will be given
    // @return {Deferred}
    getFolderNamed: function(parentFolderId, fileName, doGet) {
        return this.getFileNamed(parentFolderId, fileName, doGet, true);
    },

    addOrUpdateFile: function(parentFolderId, fileName, fileContents, fileType) {
        const self = this;
        return suitetalk
            .add({
                recordType: 'file',
                fields: [
                    { name: 'name', value: fileName },
                    { name: 'fileType', value: fileType || '_PLAINTEXT' },
                    { name: 'content', value: Buffer.from(fileContents).toString('base64') },
                    { name: 'folder', nstype: 'RecordRef', internalId: parentFolderId }
                ]
            })
            .then(function(responseBody) {
                const writeResponse = responseBody.addResponse[0].writeResponse[0];

                if (writeResponse.status[0].$.isSuccess === 'false') {
                    if (writeResponse.status[0].statusDetail[0].code[0] === 'USER_ERROR') {
                        // error because we are trying to
                        // "A folder with the same name already exists in the selected folder."
                        // so we update
                        console.log('error because exists. Updating');
                        return self.updateFile(parentFolderId, fileName, fileContents, fileType);
                    }
                } else {
                    return responseBody;
                }
            });
    },

    updateFile: function(parentFolderId, fileName, fileContents, fileType) {
        fileType = fileType || '_PLAINTEXT';
        return suitetalk.upsert({
            recordType: 'file',
            externalId: fileName,
            fields: [
                { name: 'name', value: fileName },
                { name: 'fileType', value: fileType },
                { name: 'content', value: Buffer.from(fileContents).toString('base64') },
                { name: 'folder', nstype: 'RecordRef', internalId: parentFolderId }
            ]
        });
    },

    // @method mkdir will ensure the existing of a folder by returning its reference if
    // exists or creating it otherwise @return {Deferred<RecordRef>}
    mkdir: function(parentFolderId, folderName) {
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
                    },
                    name: { operator: 'is', searchValue: folderName }
                }
            })
            .then(response => {
                // TODO: check errors
                if (
                    parseInt(response.searchResponse[0].searchResult[0].totalRecords[0], 10) !== 0
                ) {
                    return response.searchResponse[0].searchResult[0].recordList[0].record[0].$;
                }
                return suitetalk
                    .add({
                        recordType: 'folder',
                        fields: [
                            { name: 'name', value: folderName },
                            {
                                name: 'parent',
                                nstype: 'RecordRef',
                                type: 'folder',
                                internalId: parentFolderId
                            }
                        ]
                    })
                    .then(result => {
                        // TODO: check errors
                        return result.addResponse[0].writeResponse[0].baseRef[0].$;
                    });
            })
            .catch(function(error) {
                console.log('mkdirERROR', error, error.stack);
            });
    },

    // @method removeFileNamed @return {Promise} that will always be resolved.
    // Also it will be resolved with true if the file was actually deleted successfully
    removeFileNamed: function(parentFolderId, fileName) {
        const filters = {
            folder: {
                type: 'SearchMultiSelectField',
                operator: 'anyOf',
                searchValue: [
                    {
                        type: 'RecordRef',
                        internalId: parentFolderId
                    }
                ]
            },
            name: {
                operator: 'is',
                searchValue: fileName
            }
        };
        return suitetalk
            .searchBasic({
                recordType: 'file',
                filters: filters
            })
            .then(response => {
                // TODO: check errors
                const records =
                    response.searchResponse[0].searchResult[0].recordList[0].record || [];
                if (!records.length) {
                    return false; // file not found
                }
                const deleteCommand = {
                    recordType: 'file',
                    internalId: records[0].$.internalId
                };
                return suitetalk.delete(deleteCommand, (error, result) => {
                    if (error) {
                        return false;
                    }
                    const writeResponse = result.deleteResponse[0].writeResponse[0];
                    if (writeResponse.status[0].$.isSuccess === 'true') {
                        return true;
                    }
                    return false;
                });
            })
            .catch(function() {
                return false;
            });
    }
});
