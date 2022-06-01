/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CardHolderAuthentication
define('CardHolderAuthentication.Utils', ['underscore'], function(_) {
    // @class CardHolderAuthenticationUtils contains utilities related to CardholderAuthentication
    return {
        // @function getUrl return urls with the query string that iframe expect.
        getUrl: function getUrl(prefix, sspName, formAction, formId, inputs) {

            let url = `${prefix}${sspName}.ssp?action=${formAction}&form=${formId}`;

            if (inputs.length > 0) {
                const data = _.map(inputs, input => {
                    return `{"name":"${input.getValue('name')}","value":"${input.getValue(
                        'value'
                    )}"}`;
                }).join(',');
                url += `&data=[${data}]`;
            }
            return url;
        }
    };
});
