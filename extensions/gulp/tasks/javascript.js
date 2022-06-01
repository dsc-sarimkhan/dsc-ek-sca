'use strict';

var gulp = require('gulp');
var fs = require('fs');
var glob = require('glob');

function clean_js_tmp(cb)
{
	var javascript_task = require('../extension-mechanism/local-tasks/javascript')
	,   path = require('path')
    ,   configurations = require('../extension-mechanism/configurations').getConfigs();

	if(fs.existsSync(javascript_task.js_destination))
	{
		glob.sync(path.join(configurations.folders.output, 'extensions', '*_ext.js')).forEach(
			fs.unlinkSync
		);
		cb();
	}
	else
	{
		fs.mkdirSync(javascript_task.js_destination, { recursive: true });
		cb();
	}
};

gulp.task('javascript', gulp.series(clean_js_tmp, function process_javascript(cb)
{
	var javascript_task = require('../extension-mechanism/local-tasks/javascript');
	javascript_task.compileJavascript(cb);
}));

gulp.task('watch-javascript', gulp.series('javascript'));
