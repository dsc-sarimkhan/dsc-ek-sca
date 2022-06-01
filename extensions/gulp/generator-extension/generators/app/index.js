/* jshint esversion: 6 */

const {color, colorText} = require('ns-logs');
const path = require('path');
const semver = require('semver');
const { existsSync, mkdirSync } = require('fs');
const _ = require('underscore');
const pjson = require('../../../../package.json');
const configurations = require('../../../../gulp/extension-mechanism/configurations');

const ModuleGenerator = require('../module/index');

module.exports = class extends ModuleGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.option('n');
    }

    prompting() {
        console.log(
            '\nWelcome! Let´s bootstrap your extension by following these steps:\n',
        );

        return this.prompt([
            {
                type: 'input',
                name: 'fantasy_name',
                message: 'Set your Extension Fantasy Name',
                default: 'My Cool Extension!',
            },
            {
                type: 'input',
                name: 'name',
                message: 'Set your Extension Name (for folders and files)',
                default: 'MyCoolExtension',
                validate(input) {
                    let re = new RegExp(/^[a-z0-9_]+$/i);

                    if (!re.test(input)) {
                        return 'The Extension name must include only alphanumeric character and underscores.';
                    }

                    re = new RegExp(/^[a-z][a-z0-9_]+$/i);

                    if (!re.test(input)) {
                        return 'The Extension name must start with an alphabetic character.';
                    }

                    return true;
                },
            },
            {
                type: 'input',
                name: 'vendor',
                message: 'Set the Vendor Name',
                default: 'Acme',
                validate(input) {
                    let re = new RegExp(/^[a-z0-9]+$/i);

                    if (!re.test(input)) {
                        return 'The Vendor name must include only alphanumeric character.';
                    }

                    re = new RegExp(/^[a-z][a-z0-9]+$/i);

                    if (!re.test(input)) {
                        return 'The Vendor name must start with an alphabetic character.';
                    }

                    return true;
                },
            },
            {
                type: 'input',
                name: 'version',
                message: 'Assign a Version Number',
                default: '1.0.0',
                validate(input) {
                    if (!semver.validRange(input)) {
                        return 'Please provide a valid version number (ie. 1.0.0)';
                    }

                    return true;
                },
            },
            {
                type: 'input',
                name: 'description',
                message: 'Set a Description for your extension',
                default: 'My cool extension does magic!',
            },
            {
                type: 'input',
                name: 'module_name',
                message: 'Set the initial Module Name (for folders and files)',
                default: 'MyCoolModule',
                validate(input) {
                    let re = new RegExp(/^[a-z0-9]+$/i);

                    if (!re.test(input)) {
                        return 'The Module name must include only alphanumeric character.';
                    }

                    re = new RegExp(/^[a-z][a-z0-9]+$/i);

                    if (!re.test(input)) {
                        return 'The Module name must start with an alphabetic character.';
                    }

                    return true;
                },
            },
            {
                type: 'checkbox',
                name: 'target',
                message:
                    `This extension supports (Press ${colorText(color.CYAN, '<space>')} to select)`,
                default: ['SCS'],
                choices: [
                    { value: 'SCS', name: 'SuiteCommerce Online' },
                    { value: 'SCIS', name: 'SuiteCommerce InStore' },
                ],
                validate(input) {
                    return input.length > 0;
                },
            },
        ])
            .then((answers) => {
                this.extension_options = answers;

                if (_.contains(this.extension_options.target, 'SCS')) {
                    this.extension_options.target.push('SCA');
                }
            })
            .then(() => {
                let questions = [];

                const default_target_version = pjson.version.replace(
                    /^.*(\d\d\.\d\d?\.\d\d?)$/,
                    '$1',
                );
                // Add a target_version question for each target
                questions = _.map(this.extension_options.target, (target) => ({
                    type: 'input',
                    name: `${target}_target_version`,
                    message: `Set the target version of ${target}`,
                    default: `>=${default_target_version}`,
                    validate(input) {
                        if (!semver.validRange(input)) {
                            return 'Please provide a valid version number (ie. 1.0.0)';
                        }

                        return true;
                    },
                }));

                this.is_scis = _.contains(this.extension_options.target, 'SCIS');

                if (!this.is_scis) {
                    questions = questions.concat([
                        {
                            type: 'checkbox',
                            name: 'application',
                            message:
                                'This extension will be applied to (Press '
                                + colorText(color.CYAN, '<space>')
                                + ' to select)',
                            default: ['shopping', 'myaccount', 'checkout'],
                            choices: [
                                { value: 'shopping', name: 'Shopping' },
                                { value: 'myaccount', name: 'My Account' },
                                { value: 'checkout', name: 'Checkout' },
                            ],
                        },
                        {
                            type: 'checkbox',
                            name: 'resources',
                            message:
                                'For this extension you will be using (Press '
                                + colorText(color.CYAN, '<space>')
                                + ' to select)',
                            default: [
                                'templates',
                                'sass',
                                'configuration',
                                'suitescript',
                                'javascript',
                                'ss2',
                            ],
                            choices: [
                                { value: 'javascript', name: 'JavaScript' },
                                { value: 'suitescript', name: 'SuiteScript' },
                                { value: 'templates', name: 'Templates' },
                                { value: 'sass', name: 'Sass' },
                                { value: 'configuration', name: 'Configuration' },
                                { value: 'ss2', name: 'SuiteScript2' },
                            ],
                        },
                    ]);
                } else {
                    questions = questions.concat([
                        {
                            type: 'checkbox',
                            name: 'resources',
                            message:
                                'For this extension you will be using (Press '
                                + colorText(color.CYAN, '<space>')
                                + ' to select)',
                            default: ['suitescript', 'javascript', 'ss2'],
                            choices: [
                                { value: 'javascript', name: 'JavaScript' },
                                { value: 'suitescript', name: 'SuiteScript' },
                                { value: 'ss2', name: 'SuiteScript2' },
                            ],
                        },
                    ]);
                }

                return this.prompt(questions);
            })
            .then((answers) => {
                this.extension_options.target_version = {};
                _.each(answers, (answer, question) => {
                    const match = question.match(/^(.*)_target_version$/);
                    if (!match) {
                        return;
                    }
                    this.extension_options.target_version[match[1]] = answer;
                });

                this.extension_options.resources = answers.resources;
                if (answers.application) {
                    this.extension_options.application = answers.application;
                } else if (this.is_scis) {
                    this.extension_options.application = ['instore'];
                }

                this.extension_options.is_cct = false;

                const ext_application = this.config.get('ext_application') || {};
                ext_application[
                    this.extension_options.name
                    ] = this.extension_options.application;

                // this will determine for all the rest of the files of this extension
                // for which application will they be compiled
                this.config.set('ext_application', ext_application);

                const root_ext_path = path.join(
                    this.contextRoot,
                    this.work_folder,
                    this.extension_options.name,
                );

                if (existsSync(root_ext_path)) {
                    return this.prompt([
                        {
                            type: 'confirm',
                            name: 'continue',
                            message:
                                'The extension '
                                + this.extension_options.fantasy_name
                                + ' already exists.\nDo you want to continue and overwrite it?',
                            default: false,
                        },
                    ]);
                }
            })
            .then((answer_confirm) => {
                if (answer_confirm && !answer_confirm.continue) {
                    this.env.error(
                        'Create extension '
                        + this.extension_options.fantasy_name
                        + ' operation was cancelled.',
                    );
                }
            });
    }

    writing() {
        // create basic extension folders
        const root_ext_path = path.join(
            this.contextRoot,
            this.work_folder,
            this.extension_options.name,
        );
        const assets_path = path.join(root_ext_path, 'assets');
        const manifest_dest_path = path.join(root_ext_path, 'manifest.json');
        const { module_name } = this.extension_options;
        const module_path = path.join(
            root_ext_path,
            'Modules',
            this.extension_options.module_name,
        );
        const self = this;


        mkdirSync(root_ext_path, { recursive: true });
        mkdirSync(path.join(root_ext_path, 'Modules'), { recursive: true });
        mkdirSync(module_path, { recursive: true });
        mkdirSync(assets_path, { recursive: true });
        mkdirSync(path.join(assets_path, 'fonts'), { recursive: true });
        mkdirSync(path.join(assets_path, 'img'), { recursive: true });
        mkdirSync(path.join(assets_path, 'services'), { recursive: true });

        this.fs.copyTpl(
            path.join(
                this.options.gulp_context,
                'generators',
                'app',
                'templates',
                'manifest.json',
            ),
            this.destinationPath(manifest_dest_path),
            {
                name: self.extension_options.name,
                fantasy_name: self.extension_options.fantasy_name,
                version: self.extension_options.version,
                vendor: self.extension_options.vendor,
                target: self.extension_options.target.join(','),
                description: self.extension_options.description || '',
            },
        );

        const manifest = this.fs.readJSON(manifest_dest_path);
        manifest.target_version = self.extension_options.target_version;

        const module_metadata = {
            manifest,
            base_path: root_ext_path,
            module_name,
            create_mode: true,
        };

        // add resources accordignly

        _.each(this.extension_options.resources, (resource) => {
            switch (resource) {
                case 'javascript':
                    self._writeJavascript(module_metadata);
                    break;
                case 'configuration':
                    self._writeConfiguration(module_metadata);
                    break;
                case 'suitescript':
                    self._writeSuiteScript(module_metadata);
                    break;
                case 'sass':
                    self._writeSass(module_metadata);
                    break;
                case 'templates':
                    self._writeTemplates(module_metadata);
                    break;
                case 'ss2':
                    self._writeSuiteScript2(module_metadata);
                    break;
            }
        });

        this.fs.extendJSON(manifest_dest_path, manifest);
    }

    configuring() {
        const config = configurations.getConfigs();
        const new_ext_path = `${this.work_folder}/${this.extension_options.name}`;

        if (config.folders.extensions_path) {
            if (!_.contains(config.folders.extensions_path, new_ext_path)) {
                config.folders.extensions_path.push(new_ext_path);
            }
        } else {
            config.folders.extensions_path = [new_ext_path];
        }

        config.credentials = config.credentials || {};
        config.credentials.is_scis = this.is_scis;

    }

    end() {
        const time_diff = Math.abs(new Date() - this.initial_time);
        this.log(
            colorText(
                color.GREEN,
                `\nGood! The process "extension:create" finished after ${Math.round(time_diff / 1000)} sec.`
            )
        );
        this.log(
            'An example Hello World extension was generated to show you the basic setup. Feel free to modify it.',
        );
        this.log('You can continue developing using the following commands:\n');

        if (this.is_scis) {
            this.log(
                `${colorText(color.GREEN, '\t 1-')} gulp extension:fetch - to get the initial setup files and optionally start developing from extensions in the file cabinet.
           ${colorText(color.GREEN, '2-')} gulp extension:update-manifest - update the manifest.json according to the files you added or removed.
           ${colorText(color.GREEN, '3-')} gulp extension:local - (Optional) to develop locally using javascript.
           ${colorText(color.GREEN, '4-')} gulp extension:deploy - to deploy your extension to the file cabinet and try it using the Extension Management UI.`
            );
        } else {
            this.log(
                `${colorText(color.GREEN, '\t   1-')} gulp extension:fetch - to get the current theme and compile all the resources.
           ${colorText(color.GREEN, '2-')} gulp extension:update-manifest - update the manifest.json according to the files you added or removed.
           ${colorText(color.GREEN, '3-')} gulp extension:local - (Optional) to develop locally styles, template and javascript files.
           ${colorText(color.GREEN, '4-')} gulp extension:deploy - to deploy your extension to the file cabinet and try it using the Extension Management UI.\n`
            );
        }

        this.log(
            `\tType ${colorText(color.CYAN, 'gulp')} for extra help on how to use the commands.`
        );
    }
};
