/* jshint node: true */

const fs = require('fs');
const log = require('ns-logs');
const c = require('ansi-colors');
const _ = require('underscore');
const mime = require('mime');
const path = require('path');
const glob = require('glob').sync;
const shell = require('shelljs');

const archiver = require('../library/archiver');

const binary_types = [
    'application/x-autocad',
    'image/x-xbitmap',
    'application/vnd.ms-excel',
    'application/x-shockwave-flash',
    'image/gif',
    'application/x-gzip-compressed',
    'image/ico',
    'image/jpeg',
    'message/rfc822',
    'audio/mpeg',
    'video/mpeg',
    'application/vnd.ms-project',
    'application/pdf',
    'image/pjpeg',
    'image/x-png',
    'image/png',
    'application/postscript',
    'application/vnd.ms-powerpoint',
    'video/quicktime',
    'application/rtf',
    'application/sms',
    'image/tiff',
    'application/vnd.visio',
    'application/msword',
    'application/zip',
    'image/svg+xml',
    'application/x-font-ttf',
    'application/font-woff',
    'application/vnd.ms-fontobject',
    'image/x-icon',
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'image/x-icon',
    'image/vnd.microsoft.icon'
];

module.exports = {
    read: function(deploy, cb) {
        fs.readFile(deploy.options.file, { encoding: 'utf8' }, function(err, file) {
            if (err && err.code !== 'ENOENT') {
                // unknown error
                return cb(err);
            }
            if (err && err.code === 'ENOENT') {
                // File does not exists
                return cb(null, deploy);
            }
            // file is present
            if (!deploy.options.newDeploy) {
                const saved_info = JSON.parse(file);
                deploy.info = _.extend(deploy.info, saved_info.credentials || {});
            }
            return cb(null, deploy);
        });
    },

    write: function(deploy, cb) {
        const saving_info = _.extend({}, deploy.info);
        delete saving_info.password;
        delete saving_info.script;
        delete saving_info.deploy;
        delete saving_info.distro;
        delete saving_info.distro_path;
        delete saving_info.distroName;

        fs.writeFile(deploy.options.file, JSON.stringify({credentials: saving_info}, '\t', 4), function() {
            return cb(null, deploy);
        });
    },

    processFiles: function(deploy, cb) {
        const files = deploy.files.map(function(file) {
            const type = mime.getType(file.path);

            const file_info = {
                path: file.path.replace(file.base, ''),
                type: type,
                contents: file.contents.toString(~binary_types.indexOf(type) ? 'base64' : 'utf8')
            };

            let dirname = path.dirname(file.relative);
            dirname = dirname.replace(/\\/g, '/'); // Fix Windows paths
            if (deploy.publicList && deploy.publicList.indexOf(dirname) >= 0) {
                file_info.setIsOnline = true;
            }
            return file_info;
        });

        const data = JSON.stringify({
            target_folder: deploy.info.target_folder,
            backup_info: deploy.backup_info,
            files: files
        });

        const payload_path = path.join(process.gulp_init_cwd, 'payload.json');
        fs.writeFile(payload_path, data, function(error) {
            cb(error, deploy);
        });
    },

    processBackup: function(deploy, cb) {
        log('Starting', c.cyan('Backup sources'));
        console.log('Press control + c to cancel');

        const { distro } = deploy.info;
        const { distro_path } = deploy.info;
        const projectDir = path.resolve(path.join(process.gulp_dest, '..'));
        const rootDir = path.resolve(path.join(projectDir, '..'));
        const distro_rel_path = path.relative(rootDir, distro_path);

        const sourceFolder = '_Sources';
        const archiveName = deploy.info.distroName + '-' + new Date().toISOString() + '.zip';
        const archiveOptions = {
            target: path.join(process.gulp_dest, sourceFolder, archiveName),
            isMultiVolume: true,
            // suitetalk limit is 10mb
            maxVolumeLength: 1024 * 1024 * 9.8,
            archiveType: 'zip',
            sources: [
                {
                    expand: true,
                    cwd: rootDir,
                    src: [
                        path.join(distro_rel_path, '..', 'gulp', '**', '*'),
                        path.join(distro_rel_path, '*.*')
                    ]
                },
                {
                    expand: false,
                    cwd: rootDir,
                    src: [path.join(distro_rel_path, '..', '!(payload)*.*')]
                }
            ]
        };

        let src = [];
        _.each(distro.modules, module => {
            let ns_package = glob(path.join(distro_path, module, 'ns.package.json'));
            if (!ns_package || !ns_package.length) {
                return;
            }
            ns_package = ns_package[0];

            let ns_package_json = shell.cat(ns_package);
            ns_package_json = JSON.parse(ns_package_json).gulp;

            _.each(ns_package_json, (globs, resource) => {
                globs = _.isArray(globs) ? globs : _.keys(globs);
                const new_globs = _.map(globs, (glob) => {
                    return path.join(distro_rel_path, module, glob);
                });

                new_globs.push(path.relative(rootDir, ns_package));
                src = _.union(src, new_globs);
            });
        });

        distro.backend = distro.backend || {};
        const backendSuiteScript = distro.backend.suitescript || [];
        const backendThirdParties = (distro.backend.third_parties || []).map(ss2ThirdParty => {
            return path.join('..', '*', 'third_parties', ss2ThirdParty.replace(/\.js$/, '.d.ts'));
        });

        [...backendSuiteScript, ...backendThirdParties].forEach(fileGlobs => {
            const newGlobs = glob(path.join(distro_path, fileGlobs)).map(fileGlob => {
                return path.relative(rootDir, fileGlob);
            });
            src = _.union(src, newGlobs);
        });

        archiveOptions.sources.push({
            expand: true,
            cwd: rootDir,
            src: src
        });

        archiver(archiveOptions, function(error) {
            if (error) {
                return cb(error);
            }

            let files = fs.readdirSync(path.join(process.gulp_dest, sourceFolder));
            files = files.map(function(file_name) {
                const file_path = path.join(process.gulp_dest, sourceFolder, file_name);
                const file_info = {
                    path: sourceFolder + '/' + file_name,
                    type: 'application/zip',
                    setIsOnline: false,
                    contents: fs.readFileSync(file_path).toString('base64')
                };

                return file_info;
            });

            const context = {
                target_folder: deploy.info.target_folder,
                files: files
            };
            cb(null, deploy);
        });
    }
};
