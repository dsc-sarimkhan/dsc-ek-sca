const _ = require('underscore');
const suitetalk = require('suitetalk');
const fs = require('fs');
const path = require('path');
// @module suitetalk4node.uploader @class Uploader
// This implementation is simple and uses addList ns operation for adding a folder's files.
// Folders are created also using addList operation. see addFolder method.
// This first impl can be optimized by doing concurrent requests.
const Tool = function(credentials, localFolder, folderInternalId) {
    this.credentials = credentials;
    this.localFolder = localFolder;
    this.folderInternalId = folderInternalId;
    suitetalk.setCredentials(this.credentials);
};

_(Tool.prototype).extend({
    // @method addFolder recursive and calling a ws each time !
    // @param localFolder @param targetFolderId must exists @return {Deferred}
    // it first will add subfolders and sub files in two concurrent requests .Then recurse on each sub folder.
    addFolder: function(localFolder, targetFolderId, localManifest, remoteManifest, publicList) {
        this.filesUploadedCount = 0;
        const parent = {
            name: localFolder,
            path: localFolder,
            type: 'folder'
        };
        const self = this;

        this.buildFileList(parent, localManifest);

        const methodName = '_addChildren'; // (remoteManifest && remoteManifest.length) ? '_addChildren' : '_addChildren_noManifest'//'_addChildren_noManifest';//
        return self[methodName](
            parent.children,
            targetFolderId,
            localManifest,
            remoteManifest,
            publicList
        ).then(function() {
            const context = { targetFolderId: targetFolderId, folder: parent };
            return context;
        });
    },

    // @method buildFileList @param {FileNode} parent @returns {Array<FileNode>}
    buildFileList: function(parent, localManifest) {
        const folders = [];
        const files = [];
        const self = this;
        parent.children = parent.children || [];

        _(fs.readdirSync(parent.path)).each(function(child) {
            const childPath = path.join(parent.path, child);
            const type = fs.lstatSync(childPath).isDirectory() ? 'folder' : 'file';
            const node = {
                name: child,
                path: self.toUnix(childPath),
                type: type
            };
            parent.children.push(node);
            if (type === 'folder') {
                self.buildFileList(node);
            } else {
                const localEntry = _.find(localManifest, function(manifestEntry) {
                    return manifestEntry.path === childPath;
                });
                if (localEntry) {
                    node.hash = localEntry.hash;
                    node.isOnline = localEntry.isOnline;
                }
            }
        });
    },

    contentTypes: {
        '': '',
        '.css': '_STYLESHEET',
        '.csv': '_CSV',
        '.html,.html': '_HTMLDOC',
        '.gif': '_GIFIMAGE',
        '.js': '_JAVASCRIPT',
        '.gz': '_GZIP',
        '.jpg,.jpeg': '_JPGIMAGE',
        '.mp3': '_MP3',
        '.mpg': '_MPEGMOVIE',
        '.pdf': '_PDF',
        '.pjpeg': '_PJPGIMAGE',
        '.swf': '_FLASH',
        '.txt': '_PLAINTEXT',
        '.xls': '_EXCEL',
        '.xml': '_XMLDOC',
        '.png': '_PNGIMAGE',
        '.zip': '_ZIP'
    },

    getNetsuiteContentType: function(filePath) {
        const ext = path.extname(filePath);
        const nsType = _(this.contentTypes).find(function(value, k) {
            return k.indexOf(ext) !== -1;
        });
        return nsType || '_PLAINTEXT';
    },

    file2base64: function(file) {
        const buffer = fs.readFileSync(file);
        return Buffer.from(buffer).toString('base64');
    },

    base642file: function(base64str, file) {
        const buffer = Buffer.from(base64str, 'base64');
        fs.writeFileSync(file, buffer);
    },

    addProgressListener: function(listener) {
        if (!this.progressListeners) {
            this.progressListeners = [];
        }
        this.progressListeners.push(listener);
    },

    triggerProgressChange: function() {
        const args = arguments;
        const self = this;
        _.each(this.progressListeners, function(listener) {
            listener.apply(self, args);
        });
    },

    trackProgress: function() {
        this.filesUploadedCount++;
        this.triggerProgressChange(this.filesUploadedCount, this.allLocalFilesCount);
    },

    toUnix: function(p) {
        return p.replace(/\\/g, '/');
    }
});

module.exports = Tool;
