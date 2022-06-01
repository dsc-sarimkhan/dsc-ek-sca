/*jshint esversion: 6 */

const gulp = require('gulp'),
	nsArgs = require('ns-args'),
	configurations = require('../extension-mechanism/configurations');

// declare all possible command line arguments
// Retrieve credentials and application data again ignoring .nsdeploy file and application downloaded files
nsArgs.option( 'ask_credentials', {
	alias: 'to'
});

// Virtual Machine
nsArgs.option('credentials.vm', {
	alias: ['vm', 'credentials:vm']
});

// Molecule
nsArgs.option('credentials.molecule', {
	alias: ['m', 'credentials:molecule']
});

//	Version
nsArgs.option('credentials.nsVersion', {
	alias: ['nsVersion', 'credentials:nsVersion']
});

//	Role Id
nsArgs.option('credentials.roleId', {
	alias: ['role', 'credentials:roleId']
});

// Website
nsArgs.option('credentials.website', {
	alias: ['website', 'credentials:website']
});

//	Application Id
nsArgs.option('credentials.applicationId', {
	alias: ['applicationId', 'credentials:applicationId']
});

// Domain name (www.name.com)
nsArgs.option('credentials.domain', {
	alias: ['domain', 'credentials:domain']
});

// Reslet Script Id of the Extension Mechanism web service
nsArgs.option('script.web_service', {
	alias: ['web-script', 'script:web_service']
});

// Reslet Script Id of the Extension Mechanism file service
nsArgs.option('script.file_service', {
	alias: ['file-script', 'script:file_service']
});

// Reslet Script Deploy of the Extension Mechanism web service
nsArgs.option('deploy.web_service', {
	alias: ['web-deploy', 'deploy:web_service']
});

// If you want to start working on an extension you had previously in the file cabinet. Format
nsArgs.option('fetchConfig.extension', {
	alias: ['fetch', 'fetchConfig:extension']
});

function executeFetch(cb)
{
	var fetch_lib = require('../extension-mechanism/fetch/fetch')
	,	validate = require('./validate');

	fetch_lib.fetch(function(error)
	{
		if(!error)
		{
			validate.validate(cb);
		}
		else
		{
			cb(error);
		}
	});
}

if(configurations.getConfigs().extensionMode)
{
	/**
	* Downloads the active theme and active extensions code (optional).
	* It can receive the following arguments:
	* @task {extension:fetch}
	* @order {4}

	* @arg {fetch} Comma separated list of extension names to download. Use "" (double quotes) if the name contain spaces.
	* @arg {m <arg>} Idem as extension:deploy parameter.
   	* @arg {to} Idem as extension:deploy parameter.
	*/
	gulp.task('extension:fetch', executeFetch);
}
else
{
	/**
	* Downloads active theme and extensions code.
	* It can receive the following arguments:
	* @task {theme:fetch}
	* @order {4}

	* @arg {m <arg>} Idem as theme:deploy parameter.
   	* @arg {to} Idem as extension:deploy parameter.
	*/
	gulp.task('theme:fetch', executeFetch);
}
