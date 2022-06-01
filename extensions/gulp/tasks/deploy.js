'use strict';

const gulp = require('gulp');
const {log, colorText, color} = require('ns-logs');
const nsArgs = require('ns-args');
const configurations = require('../extension-mechanism/configurations');
const deploy_task_helper = require('../extension-mechanism/deploy/deploy-task-helper');

const config = configurations.getConfigs();

// declare all possible command line arguments
// --create Automatically will upload the local extension to a new folder and create a new extension record
nsArgs.option('deploy_config.create', {
	alias: ['create', 'deploy_config:create']
});

// --update Automatically will deploy the folders, and update the version of the extension record if necessary
nsArgs.option('deploy_config.update', {
	alias: ['update', 'deploy_config:update']
});

// --advanced The deploy will give the option to update the extension version, description and targets
nsArgs.option('deploy_config.advanced', {
	alias: ['advanced', 'deploy_config:advanced']
});

// --skip-compilation Skip extra compilation of the sass and templates to check for syntax errors, and upload directly the source code and manifest
nsArgs.option('deploy_config.skip_compilation', {
	alias: ['skip-compilation', 'deploy_config:skip_compilation']
});

// --source <source> Deploy only sass or templates files
nsArgs.option('deploy_config.source', {
	alias: ['source', 'deploy_config:source']
});

// Virtual Machine
nsArgs.option('credentials.vm', {
	alias: ['vm', 'credentials:vm']
});

// Molecule
nsArgs.option('credentials.molecule', {
	alias: ['m', 'credentials:molecule']
});

// Integration record Key
nsArgs.option('credentials.key', {
    alias: ['key', 'credentials:key']
});

// Integration record  Secret
nsArgs.option('credentials.secret', {
    alias: ['secret', 'credentials:secret']
});

// Version
nsArgs.option('credentials.nsVersion', {
	alias: ['nsVersion', 'credentials:nsVersion']
});

// --debug will upload javascript without minifying.
nsArgs.option('deploy_config.debug_mode', {
	alias: ['debug', 'deploy_config:debug_mode']
});

deploy_task_helper.syncThemeFolder();
deploy_task_helper.syncExtensionsFolder();

function startDeploy(cb)
{
	var deploy_lib = require('../extension-mechanism/deploy/deploy');

	var task = config.extensionMode ? 'extensions' : 'themes',
		sources = config.extensionMode ? 'javascript, ssp-libraries, sass, templates, assets, etc.' : 'sass, templates, assets.'

	log('+- Starting deploy process...');

	if(!_isSkipCompilation())
	{
		log('+- You can use ' + colorText(color.CYAN, '--skip-compilation') + ' to deploy ' + task + ' faster.');
	}

	if(!nsArgs.argv().source)
	{
		log('+- You can use ' + colorText(color.CYAN, '--source') + ' option to upload only ' + sources);
	}

	log('+- Type ' + colorText(color.CYAN, 'gulp') + ' for extra help on how to use the commands.');

	deploy_lib.deploy(cb);
}

function _isSkipCompilation()
{
	return nsArgs.argv()['skip-compilation'];
}

var compilation_tasks = [];
if(!_isSkipCompilation())
{
	compilation_tasks = deploy_task_helper.getCompilationTasks();
	compilation_tasks = [gulp.parallel(compilation_tasks)];
}
compilation_tasks.push(startDeploy);

if(config.extensionMode)
{
	/**
	 * Uploads an extension to the File Cabinet and creates or updates necessary records.
	 *
	 * @task {extension:deploy}
	 * @order {8}

	 * @arg {skip-compilation} Skips all the compilation tasks and uploads the extension directly.
	 * @arg {source} Comma separated list of resources to deploy. Possible values: templates,sass,ssp-libraries,services,assets,configuration.
	 * @arg {create} Creates a new extension, instead of updating the current one.
	 * @arg {advanced} Updates the extension record: vendor, name, version, and description.
	 * @arg {preserve-manifest} Do not automatically update the manifest.json file.
	 * @arg {m <arg>} Deploys to molecule named <arg>. i.e. "gulp extension:deploy --m f" deploys to system.f.netsuite.com.
	 * @arg {to} Asks for credentials, ignoring .nsdeploy file.
	 */
	gulp.task('extension:deploy', gulp.series(compilation_tasks));
}
else
{
	/**
	 * Uploads the theme to the File Cabinet and creates or updates necessary records.
	 * @task {theme:deploy}
	 * @order {8}

	 * @arg {skip-compilation} Skips all the compilation tasks and uploads the theme directly.
	 * @arg {source} Comma separated list of resources to deploy. Possible values: templates,sass,assets,skins.
	 * @arg {create} Creates a new theme, instead of updating the current one.
	 * @arg {advanced} Updates the theme record: vendor, name, version, and description. Available for custom themes.
	 * @arg {preserve-manifest} Do not automatically update the manifest.json file.
	 * @arg {m <arg>} Deploys to molecule named <arg>. i.e. "gulp theme:deploy --m f" deploys to system.f.netsuite.com.
	 * @arg {to} Asks for credentials, ignoring .nsdeploy file.
	 */
	gulp.task('theme:deploy', gulp.series(compilation_tasks));
}
