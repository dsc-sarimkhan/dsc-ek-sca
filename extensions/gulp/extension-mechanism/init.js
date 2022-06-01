var path = require('path'),
fs = require('fs'),
{log, colorText, color} = require('ns-logs'),
configurations = require('./configurations'),
args = require('ns-args').argv(),
_ = require('underscore');

var manifest_manager = require('./manifest-manager');

'use strict';

const config = configurations.getConfigs();
function registerExtrasExtensions()
{
    var extensions_path = config.folders.source.extras_path
        ,	ext_path;

    _.each(fs.readdirSync(extensions_path), function(vendor_folder)
    {
        vendor_folder = path.join(extensions_path, vendor_folder);

        _.each(fs.readdirSync(vendor_folder), function(ext_folder)
        {
            ext_path = path.join(vendor_folder, ext_folder);

            if(fs.statSync(ext_path).isDirectory())
            {
                try
                {
                    _registerManifest(ext_path);
                }
                catch(error)
                {
                    log(colorText(color.YELLOW, ext_path + '/manifest.json does not exist. Ignoring ' + ext_path));
                }
            }
        });
    });
}

function registerWorkspaceExtensions()
{
    var new_extensions_path = []
        ,	extensions_path = config.folders.source.source_path
        ,	ext_path;

    !fs.existsSync(extensions_path) && fs.mkdirSync(extensions_path, 0744);

    _.each(fs.readdirSync(extensions_path), function(ext_folder)
    {
        var is_theme_extra_dir = config.folders.source.extras_path && config.folders.source.extras_path.includes(ext_folder);

        ext_path = path.join(extensions_path, ext_folder);

        if(!is_theme_extra_dir && fs.statSync(ext_path).isDirectory())
        {
            try
            {
                _registerManifest(ext_path);
                new_extensions_path.push(ext_path);
            }
            catch(error)
            {
                log(colorText(color.YELLOW, `${path.join(ext_path, 'manifest.json')} does not exist or is malformed. Ignoring ${ext_path}`));
            }
        }
    });

    return new_extensions_path;
}

function _registerManifest(manifest_path)
{
    manifest_manager.addManifest(path.join(manifest_path, 'manifest.json'));
}

function _isSkipCompilation()
{
    return args['skip-compilation'];
}

module.exports = function()
{
    var app_manifest_path = path.join(config.folders.application_manifest, 'application_manifest.json')
        ,	is_scis = config.credentials.is_scis;

    if(fs.existsSync(app_manifest_path))
    {
        config.application.application_manifest = JSON.parse(fs.readFileSync(app_manifest_path).toString());
    }

    _.each(config.folders.source, function(src_folder)
    {
        if(!fs.existsSync(src_folder))
        {
            var message = 'The source path "' + src_folder + '" does not exist. You need to execute ';

            if(!_isSkipCompilation() && !is_scis)
            {
                if(config.extensionMode)
                {
                    log(colorText(color.RED, message + ' "gulp extension:fetch" first.'));
                    process.exit(1);
                }
                else
                {
                    log(colorText(color.RED, message + ' "gulp theme:fetch" first.'));
                    process.exit(1);
                }
            }
        }
    });

    //add all the manfiests
    if(!is_scis)
    {
        var theme_path = config.folders.theme_path;
        if(!theme_path)
        {
            log(colorText(color.YELLOW, 'There is no theme_path configured'));
            theme_path = config.extensionMode ? config.folders.source.extras_path : config.folders.source.source_path;
            theme_path = path.join(theme_path, '*', 'manifest.json');

            var glob = require('glob').sync;
            theme_path = glob(theme_path);
            theme_path = theme_path.length ? path.dirname(theme_path[0]) : null;

            theme_path && log(colorText(color.YELLOW, `Looking for a theme in ${theme_path}`));
            config.folders.theme_path = theme_path;
        }

        if(theme_path && fs.statSync(theme_path).isDirectory())
        {
            config.folders.overrides_path = theme_path + '/' + config.folders.overrides;

            theme_path = path.join(theme_path, 'manifest.json');
            log(colorText(color.YELLOW, `Configuring ${theme_path} as theme`));
            manifest_manager.addManifest(theme_path);
        }

        //no skip compilation option, or you are in theme or scis and is required to do a fetch
        if(!config.folders.theme_path && (!_isSkipCompilation() || !config.extensionMode))
        {
            var task_name = config.extensionMode ? 'extension' : 'theme';
            log(colorText(color.RED, 'You need to run gulp ' + task_name + ':fetch before to get the initial setup files. Aborting. '));
            process.exit(1);
        }
    }

    if(!config.extensionMode)
    {
        registerExtrasExtensions();

        //run overrides task only in the theme tools
        var overrides = require('./overrides');
        overrides.updateOverrides();
    }
    else
    {
        var new_extensions_path = registerWorkspaceExtensions();

        //update extension paths
        new_extensions_path = new_extensions_path.map((path) => path.replace('\\', '/'));
        config.folders.extensions_path = new_extensions_path;
    }

    configurations.saveConfigs();

    return manifest_manager;
};
