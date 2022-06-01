/* jshint esversion: 6 */

const _ = require('underscore');
const crypto = require('crypto');
const fs = require('fs');
const async = require('async');
const path = require('path');
const Tool = require('./tool');

module.exports = Tool;

_.extend(Tool.prototype, {
    MANIFEST_FILE_NAME: '__ns-uploader-manifest__.json',

    ignoreFile: function(f) {
        if (path.parse(f).base === this.MANIFEST_FILE_NAME) {
            return true;
        }
        return false;
    },

    mergeManifests: function(localManifest, remoteManifest, uploadedManifest) {
        const finalManifest = [];
        const self = this;

        // first we add the filecabinet information to the local manifest entries
        _.each(localManifest, function(localEntry) {
            const remoteEntry = _.find(remoteManifest, function(remote) {
                return remote.path === localEntry.path;
            });
            if (!remoteEntry) {
                // means that a new file was added in this upload
                const uploadedEntry = _.find(uploadedManifest, function(uploaded) {
                    return uploaded.path === localEntry.path;
                });
                if (!uploadedEntry && !self.ignoreFile(localEntry.path)) {
                    console.log(
                        'ERROR mergeManifests ',
                        localEntry.path,
                        ' local entry not found in uploaded!'
                    );
                } else if (uploadedEntry) {
                    localEntry.internalId = uploadedEntry.internalId;
                    // localEntry.parentFolderId = uploadedEntry.parentFolderId;
                }
            } else {
                localEntry.internalId = remoteEntry.internalId;
                // localEntry.parentFolderId = remoteEntry.parentFolderId;
            }
            finalManifest.push(localEntry);
        });

        // last we add those files that might be in the file cabinet but not locally
        _.each(remoteManifest, function(remoteEntry) {
            const localEntry = _.find(localManifest, function(local) {
                return local.path === remoteEntry.path;
            });
            if (!localEntry) {
                finalManifest.push(remoteEntry);
            }
        });

        return finalManifest;
    },

    buildManifest: function(data) {
        const output = [];
        this.visitManifestFiles(data.folder.children, output);
        return output;
    },

    addFileContentHashTo: function(manifest) {
        const self = this;
        return new Promise(function(resolve) {
            async.eachSeries(
                manifest,
                function(entry, next) {
                    if (entry.type === 'file') {
                        self.getFileContentHash(entry.path).then(function(hash) {
                            entry.hash = hash;
                            next();
                        });
                    } else {
                        next();
                    }
                },
                function() {
                    // TODO. error?
                    resolve(manifest);
                }
            );
        });
    },

    getFileContentHash: function(file) {
        const shasum = crypto.createHash('md5');
        const s = fs.ReadStream(file);
        return new Promise(resolve => {
            s.on('data', function(d) {
                shasum.update(d);
            });
            s.on('end', function() {
                try {
                    const d = shasum.digest('hex');
                    resolve(d);
                } catch (err) {
                    // TODO: it happens
                }
            });
        });
    },

    visitManifestFiles: function(children, output) {
        const self = this;
        _.each(children, function(node) {
            // if(!node.record)
            // {
            // 	debugger;
            // }
            let parentFolder = _.find(node.record.fields, function(f) {
                return f.name === 'folder';
            });
            if (!parentFolder) {
                parentFolder = _.find(node.record.fields, function(f) {
                    return f.name === 'parent';
                });
            }
            if (!node.response) {
                node.response = node.record.response.baseRef[0]; // To support the other add implementation using upsertList that has another api :(
            }
            const data = {
                path: self.toUnix(node.path),
                type: node.record.recordType,
                internalId: node.response.$.internalId,
                parentFolderId: parentFolder.internalId
            };
            output.push(data);
            self.visitManifestFiles(node.children, output);
        });
    },

    buildLocalManifest: function(rootFolder) {
        const manifest = [];
        this.allLocalFilesCount = 0;
        return this._buildLocalManifest(rootFolder, manifest);
    },

    _buildLocalManifest: function(folder, manifest) {
        const self = this;
        const children = fs.readdirSync(folder);
        return new Promise(function(resolve) {
            async.eachSeries(
                children,
                function(c, done) {
                    const childPath = path.join(folder, c);
                    self.allLocalFilesCount++;
                    if (
                        !/^(Deploy|Local)Distribution(Advanced|Online|InStore)(\/|\\)processed-templates$/.test(
                            childPath
                        )
                    ) {
                        if (fs.lstatSync(childPath).isDirectory()) {
                            manifest.push({
                                path: self.toUnix(childPath),
                                type: 'folder'
                            });
                            self._buildLocalManifest(childPath, manifest).then(function() {
                                done();
                            });
                        } else {
                            self.getFileContentHash(childPath)
                                .then(function(hash) {
                                    manifest.push({
                                        path: self.toUnix(childPath),
                                        hash: hash,
                                        type: 'file'
                                    });
                                    done();
                                })
                                .catch(function(err) {
                                    console.log('err ', err);
                                });
                        }
                    }
                },
                function() {
                    resolve(manifest);
                }
            );
        });
    }
});
