/* jshint esversion: 6 */

const _ = require('underscore');
const mapStream = require('map-stream');
const fsExtensions = require('./fs-extensions');

const licenseTypes = {
    '.tpl': {
        beginComment: '{{!',
        endComment: '}}\n\n'
    },
    '.js': {
        beginComment: '/*',
        endComment: '*/\n\n'
    },
    '.ts': {
        beginComment: '/*',
        endComment: '*/\n\n'
    },
    '.ss': {
        beginComment: '/*',
        endComment: '*/\n\n'
    },
    '.ssp': {
        beginComment: '<%/*',
        endComment: '*/%>'
    },
    '.css': {
        beginComment: '/* ',
        endComment: ' */\n\n'
    },
    '.scss': {
        beginComment: '/*',
        endComment: '*/\n\n'
    },
    '.sass': {
        beginComment: '/*',
        endComment: '*/\n\n'
    },
    '.less': {
        beginComment: '/*',
        endComment: '*/\n\n'
    }
};

const licenseIgnores = ['html5shiv.min', 'require', 'respond.min'];

function mapAddLicense(license_text) {
    license_text = license_text || '';

    return mapStream(function(file, cb) {
        const path = fsExtensions.parsePath(file.path);
        const license_type = licenseTypes[path.extension];
        const is_ignore = licenseIgnores.indexOf(path.baseName) >= 0;

        if (!!license_type && !is_ignore) {
            const license = license_type.beginComment + license_text + license_type.endComment;
            const file_content = file.contents.toString('utf8');

            // see if the file already got license
            const licence_prefix = file_content.substring(0, license.length);
            if (license !== licence_prefix) {
                let newContent = license + file_content;
                if (/[/\\]Backend[/\\]/.test(file.path) && /^\/\*\*/.test(file_content.trim())) {
                    newContent = file_content.trim().replace(/^\/\*\*/, `/**\n${license_text}\n`);
                }

                file.contents = Buffer.from(newContent);
            }
        }
        cb(null, file);
    });
}

function matchAny(string, reg_exps) {
    return _.some(reg_exps, function(reg_exp) {
        return reg_exp.test(string);
    });
}

function expandSearch(jsonObject) {
    if (!_.isObject(jsonObject) || _.isArray(jsonObject)) {
        return [];
    }

    const result = _.map(Object.keys(jsonObject), function(key) {
        return { parent: jsonObject, key: key };
    });
    return result;
}

function dfsDelete(jsonObject, reg_exps) {
    let fringe = expandSearch(jsonObject);

    while (fringe.length > 0) {
        const entry = fringe.pop();

        if (matchAny(entry.key, reg_exps)) {
            delete entry.parent[entry.key];
        } else {
            const expanded = expandSearch(entry.parent[entry.key]);
            fringe = fringe.concat(expanded);
        }
    }
}

function mapJsonKeys(keys_to_delete) {
    keys_to_delete = keys_to_delete || [];
    const regexps_to_delete = _.map(keys_to_delete, function(key) {
        return new RegExp(key);
    });

    return mapStream(function(file, cb) {
        const json = JSON.parse(file.contents.toString('utf8'));
        dfsDelete(json, regexps_to_delete);
        file.contents = Buffer.from(JSON.stringify(json, '\t', 4));
        cb(null, file);
    });
}

module.exports = {
    mapAddLicense: mapAddLicense,
    mapJsonKeys: mapJsonKeys
};
