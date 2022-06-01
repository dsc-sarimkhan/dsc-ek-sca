const log = require('ns-logs');
const c = require('ansi-colors');
const path = require('path');
const shell = require('shelljs');
const _ = require('underscore');
const configs = require('../../../../gulp/extension-mechanism/configurations').getConfigs();

const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    const context = this.options.gulp_context
      ? `${this.options.gulp_context}/`
      : '';
    this.work_folder = this.options.work_folder;
    this.deploy_folder = this.options.deploy_folder;
    this.sourceRoot(`${context}generators/app/templates`);
    this.extension_options = {};
    this.initial_time = new Date();
    this.is_scis = false;
    this.ss = false;
    this.ss2 = false;
  }

  prompting() {
    this.log(
      '\nWelcome! Let´s bootstrap your module by following these steps:\n',
    );

    return this.prompt([
      {
        type: 'input',
        name: 'module_name',
        message: 'Set the Module Name (for folders and files)',
        default: 'AdditionalCoolModule',
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
        name: 'resources',
        message: 'For this module you will be using (Press <space> to select)',
        default: [
          'templates',
          'sass',
          'configuration',
          'suitescript',
          'javascript',
        ],
        choices: [
          { value: 'javascript', name: 'JavaScript' },
          { value: 'templates', name: 'Templates' },
          { value: 'sass', name: 'Sass' },
          { value: 'suitescript', name: 'SuiteScript' },
          { value: 'configuration', name: 'Configuration' },
        ],
      },
    ])
      .then((answers) => {
        this.extension_options = answers;

        this.extension_options.is_cct = false;
        return this._inquireExtension();
      })
      .then((manifest) => {
        this.extension_options.name = manifest.name;
        this.extension_options.vendor = manifest.vendor;
        this.extension_options.fantasy_name = manifest.fantasy_name;

        this.extension_options.application = this.config.get('ext_application')
          ? this.config.get('ext_application')[manifest.name]
          : ['shopping', 'myaccount', 'checkout'];
        const root_ext_path = path.join(
          this.contextRoot,
          this.work_folder,
          this.extension_options.name,
          this.extension_options.module_name,
        );

        if (shell.test('-d', root_ext_path)) {
          return this.prompt([
            {
              type: 'confirm',
              name: 'continue',
              message:
                'The module '
                + this.extension_options.module_name
                + ' already exists.\nDo you want to continue and overwrite it?',
            },
          ]);
        }
      })
      .then((answer_confirm) => {
        if (answer_confirm && !answer_confirm.continue) {
          this.env.error(
            'Canceling extension:create-module for '
              + this.extension_options.module_name,
          );
        }
      });
  }

  _inquireExtension() {
    let { extensions_path } = configs.folders;
    let manifest;
    let manifest_path;
    const self = this;
    const type = this.extension_options.is_cct ? 'CCT' : 'module';
    extensions_path = _.filter(
      extensions_path,
      (extension_path) => !_.isUndefined(
          self.fs.readJSON(path.join(extension_path, 'manifest.json')),
        ),
    );

    if (extensions_path.length) {
      if (extensions_path.length === 1) {
        manifest_path = path.join(extensions_path[0], 'manifest.json');
        manifest = this.fs.readJSON(manifest_path);
        return Promise.resolve(manifest);
      }
      const extensions = _.map(extensions_path, (path) => path.replace(`${configs.folders.source.source_path}/`, ''),);

      return this.prompt([
        {
          type: 'list',
          name: 'extension',
          message: 'Select extension to add ' + type + ':',
          default: extensions[0],
          choices: extensions,
        },
      ]).then((ext_answer) => {
        ext_answer = ext_answer.extension;
        manifest_path = path.join(
          this.contextRoot,
          configs.folders.source.source_path,
          ext_answer,
          'manifest.json',
        );
        manifest = self.fs.readJSON(manifest_path);

        return manifest;
      });
    }
    this.env.error(
      'Sorry. Could not find extension to add additional ' + type + '.',
    );
  }

  writing() {
    // create module folders
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
    shell.mkdir('-p', module_path);

    // add resources accordignly
    const manifest = this.fs.readJSON(manifest_dest_path);

    if (this.extension_options.is_cct) {
      const cct_name_array = [
        'cct',
        this.extension_options.vendor,
        this.extension_options.module_name,
      ];
      const cct_name = cct_name_array
        .map((value) => value.toLowerCase())
        .join('_');
      const icon_name = `${cct_name}_icon.svg`;
      const cct_icon_dest_path = path.join(assets_path, 'img', icon_name);
      shell.mkdir('-p', path.join(assets_path, 'img'));

      this.fs.copy(
        path.join(
          this.options.gulp_context,
          'generators',
          'app',
          'templates',
          'cct_icon.svg',
        ),
        this.destinationPath(cct_icon_dest_path),
      );

      this.extension_options.cct_name = cct_name;

      const cct = {
        icon: 'img/' + cct_name + '_icon.svg',
        settings_record: 'customrecord_' + cct_name,
        registercct_id: cct_name,
        label: this.extension_options.fantasy_module_name,
        description: this.extension_options.module_description,
      };

      if (!manifest.cct) {
        manifest.cct = [];
      }

      if (!_.isArray(manifest.cct)) {
        manifest.cct = [manifest.cct];
      }

      manifest.cct.push(cct);

      manifest.assets.img.files.push(cct.icon);
    }

    const module_metadata = {
      manifest,
      base_path: root_ext_path,
      module_name,
      create_mode: false,
    };

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
      }
    });

    this.fs.extendJSON(manifest_dest_path, manifest);
  }

  end() {
    const time_diff = Math.abs(new Date() - this.initial_time);
    const type = this.extension_options.is_cct ? 'cct' : 'module';

    this.log(
      c.green(
        `\nGood! The process "extension:create-${type}" finished after ${Math.round(
          time_diff / 1000,
        )} sec.`,
      ),
    );
    this.log(
      c.green('You can continue developing using the following commands:\n'),
    );
    this.log(
      `${c.green(
        '\t1- ',
      )}gulp extension:fetch - to get the current theme and compile all the resources.\n${c.green(
        '\t2- ',
      )}gulp extension:update-manifest - update the manifest.json according to the files you added or removed.\n${c.green(
        '\t2- ',
      )}gulp extension:local - (Optional) to develop locally styles, templates and javascript files.\n${c.green(
        '\t3- ',
      )}gulp extension:deploy - to deploy your extension to the file cabinet and try it using the Extension Management UI.\n`,
    );

    this.log(
      '\tType '
        + c.cyan('gulp')
        + ' for extra help on how to use the commands.\n',
    );

    if (this.extension_options.is_cct) {
      const default_logo_path =        'SuiteScripts/'
        + this.deploy_folder
        + '/'
        + this.extension_options.vendor
        + '/'
        + this.extension_options.name
        + '@'
        + this.extension_options.version
        + '/assets/'
        + this.extension_options.cct_name
        + '_icon.svg';
      const { manifest } = this.extension_options;
      let extension_application =        this.extension_options.application
        && this.extension_options.application[0];

      // in case the parent extension of the cct has not being added through the gulp extension:create command
      if (!extension_application) {
        if (manifest.javascript.entry_points.shopping) {
          extension_application = 'shopping';
        } else if (manifest.javascript.entry_points.myaccount) {
          extension_application = 'myaccount';
        } else if (manifest.javascript.entry_points.checkout) {
          extension_application = 'checkout';
        }
      }

      const entrypoint_cct_name = [
        this.extension_options.vendor,
        this.extension_options.name,
        this.extension_options.module_name,
      ].join('.');
      const entrypoint_cct_sass = [
        this.extension_options.name,
        this.extension_options.module_name,
      ]
        .join('-')
        .toLowerCase();
      const entry_point_js =        manifest.javascript.entry_points[extension_application];
      const entry_point_name = path.basename(entry_point_js);
      const entry_point_css = manifest.sass.entry_points[extension_application];
      const entry_point_css_name = path.basename(entry_point_css);

      this.log(
        'An example Hello World CCT was generated with id '
          + c.green(this.extension_options.cct_name)
          + ' to show you the basic setup. Feel free to modify it.\n'
          + 'Check the manifest.json --> cct section to change its settings.\n'
          + c.green('\ta) ')
          + 'Customize the default icon "'
          + this.extension_options.cct_name
          + '_icon.svg" to include your own.\n'
          + c.green('\tb) ')
          + 'Remember that the cct record id (settings_record key) must be less than 28 characters long (without including "customrecord").\n'
          + c.green('\tc) ')
          + 'The CCT label must be less than 18 characters long.\n'
          + 'For more info on how to create ccts go to '
          + c.cyan('https://developers.suitecommerce.com/section1516375561')
          + '.\n\n'
          + 'This CCT was added as part of the extension '
          + c.green(this.extension_options.name)
          + '.\n'
          + 'In order to be executed you need to:\n'
          + c.green('\t1- ')
          + 'Go to the javascript file '
          + entry_point_name
          + '.\n'
          + c.green('\t2- ')
          + 'Include "'
          + entrypoint_cct_name
          + '.js" as a dependency.\n'
          + c.green('\t3- ')
          + 'Add the following line: "< CCT dependency >.mountToApp(container);"\n'
          + c.green('\t4- ')
          + 'Import the styles of "_'
          + entrypoint_cct_sass
          + '.scss" to the entry point file: "'
          + entry_point_css_name
          + '".',
      );
    }

    this.log(c.green('\nThank you.'));
  }

  _writeJavascript(data) {
    const module_full_name_array = [
      this.extension_options.vendor,
      this.extension_options.name,
      this.extension_options.module_name,
    ];
    const module_full_name = module_full_name_array.join('.');
    const tpl_name = module_full_name_array
      .map((value) => value.toLowerCase())
      .join('_');
    const service_name = this.extension_options.module_name;
    const view_id = this.extension_options.module_name;
    const module_dep_name = this.extension_options.module_name;
    const tpl_dep_name = tpl_name;
    const javascript_path = path.join(
      data.base_path,
      'Modules',
      this.extension_options.module_name,
      'JavaScript',
      data.module_name,
    );
    const full_entry_point_path = path.join(
      data.base_path,
      'Modules',
      this.extension_options.module_name,
      'JavaScript',
      module_full_name,
    );
    const manifest_module_path = [
      'Modules',
      this.extension_options.module_name,
      'JavaScript',
      data.module_name,
    ].join('/');
    const manifest_entry_point_path = [
      'Modules',
      this.extension_options.module_name,
      'JavaScript',
      module_full_name,
    ].join('/');
    if (this.extension_options.is_cct) {
      this.fs.copyTpl(
        path.join(
          this.options.gulp_context,
          'generators',
          'app',
          'templates',
          'JavaScript',
          'EntryPoint.CCT.js',
        ),
        this.destinationPath(`${full_entry_point_path}.js`),
        {
          module_name: module_full_name,
          module_dep_name,
          cct_id: this.extension_options.cct_name,
        },
      );

      this.fs.copyTpl(
        path.join(
          this.options.gulp_context,
          'generators',
          'app',
          'templates',
          'JavaScript',
          'View.CCT.js',
        ),
        this.destinationPath(`${javascript_path}.View.js`),
        {
          module_name: module_full_name,
          tpl_name,
          tpl_dep_name,
          module_dep_name,
        },
      );
    } else if (this.is_scis) {
      this.fs.copyTpl(
        path.join(
          this.options.gulp_context,
          'generators',
          'app',
          'templates',
          'JavaScript',
          'EntryPoint.SCIS.js',
        ),
        this.destinationPath(`${full_entry_point_path}.js`),
        {
          module_name: module_full_name,
          module_dep_name,
        },
      );
    } else {
      this.fs.copyTpl(
          path.join(
              this.options.gulp_context,
              'generators',
              'app',
              'templates',
              'JavaScript',
              'EntryPoint.js',
          ),
          this.destinationPath(`${full_entry_point_path}.js`),
          {
            module_name: module_full_name,
            module_dep_name,
          },
      );

      this.fs.copyTpl(
          path.join(
              this.options.gulp_context,
              'generators',
              'app',
              'templates',
              'JavaScript',
              'Model.js',
          ),
          this.destinationPath(`${full_entry_point_path}.Model.js`),
          {
            module_name: module_full_name,
            module_dep_name,
            ss: this.ss
          },
      );

      if(this.ss2)
      {
        this.fs.copyTpl(
            path.join(
                this.options.gulp_context,
                'generators',
                'app',
                'templates',
                'JavaScript',
                'SS2Model.js',
            ),
            this.destinationPath(`${full_entry_point_path}.SS2Model.js`),
            {
              module_name: module_full_name,
              module_dep_name
            },
        );
      }

      this.fs.copyTpl(
          path.join(
              this.options.gulp_context,
              'generators',
              'app',
              'templates',
              'JavaScript',
              'View.js',
          ),
          this.destinationPath(`${javascript_path}.View.js`),
          {
            module_name: module_full_name,
            tpl_name,
            tpl_dep_name,
            service_name,
            module_dep_name,
            ss2: true
          },
      );
    }

    const create_javascript =      data.create_mode
        || !(data.manifest.javascript && data.manifest.javascript.application);
    const files_to_add = [
      `${manifest_entry_point_path}.js`,
      `${manifest_module_path}.View.js`,
    ];

    const files_to_add_scis = [`${manifest_entry_point_path}.js`];

    const self = this;

    if (create_javascript) {
      data.manifest.javascript = {
        entry_points: {},
        application: {},
      };

      _.each(this.extension_options.application, (application) => {
        data.manifest.javascript.entry_points[
            application
            ] = `${manifest_entry_point_path}.js`;
        data.manifest.javascript.application[application] = {
          files: self.is_scis ? files_to_add_scis : files_to_add,
        };
      });
    } else {
      _.each(this.extension_options.application, (application) => {
        data.manifest.javascript = data.manifest.javascript || {};
        data.manifest.javascript.application =          data.manifest.javascript.application || {};
        data.manifest.javascript.application[application] =          data.manifest.javascript.application[application] || {};
        data.manifest.javascript.application[application].files =          data.manifest.javascript.application[application].files || [];

        data.manifest.javascript.application[
            application
            ].files = data.manifest.javascript.application[
            application
            ].files.concat(self.is_scis ? files_to_add_scis : files_to_add);
      });
    }
  }

  _writeConfiguration(data) {
    const conf_path = path.join(
        data.base_path,
        'Modules',
        this.extension_options.module_name,
        'Configuration',
        data.module_name,
    );

    const module_full_name_array = [
      this.extension_options.vendor,
      this.extension_options.name,
      this.extension_options.module_name,
    ];

    const module_full_name = module_full_name_array.join('.');

    const manifest_module_path = [
      'Modules',
      this.extension_options.module_name,
      'Configuration',
      data.module_name,
    ].join('/');

    const create_conf =      data.create_mode
        || !(data.manifest.configuration && data.manifest.configuration.files);

    if (create_conf) {
      data.manifest.configuration = {
        files: [`${manifest_module_path}.json`],
      };
    }

    const exampleKey = this.extension_options.module_name + '.config';
    const exampleSubtab = this.extension_options.module_name + '_subtab';
    const exampleTitle = this.extension_options.module_name + '_Title';

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'Configuration',
            'config.json',
        ),
        this.destinationPath(`${conf_path}.json`),
        {
          module_name: module_full_name,
          exampleKey,
          exampleSubtab,
          exampleTitle
        },
    );
  }

  _writeSuiteScript(data) {
    this.ss = true;
    const module_full_name_array = [
      this.extension_options.vendor,
      this.extension_options.name,
      this.extension_options.module_name,
    ];
    const module_full_name = module_full_name_array.join('.');
    const module_dep_name = this.extension_options.module_name;
    const suitescript_path = path.join(
        data.base_path,
        'Modules',
        this.extension_options.module_name,
        'SuiteScript',
        data.module_name,
    );

    const js_full_entry_point_path = path.join(
        data.base_path,
        'Modules',
        module_dep_name,
        'JavaScript',
        module_full_name,
    );

    const service_path = path.join(
        data.base_path,
        'assets',
        'services',
        data.module_name,
    );
    const full_entry_point_path = path.join(
        data.base_path,
        'Modules',
        this.extension_options.module_name,
        'SuiteScript',
        module_full_name,
    );
    const manifest_module_path = [
      'Modules',
      this.extension_options.module_name,
      'SuiteScript',
      data.module_name,
    ].join('/');
    const manifest_entry_point_path = [
      'Modules',
      this.extension_options.module_name,
      'SuiteScript',
      module_full_name,
    ].join('/');
    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'SuiteScript',
            'EntryPoint.js',
        ),
        this.destinationPath(`${full_entry_point_path}.js`),
        {
          module_name: module_full_name,
          module_dep_name,
        },
    );

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'JavaScript',
            'Model.js',
        ),
        this.destinationPath(`${js_full_entry_point_path}.Model.js`),
        {
          module_name: module_full_name,
          module_dep_name,
          ss: true
        },
    );

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'SuiteScript',
            'ServiceController.js',
        ),
        this.destinationPath(`${suitescript_path}.ServiceController.js`),
        {
          module_name: module_full_name,
          module_dep_name,
        },
    );

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'service.ss',
        ),
        this.destinationPath(`${service_path}.Service.ss`),
        {
          module_name: module_full_name,
        },
    );

    const create_ssp_lib =      data.create_mode
        || !(data.manifest['ssp-libraries'] && data.manifest['ssp-libraries'].files);
    const files_to_add = [
      `${manifest_entry_point_path}.js`,
      `${manifest_module_path}.ServiceController.js`,
    ];
    if (create_ssp_lib) {
      data.manifest['ssp-libraries'] = {
        entry_point: `${manifest_entry_point_path}.js`,
        files: files_to_add,
      };
    } else {
      data.manifest['ssp-libraries'].files = data.manifest[
          'ssp-libraries'
          ].files.concat(files_to_add);
    }

    data.manifest.assets = data.manifest.assets || {};
    data.manifest.assets.services = data.manifest.assets.services || {
      files: [],
    };

    data.manifest.assets.services.files.push(
        'services/' + data.module_name + '.Service.ss',
    );
  }

  _writeSuiteScript2(data) {
    this.ss2 = true;
    const module_full_name_array = [
      this.extension_options.vendor,
      this.extension_options.name,
      this.extension_options.module_name,
    ];

    const module_dep_name = this.extension_options.module_name;
    const module_full_name = module_full_name_array.join('.');
    const manifest_module_path = [
      'Modules',
      module_dep_name,
      'SuiteScript2',
      data.module_name,
    ].join('/');

    const suitescript2_path = path.join(
        data.base_path,
        'Modules',
        module_dep_name,
        'SuiteScript2',
        data.module_name,
    );

    const js_full_entry_point_path = path.join(
        data.base_path,
        'Modules',
        module_dep_name,
        'JavaScript',
        module_full_name,
    );

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'JavaScript',
            'SS2Model.js',
        ),
        this.destinationPath(`${js_full_entry_point_path}.SS2Model.js`),
        {
          module_name: module_full_name,
          module_dep_name
        },
    );

    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'serviceSS2.ss',
        ),
        this.destinationPath(`${suitescript2_path}.Service.ss`),
        {
          module_name: module_full_name,
        },
    );

    data.manifest.suitescript2.files.push(`${manifest_module_path}.Service.ss`);
  }

  _writeSass(data) {
    const sass_entry_file_name = [
      this.extension_options.name,
      this.extension_options.module_name,
    ]
        .map((value) => value.toLowerCase())
        .join('-');
    const sass_class_name = this.extension_options.module_name.toLowerCase();
    const sass_path = path.join(
        data.base_path,
        'Modules',
        this.extension_options.module_name,
        'Sass',
        '_',
    );
    const manifest_module_path = [
      'Modules',
      this.extension_options.module_name,
      'Sass',
      '_',
    ].join('/');
    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'Sass',
            '_entry-point.scss',
        ),
        this.destinationPath(`${sass_path + sass_entry_file_name}.scss`),
        {
          sass_dependency: sass_class_name,
          sass_class_name,
        },
    );

    const create_sass =      data.create_mode || !(data.manifest.sass && data.manifest.sass.files);
    const files_to_add = [
      `${manifest_module_path + sass_entry_file_name}.scss`,
    ];
    if (create_sass) {
      data.manifest.sass = {
        entry_points: {},
        files: files_to_add,
      };

      _.each(this.extension_options.application, (application) => {
        data.manifest.sass.entry_points[application] = `${manifest_module_path
        + sass_entry_file_name}.scss`;
      });
    } else {
      data.manifest.sass.files = data.manifest.sass.files.concat(files_to_add);
    }
  }

  _writeTemplates(data) {
    const module_full_name_array = [
      this.extension_options.vendor,
      this.extension_options.name,
      this.extension_options.module_name,
    ];
    const module_full_name = module_full_name_array
        .map((value) => value.toLowerCase())
        .join('_');
    const class_name = this.extension_options.module_name.toLowerCase();
    const templates_path = path.join(
        data.base_path,
        'Modules',
        this.extension_options.module_name,
        'Templates',
        module_full_name,
    );
    const manifest_module_path = [
      'Modules',
      this.extension_options.module_name,
      'Templates',
      module_full_name,
    ].join('/');
    const files_to_add = [`${manifest_module_path}.tpl`];
    this.fs.copyTpl(
        path.join(
            this.options.gulp_context,
            'generators',
            'app',
            'templates',
            'Templates',
            'template.tpl',
        ),
        this.destinationPath(`${templates_path}.tpl`),
        {
          module_name: this.extension_options.name,
          module_dep_name: data.module_name,
          class_name,
        },
    );

    const create_templates =      data.create_mode
        || !(data.manifest.templates && data.manifest.templates.application);

    if (create_templates) {
      data.manifest.templates = {
        application: {},
      };

      _.each(this.extension_options.application, (application) => {
        data.manifest.templates.application[application] = {
          files: files_to_add,
        };
      });
    } else {
      _.each(this.extension_options.application, (application) => {
        data.manifest.templates = data.manifest.templates || {};
        data.manifest.templates.application =          data.manifest.templates.application || {};
        data.manifest.templates.application[application] =          data.manifest.templates.application[application] || {};
        data.manifest.templates.application[application].files =          data.manifest.templates.application[application].files || [];

        data.manifest.templates.application[
            application
            ].files = data.manifest.templates.application[application].files.concat(
            files_to_add,
        );
      });
    }
  }
};
