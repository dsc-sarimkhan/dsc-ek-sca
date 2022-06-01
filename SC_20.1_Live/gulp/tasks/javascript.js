/* jshint node: true */

/*
@module gulp.javascript
#gulp javascript

This gulp task will compile the project's javascript output.
It support two different kind of compilation:

## Compiling for production

For generating production code we use the amd-optimizer build
tool that will generate all the required
JavaScript code dependencies from a application's Starter.js
file that is declared in distro.json file
property javascript->entryPoint. Then, some extra tools like
minification thorough uglify and/or sourcemap.
Also for performance reasons the final output is transformed
using the tool amdclean.
can be done as well. Examples:

	gulp javascript
	gulp javascript --js require
	gulp javascript --nouglify

Notice that generating sourcemaps or running uglify can take longer.

##Compiling for development

We support compilation type suited for development using the argument '--js require'.
This will generate a requirejs config file pointing to the real files in Modules/.
This way you don't need to do any compilation on your JavaScript files,
just save them and reload your browser.
This task is called indirectly when running our development environment using:

	gulp local --js require

##Declaring javascript in ns.package.json

The javascript files that are able to be compiled are those referenced by
the property gulp.javascript in module's ns.package.json file.
Also the compiled templates (using gulp templates). Example:

	{
		"gulp": {
			...
		,	"javascript": [
				"JavaScript/*"
			]
		}
	}

*/

const path = require('path');
const gulp = require('gulp');
const _ = require('underscore');
const fs = require('fs');
const File = require('vinyl');
const through = require('through');
const amdOptimize = require('gulp-requirejs-optimize');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const map = require('map-stream');
const add = require('gulp-add');
const gif = require('gulp-if');
const async = require('async');
const args = require('yargs').argv;
const glob = require('glob').sync;
const chmod = require('gulp-chmod');
const ts = require('gulp-typescript');
const package_manager = require('../package-manager');

!process.is_SCA_devTools && require('./templates');

const dest = path.join(process.gulp_dest, 'javascript');

const typeScriptCompilerOptions = {
    module: 'amd',
    target: 'es5',
    allowJs: true,
    experimentalDecorators: true,
    types: [],
    lib: ['DOM', 'ES5', 'ScriptHost', 'ES2015']
};
if (args.tsStrict) {
    typeScriptCompilerOptions.strictNullChecks = true;
    typeScriptCompilerOptions.strictBindCallApply = true;
    typeScriptCompilerOptions.strictFunctionTypes = true;
    typeScriptCompilerOptions.strictPropertyInitialization = true;
    typeScriptCompilerOptions.noImplicitThis = true;
}
let almondNSPackage = 'almond';
let almondNSPackageSection = 'javascript';
if (args.instrumentBc) {
    almondNSPackage = 'ViewContextDumper';
    almondNSPackageSection = 'instrumented-javascript';
    typeScriptCompilerOptions.lib.push('ES6');
}

function getGlobs() {
    return _.union(
        [path.join(process.gulp_dest, 'processed-templates', '*.js')],
        package_manager.getGlobsFor('javascript'),
        [path.join(process.gulp_dest, 'javascript-dependencies', '*.js')],
        package_manager.getGlobsFor('unit-test-files')
    );
}

const { instrumentVinylFile } = require('./istanbul-instrument');

// generates a bootstrapper script that requires the starter script using require.js
function generateStarterLocalFiles(config) {
    let paths = {};

    const onFile = function(file) {
        let normalized_path = path.resolve(file.path);
        const moduleName = path.basename(normalized_path, '.js');
        const override_info = package_manager.getOverrideInfo(normalized_path);

        if (override_info.isOverriden) {
            normalized_path = override_info.overridePath;
        }

        paths[moduleName] = normalized_path.replace(/\\/g, '/').replace(/\.js$/, '');

        if (file.contents) {
            const contents = file.contents.toString();
            const regex = /(\w+\.tpl)/g;
            let match = regex.exec(contents);
            let template;

            config.amdConfig.rawText = config.amdConfig.rawText || {};
            config.amdConfig.rawText[paths[moduleName]] = contents;

            while (match) {
                template = match[0];
                config.amdConfig.rawText[template] = '';

                match = regex.exec(contents);
            }
        }
    };

    const fixPaths = function() {
        _.each(config.amdConfig.paths, function(renamedModuleName, originalModuleName) {
            paths[originalModuleName] = paths[renamedModuleName];
        });
    };

    const onEnd = function() {
        fixPaths();

        if (package_manager.isGulpLocal) {
            let http_config = package_manager.getTaskConfig('local.https', false);
            let protocol = 'https';

            if (!http_config) {
                http_config = package_manager.getTaskConfig('local.http', false);
                protocol = 'http';
            }

            config.amdConfig.baseUrl = `${protocol}://localhost:${http_config.port}`;
            config.amdConfig.rawText = {};

            const local_dst_path = process.gulp_dest.replace(/\\/g, '/');
            const base_path = process.cwd().replace(/\\/g, '/');
            let thirdparties_path = path.join(package_manager.env.srcDir, '..', '..');

            thirdparties_path = path.normalize(thirdparties_path).replace(/\\/g, '/');

            if (process.is_SCA_devTools) {
                paths = _.omit(paths, function(val, key) {
                    return /\.tpl$/.test(key);
                });
            }

            paths = _.mapObject(paths, function(val) {
                val = val.replace(local_dst_path + '/', '');
                if (val.indexOf(base_path) === 0) {
                    val = path.join('javascript', 'compiled', path.basename(val, '.js'));
                }
                val = val.replace(thirdparties_path + '/', '');
                return val;
            });
        }

        config.amdConfig.paths = paths;
        const starter_content = generateEntryPointContent(config);
        config.amdConfig.rawText[path.basename(config.exportFile, '.js')] = starter_content;

        const file = new File({
            path: config.exportFile,
            contents: Buffer.from(starter_content)
        });

        this.emit('data', file);
        this.emit('end');
    };

    return through(onFile, onEnd);
}

module.exports = {
    generateStarterLocalFiles: generateStarterLocalFiles
};

function generateEntryPointContent(config) {
    const entry_point = [config.entryPoint];

    const template = _.template(
        'try {\nrequire.config(<%= require_config %>);\nvar ' +
            entry_point[0].replace(/\./g, '') +
            '= true;\n}\ncatch(e){};'
    );

    const jasminePaths = {
        jasmine: '/jasmine/lib/jasmine-3.4.0/jasmine',
        'jasmine-html': '/jasmine/lib/jasmine-3.4.0/jasmine-html',
        'jasmine-boot': '/jasmine/lib/jasmine-3.4.0/boot'
    };
    const jasminShims = {
        'jasmine-html': {
            deps: ['jasmine']
        },
        'jasmine-boot': {
            deps: ['jasmine', 'jasmine-html']
        }
    };
    config.amdConfig.paths = { ...config.amdConfig.paths, ...jasminePaths };
    config.amdConfig.shim = { ...config.amdConfig.shim, ...jasminShims };

    const starter_content = template({
        require_config: JSON.stringify(config.amdConfig, null, '\t'),
        entry_point: JSON.stringify(entry_point)
    });

    return starter_content;
}

function compileSCA(config, cb, generateTemplateManifests) {
    config.amdConfig.onBuildRead = function(moduleName, pathName, contents) {
        if (generateTemplateManifests) {
            const fileIsTemplate =
                pathName.match(/\.tpl\.js$/) ||
                moduleName.indexOf('handlebars.runtime') === 0 ||
                moduleName.indexOf('Handlebars.CompilerNameLookup') === 0;

            if (!fileIsTemplate) {
                return contents;
            }

            return '';
        }

        return contents;
    };

    config.amdConfig.onModuleBundleComplete = function(data) {
        if (generateTemplateManifests) {
            const manifestName =
                'templates-manifest-' + path.basename(config.exportFile, '.js') + '.json';

            const templates = {};
            _.each(data.included, file => {
                if (/\.tpl\.js$/.test(file)) {
                    templates[path.basename(file)] = true;
                }
            });

            _.each(process.dataTemplateDependencies, function(moduleViews) {
                _.each(moduleViews, function(view) {
                    templates[view + '.tpl.js'] = true;
                });
            });

            fs.writeFileSync(manifestName, JSON.stringify(_.keys(templates), null, 2));
        }
    };

    config.amdConfig.onBuildWrite = function(moduleName, pathName, contents) {
        if (path.basename(config.exportFile, '.js') === moduleName) {
            if (config.amdConfig.map && !package_manager.isGulpLocal) {
                const tpl = _.template('require.config({map: <%= amdConfig %>})');
                return tpl({
                    amdConfig: JSON.stringify(config.amdConfig.map, null, '\t')
                });
            }

            return '';
        }

        return contents;
    };

    if (!args.nouglify && !package_manager.isGulpLocal) {
        config.amdConfig.optimize = 'uglify';
        config.amdConfig.uglify = {
            output: {
                comments: 'some'
            }
        };
    } else {
        config.amdConfig.optimize = 'none';
    }

    config.amdConfig.generateSourceMaps = true;
    config.amdConfig.skipModuleInsertion = false;
    config.amdConfig.wrapShim = true;
    config.amdConfig.preserveLicenseComments = false;
    config.amdConfig.rawText = {};
    config.amdConfig.deps = [config.entryPoint];

    if (!config.is_extensible) {
        config.amdConfig.deps.unshift('almond');
    }

    let licenses_content = '';
    if (!package_manager.isGulpLocal) {
        const { distro } = package_manager;
        const third_paties = distro.modules.map(library => {
            if (library.indexOf(distro.folders.thirdPartyModules) !== 0) {
                return [];
            }
            return glob(path.join(package_manager.env.srcDir, library, '**', '*.license'));
        });

        const license_paths = _.flatten(third_paties);
        _.each(license_paths, function(license_path) {
            licenses_content +=
                fs.readFileSync(license_path, {
                    encoding: 'utf8'
                }) + '\n';
        });
    } else {
        delete config.amdConfig.deps;
    }

    let stream = gulp
        .src(getGlobs(), { allowEmpty: true })
        .pipe(package_manager.handleOverrides())
        .pipe(ts(typeScriptCompilerOptions))
        .pipe(
            gif(
                args.instrumentFrontend,
                instrumentVinylFile({
                    coverageServer: args.coverageServer
                })
            )
        )
        .pipe(generateStarterLocalFiles(config));

    if (!package_manager.isGulpLocal) {
        stream = stream.pipe(amdOptimize(config.amdConfig)).pipe(
            map(function(file, cb) {
                const content = file.contents.toString();
                file.contents = Buffer.from(content + '\n' + licenses_content);
                cb(null, file);
            })
        );
    }

    stream
        .pipe(chmod(0o666))
        .pipe(gulp.dest(dest, { mode: '0777' }))
        .on('end', cb);
}

function compileTemplates(config, cb) {
    function getOnlyTemplatesGlobs(config) {
        const shell = require('shelljs');
        const appName = path.basename(config.exportFile, '.js');
        let templateManifest = 'templates-manifest-' + appName + '.json';
        if (!shell.test('-f', templateManifest)) {
            return [];
        }
        templateManifest = JSON.parse(shell.cat(templateManifest));

        let templatesToAdd = {};

        let templates = _.map(templateManifest, function(templateFile) {
            const parentTemplate = path.basename(templateFile, '.tpl.js');
            templatesToAdd = _.extend(
                templatesToAdd,
                process.dataTemplateDependencies[parentTemplate] || {}
            );
            return path.join(process.gulp_dest, 'processed-templates', templateFile);
        });
        templates = _.union(
            templates,
            _.map(templatesToAdd, function(t) {
                return path.join(process.gulp_dest, 'processed-templates', t + '.tpl.js');
            })
        );

        // we will recreate another override map to be more performant
        if (!package_manager.overrides.mapLocal) {
            package_manager.overrides.mapLocal = {};
            _.each(package_manager.overrides.map, function(val, key) {
                const p = path.join(
                    process.gulp_dest,
                    'processed-templates',
                    path.basename(key) + '.js'
                );
                package_manager.overrides.mapLocal[p] = val;
            });
        }
        const files = _.union([path.join(process.gulp_dest, 'javascript-libs.js')], templates);
        return files;
    }

    const requiredFiles = getOnlyTemplatesGlobs(config);
    const outputFile = path.basename(config.exportFile, '.js') + '-templates.js';
    const doUglify = !args.nouglify && !package_manager.isGulpLocal;

    gulp.src(requiredFiles, { allowEmpty: true })
        .pipe(
            gif(
                args.instrumentFrontend,
                instrumentVinylFile({
                    coverageServer: args.coverageServer
                })
            )
        )
        .pipe(concat(outputFile))
        .pipe(gif(doUglify, uglify({ output: { comments: 'some' } })))
        .on('error', package_manager.pipeErrorHandler)
        .pipe(chmod(0o666))
        .pipe(gulp.dest(path.join(package_manager.getNonManageResourcesPath()), { mode: '0777' }))
        .on('end', cb);
}

function cloneJson(json) {
    return JSON.parse(JSON.stringify(json));
}

function processJavascript(cb) {
    let configs = package_manager.getTaskConfig('javascript', []);

    configs = _.isArray(configs) ? configs : [configs];
    async.each(
        configs,
        function(config, cb) {
            const applications = package_manager.distro.app_manifest.application || [];
            const export_file = config.exportFile.replace(/\.js$/, '');

            config.is_extensible = _.contains(applications, export_file);

            if (config.is_extensible) {
                compileSCA(
                    cloneJson(config),
                    function() {
                        if (!process.is_SCA_devTools && !package_manager.isGulpLocal) {
                            compileTemplates(cloneJson(config), cb);
                        } else {
                            cb();
                        }
                    },
                    !process.is_SCA_devTools && !package_manager.isGulpLocal
                );
            } else {
                compileSCA(cloneJson(config), cb, false);
            }
        },
        function() {
            cb();
        }
    );
}

function requireJSCopy() {
    return gulp
        .src(package_manager.getGlobsForModule('require.js', 'javascript'), { allowEmpty: true })
        .pipe(chmod(0o666))
        .pipe(gulp.dest(dest, { mode: '0777' }));
}

function ensureFolder(name) {
    try {
        !fs.existsSync(name) && fs.mkdirSync(name, { mode: '0777' });
    } catch (ex) {}
}

gulp.task('javascript-entrypoints', function(cb) {
    const configs = package_manager.getTaskConfig('javascript', []);
    ensureFolder(process.gulp_dest);
    ensureFolder(path.join(process.gulp_dest, 'javascript-dependencies'));
    _(configs).each(function(config) {
        let contentPrefix = '';
        if (args.instrumentBc) {
            if (!_.contains(config.dependencies, 'ViewContextDumper')) {
                config.dependencies.push('ViewContextDumper');
            }

            contentPrefix =
                '\nINTRUMENT_BC_ARGUMENT = "' +
                args.instrumentBc +
                '";\n' +
                (args.instrumentationServer
                    ? 'INTRUMENT_BC_SERVER = "' + args.instrumentationServer + '";\n'
                    : '');
        }

        const dependenciesModuleName = config.entryPoint + '.Dependencies';
        const fn_params = []; // we must pass the arguments because an amdclean issue
        for (let i = 0; i < _(config.dependencies).keys().length; i++) {
            fn_params.push('a' + i);
        }
        const content =
            contentPrefix +
            "define('" +
            dependenciesModuleName +
            "', " +
            JSON.stringify(config.dependencies) +
            ', function(' +
            fn_params.join(',') +
            '){ return Array.prototype.slice.call(arguments); }); ';

        fs.writeFileSync(
            path.join(process.gulp_dest, 'javascript-dependencies', dependenciesModuleName + '.js'),
            content
        );
    });
    cb();
});

gulp.task('backward-compatibility-amd-unclean', function(cb) {
    const outputFile = 'backward-compatibility-amd-unclean.js';
    const doUglify = !args.nouglify && !package_manager.isGulpLocal;
    const files = _.union(
        _.flatten(
            _.map(
                package_manager.getGlobsForModule(almondNSPackage, almondNSPackageSection),
                function(g) {
                    return glob(g);
                }
            )
        ),
        _.flatten(
            _.map(
                package_manager.getGlobsForModule('SC.Extensions', 'javascript-almond-fix'),
                function(g) {
                    return glob(g);
                }
            )
        ),
        _.flatten(
            _.map(package_manager.getGlobsFor('javascript-ext'), function(g) {
                return glob(g);
            })
        )
    );

    gulp.src(files, { allowEmpty: true })
        .pipe(
            map(function(file, cb) {
                if (
                    path.basename(file.path, '.js') === 'almond' ||
                    path.basename(file.path, '.js') === 'LoadTemplateSafe'
                ) {
                    let file_content = '';
                    if (path.basename(file.path, '.js') === 'almond') {
                        file_content += "var was_undefined = (typeof define === 'undefined');\n";
                    }
                    file_content += 'if(was_undefined)\n{\n';
                    file_content += file.contents.toString();
                    file_content += '\n}\n';

                    file.contents = Buffer.from(file_content);
                }
                cb(null, file);
            })
        )
        .pipe(concat(outputFile))
        .pipe(gif(doUglify, uglify({ output: { comments: 'some' } })))
        .on('error', package_manager.pipeErrorHandler)
        .pipe(chmod(0o666))
        .pipe(gulp.dest(path.join(process.gulp_dest), { mode: '0777' }))
        .on('end', cb);
});

gulp.task('libs', function libs(cb) {
    function getAMDIndexFile(requiredFiles) {
        const requiredModules = _.map(requiredFiles, function(f) {
            return path.basename(f);
        });
        const indexName = 'index-javascript-lib';
        let counter = 0;

        const indexContent =
            "define('" +
            indexName +
            "', [" +
            _.map(requiredModules, function(m) {
                if (m.indexOf('handlebars.runtime') === 0) {
                    return "'Handlebars'";
                }
                if (m.indexOf('almond.custom') === 0) {
                    return "'almond'";
                }
                return "'" + m + "'";
            }).join(', ') +
            '], function(' +
            _.map(requiredModules, function() {
                counter++;
                return 'a' + counter;
            }).join(', ') +
            '){});';

        return {
            name: indexName,
            content: indexContent
        };
    }

    function getPathFile(moduleName, folderName, fileName) {
        const file =
            _.flatten(
                _.map(package_manager.getGlobsForModule(moduleName, folderName), function(g) {
                    if (fileName) {
                        return [
                            _.find(glob(g), function(f) {
                                return f.indexOf(fileName) !== -1;
                            })
                        ];
                    }
                    return glob(g);
                })
            )[0] || '';

        return file.replace(/\.[jt]s$/, '');
    }

    const outputFile = 'javascript-libs.js';
    const doUglify = !args.nouglify && !package_manager.isGulpLocal;
    const files = {
        almond: getPathFile(almondNSPackage, almondNSPackageSection),
        LoadTemplateSafe: getPathFile('SC.Extensions', 'javascript-almond-fix'),
        Handlebars: getPathFile('handlebars', 'javascript'),
        'Handlebars.CompilerNameLookup': getPathFile(
            'HandlebarsExtras',
            'javascript',
            'Handlebars.CompilerNameLookup'
        )
    };

    const indexFile = getAMDIndexFile(_.values(files));
    const amdOptimizeConfig = {
        paths: files,
        preserveLicenseComments: true,
        optimize: 'none',
        rawText: {}
    };

    amdOptimizeConfig.rawText[indexFile.name] = indexFile.content;

    const globs = _.map(_.values(files), file => {
        return file + '.*';
    });

    gulp.src(globs, { allowEmpty: true })
        .pipe(ts(typeScriptCompilerOptions))
        .pipe(
            through(
                file => {
                    let file_path = file.path.replace(/\.js$/, '');
                    file_path = file_path.replace(/\\/g, '/');
                    amdOptimizeConfig.rawText[file_path] = file.contents.toString();
                },
                function() {
                    const file = new File({
                        path: indexFile.name + '.js',
                        contents: Buffer.from('')
                    });
                    this.emit('data', file);
                    this.emit('end');
                }
            )
        )
        .pipe(amdOptimize(amdOptimizeConfig))
        .on('error', package_manager.pipeErrorHandler)
        .pipe(concat(outputFile))
        .pipe(gif(doUglify, uglify({ output: { comments: 'some' } })))
        .on('error', package_manager.pipeErrorHandler)
        .pipe(chmod(0o666))
        .pipe(gulp.dest(path.join(process.gulp_dest), { mode: '0777' }))
        .on('end', cb);
});

let js_deps = [requireJSCopy, 'javascript-entrypoints'];

!process.is_SCA_devTools && js_deps.splice(0, 0, 'templates');

js_deps.push(gulp.series('backward-compatibility-amd-unclean', 'libs'));
js_deps = gulp.parallel(js_deps);

gulp.task('javascript', gulp.series(js_deps, processJavascript));

gulp.task('javascript_local', () => {
    let globs = package_manager.getGlobsFor('javascript');
    const destination = path.join(dest, 'compiled');

    if (package_manager.isGulpUnitTest) {
        globs = globs.concat(package_manager.getGlobsFor('unit-test-files'));
    }

    return gulp
        .src(globs, { allowEmpty: true })
        .pipe(package_manager.handleOverrides())
        .pipe(sourcemaps.init())
        .pipe(ts(typeScriptCompilerOptions))
        .pipe(
            map((file, cb) => {
                const fileName = path.basename(file.path);
                file.base = file.path.replace(fileName, '');
                cb(null, file);
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(chmod(0o666))
        .pipe(
            gulp.dest(destination),
            { mode: '0777' }
        );
});

gulp.task('watch-javascript', function() {
    const globs = package_manager.getGlobsFor('javascript');
    gulp.watch(globs, { interval: 1000 }, gulp.series('javascript_local'));
});
