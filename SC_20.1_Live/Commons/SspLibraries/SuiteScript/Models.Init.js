/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// Init.js
// -------
// Global variables to be used accross models
// This is the head of combined file Model.js
/* exported container, session, settings, customer, context, order */

function log(level, title, details) {
    const console = require('Console');
    const levels = {
        DEBUG: 'log',
        AUDIT: 'info',
        EMERGENCY: 'error',
        ERROR: 'warn'
    };

    console[levels[level]](title, details);
}

const wrapped_objects = {};

function wrapObject(object, class_name) {
    if (!wrapped_objects[class_name]) {
        wrapped_objects[class_name] = {};

        for (const method_name in object) {
            if (method_name !== 'prototype') {
                wrapped_objects[class_name][method_name] = wrap(object, method_name, class_name);
            }
        }
    }

    return wrapped_objects[class_name];
}

function wrap(object, method_name, class_name, original_function) {
    return function() {
        let result;
        const is_secure = ~request.getURL().indexOf('https:');
        const function_name = class_name + '.' + method_name + '()';
        const file =
            '/' +
            request
                .getParameter('sitepath')
                .replace(session.getAbsoluteUrl2(is_secure ? 'checkout' : 'shopping', '/'), '');
        const start = Date.now();

        try {
            if (original_function) {
                result = original_function.apply(object, arguments);
            } else {
                result = object[method_name].apply(object, arguments);
            }
        } catch (e) {
            if (!SC.debuggingSilent) {
                log(
                    'ERROR',
                    file + ' | ' + function_name,
                    ' | Arguments: ' +
                        JSON.stringify(arguments) +
                        ' | Exception: ' +
                        JSON.stringify(e)
                );
            }

            throw e;
        }

        if (!SC.debuggingSilent) {
            log(
                'DEBUG',
                file + ' | ' + function_name,
                'Time: ' +
                    (Date.now() - start) +
                    'ms | Remaining Usage: ' +
                    nlapiGetContext().getRemainingUsage() +
                    ' | Arguments: ' +
                    JSON.stringify(arguments)
            );
        }

        return result;
    };
}

let container = null;
var session = null;
let customer = null;
let context = null;
let order = null;
// only initialize vars when the context actually have the functions
switch (nlapiGetContext().getExecutionContext()) {
    case 'suitelet':
        context = nlapiGetContext();
        break;
    case 'webstore':
    case 'webservices':
    case 'webapplication':
        // nlapiLogExecution('DEBUG', 'Initializing global vars', nlapiGetContext().getExecutionContext());
        container = nlapiGetWebContainer();
        session = container.getShoppingSession();
        customer = session.getCustomer();
        context = nlapiGetContext();
        order = session.getOrder();
        break;
    default:
        // nlapiLogExecution('DEBUG', 'Omitting initialization of global vars', nlapiGetContext().getExecutionContext());
        break;
}

/*
 *	Returns the location id for the employee.
 *		if SCIS => the selecetd scis location
 *		else => the employee location field.
 */
define('Models.Init', ['underscore'], function(_) {
    if (SC.debuggingMode) {
        const suite_script_functions_to_wrap = [
            'nlapiLoadRecord',
            'nlapiSearchRecord',
            'nlapiSubmitRecord',
            'nlapiCreateRecord',
            'nlapiLookupField'
        ];

        _.each(
            suite_script_functions_to_wrap,
            function(method_name) {
                this[method_name] = wrap(this, method_name, 'SuiteScript', this[method_name]);
            },
            this
        );

        return {
            container: wrapObject(container, 'WebContainer'),
            session: wrapObject(session, 'ShoppingSession'),
            customer: wrapObject(customer, 'Customer'),
            context: wrapObject(context, 'Context'),
            order: wrapObject(order, 'Order')
        };
    }
    return {
        container: container,
        session: session,
        customer: customer,
        context: context,
        order: order
    };
});
