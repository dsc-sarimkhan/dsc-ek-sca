const _ = require('underscore');
const suitetalk = require('suitetalk');
const async = require('ns-async');
const Tool = require('./tool');

_(Tool.prototype).extend({
    // @method _addChildren @param {Array<FileNode>} @param targetFolderId children
    // @return {Deferred} resolved with the records array w responses
    _addChildren: async function(
        children,
        targetFolderId,
        localManifest,
        remoteManifest,
        publicList
    ) {
        const self = this;
        const records = [];
        const removeIndexes = []; // we cannot splice while iterating the array - so we store indexes and do the splice after iteration

        const regExpr = new RegExp(`(${(publicList || []).join('|')})(/[^/]+)?$`);

        if (!children || children.length === 0) {
            return;
        }
        // first we iterate all children and create the suitetalk
        // operation request objects. Also see if file contents changed and
        let i = 0;
        _(children).each(function(c) {
            const record = {
                recordType: c.type,
                externalId: `${c.name}_${Math.random()}`, // I have to pass a random value here - if not file collisions of files w same name in different folders occurs
                fields: [{ name: 'name', value: c.name }]
            };
            if (c.type === 'file') {
                record.fields.push({
                    name: 'folder',
                    nstype: 'RecordRef',
                    type: 'folder',
                    internalId: targetFolderId
                });
                record.fields.push({
                    name: 'fileType',
                    value: self.getNetsuiteContentType(c.path)
                });
                record.fields.push({ name: 'content', value: self.file2base64(c.path) });

                const filePath = c.path.replace(/\\/g, '/'); // Fix Windows paths
                record.fields.push({ name: 'isOnline', value: regExpr.test(filePath) });
            } else {
                record.fields.push({
                    name: 'parent',
                    nstype: 'RecordRef',
                    type: 'folder',
                    internalId: targetFolderId
                });
            }

            const localChildEntry = _.find(localManifest, function(localEntry) {
                return localEntry.path === c.path;
            });

            if (localChildEntry) {
                c.hash = localChildEntry.hash;
            }

            const remoteChild = _.find(remoteManifest, function(remoteEntry) {
                return remoteEntry.path === c.path;
            });
            const remoteChildHash = remoteChild ? remoteChild.hash : '';
            self.trackProgress();

            records.push(record);
            c.record = record;

            // console.log('comparing', c.hash, remoteChildHash, c.path,
            // (c.hash === remoteChildHash && c.type !== 'folder') )
            if ((c.hash === remoteChildHash && c.type !== 'folder') || self.ignoreFile(c.path)) {
                removeIndexes.push(i);
            }

            i++;
        });

        // remove the non desired ones from children and records array:
        let indexDecrement = 0;
        _.each(removeIndexes, function(index) {
            children.splice(index - indexDecrement, 1);
            records.splice(index - indexDecrement, 1);
            indexDecrement++;
        });

        if (records.length === 0) {
            return;
        }

        // console.log('\n  Writing in folder ' + targetFolderId + ':
        // ', _.map(children, function(c){return c.path}).join('",  "'));

        // now we add records of this folder level all together using upsertlist operation
        return suitetalk.upsertList({ records: records }).then(function(responseBody) {
            const responses = responseBody.upsertListResponse[0].writeResponseList[0].writeResponse;

            // TODO: we must support manifests without internalIds
            //  - in the case the records was updated we should get
            //  the internal ids of those records here and update
            //  the remoteManifest variable so the manifest is updated
            //  with the internalIds after upload finished in main

            // check responseBody.fault - example > 100mb
            if (
                responseBody.upsertListResponse[0].writeResponseList[0].status[0].$.isSuccess !==
                'true'
            ) {
                throw new Error(
                    `${
                        responseBody.upsertListResponse[0].writeResponseList[0].status[0]
                            .statusDetail[0].message
                    } - Code: ${
                        responseBody.upsertListResponse[0].writeResponseList[0].status[0]
                            .statusDetail[0].code[0]
                    }`
                );
            }
            let i = -1;
            return new Promise(function(resolve, reject) {
                async.eachSeries(
                    records,
                    function(r, done) {
                        i++;
                        const child = children[i];

                        r.response = responses[i];

                        if (r.response.status[0].$.isSuccess !== 'true') {
                            if (child.type === 'file') {
                                console.log(
                                    `ERROR writing file ${child.path}: ${
                                        r.response.status[0].statusDetail[0].message
                                    }\nCode: ${
                                        r.response.status[0].statusDetail[0].code[0]
                                    }\nExiting. `
                                );
                                process.exit(1);
                            } else {
                                return self
                                    .getFileNamed(targetFolderId, child.name, false, true)
                                    .then(function(record) {
                                        r.response = { baseRef: [record] };

                                        const newFolderInternalId2 = record.$.internalId;
                                        return self
                                            ._addChildren(
                                                child.children,
                                                newFolderInternalId2,
                                                localManifest,
                                                remoteManifest
                                            )
                                            .then(function() {
                                                done();
                                            })
                                            .catch(function(err) {
                                                done(err);
                                            });
                                    })
                                    .catch(function(err) {
                                        done(err);
                                    });
                            }
                        } else if (child.type === 'folder') {
                            const newFolderInternalId = r.response.baseRef[0].$.internalId;
                            return self
                                ._addChildren(
                                    child.children,
                                    newFolderInternalId,
                                    localManifest,
                                    remoteManifest
                                )
                                .then(function() {
                                    done();
                                })
                                .catch(function(err) {
                                    done(err);
                                });
                        } else {
                            done();
                        }
                    },
                    function(err) {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    }
                );
            });
        });
    }
});

module.exports = Tool;
