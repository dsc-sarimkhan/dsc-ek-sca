/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
 function service(request) {
    'use strict';
    var Application = require('Application');
    try {
        // var AUTH_HEADER = {
        //     "Authorization": "Basic NDIyMzc6ZTI5ZmQ0NWU1YzNkMDkzZDJjMTRmOWE4ZjYxOWNkM2I5NmI2Yzc4ZDBmNjhiZDBlYWE0NzdlYzBiOTJhY2M4MzljNjdjZGJhNTQ2ZWM1YWFlMWU1MDc5Yjc0MjJkNzVhM2QwZjNlMmNkYjA2YTAxZDY2NmQ1ZGQ2YzJlNjVkMjE=",
        //     "Content-Type": "application/json",
        //     "Accept": "application/json",
        //     "User-Agent": "Custom Plugin/1.0.0 (SuiteCommerce Advanced/21.1; NetSuite; Merchant/42237) https://ek1.yourcloudcto.com/"
        // };
        // var BASE_API_URL = "https://api-sandbox.afterpay.com/v2/";
        
        // Production HEADER
        var userId = nlapiGetUser();
        nlapiLogExecution("debug", "User ID", userId); //10824
        var BASE_API_URL = "https://api.afterpay.com/v2/";
        var AUTH_HEADER = {
            "Authorization": "Basic MTQ1OTE4OjJiMWQxMjY0MjQ3NWZlZmQzMmQzYzdmOWIyZGMxNzUwZWE3NGM1NDgwMjAyMTI5NDg0ZjY0ZTlhY2YwNDUzZWE5NWI0N2ZjYzQzMjNkNWI4YjEyMWY3ZDFhY2I0MDUxMWUwODdkNjdmZjAyN2U3NTBiZGExMmFiOTVmOTliOGJi",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Custom Plugin/1.0.0 (SuiteCommerce Advanced/21.1; NetSuite; Merchant/145918) https://www.evakool.com.au/"
        };
        // Production Header - END

        // if(userId === 10824){ //if test user then goto to afterpay sandbox
        //     AUTH_HEADER = {
        //         "Authorization": "Basic NDIyMzc6ZTI5ZmQ0NWU1YzNkMDkzZDJjMTRmOWE4ZjYxOWNkM2I5NmI2Yzc4ZDBmNjhiZDBlYWE0NzdlYzBiOTJhY2M4MzljNjdjZGJhNTQ2ZWM1YWFlMWU1MDc5Yjc0MjJkNzVhM2QwZjNlMmNkYjA2YTAxZDY2NmQ1ZGQ2YzJlNjVkMjE=",
        //         "Content-Type": "application/json",
        //         "Accept": "application/json",
        //         "User-Agent": "Custom Plugin/1.0.0 (SuiteCommerce Advanced/21.1; NetSuite; Merchant/42237) https://ek1.yourcloudcto.com/"
        //     };
        //     BASE_API_URL = "https://api-sandbox.afterpay.com/v2/";
        // }

        var decodedString = "";

        var data = request.getParameter('data');
        var config = request.getParameter('config');
        var paymentData = request.getParameter('paymentData');
        if(config !== null && config == 'true'){
            var configuration_res = nlapiRequestURL(BASE_API_URL+"configuration", null, AUTH_HEADER, null, 'GET');
            Application.sendContent(configuration_res);
        }else if(data !== null && data !== ''){ //make checkout call for getting token of AfterPay
            decodedString = Base64.decode(data);
            nlapiLogExecution("debug", "Afterpay Token request Data:", JSON.stringify(decodedString));
            var response = nlapiRequestURL(BASE_API_URL+"checkouts", decodedString, AUTH_HEADER, null, 'POST');
            nlapiLogExecution("debug", "Afterpay Token request response:", JSON.stringify(response));
            Application.sendContent(response);
        }else if(paymentData !== null && paymentData !== ''){ //make capture of payment
            decodedString = Base64.decode(paymentData);
            nlapiLogExecution("debug", "Afterpay AUTH request Data:", JSON.stringify(decodedString));
            var response = nlapiRequestURL(BASE_API_URL+"payments/auth", decodedString, AUTH_HEADER, null, 'POST');
            nlapiLogExecution("debug", "Afterpay AUTH request response:", JSON.stringify(response));
            Application.sendContent(response);
        }
    } catch (e) {
        Application.sendError(e);
    }

}


var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}