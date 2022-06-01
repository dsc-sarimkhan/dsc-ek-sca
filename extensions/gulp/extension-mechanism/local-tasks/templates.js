/* jshint esversion: 6 */
const gulp = require('gulp');
const async = require('ns-async');
const concat = require('files-concat');
const fs = require('fs');
const map = require('map-stream');

const handleBarsCompile = require('handlebars-compile');
const handlebars = require('handlebars');
const path = require('path');
const _ = require('underscore');

const manifest_manager = require('../manifest-manager');
const watch_manager = require('../watch-manager');
const configurations = require('../configurations').getConfigs();

const local_folders = _.map(configurations.folders.source, function(folder)
{
	return path.join(folder, '**/*.tpl');
});

function findTemplateDependencies(content)
{
	var regex = /data-\w*\-{0,1}template=\\"([^"]+)\\"/gm
		,	result
		,	deps = ['\'Handlebars\'', '\'Handlebars.CompilerNameLookup\''];
	do
	{
		result = regex.exec(content);
		if(result && result.length > 1)
		{
			deps.push('\'' + result[1] + '.tpl\'');
		}
	}
	while(result);
	return deps;
}

var nameLookup = handlebars.JavaScriptCompiler.prototype.nameLookup;

var wrapTemplates = function(stream)
{
	var handleOverrides = _.bind(manifest_manager.handleOverrides, manifest_manager);

	var theme_manifest = manifest_manager.getThemeManifest()
		,	theme_path = [
		'http://localhost:' + configurations.dbConfig.port
		,	'tmp'
		,	'extensions'
		,	theme_manifest.vendor
		,	theme_manifest.name
		,	theme_manifest.version
		,	''].join('/');

	var compile_templates = function compile_templates()
	{
		handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name)
		{
			return 'compilerNameLookup(' + parent + ',"' + name + '")';
		};
		return handleBarsCompile({handlebars: handlebars});
	};

	return stream
		.pipe(handleOverrides())
		.pipe(compile_templates())
		.pipe(map((file, cb) =>
		{
			var current_contents = file.contents.toString()
				,	module_name = path.basename(file.path, '.js');

			var deps = findTemplateDependencies(current_contents);

			var extension_path = [
				'http://localhost:' + configurations.dbConfig.port
				,	'tmp'
				,	manifest_manager.getTemplateExtensionPath(file.path)
			].join('/');

			file.contents = Buffer.from(
				'define(\'' + module_name + '.tpl\', [' + deps.join(',') + '], function (Handlebars, compilerNameLookup){ var t = ' + current_contents + '; var main = t.main; t.main = function(){ arguments[1] = arguments[1] || {}; var ctx = arguments[1]; ctx._extension_path = \'' + extension_path + '\'; ctx._theme_path = \'' + theme_path + '\'; return main.apply(this, arguments); }; var template = Handlebars.template(t); template.Name = \'' + module_name + '\'; return template;});'
			);

			cb(null, file);
		}));
};

function generateLibraryFile(cb)
{
	const outputFile = `javascript-libs.js`;
	const files = [
		'node_modules/handlebars/dist/handlebars.runtime.js'
	,	'gulp/extension-mechanism/client-script/Handlebars.CompilerNameLookup.js'
	];

	gulp.src(files, { allowEmpty: true })
	.pipe(map(function(file, cb) {
            if (path.basename(file.path, '.js') === 'handlebars.runtime') {
				const fileContent = file.contents.toString();
				file.contents = Buffer.from(fileContent.replace('define([', 'define("Handlebars", ['));
			}
			cb(null, file);
		})
	)
	.pipe(concat(outputFile))
	.pipe(gulp.dest(configurations.folders.output, { mode: 0o700 }))
	.on('end', cb);
}

function runTemplates(gulpDone)
{
	async.each(manifest_manager.getTemplateApplications(), (application, cb)=>
	{
		var templates = manifest_manager.getApplicationTemplates(application, true);

		wrapTemplates(gulp.src(templates, {allowEmpty: true}))
			.on('error', gulpDone)
			.pipe(concat(application + '-templates.js'))
			.pipe(gulp.dest(configurations.folders.output))
			.on('end', cb);
	}, function()
	{
		handlebars.JavaScriptCompiler.prototype.nameLookup = nameLookup;
		gulpDone.apply(this, arguments);
	});
}

function runTemplatesLocal(gulpDone)
{
	const db_config = configurations.dbConfig;

	async.each(manifest_manager.getTemplateApplications(), (application, cb) =>
	{
		var paths = {}
		,   templates = manifest_manager.getApplicationTemplates(application, true);

		wrapTemplates(gulp.src(templates, {allowEmpty: true}))
			.pipe(map(function(file, cb)
			{
				file.path = file.path.replace('.js', '.tpl.js');

				paths[path.basename(file.path, '.js')] = `tmp/processed-templates/${path.basename(file.path, '.js')}`;

				file.base = path.dirname(file.path);

				cb(null, file);
			}))
			.pipe(gulp.dest(path.join(configurations.folders.output, 'processed-templates')))
			.on('end', ()=>
			{
				// shim dependencies to work with module-loader. Added in devtools for backward compatibility
				const shimDependencies = {
					'Backbone.Validation': { deps: [ 'Backbone' ] },
					bootstrap: { deps: [ 'jQuery' ] },
					'bootstrap-datepicker': { deps: [ 'jQuery', 'bootstrap' ] },
					highcharts: { deps: [ 'jQuery' ] },
					jQuery: { exports: 'jQuery' },
					'jQuery.bxSlider': { deps: [ 'jQuery' ] },
					JsBarcode: { deps: [ 'jQuery' ] },
					'jquery.keyboard': { deps: [ 'jQuery' ] },
					'jquery.zoom': { deps: [ 'jQuery' ] },
					zoom: { deps: [ 'jQuery' ] },
					json2: { exports: 'JSON' },
					tablesort: { exports: 'window.Tablesort' },
					timeline: { exports: 'links' },
					'jquery.cookie': { deps: [ 'jQuery' ] },
					typeahead: { deps: [ 'jQuery' ] },
					'timeline-locales': { exports: 'links.locales' }
				};

				var protocol = db_config.https ? 'https' : 'http';
				var content = `require.config({
                "paths": ${JSON.stringify(paths, null, 4)}
            ,   "baseUrl": '${protocol}://localhost:${db_config.port}'
            ,   "shim": ${JSON.stringify(shimDependencies)}
            });
            SC.ENVIRONMENT.TEMPLATES_MODULE_NAMES = ${JSON.stringify(_.keys(paths))};`;

				var dest_file = path.join(
					configurations.folders.output
				,   `${application}-templates.js`
				);

				console.log(dest_file);
				fs.writeFileSync(dest_file, content);
				cb();
			});
	}, function()
	{
		gulpDone.apply(this, arguments);
	});

	// register templates file watch
	watch_manager.registerWatch(local_folders, ['templates']);
}

module.exports = {
	runTemplates: runTemplates
,   runTemplatesLocal: runTemplatesLocal
,	generateLibraryFile: generateLibraryFile
};
