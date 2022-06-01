/* jshint esversion: 6 */

const gulp = require('gulp');
const configs = require('../extension-mechanism/configurations').getConfigs();
const fs = require('fs');
const path = require('path');
const PluginError = require('../extension-mechanism/CustomError');
const argv = require('ns-args').argv();
const nsServer = require('ns-server');

function whoService(req, res)
{
    var protocol = req.connection.encrypted ? 'https' : 'http'
    ,   host = req.headers.host
    ,   app = req.params.app
    ,   configs = require('../extension-mechanism/configurations').getConfigs()
    ,   extensionMode = configs.extensionMode
    ,   sspApplicationPath = argv['ssp-application-path'];

    //A null url make the local ssp file grab the resource from backend (production)

    var css = {
            tag: 'link'
        ,   resource: 'css'
        ,   url: `${protocol}://${host}/tmp/css/${app}.css`
        }
    ,   define_patch = {
            tag: 'script',
            resource: 'define_patch',
            url: `${protocol}://${host}/define_patch.js`
        }
    ,   requirejs = {
            tag: 'script'
        ,   resource: 'requirejs'
        ,   url: `${protocol}://${host}/tmp/require.js`
        }
    ,   javascript_libs = {
            tag: 'script'
        ,   resource: 'javascript_libs'
        ,   url: `${protocol}://${host}/tmp/javascript-libs.js`
        }
    ,   templates = {
            tag: 'script'
        ,   resource: 'templates'
        ,   url: `${protocol}://${host}/tmp/${app}-templates.js`
        }

    ,   js_core = {
            tag: 'script'
        ,   resource: 'js_core'
        ,   url: null
        }

    ,   js_extensions = {
            tag: 'script'
        ,   resource: 'js_extensions'
        ,   url: `${protocol}://${host}/tmp/extensions/${app}_ext.js`
        };

    var response;
    if(extensionMode)
    {
        response = [
            css
        ,   define_patch
        ,   requirejs
        ,   javascript_libs
        ,   templates
        ,   js_core
        ,   js_extensions
        ];
    }
    else
    {
        //In the case of the Theme devTools, the extension javascript is grabbed  from backend
        js_extensions.url = null;

        response = [
            css
        ,   define_patch
        ,   requirejs
        ,   javascript_libs
        ,   templates
        ,   js_core
        ,   js_extensions
        ];
    }

    res.setHeader('Content-Type', 'application/json');
    res.json(response);
}

function definePatchService(req, res)
{
    var response = function define_patch()
    {
		Object.defineProperty(window, 'define', {
			set: function(val) {
				if (!window.__my_define) {
					// keep the first time 'define' is defined
					window.__my_define = function define(name, args, cb)
					{
						var is_tpl = name && /\.tpl$/.test(name);
						var cbfunction = typeof args === 'function' ? args : cb;
						var cb_string = cbfunction ? cbfunction.toString().replace(/\s/g, '') : '';
						var is_empty_cb = cb_string === 'function(){}';

						if(is_tpl && is_empty_cb)
						{
							return;
						}
						return val.apply(this, arguments);
					}

					define.amd = {
						jQuery: true
					};
				} else if (val.toString().indexOf('Safe Mode is on') !== -1) {
					// this is the wrap of 'gulp\library\extlaypatch.js'
					// any other wrap we ignore it
					window.__my_define = val;
				}
			},
			get: function() {
				return window.__my_define;
			}
		});

        Object.defineProperty(window, 'require', {
            set: function(val) {
                if (!window.__my_require) {
                    window.__my_require = val;
                }
            },
            get: function() {
                return window.__my_require;
            }
        });

        Object.defineProperty(window, 'requirejs', {
            set: function(val) {
                if (!window.__my_require) {
                    window.__my_require = val;
                }
            },
            get: function() {
                return window.__my_require;
            }
        });
    };

    res.setHeader('Content-Type', 'application/javascript');
    res.send(`${response}; define_patch();`);
}

function copyRequireJs()
{
    return fs.createReadStream(path.join(
        process.cwd()
    ,   'node_modules'
    ,   'module-loader'
    ,   'module-loader.js'
    ))
    .pipe(fs.createWriteStream(path.join(
        configs.folders.output
    ,   'require.js'
    )));
}

// gulp connect implements both http server for static files
gulp.task('connect', gulp.series(copyRequireJs, function start_server(cb)
{
    try {
        var db_config = configs.dbConfig;
		var server;

		//setup secure server for scis
		if (configs.credentials.is_scis) {
			db_config.secure = true;

			var keyfile = process.env[db_config.key] || db_config.key;
			var certfile = process.env[db_config.cert] || db_config.cert;

			if (!keyfile || !certfile) {
				throw new PluginError('Https Certificate and/or Certificate Key Not Found.',
					'Please check the paths or environment variables as registered in: gulp/config/config.json file.\n' +
					'\tConfiguration variables: dbConfig->key and dbConfig->cert. Thank you.');
			}

			db_config.key = fs.readFileSync(keyfile, 'utf8')
			db_config.cert = fs.readFileSync(certfile, 'utf8')

			server = nsServer.createServer(db_config);
		} else {
			server = nsServer.createServer();
		}

        // Allow CORS requests in server
        server.use(function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
        });

        server.use('/', configs.folders.local);
        server.use('/', configs.folders.source.source_path);
        //Service used by the index-local.ssp files to know what files load
        server.use('/who/:app', whoService);
        //Serves the script patch to ignore tpl defines executed by core javascript file
        server.use('/define_patch.js', definePatchService);

        server.listen(db_config.port);
        cb();
    }
    catch(error)
    {
        cb(error);
    }
}));
