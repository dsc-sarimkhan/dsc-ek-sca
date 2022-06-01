/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors.ErrorStatus"/>
import ComponentContainer = require('../../../Commons/SC/JavaScript/SC.ComponentContainer');

export function errorStatus(): { errorStatus: string } {
    const { application } = ComponentContainer.getComponent('Layout');
    const current_view = application.getLayout().getCurrentView();
    const errorData = current_view.isErrorView && (current_view.getPageDescription() || 'error');
    return { errorStatus: errorData };
}
