const through = require('through2');
const path = require('path');

function concatFileContents(file, callback, contentParts) {
    if (contentParts.length !== 0) {
        contentParts.push(Buffer.from('\n'));
    }
    contentParts.push(file.contents);
    callback();
}

function fileConcat(fileName) {
    const contentParts = [];
    let fileLatestModification;
    let latestFileModified;
    return through.obj(
        function(file, encryption, callback) {
            if (file.isNull()) {
                callback();
                return;
            }
            if (file.isStream()) {
                this.emit('error', new Error('fileConcat: Streaming not supported'));
                callback();
                return;
            }
            // set latest file if not already set,
            // or if the current file was modified more recently.
            if (
                !fileLatestModification ||
                (file.stat && file.stat.mtime > fileLatestModification)
            ) {
                latestFileModified = file;
                fileLatestModification = file.stat && file.stat.mtime;
            }
            concatFileContents(file, callback, contentParts);
        },
        function(callback) {
            const joinedFile = latestFileModified.clone({ contents: false });
            joinedFile.path = path.join(latestFileModified.base, fileName);
            joinedFile.contents = Buffer.concat(contentParts);
            this.push(joinedFile);
            callback();
        }
    );
}

module.exports = fileConcat;
