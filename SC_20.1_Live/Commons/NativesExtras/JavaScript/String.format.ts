/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="String.format"/>

// ! © 2015 NetSuite Inc.
// String.format.js
// ----------------
// Used for the translation method in Utils.js
// Will replace $(n) for the n parameter entered
// eg: "This $(0) a $(1), $(0) it?".format("is", "test");
//     returns "This is a test, is it?"
type StringFormatParam = string | number;
export function stringFormat(text: string, ...continuationText: StringFormatParam[]): string {
    return text.replace(/\$\((\d+)\)/g, function(match: string | number, number: number) {
        if (typeof continuationText[number] !== 'undefined') {
            return continuationText[number].toString();
        }
        return match.toString();
    });
}

(<any>String).prototype.format = function() {
    const args = arguments;

    return this.replace(/\$\((\d+)\)/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
};
