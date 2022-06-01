var gulp = require('gulp');

gulp.task('assets', function(cb)
{
	var configurations = require('../extension-mechanism/configurations')
		,	path = require('path')
		,	map = require('map-stream')
		,	manifest_manager = require('../extension-mechanism/manifest-manager')
		,	_ = require('underscore');

	let config = configurations.getConfigs();
	var local_folders = _.map(config.folders.source, function(folder)
	{
		return path.join(folder, '*', 'assets', '**', '*.*');
	});

	gulp.src(local_folders, {allowEmpty: true})
		.pipe(map(function(file, cb)
		{
			try
			{
				var file_path = file.path.replace(file.base, '');
				file_path = file_path.split(path.sep);

				var ext_name_index = file_path.indexOf('assets');

				var manifest = manifest_manager.getManifestByName(file_path[ext_name_index - 1]);

				file.base = path.join.apply(path, [file.base].concat(file_path.slice(0, ext_name_index + 1)));

				file_path.splice(0, ext_name_index + 1);
				file_path = path.join.apply(path, file_path);

				file.path = path.join(file.base, 'extensions', manifest.vendor, manifest.name, manifest.version, file_path);

				cb(null, file);
			}
			catch(error)
			{
				cb(error);
			}
		}))
		.pipe(gulp.dest(path.join(config.folders.output), { mode: 0o700 }))
		.on('end', cb);
});
