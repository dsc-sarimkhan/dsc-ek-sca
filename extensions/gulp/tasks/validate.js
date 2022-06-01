const gulp = require('gulp'),
	nsArgs = require('ns-args'),
	configurations = require('../extension-mechanism/configurations');

require('./update-manifest');
let config = configurations.getConfigs();

// --preserve-manifest Do not automatically update the manifest.json file
nsArgs.option('preserveManifest', {
	alias: 'preserve-manifest'
});

function do_validate(cb)
{
	var validate_helper = require('../extension-mechanism/local-tasks/validate-manifest');

	return validate_helper.validateManifests(cb);
}

var validate_dep = nsArgs.argv()['preserve-manifest'] ? [] : [gulp.parallel('update-manifest')];
validate_dep.push(do_validate);
/**
 * Validates the manifest file.
 * @task {validate}
 * @group {Utility tasks}
 */
gulp.task('validate', do_validate);
gulp.task('update-validate', gulp.series(validate_dep));

module.exports = {
	validate: do_validate
};
