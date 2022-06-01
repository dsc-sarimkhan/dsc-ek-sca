/*jshint esversion: 6 */
'use strict';

const gulp = require('gulp');
const log = require('ns-logs');
const c = require('ansi-colors');
const configs = require('../configurations').getConfigs();
const through = require('through2').obj;
const path = require('path');
const shell = require('shelljs');
const _ = require('underscore');
const crypto = require('crypto');
const Vinyl = require('vinyl');

var ManifestManager = require('../manifest-manager');

var prepare_deploy_folder = {

	prepareDeployFolder: function prepareDeployFolder(data, cb)
	{
		try
		{
			log(c.green('Preparing content to deploy in ' + configs.folders.deploy + '...'));

			var new_manifest = {
				name: data.manifest.name
			,	fantasyName: data.manifest.fantasyName
			,	vendor: data.manifest.vendor
			,	type: data.manifest.type
			,	target: data.manifest.target
			,	target_version: data.manifest.target_version
			,	version: data.manifest.version
			,	description: data.manifest.description
			,	override: data.manifest.override
			,	skins: data.manifest.skins
			,	templates: data.manifest.templates
			,	sass: data.manifest.sass
			,	assets: data.manifest.assets
			,	translations: data.manifest.translations
			};

			if(data.new_extension)
			{
				var new_targets = [];

				_.each(data.new_extension.targets, function(target_id)
				{
					var target_obj = _.find(data.targets, function(target)
					{
						return target.target_id === target_id;
					});

					if(target_obj)
					{
						new_targets.push(target_obj.name);
					}
				});

				new_manifest.name = data.new_extension.name;
				new_manifest.fantasyName = data.new_extension.fantasy_name;
				new_manifest.vendor = data.new_extension.vendor;
				new_manifest.version = data.new_extension.version;
				new_manifest.target_version = data.new_extension.target_version;
				new_manifest.target = new_targets.join(',');
				new_manifest.description = data.new_extension.description;
			}

			var deploy_path = path.join(configs.folders.deploy, new_manifest.vendor, new_manifest.name + '@' + new_manifest.version)
			,	sources = configs.deploy_config.source
			,	src_folder = configs.folders.theme_path
			, 	src_paths = [];

			if(sources)
			{
				if(data.new_extension)
				{
					log(c.yellow('Ignoring the use of --source parameter when creating a new theme. Deploying all the content...'));
					src_paths.push('*');
				}
				else
				{
					src_paths.push('manifest.json');

					_.each(sources, function(source)
					{
						switch(source)
						{
							case 'templates':
								src_paths.push(path.join('**', '*.tpl'));
								break;
							case 'sass':
								src_paths.push(path.join('**', '*.scss'));
								break;
							case 'assets':
								var asset_files = ManifestManager.getAssetFilesForManifest(data.manifest.name);
								src_paths = src_paths.concat(asset_files);
								break;
							case 'skins':
								src_paths.push('Skins', '*.json');
								break;
							case 'translations':
								var translations = _.values(data.manifest.translations || {});
								src_paths = src_paths.concat(translations);
								break;
						}
					});
				}
			}
			else
			{
				src_paths.push('*');
			}

			shell.rm('-rf', configs.folders.deploy + '/*');

            const { data: uploadManifest, name: uploadManifestName } = data.uploadManifest;

			gulp.src(src_paths, { cwd: src_folder + '/**', allowEmpty: true, nodir: true })
			.pipe(through(function(file, type, done) {
				const filePath = path.join(deploy_path, path.relative(file.base, file.path));
				const contents = file.contents.toString();
				const hash = crypto.createHash('md5').update(contents).digest('hex');

				uploadManifest[filePath] = uploadManifest[filePath] || '';

				if(path.basename(file.path) === 'manifest.json') {
					file.contents = Buffer.from(JSON.stringify(new_manifest, null, 4));
					this.push(file);
				} else if(uploadManifest[filePath] !== hash){
                    uploadManifest[filePath] = hash;
					this.push(file);
                }
				done();
		}, function(done) {
				const deployDist = configs.folders.deploy;
				const uploadManifestFile = new Vinyl({
					path: path.join(deployDist, '..', '..', uploadManifestName),
					base: deployDist,
					contents: Buffer.from(JSON.stringify(uploadManifest))
				});

				this.push(uploadManifestFile);
				done();
            }))
			.pipe(gulp.dest(deploy_path, {mode: '0777'}))
			.on('end', function()
				{
					data.new_manifest = new_manifest;
					cb(null, data);
				}
			)
			.on('error', function(err)
				{
					cb(err);
				}
			);
		}
		catch(err)
		{
			cb(err);
		}
	}
};

module.exports = prepare_deploy_folder;
