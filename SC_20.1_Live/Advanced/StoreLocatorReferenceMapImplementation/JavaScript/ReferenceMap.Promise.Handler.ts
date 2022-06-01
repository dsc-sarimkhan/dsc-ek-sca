/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ReferenceMap.Promise.Handler"/>
// @module StoreLocatorReferenceMapsImplementation

class ReferenceMapPromiseHandler {
    private static instance = null;

    private constructor() {
        if (ReferenceMapPromiseHandler.instance !== null) {
            throw new Error(
                'Cannot instantiate more than one ReferenceMapPromiseHandler, use ReferenceMapPromiseHandler.getInstance()'
            );
        }

        this.initialize();
    }

    private initialize = function() {
        this.promise = null;
    };

    private setPromise = function(promise) {
        this.promise = promise;
    };

    private getPromise = function() {
        return this.promise;
    };

    public static getInstance = function() {
        if (ReferenceMapPromiseHandler.instance === null) {
            ReferenceMapPromiseHandler.instance = new ReferenceMapPromiseHandler();
        }

        return ReferenceMapPromiseHandler.instance;
    };
}
export = ReferenceMapPromiseHandler.getInstance();
