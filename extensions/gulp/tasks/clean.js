var gulp = require('gulp'),
configurations = require('../extension-mechanism/configurations'),
fs = require('fs');

const config = configurations.getConfigs();
/**
 * Removes temporary files and folders
 *
 * @task {clean}
 * @order {4}
 * @group {Utility tasks}
 */
gulp.task(
	'clean'
,	(cb) =>
	{
		try
		{
			fs.rmdirSync('.nsdeploy tmp ' + config.folders.local + ' ' + config.folders.deploy + ' ' + require('../extension-mechanism/credentials-inquirer').nsdeploy_path, { recursive: true });
			cb();
		}
		catch (error)
		{
			cb(error);
		}
	}
);
