var sourcemaps = require('gulp-sourcemaps')
,	gulp = require('gulp')
,	path = require('path')
,	fs = require('fs')
,	concat = require('files-concat')
,	map = require('map-stream')
,	_ = require('underscore');

var manifest_manager = require('../manifest-manager')
,	watch_manager = require('../watch-manager')
,	configs = require('../configurations').getConfigs();

var javascript_destination = path.join(configs.folders.output, 'extensions');

function generateEntryPoints()
{
    var	application_manifest = configs.application.application_manifest
    ,	entry_points
    ,	js_dest = [];

    if(application_manifest)
    {
        var entry_points = application_manifest.application;
        _.each(entry_points, function(application)
        {
            js_dest.push(path.join(javascript_destination, application + '_ext.js'));
        });
    }

    return [entry_points, js_dest];
}

var javascript_files = [];

function generateGetAssetsPathFunction(manifest)
{
	var assets_paths = [
		'extensions'
	,	manifest.vendor
	,	manifest.name
	,	manifest.version
	,	''
	].join('/');

	var function_string = 'function getExtensionAssetsPath(asset){\n';
	function_string += '\treturn \'' + assets_paths + '\' + asset;\n';
	function_string += '}\n\n';

	return function_string;
}

function generateDefinesSection(manifests, application, dest_file)
{
	var content = 'var extensions = {};\n\n'
	,	app_javascript_files = []
    ,	appModuleNames = [];

	_.each(manifests, function(manifest)
	{
		if(manifest.javascript && manifest.javascript.application)
		{
			var javascript_data = manifest.javascript.application[application];

			if( javascript_data && _.isArray(javascript_data.files))
			{
				if(manifest.javascript.entry_points[application])
				{
					var files_extension = javascript_data.files
					,	extension_name = [manifest.vendor, manifest.name, manifest.version].join('.')
					,	entry_point = manifest.javascript.entry_points[application]
					,	entry_point_content = '';

					var extension_content = 'extensions[\'' + extension_name + '\'] = function(){\n\n';
					extension_content += generateGetAssetsPathFunction(manifest);

					files_extension = _.map(files_extension, function(file)
					{
						return path.join(configs.folders.source.source_path, manifest.name, file);
					});

					_.each(files_extension, function(file_path)
					{
						if(file_path.endsWith(path.join(entry_point)))
						{
							entry_point_content = fs.readFileSync(file_path) + '\n\n';
						}
						else
						{
                            var fileContent = fs.readFileSync(file_path) + '\n\n';
                            extension_content += fileContent;
							appModuleNames.push(getDefineNames(fileContent));
						}
					});

					app_javascript_files = _.union(app_javascript_files, files_extension);

					//add entry point code last
					extension_content += entry_point_content + '};\n\n';
					content += extension_content;
				}
				else
				{
					throw new Error('Manifest ' + manifest.name + ': missing entry point for ' + application);
				}
			}
		}
	});

	javascript_files = _.union(javascript_files, app_javascript_files);

    content += `SC.ENVIRONMENT.EXTENSIONS_JS_MODULE_NAMES = ${JSON.stringify(appModuleNames)};`;
	//var file_name = path.basename(dest_file, '.js');
	//content = '//# sourceMappingURL=' + file_name + '.map\n' + content;
    appendContentToDestFile(dest_file, content);

	//It was commented because doesn't work properly
	//generateSourceMaps(app_javascript_files, dest_file);
}

function getDefineNames(fileContent) {
    try{
        var fakeDefine = 'var defineName = "";';
        fakeDefine += 'function define(name, dependencies, callback){';
		fakeDefine += 'defineName = name;';
        fakeDefine += '}\n';
        fakeDefine += fileContent;

        eval(fakeDefine);

        return defineName;
    } catch (error) {
        console.log(error);
    }
}

function generateSourceMaps(files_extension, dest_file)
{
	var dest_dir = path.dirname(dest_file)
	,	file_name = path.basename(dest_file, '.js');

	gulp.src(files_extension, {allowEmpty: true})
	.pipe(sourcemaps.init({largeFile: true}))
	.pipe(concat(file_name))
	.pipe(sourcemaps.write('.'))
	.pipe(map(function(file, cb)
	{
		if(path.basename(file.path, '.js') === file_name)
		{
			return cb(null, null);
		}
		cb(null, file);
	}))
	.pipe(gulp.dest(dest_dir));
}

function appendContentToDestFile(destFile, content) {
    var destFileContent = '';
    if (fs.existsSync(destFile)) {
        destFileContent = fs.readFileSync(destFile).toString();
    }
    fs.writeFileSync(destFile, destFileContent+content);
}


function generateRequireSection(manifests, application, dest_file)
{
	var content = '';
	_.each(manifests, function(manifest)
	{
		if(manifest.javascript && manifest.javascript.application)
		{
			var javascript_data = manifest.javascript.application[application]
			,	app_entry_point = manifest.javascript.entry_points[application];

			if(javascript_data)
			{
				if(app_entry_point)
				{
					content += '\n';
					var name = app_entry_point.match(/([^\/\\]*)\.js$/);
					var module_name = name.length && name[1];
					var extension_name = [manifest.vendor, manifest.name, manifest.version].join('.');

					content += 'try{\n';
					content += '	extensions[\'' + extension_name + '\']();\n';
					content += '	SC.addExtensionModule(\'' + module_name + '\');\n';
					content += '}\n';
					content += 'catch(error)\n';
					content += '{\n';
					content += '	console.error(error);\n';
					content += '}\n\n';
				}
				else
				{
					throw new Error('Manifest ' + manifest.name + ': missing entry point for ' + application);
				}
			}
		}
	});

    appendContentToDestFile(dest_file, content);
}

function compileJavascript(cb)
{
	var manifests = manifest_manager.getExtensionManifests()
    ,   [entry_points, js_dest] = generateEntryPoints();

	_.each(entry_points, function(application, i)
	{
		var js_app_dest = js_dest[i];
		generateDefinesSection(manifests, application, js_app_dest);
		generateRequireSection(manifests, application, js_app_dest);
	});

	watch_manager.registerWatch(javascript_files, ['watch-javascript']);
	cb();
}

module.exports = {
	compileJavascript: compileJavascript
,	js_destination: javascript_destination
};
