/* jshint esversion: 6 */

const _ = require('underscore');
const fs = require('fs');
const Tool = require('./tool');

require('./delete');
require('./manifest-manager');

// @module suitetalk4node.uploader @class Uploader

_(Tool.prototype).extend({
    // @method main @param {MainConfig} config @return {Deferred}
    main: function(config) {
        let remoteManifest = [];
        let localManifest = this.buildLocalManifest(config.sourceFolderPath);
        let finalManifest;

        // first we check if we need to remove the remote manifest
        // if any because configuration 'clean' says so
        return this.checkCleanManifest(config)
            .then(() => {
                // then, get the remote manifest
                return this.getFileNamed(config.targetFolderId, this.MANIFEST_FILE_NAME, true);
            })
            .then(record => {
                // then build the local manifest
                if (record) {
                    const content = Buffer.from(record.content[0], 'base64').toString();
                    remoteManifest = JSON.parse(content);
                }
                return this.buildLocalManifest(config.sourceFolderPath);
            })
            .then(() => {
                // now that we have both manifest, start uploading
                return this.addFileContentHashTo(localManifest, config.sourceFolderPath).then(
                    manifest => {
                        localManifest = manifest;
                        return this.addFolder(
                            config.sourceFolderPath,
                            config.targetFolderId,
                            localManifest,
                            remoteManifest,
                            config.publicList
                        );
                    }
                );
            })
            .then(uploadResults => {
                // upload is done, now we update the manifest
                const uploadedManifest = this.buildManifest(uploadResults);
                finalManifest = this.mergeManifests(
                    localManifest,
                    remoteManifest,
                    uploadedManifest
                );
                return this.addOrUpdateFile(
                    config.targetFolderId,
                    this.MANIFEST_FILE_NAME,
                    JSON.stringify(finalManifest),
                    '_PLAINTEXT'
                );
            });
    },

    checkCleanManifest: function(config) {
        if (!config.cleanManifest) {
            return new Promise(resolve => {
                resolve();
            });
        }
        return this.removeFileNamed(config.targetFolderId, this.MANIFEST_FILE_NAME, true);
    }
});

module.exports = Tool;

/*
@class MainConfig
@property sourceFolderPath @mandatory
*/
