/*jshint esversion: 6 */
'use strict';

const gulp = require('gulp');
const {log, colorText, color} = require('ns-logs');
const configurations = require('../configurations');
const through = require('through2').obj;
const path = require('path');
const { rmdirSync } = require('fs');
const _ = require('underscore');
const crypto = require('crypto');
const Vinyl = require('vinyl');

var ManifestManager = require('../manifest-manager');
const config = configurations.getConfigs();

var prepare_deploy_folder = {

	prepareDeployFolder: function prepareDeployFolder(data, cb)
	{
		log(colorText(color.GREEN, 'Preparing content to deploy in ' + config.folders.deploy + '...'));

		try
		{
			var new_manifest = {
				name: data.manifest.name
			,	fantasyName: data.manifest.fantasyName
			,	vendor: data.manifest.vendor
			,	type: data.manifest.type
			,	cct: data.manifest.cct
			,	page: data.manifest.page
			,	target: data.manifest.target
			,	target_version: data.manifest.target_version
			,	version: data.manifest.version
			,	description: data.manifest.description
			,	assets: data.manifest.assets
			,	configuration: data.manifest.configuration
			,	templates: data.manifest.templates
			,	sass: data.manifest.sass
			,	javascript: data.manifest.javascript
			,	'ssp-libraries': data.manifest['ssp-libraries']
			,   suitescript2: data.manifest.suitescript2
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

			var deploy_path = path.join(config.folders.deploy, new_manifest.vendor, new_manifest.name + '@' + new_manifest.version)
			,	sources = config.deploy_config.source
			,	src_folder = data.ext_folder
			, 	src_paths = [];

			if(sources)
			{
				if(data.new_extension)
				{
					log(colorText(color.YELLOW, 'Ignoring the use of --source parameter when creating a new extension. Deploying all the content...'));
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
							case 'configuration':
								var conf_files =  data.manifest.configuration && data.manifest.configuration.files.length ? data.manifest.configuration.files : [];
								src_paths = src_paths.concat(conf_files);
								break;
							case 'ssp-libraries':
								var ssp_lib_files = data.manifest['ssp-libraries'] && data.manifest['ssp-libraries'].files.length ? data.manifest['ssp-libraries'].files : [];
								src_paths = src_paths.concat(ssp_lib_files);
								break;
							case 'javascript':
								var js_files = ManifestManager.getJsFilesForManifest(data.manifest.name);
								src_paths = src_paths.concat(js_files);
								break;
							case 'services':
								var assets = data.manifest.assets || {};
								var services = assets.services || {};
								var service_files = services.files || []
								src_paths = src_paths.concat(service_files);
								break;
							case 'suitescript2':
								var ss2_files = data.manifest.suitescript2 && data.manifest.suitescript2.files.length ? data.manifest.suitescript2.files : [];
								src_paths = src_paths.concat(ss2_files);
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

            rmdirSync(config.folders.deploy + '/*', {recursive: true});

            const { data: uploadManifest, name: uploadManifestName } = data.uploadManifest;

			gulp.src(src_paths, {cwd: src_folder + '/**', allowEmpty: true, nodir: true})
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
                    const deployDist = config.folders.deploy;
                    const uploadManifestFile = new Vinyl({
                        path: path.join(deployDist, '..', '..', uploadManifestName),
                        base: deployDist,
                        contents: Buffer.from(JSON.stringify(uploadManifest))
                    });

                    this.push(uploadManifestFile);
                    done();
                }))
				.pipe(gulp.dest(deploy_path, { mode: 0o700 }))
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
