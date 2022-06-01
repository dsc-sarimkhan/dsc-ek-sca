/*jshint esversion: 6 */

var {log, color, colorText} = require('ns-logs')
,	configs = require('../configurations').getConfigs()
,	path = require('path')
,   fs = require('fs')
,	_ =  require('underscore');

var update_helper = require('./update-manifest-resources')
,	compute_differences = require('./compute-differences');

function impactChanges(manifest)
{

	var new_manifest = {
		name: manifest.name
	,	fantasyName: manifest.fantasyName
	,	vendor: manifest.vendor
	,	version: manifest.version
	,	type: manifest.type
	,	target: manifest.target
	,	target_version: manifest.target_version
	,	description: manifest.description
	,	cct: manifest.cct
	,	page: manifest.page
	,	override: manifest.override
	,	skins: _.sortBy(manifest.skins, 'name')
	,	assets: manifest.assets
	,	configuration: manifest.configuration
	,	sass: manifest.sass
	,	templates: manifest.templates
	,	javascript: manifest.javascript
	,	translations: manifest.translations
	,	'ssp-libraries': manifest['ssp-libraries']
	,	local_folder: manifest.local_folder
    ,	suitescript2: manifest.suitescript2
	};

	fs.writeFileSync(path.join(new_manifest.local_folder, 'manifest.json'), JSON.stringify(new_manifest, null, 4));
}

function isSkin(file_path)
{
	return file_path.toLowerCase().includes('skin');
}

function updateManfiest(manifest, file_path, action)
{
	var mod_regex = new RegExp('\/' + manifest.name + '\/(.*)')
	,	module_path = file_path.match(mod_regex) && file_path.match(mod_regex)[1]
	,	asset_path = file_path.match(/\/assets\/(.*)/) && file_path.match(/\/assets\/(.*)/)[1];

	var update_data = {
		manifest: manifest
	,	file_path: module_path
	,	action: action
	,	cb: impactChanges
	};

	var update_asset_data = {
		manifest: manifest
	,	file_path: asset_path
	,	action: action
	};

	var file_promise;

	if(asset_path)
	{
		return update_helper.updateAssets(update_asset_data);
	}

    switch(path.extname(file_path))
    {
        case '.scss':
            file_promise = update_helper.updateSass(update_data);
            break;
        case '.tpl':
            file_promise = update_helper.updateTemplates(update_data);
            break;
        case '.json':
            if(isSkin(file_path) && !configs.extensionMode)
            {
                file_promise = update_helper.updateSkins(update_data);
                break;
			}

            if (compute_differences.isTranslation(file_path) && configs.extensionMode) {
                file_promise = update_helper.updateTranslations(update_data);
                break;
            }

            file_promise = update_helper.updateConfiguration(update_data);
            break;
        case '.js':
            file_promise = update_helper.updateJavascript(update_data);
            break;
        default:
            log(colorText(color.YELLOW, `Sorry. Could not update the manifest for the file ${file_path})`));
            file_promise = Promise.resolve();
            break;
    }

	return file_promise;
}

function getFilesPromises(manif_update_data)
{
	var manifest_files_promises = [];

	_.each(manif_update_data.differences.add, function(file)
	{
		manifest_files_promises.push(
			updateManfiest(manif_update_data.manifest, file, 'added')
		);
	});

	_.each(manif_update_data.differences.delete, function(file)
	{
		manifest_files_promises.push(
			updateManfiest(manif_update_data.manifest, file, 'deleted')
		);
	});

	return manifest_files_promises;
}

function startUpdateManifest(cb)
{
	if(configs.folders.extensions_path || configs.folders.theme_path)
	{
		var maninfest_diff_promises = compute_differences.computeDifferences()
		,	update_manifest_promises = [];

		Promise.all(maninfest_diff_promises)
		.then(function(differences_data)
		{
			_.each(differences_data, function(manif_diff_data)
			{
				update_manifest_promises.push(

					Promise.all(getFilesPromises(manif_diff_data))
					.then(function()
					{
						impactChanges(manif_diff_data.manifest);
					})
				);
			});

			return Promise.all(update_manifest_promises);
		})
		.then(function()
		{
			cb();
		})
		.catch(function(error)
		{
			cb(error);
		});
	}
	else
	{
		log(colorText(color.RED, 'No extensions or themes in your workspace were found. Aborting.'));
		cb();
	}
}

module.exports = {
	startUpdateManifest: startUpdateManifest
};
