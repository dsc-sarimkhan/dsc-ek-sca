/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccount.Full"/>

import '../../../Commons/Main/JavaScript/Application';
import '../../../Commons/Utilities/JavaScript/backbone.custom';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Model';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.Sync';
import '../../../Commons/Core/JavaScript/backbone/BackboneExtras';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.render';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.saveForm';
import '../../../Commons/BackboneExtras/JavaScript/Backbone.View.toggleReset';
import '../../../Commons/BootstrapExtras/JavaScript/Bootstrap.Rate';
import '../../../Commons/BootstrapExtras/JavaScript/Bootstrap.Slider';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.ajaxSetup';
import '../../../Commons/jQueryExtras/JavaScript/jQuery.serializeObject';
import '../../../Commons/NativesExtras/JavaScript/String.format';
import * as Layout from './SC.MyAccount.Layout';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import IMyAccount = require('./IMyAccount');

import MyAccountConfiguration = require('../../MyAccountApplication.SCA/JavaScript/MyAccount.Configuration');

class MyAccountFull extends SC.Application implements IMyAccount {
    static readonly _internalName: string = 'MyAccount.Full';

    public static getName(): string {
        return MyAccountFull._internalName;
    }

    public Configuration;

    public Layout;

    constructor(appName: string) {
        super(appName);
        this.Configuration = MyAccountConfiguration.getInstance().getConfiguration();
        this.Layout = Layout;
        jQuery.ajaxSetup({ cache: false });
        this.on('afterModulesLoaded', this.onAfterModulesLoadedHandler);
    }

    onAfterModulesLoadedHandler = (): void => {
        this.off('afterModulesLoaded');
    };

    modulesToLoad = (entryPointModules: any) => entryPointModules;

    clearLayout = (layout: any) => {};

    removeViews = () => {};

    replaceView = () => {};
}

export = MyAccountFull;
