/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ApplicationSkeleton
// Defines the top level components of an application like the name, layout, or the start function
/// <amd-module name = "ApplicationSkeleton"/>

import * as _ from 'underscore';
import * as Utils from '../../Utilities/JavaScript/Utils';
import * as jQuery from '../../Core/JavaScript/jQuery';

import Layout = require('./ApplicationSkeleton.Layout');
import SCComponentContainer = require('../../SC/JavaScript/SC.ComponentContainer');
import GenericLayoutComponent = require('./Generic.LayoutComponent');
import Backbone = require('../../Utilities/JavaScript/backbone.custom');

const ApplicationSkeleton: any = function(name: string) {
    if (!(this instanceof ApplicationSkeleton)) {
        return new ApplicationSkeleton();
    }

    // @property {SCA.Configuration} Application Default settings
    this.Configuration = {};

    // @property {String} name the name of this application instance
    this.name = name;

    // @property {Array<Any>} _modulesMountToAppResult stores
    // the results of each modules mountToApp method call
    // @private
    this._modulesMountToAppResult = [];

    this.app_promises = [];
};

// @method resizeImage Wraps the Utils.resizeImage and passes in the settings it needs
// @param {String} url
// @param {String} size
ApplicationSkeleton.prototype.resizeImage = function(url: string, size: string) {
    url =
        url ||
        Utils.getThemeAbsoluteUrlOfNonManagedResources(
            'img/no_image_available.jpeg',
            this.getConfig('imageNotAvailable')
        );
    const mapped_size = this.getConfig('imageSizeMapping.' + size, size);
    return Utils.resizeImage(this.getConfig('siteSettings.imagesizes', []), url, mapped_size);
};

// @property {ApplicationSkeleton.Layout} Layout
// This View will be created and added to the dom as soon as the app starts.
// All module's views will get into the dom through this view by calling
// either showContent, showContent
ApplicationSkeleton.prototype.Layout = Layout;

// @method getLayout @returns {ApplicationSkeleton.Layout}
ApplicationSkeleton.prototype.getLayout = function getLayout() {
    this._layoutInstance = this._layoutInstance || new this.Layout(this);
    return this._layoutInstance;
};

// @method getConfig
// @returns {Any} the configuration object of the aplication
// if a path is applied, it returns that attribute of the config
// if nothing is found, it returns the default value
// @param {String} path
// @param {String} default_value
ApplicationSkeleton.prototype.getConfig = function getConfig(path: string, default_value: string) {
    return Utils.getPathFromObject(this.Configuration, path, default_value);
};

ApplicationSkeleton.prototype.waitForPromise = function waitForPromise(promise: any) {
    this.app_promises.push(promise);
};

// @method start starts this application by mounting configured
// modules and triggering events 'afterModulesLoaded' and 'afterStart'
// @param {Array<SubClassOf<ApplicationModule>>}
// @param {Array<SubClassOf<ApplicationModule>>} modules
// @param {Function} done_fn the handler to be called once the application finish starting
ApplicationSkeleton.prototype.start = function start(modules: any, done_fn: any) {
    // @event beforeStart triggered before loading modules
    // so users have a chance to include new modules at this point.
    this.trigger('beforeStart', this);

    const self = this;

    // @property {Array<SubClassOf<ApplicationModule>>} modules
    // We set the modules to the application the keys are the modules_list (names)
    // and the values are the loaded modules returned in the arguments by require.js
    self.modules = modules;

    let mount_to_app_result: any = {};

    this.registerComponent(GenericLayoutComponent(this));

    // we mount each module to our application
    _.each(self.modules, function(module: any) {
        if (module && _.isFunction(module.mountToApp)) {
            try {
                mount_to_app_result = module.mountToApp(self);

                if (mount_to_app_result && mount_to_app_result.componentName) {
                    self.registerComponent(mount_to_app_result);
                } else {
                    self._modulesMountToAppResult.push(mount_to_app_result);
                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    // This checks if you have registered modules
    if (!Backbone.history) {
        throw new Error(
            'No Backbone.Router has been initialized (Hint: Are your modules properly set?).'
        );
    }

    // @event afterModulesLoaded triggered after all modules have been loaded
    self.trigger('afterModulesLoaded', self);

    jQuery.when.apply(jQuery, self.app_promises).then(function() {
        if (done_fn && _.isFunction(done_fn)) {
            done_fn(self);
        }
        // @event afterStart triggered after the application
        // finish starting and after the start() callback is called.
        self.trigger('afterStart', self);
    });
};

// We allow ApplicationSkeleton to listen and trigger custom events
// http://backbonejs.org/#Events
_.extend(ApplicationSkeleton.prototype, Backbone.Events, SCComponentContainer);

export = ApplicationSkeleton;
