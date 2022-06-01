/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('SecurityHeaders', ['Configuration'], function(
    Configuration
){

    // Issue 344405 Penetration Test Finding - Missing Security Headers
    // First we release this new config but we ignore it till next release
    // To stop ignoring it, change enableDisallow to true
    var enableDisallow = true;

    var DISALLOW_FRAMING = 'DISALLOW FRAMING';
    var ALLOW_FRAMING_CUSTOM = 'ALLOW FRAMING CUSTOM';

    var XFOHeader = 'X-Frame-Options';
    var CSPHeader = 'Content-Security-Policy';
    var XFOHeaderSameOrigin = 'SAMEORIGIN';
    var CSPHeaderFrameAncestors = 'frame-ancestors ';
    var CSPHeaderSelf = '\'self\'';

    var SecurityHeaders = {
        addSecurityHeaders: function(response) {
            var allowFraming = Configuration.get('security.allowFraming');

            if (allowFraming === DISALLOW_FRAMING && enableDisallow) {
                response.addHeader(XFOHeader, XFOHeaderSameOrigin);
                response.addHeader(CSPHeader, CSPHeaderFrameAncestors + CSPHeaderSelf);
            } else if (allowFraming === ALLOW_FRAMING_CUSTOM) {
                var allowFramingBy = Configuration.get('security.allowFramingBy');

                if (allowFramingBy.length === 1) {
                    var origin = allowFramingBy[0];
                    if (origin !== XFOHeaderSameOrigin) {
                        origin = (/^https?:\/\//.test(origin) ? '' : 'https://') + origin;
                        // ALLOW-FROM has limited browser support and will disable Clickjacking
                        // protection on modern browsers, please consider using CSP frame-ancestor
                        // directive instead: https://caniuse.com/#x-frame-options
                        origin = 'ALLOW-FROM ' + origin;
                    }
                    response.addHeader(XFOHeader, origin);
                }

                CSPHeaderFrameAncestors += allowFramingBy
                    .join(' ')
                    .replace(XFOHeaderSameOrigin, CSPHeaderSelf);
                response.addHeader(CSPHeader, CSPHeaderFrameAncestors);
            }
        }
    };

    return SecurityHeaders;
});
