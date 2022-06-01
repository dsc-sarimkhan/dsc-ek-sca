/// <amd-module name="EKHomeBanner.Model"/>
// @module EKHomeBanner

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const EKHomeBannerModel: any = Backbone.Model.extend({
    // @property {String} urlRoot
    urlRoot: Utils.getAbsoluteUrl('services/EKHomeBanner.Service.ss')
    
});

export = EKHomeBannerModel;
