/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="LoginRegister.Utils"/>

import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

import ErrorManagement = require('../../../Commons/ErrorManagement/JavaScript/ErrorManagement');
import Configuration = require('../../SCA/JavaScript/SC.Configuration');
import jQueryExtras = require('../../../Commons/jQueryExtras/JavaScript/jQuery.serializeObject');

const LoginRegisterUtils: any = {
    skipLoginCloseModal: function() {
        if (this.$containerModal && Configuration.get('checkoutApp.skipLogin')) {
            this.$containerModal
                .removeClass('fade')
                .modal('hide')
                .data('bs.modal', null);
        }
    }
};

export = LoginRegisterUtils;
