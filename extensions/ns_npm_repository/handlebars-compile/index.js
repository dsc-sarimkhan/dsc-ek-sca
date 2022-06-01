const through2 = require('through2');
const path = require('path');

function replaceExtension(filePath, extension) {
    const fileName = path.basename(filePath, path.extname(filePath)) + extension;
    let filePathResult = path.join(path.dirname(filePath), fileName);
    if (filePathResult.slice(0, 2) === `.${path.sep}`) {
        filePathResult = `.${path.sep}${filePathResult}`;
    }
    return filePathResult;
}

function handleBarsCompile(handlebarOptions) {
    const compilerOptions = {};
    let handlebarCompiled;
    return through2.obj(function(file, fileEncoding, callback) {
        const contents = file.contents.toString();
        if (file.isStream()) {
            this.emit('error', new Error('Streaming is not supported in template.js file'));
            return callback();
        }
        try {
            handlebarCompiled = handlebarOptions.handlebars
                .precompile(handlebarOptions.handlebars.parse(contents), compilerOptions)
                .toString();
        } catch (err) {
            this.emit('error', new Error(`${err.message} in template.js ${file.path}`));
            return callback();
        }
        file.contents = Buffer.from(handlebarCompiled);
        file.path = replaceExtension(file.path, '.js');

        file.defineModuleOptions = {
            require: {
                Handlebars: 'handlebars'
            },
            context: {
                handlebars: 'Handlebars.template(<%= contents %>)'
            },
            wrapper: '<%= handlebars %>'
        };

        callback(null, file);
    });
}

module.exports = handleBarsCompile;
