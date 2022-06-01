var gulp = require('gulp'),
configurations = require('../extension-mechanism/configurations'),
shell = require('shelljs');

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
			shell.rm('-rf', '.nsdeploy tmp ' + config.folders.local + ' ' + config.folders.deploy + ' '
				+ require('../extension-mechanism/credentials-inquirer').nsdeploy_path);
			cb();
		}
		catch (error)
		{
			cb(error);
		}
	}
);
