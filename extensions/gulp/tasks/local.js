const gulp = require('gulp');
const configurations = require('../extension-mechanism/configurations');

require('./watch');
require('./validate');
const config = configurations.getConfigs();

function localMessage(cb)
{
	var {log, color, colorText} = require('ns-logs')
    ,   run_https = config.dbConfig.https
	,	folders_watching = config.extensionMode ? (config.folders.extensions_path).join(', ') : config.folders.theme_path;

	if(config.credentials && config.credentials.is_scis)
	{
		run_https = true;
	}

	log('+- Local server available at ' + colorText(color.CYAN, (run_https ? 'https': 'http') + '://localhost:' + config.dbConfig.port) + '.');
	log('+- Watching current folder: '  + colorText(color.CYAN, folders_watching)+ '.');

	log('+- Type ' + colorText(color.CYAN, 'gulp')+ ' for help on how to use the commands.');
	log('+- Please check your local.ssp applications to start working locally.');
	log('+- To cancel Gulp Watch enter: ' + colorText(color.CYAN, 'control + c')+ '.');
	cb();
}

if(config.extensionMode)
{
	/**
	* Compiles the code locally -javascript, templates and sass- and watch for changes to work in -local.ssp urls.
	* Updates the manifest automatically before compiling.
	* It can receive the following arguments:
	* @task {extension:local}
	* @order {6}
	
	* @arg {ssp-application-path} SSP Application path. Required if touchpoints are configured to access -local.ssp files.
	* @arg {preserve-manifest} Do not automatically update the manifest.json file.
	*/
	gulp.task('extension:local', gulp.series('update-validate', 'watch', localMessage));
}
else
{
	/**
	* Compiles the code locally -templates and sass- and watch for changes to work in the -local.ssp urls.
	* It recognizes overrides made in the Overrides folder.
	* To add new override files execute theme:local again.
	* Updates the manifest automatically before compiling.
	* It can receive the following arguments:
	* @task {theme:local}
	* @order {6}
	
	* @arg {ssp-application-path} SSP Application path. Required if touchpoints are configured to access -local.ssp files.
	* @arg {preserve-manifest} Do not automatically update the manifest.json file.
	*/
	gulp.task('theme:local', gulp.series('update-validate', 'watch', localMessage));
}
