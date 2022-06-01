/*jshint esversion: 6 */
'use strict';

const fs = require('fs');
const path = require('path');
const HelpDisplay = require('./gulp/extension-mechanism/HelpDisplay');
const gulp = require('gulp');
const args = require('yargs')
	.parserConfiguration({ 'dot-notation': true })
	.option('product', {
		default: 'gulp',
		hidden: true
	});
const configurations = require('./gulp/extension-mechanism/configurations');

process.gulp_init_cwd = process.env.INIT_CWD || process.cwd();

const config = configurations.getConfigs();

if(config.extensionMode)
{
	if (['update-manifest', 'extension:update-manifest', 'extension:local', 'extension:deploy'].indexOf(process.argv[2]) !== -1)
	{
		require('./gulp/extension-mechanism/init')();
	}
}
else
{
	if (['update-manifest', 'theme:update-manifest', 'theme:local', 'theme:deploy'].indexOf(process.argv[2]) !== -1)
	{
		require('./gulp/extension-mechanism/init')();
	}
}

// evaluate all gulp tasks files
var baseTaskDir = path.resolve(__dirname, './gulp/tasks');
fs.readdirSync(baseTaskDir).forEach(function(task_name)
{
	if (/\.js/.test(task_name))
	{
		require(path.join(baseTaskDir, task_name.replace('.js', '')));
	}
});

/**
 * This simply defines help task which would produce usage
 * display for this gulpfile.
 */
gulp.task('help', async function()
{
	return new HelpDisplay();
});
gulp.task('default', gulp.parallel('help'));
