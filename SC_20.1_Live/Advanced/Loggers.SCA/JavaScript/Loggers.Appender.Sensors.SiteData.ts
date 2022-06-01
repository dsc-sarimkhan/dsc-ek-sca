/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors.SiteData"/>

import { BootstrappedData } from '../../../Commons/Core/JavaScript/BootstrappedData';
import ComponentContainer = require('../../../Commons/SC/JavaScript/SC.ComponentContainer');

interface Site {
    sitePage: string;
    siteFragment: string;
    sitePageDisplayName: string;
    siteUrl: string;
}
export function site(): Site {
    const pageType = ComponentContainer.getComponent('PageType');
    const context = pageType.getContext();
    const data = {
        sitePage: context.page_type,
        siteFragment: context.path,
        sitePageDisplayName: context.page_type_display_name,
        siteUrl: BootstrappedData.getSC().ENVIRONMENT.shoppingDomain
    };
    return data;
}
