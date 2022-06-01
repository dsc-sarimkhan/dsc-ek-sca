/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors.Shopper"/>
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
import Session = require('../../../Commons/Session/JavaScript/Session');

export function shopper(): { shopperInternalId: string; currencyCode: string } {
    const data = { shopperInternalId: '', currencyCode: '' };
    const profile_instance = ProfileModel.getInstance();

    const shopper_id = profile_instance.get('internalid');
    if (shopper_id && shopper_id !== '0') {
        data.shopperInternalId = shopper_id;
    }
    data.currencyCode = Session.get('currency.code') || '';
    return data;
}
