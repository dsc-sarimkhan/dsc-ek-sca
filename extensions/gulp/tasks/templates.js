'use strict';
var gulp = require('gulp');

gulp.task('pre-templates', (cb)=>
{
    if(process.running_local)
    {
        var fs = require('fs')
        ,   path = require('path')
        ,   configurations = require('../extension-mechanism/configurations');

        var tpls_folder = path.join(configurations.getConfigs().folders.output, 'processed-templates');

        if(!fs.existsSync(tpls_folder))
        {
            fs.mkdirSync(tpls_folder, { recursive: true });
        }
    }

	var templates_task = require('../extension-mechanism/local-tasks/templates');
	templates_task.generateLibraryFile(cb);
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
