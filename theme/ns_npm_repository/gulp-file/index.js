/* jshint esversion: 6 */

const Vinyl = require('vinyl');
const through = require('through2');

module.exports = (name, content) => {
    const vinylFile = new Vinyl({
        cwd: '',
        base: undefined,
        path: name,
        contents: Buffer.from(content)
    });

    const fileStream = through.obj(function(file, encoding, callback) {
        this.push(file);

        return callback();
    });
    fileStream.write(vinylFile);

    fileStream.end();
    return fileStream;
};
