/* jshint esversion: 6 */
const fs = require('fs');
const _ = require('underscore');
const args = require('yargs');

let configs;
const configsPath = 'gulp/config/config.json';
const nsdeployPath = '.nsdeploy';

function getConfigs() {
    if (configs) {
        const deep = (confs, args)=>_.isObject(confs) && _.isObject(args) ? _.extend(confs, args, deep) : args;
        return _.extend(configs, args.argv, deep);
    }

    const jsonConfig = fs.existsSync(configsPath)
        ? JSON.parse(fs.readFileSync(configsPath, 'utf-8'))
        : {};
    const nsdeploy = fs.existsSync(nsdeployPath)
        ? JSON.parse(fs.readFileSync(nsdeployPath, 'utf-8'))
        : {};


    if (args.argv.to) {
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