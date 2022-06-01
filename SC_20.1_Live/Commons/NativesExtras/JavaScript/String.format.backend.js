/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ! © 2015 NetSuite Inc.
// String.format.js
// ----------------
// Used for the translation method in Utils.js
// Will replace $(n) for the n parameter entered
// eg: "This $(0) a $(1), $(0) it?".format("is", "test");
//     returns "This is a test, is it?"
define('String.format.backend', function() {
    String.prototype.format = function() {
        const args = arguments;

        return this.replace(/\$\((\d+)\)/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
});
