'use strict';
var gulp = require('gulp');

gulp.task('pre-templates', (cb)=>
{
    if(process.running_local)
    {
        var shell = require('shelljs')
        ,   path = require('path')
        ,   configurations = require('../extension-mechanism/configurations');

        var tpls_folder = path.join(configurations.getConfigs().folders.output, 'processed-templates');

        if(!shell.test('-d', tpls_folder))
        {
            shell.mkdir('-p',tpls_folder);
        }
    }
    cb();
});

gulp.task('templates', gulp.series('pre-templates', function do_templates(cb)
{
	var templates_task = require('../extension-mechanism/local-tasks/templates');

    if(process.running_local)
    {
        templates_task.runTemplatesLocal(cb);
        return;
    }

	templates_task.runTemplates(cb);
}));
