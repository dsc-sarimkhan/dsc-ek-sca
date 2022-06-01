/*jshint esversion: 6 */
'use strict';

var {log, colorText, color} = require('ns-logs')
,	configs = require('../configurations').getConfigs()
,	_ = require('underscore')
,	semver = require('semver');

var ConversionTool = require('../conversion-tool')
,	RecordHelper = require('../extension-record-helper')
,	ResourcePromisesHelper = require('./resource-promises-helper')
,   FileServiceClient = require('../client-script/FileServiceClient');

var DownloadResourcesHelper = {

	getManifestFilePromises: async function getManifestFilePromises(manifest, cb)
	{
		var isFetchExtension = manifest.type === 'extension' && configs.fetchConfig.extension && _.contains(configs.fetchConfig.extension.split(','), manifest.name);

        try
        {
            if(manifest.type !== 'theme' && !isFetchExtension)
            {
                return [];
            }

            let result = await RecordHelper.searchExtensions({manifest: manifest});

            //Get the manifest in order to use its path updated since the one that comes in the activationManifest may be old (generated before a SCEM push)
            const file_service_client = FileServiceClient.getInstance();
            const manifest_file = await file_service_client.getFiles([result.extension_record.manifest_id]);
            manifest.path = manifest_file[0].path;

            if(!isFetchExtension)
            {
                return this.downloadFiles(manifest);
            }

            if (result.extension_record && result.has_bundle)
            {
                log(colorText(color.YELLOW, 'Cannot fetch packaged extension ' + manifest.name + '.\n' +
                    '\tYou can only fetch custom extensions located in your file cabinet.\n'));

                return [];
            }

            ConversionTool.updateConfigPaths(manifest);
            return this.downloadFiles(manifest);
        }
        catch(error)
        {
            cb(error);
        }
	}

,	downloadFiles: function downloadFiles(manifest)
	{
		var app_manifest = configs.application.application_manifest
        ,   allowed_resources = app_manifest.extensible_resources
		,	file_promises = [];

		//for versions of SC >= to 19.1 we should support suite script 2 resources because SSPv2 is available but not present into app manifest
    	if(!semver.lt(app_manifest.version, '19.1.0') && !_.contains(allowed_resources, 'suitescript2'))
        {
            allowed_resources.push('suitescript2');
        }

		_.each(manifest, function(resource_data, resource)
		{
			if(_.contains(allowed_resources, resource))
			{
				var message_finished = 'Finished downloading ' + resource + ' of ' + manifest.type + ': ' +  manifest.name + '...'
				,	resource_promises;

				switch(resource)
				{
					case 'templates':
					case 'javascript':

						resource_promises = ResourcePromisesHelper.getFilesPromisesForAppResource({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises = file_promises.concat(resource_promises);
						break;

					case 'sass':
					case 'ssp-libraries':
					case 'configuration':
                    case 'suitescript2' :

						resource_promises = ResourcePromisesHelper.getFilesPromisesForResource({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises.push(resource_promises);
						break;

					case 'assets':

						resource_promises = ResourcePromisesHelper.getAssetFilesPromises({
                            manifest: manifest
                        ,	resource: resource
                        ,	message_finished: message_finished
                        });

						file_promises.push(resource_promises);
						break;
				}
			}
		});

		return file_promises;
	}
};

module.exports = DownloadResourcesHelper;
