var fs = require('fs')
,	configurations = require('./configurations')
,	path = require('path')
,	shell = require('shelljs')
,	_ = require('underscore')
,   configs = configurations.getConfigs();


'use strict';

var conversion_tool = {

	_createDir: function _createDir(path)
	{
		try
		{
			if(!fs.existsSync(path))
			{
				shell.mkdir('-p', path);
			}
		}
		catch (err)
		{
			console.error(err.message);
		}
	}

,	createWorkspaceFolders: function createWorkspaceFolders(overwrite_ext)
	{
		var self = this;

		//only delete extras folder
		if(configs.extensionMode)
		{
			var extras_path = configs.folders.source.extras_path
			,	extensions_path = configs.folders.extensions_path
			;

			if(fs.existsSync(extras_path))
			{
				shell.rm('-rf', extras_path);
			}

			self._createDir(extras_path);

			_.each(overwrite_ext, function(ext_path)
			{
				if(fs.existsSync(ext_path))
				{
					shell.rm('-rf', ext_path);
				}

				extensions_path = extensions_path.filter(ext => ext !== ext_path);
			});

			configs.folders.extensions_path = extensions_path || [];
		}
		else
		{
			_.each(configs.folders.source, function(root_path)
			{
				if(fs.existsSync(root_path))
				{
					shell.rm('-rf', root_path);
				}

				self._createDir(root_path);
			});
		}


	}

,	getResourceType: function getResourceType(file)
	{
		return file && file.resourceType ? file.resourceType : null;
	}

,	initializeExtensionFolder: function initializeExtensionFolder(manifest)
	{
		var self = this
		,	isExtensionMode = configs.extensionMode
		,	source_folder = configs.folders.source.source_path
		,	folder_path
		;

		switch(manifest.type)
		{
			case 'theme':

				if(isExtensionMode)
				{
					folder_path = path.join(configs.folders.source.extras_path, manifest.name);
				}
				else
				{
					folder_path = path.join(source_folder, manifest.name);
				}

				break;

			case 'extension':

				if(isExtensionMode)
				{
					folder_path = path.join(source_folder, manifest.name);
				}
				else
				{
					folder_path = path.join(configs.folders.source.extras_path, manifest.vendor, manifest.name);
				}
				break;
		}

		self._createDir(folder_path);
		return folder_path;
	}

,	extensionToModules: function extensionToModules(manifest, files)
	{
		var self = this;
		var extension_path = self.initializeExtensionFolder(manifest);
		var is_extension = manifest.type === 'extension';

		_.each(files, function(file)
		{
			var resource = self.getResourceType(file);

			if(resource)
			{
				//replace file cabinet backend path by the local development environment path
				var local_file_destination = file.file.replace(manifest.path + '/', '');

				var destination_path = path.join(extension_path, local_file_destination);
				self._createDir(path.dirname(destination_path));
				fs.writeFileSync(destination_path, file.content);

				// after creating the file, if in theme mode and is extension, create also the empty folders inside overrides
				// ignoring assets
				if(is_extension && !configs.extensionMode &&
					path.dirname(local_file_destination).split('/').indexOf('assets') !== 0 )
				{
					var override_destination_path = path.join(configs.folders.overrides_path, manifest.vendor, manifest.name, path.dirname(local_file_destination));
					self._createDir(override_destination_path);
				}
				return;
			}
		});

		var manifest_path = path.join(extension_path, 'manifest.json');
		if(!fs.existsSync(manifest_path))
		{
			fs.writeFileSync(manifest_path, JSON.stringify(manifest, null, '\t'));
		}
	}

,	updateConfigPaths: function updateConfigPaths(manifest, options)
	{
		var source_folder = configs.folders.source.source_path;

		if(manifest.type === 'theme')
		{
			var theme_path
			,	overrides_path;

			if(configs.extensionMode)
			{
				theme_path = configs.folders.source.extras_path + '/' + manifest.name;
			}
			else
			{
				theme_path = source_folder + '/' + manifest.name;
			}

			configs.folders.theme_path = theme_path;
			overrides_path = theme_path + '/' + configs.folders.overrides;
			configs.folders.overrides_path = overrides_path;

			try
			{
				if(!fs.existsSync(overrides_path))
				{
					shell.mkdir('-p', overrides_path);
				}
			}
			catch (err)
			{
				console.error(err.message);
			}
		}
		else
		{
			var extension_path = configs.folders.source.source_path + '/' + manifest.name
			,	extensions_config_paths = configs.folders.extensions_path || []
			;

			if(options && options.replace && options.replace_path)
			{
				var index = _.indexOf(extensions_config_paths, options.replace_path);
				extensions_config_paths[index] = extension_path;
			}
			else if(!_.contains(extensions_config_paths, extension_path))
			{
				extensions_config_paths.push(extension_path);
			}

			configs.folders.extensions_path =  extensions_config_paths;
		}

        configurations.saveConfigs();
	}
};

module.exports = conversion_tool;
