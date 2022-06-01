/// <amd-module name="EKConfiguration.Model"/>
// @module EKConfiguration

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const EKConfigurationModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('services/EKConfiguration.Service.ss')
    
});

export = EKConfigurationModel;
