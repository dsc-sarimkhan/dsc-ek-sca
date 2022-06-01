/* jshint esversion: 6 */
const fs = require('fs');
const _ = require('underscore');
const args = require('ns-args').argv();

let configs;
const configsPath = 'gulp/config/config.json';
const nsdeployPath = '.nsdeploy';

function extend (source, target) {
    if (typeof source === 'object' && typeof target === 'object') {
        Object.keys(source).forEach((sourceKey) => {
            const sourceObj = source[sourceKey];
            if (sourceKey in target) {
                extend(target[sourceKey], sourceObj);
            } else {
                target[sourceKey] = sourceObj
            }
        });
    }
    return target;
};

function getConfigs() {
    if (configs) {
        return extend(configs, args);
    }

    const jsonConfig = fs.existsSync(configsPath)
        ? JSON.parse(fs.readFileSync(configsPath, 'utf-8'))
        : {};
    const nsdeploy = fs.existsSync(nsdeployPath)
        ? JSON.parse(fs.readFileSync(nsdeployPath, 'utf-8'))
        : {};


    if (args.to) {
        jsonConfig.credentials = {};
        nsdeploy.credentials = {};
    }

    configs = { ...jsonConfig, ...nsdeploy };
    configs.credentials = configs.credentials || {};
    configs.nsdeployPath = nsdeployPath;

    return configs;
}

function saveConfigs() {
    fs.writeFileSync(configsPath, JSON.stringify(configs, null, 4));
}

module.exports = {
    getConfigs: getConfigs,
    saveConfigs: saveConfigs
};
