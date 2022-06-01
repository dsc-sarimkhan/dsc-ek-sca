/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Sensors.Bundle"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

interface Bundle {
    bundleId: string;
    bundleName: string;
    bundleVersion: string;
    buildNo: string;
    dateLabel: string;
    baseLabel: string;
}
export function bundle(): Bundle {
    const metadata = SC.ENVIRONMENT.RELEASE_METADATA || {};
    const data = {
        bundleId: metadata.prodbundle_id || '',
        bundleName: metadata.name || '',
        bundleVersion: metadata.version || '',
        buildNo: metadata.buildno || '',
        dateLabel: metadata.datelabel || '',
        baseLabel: metadata.baselabel || ''
    };
    return data;
}
