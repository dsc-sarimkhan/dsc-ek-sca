/*jshint esversion: 6 */

const gulp = require('gulp'),
	yargs = require('yargs'),
	configurations = require('../extension-mechanism/configurations');

yargs.option(
	    'ask_credentials', {
	      alias: 'to',
	      describe: 'Retrieve credentials and application data again ignoring .nsdeploy file and application downloaded files'
	    })
.option('credentials.vm', {
		alias: ['vm', 'credentials:vm'],
		describe: 'Virtual Machine'
})
.option('credentials.molecule', {
		alias: ['m', 'credentials:molecule'],
		describe: 'Molecule'
})
.option('credentials.nsVersion', {
		alias: ['nsVersion', 'credentials:nsVersion'],
		describe: 'Version'
})
.option('credentials.roleId', {
		alias: ['role', 'credentials:roleId'],
		describe: 'Role Id'
})
.option('credentials.website', {
		alias: ['website', 'credentials:website'],
		describe: 'Website'
})
.option('credentials.applicationId', {
		alias: ['applicationId', 'credentials:applicationId'],
		describe: 'Application Id'
})
.option('credentials.domain', {
		alias: ['domain', 'credentials:domain'],
		describe: 'Domain name (www.name.com)'
})
.option('script.web_service', {
		alias: ['web-script', 'script:web_service'],
		describe: 'Reslet Script Id of the Extension Mechanism web service'
})
.option('script.file_service', {
		alias: ['file-script', 'script:file_service'],
		describe: 'Reslet Script Id of the Extension Mechanism file service'
})
.option('deploy.web_service', {
	alias: ['web-deploy', 'deploy:web_service'],
		describe: 'Reslet Script Deploy of the Extension Mechanism web service'
})
.option('fetchConfig.extension', {
		alias: ['fetch', 'fetchConfig:extension'],
		describe: 'If you want to start working on an extension you had previously in the file cabinet. Format: '
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
