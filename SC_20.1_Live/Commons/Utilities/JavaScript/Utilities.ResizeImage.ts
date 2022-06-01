/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Utilities.ResizeImage"/>
import * as _ from 'underscore';

import Utils = require('./Utils');
import Configuration = require('../../../Advanced/SCA/JavaScript/SC.Configuration');

function resizeImage(url, size) {
    url =
        url ||
        Utils.getThemeAbsoluteUrlOfNonManagedResources(
            'img/no_image_available.jpeg',
            Configuration.get('imageNotAvailable')
        );
    size = Configuration['imageSizeMapping.' + size] || size;

    const resize: any = _.first(
        _.where(Configuration.get('siteSettings.imagesizes', []), { name: size })
    );

    if (resize) {
        return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
    }

    return url;
}
export = resizeImage;
