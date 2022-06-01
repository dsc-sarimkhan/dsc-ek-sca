/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="OrderWizard.Model"/>

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');
import Singleton = require('../../../Commons/Main/JavaScript/Singleton');

const OrderWizardModel: any = Backbone.Model.extend({}, Singleton);

export = OrderWizardModel;
