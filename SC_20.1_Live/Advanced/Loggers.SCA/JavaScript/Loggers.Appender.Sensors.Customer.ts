/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors.Customer"/>
import ProfileModel = require('../../../Commons/Profile/JavaScript/Profile.Model');
interface Customer {
    customerSessionStatus: string;
    visitorId: string;
}
export function customer(): Customer {
    const profile_model = ProfileModel.getInstance();
    const isGuest = profile_model.get('isGuest') === 'T';
    const isLoggedIn = !isGuest && profile_model.get('isLoggedIn') === 'T';
    const isRecognized = !isGuest && profile_model.get('isRecognized') === 'T';
    const isReturning = !isGuest && isLoggedIn;
    const isNew = !isGuest && !isRecognized && !isLoggedIn;

    const customerSessionStatus: string = isNew
        ? 'New'
        : isReturning
        ? 'Returning'
        : isGuest
        ? 'Guest'
        : isRecognized
        ? 'Recognized'
        : '';

    const regex = new RegExp('[; ]NLVisitorId=([^\\s;]*)');
    const sMatch = ` ${document.cookie}`.match(regex);
    const visitorId: string = sMatch ? unescape(sMatch[1]) : '';

    return { customerSessionStatus, visitorId };
}
