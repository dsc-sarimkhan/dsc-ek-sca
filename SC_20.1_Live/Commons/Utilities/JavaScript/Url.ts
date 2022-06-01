/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Url"/>
import * as _ from 'underscore';

const parametersRegex = /([^;]*)(;(.*))*/;
const queryRegex = /([^?]*)(\?(.*))*/;
const netLocRegex = /^\/\/([^\/]*)(.*)/;
const squemaNameRegex = /^([a-zA-Z+\-.]+):(.+)/;
const fragmentRegex = /([^#]*)(#(.*))*/;
const netLocComponentsRegex = /(([^:@]*)(:([^@]*))?@)*([\d\w.-]+)$/;
function parse(url, outputObject) {
    function parseFragment() {
        const match = url.match(fragmentRegex);
        if (match) {
            outputObject.fragment = match[3];
            url = match[1];
        }
    }
    function parseSchema() {
        const match = url.match(squemaNameRegex);
        if (match) {
            outputObject.schema = match[1];
            url = match[2];
        }
    }
    function parseNetLoc() {
        const match = url.match(netLocRegex);
        if (match) {
            outputObject.netLoc = match[1];
            url = match[2];
        }
    }
    function parseQuery() {
        const match = url.match(queryRegex);
        if (match) {
            outputObject.query = match[3];
            url = match[1];
        }
    }
    function parseParameters() {
        const match = url.match(parametersRegex);
        if (match) {
            outputObject.parameters = match[3];
            url = match[1];
        }
    }
    function parsePath() {
        outputObject.path = url;
        url = '';
    }
    function parseNetLocComponents() {
        // todo: implement parsing validations
        const { netLoc } = outputObject;
        if (netLoc) {
            const match = netLoc.match(netLocComponentsRegex);
            if (match) {
                if (match[2] !== undefined) {
                    outputObject.netLocComponets.user = match[2];
                    // password can only be considered if a user was provided
                    if (match[4] !== undefined) {
                        outputObject.netLocComponets.password = match[4];
                    }
                }
                if (match[5] !== undefined) {
                    outputObject.netLocComponets.domain = match[5];
                    if (match[7] !== undefined) {
                        outputObject.netLocComponets.port = match[7];
                    }
                }
            }
        }
    }
    outputObject = outputObject || {};
    if (url) {
        // order needs to be preserved
        parseFragment();
        parseSchema();
        parseNetLoc();
        parseQuery();
        parseParameters();
        parsePath();
        parseNetLocComponents();
    }
    return outputObject;
}
/**
 * REFERENCES
 * https://tools.ietf.org/html/rfc1808
 * @class
 */
function Url() {
    // @property {String} schema
    this.schema = null;
    // @property {String} netLoc
    this.netLoc = null;
    // @property {String} path
    this.path = null;
    // @property {String} parameters
    this.parameters = null;
    // @property {String} fragment
    this.fragment = null;
    // @property {String} query
    this.query = null;
    // @property {Object} netLocComponets
    this.netLocComponets = {};
}
Url.prototype = {
    toString: function() {
        let url = '';
        if (this.schema) {
            url += this.schema + ':';
        }
        if (this.netLoc) {
            url += '//' + this.netLoc;
        }
        if (this.path) {
            url += this.path;
        }
        if (this.parameters) {
            url += ';' + this.parameters;
        }
        if (this.query) {
            url += '?' + this.query;
        }
        if (this.fragment) {
            url += '#' + this.fragment;
        }
        return url;
    },
    /**
     * Parse a string into the current Url object
     * @param {String} strUrl
     * @returns {Url} Reference to the Url object that the method bellows to
     */
    parse: function(strUrl) {
        this.strUrl = strUrl;
        parse(strUrl, this);
        return this;
    },
    /**
     * Get a copy of the current Url object
     * @returns {Url}
     */
    clone: function() {
        const url = new Url();
        return _.extend(url, this);
    },
    /**
     * @method resolve
     * Resolve the absolute URL for the current URL taking the base URL as argument
     * The algorithm is fallowing the steps described in https://tools.ietf.org/html/rfc1808 (Resolving Relative URLs)
     * @param {String} baseUrl
     * @returns {URL}
     */
    resolve: function(baseUrl) {
        baseUrl = baseUrl instanceof Url ? baseUrl : new Url().parse(baseUrl);
        const relative = this;
        const absoluteUrl = relative.clone();
        // step 1
        if (!baseUrl.strUrl) {
            return relative;
        }
        // step 2 - a
        if (!relative.strUrl) {
            return baseUrl;
        }
        // step 2 - b
        if (relative.schema) {
            return relative;
        }
        // step 2 - c

        absoluteUrl.schema = baseUrl.schema;

        // step 3
        if (!relative.netLoc) {
            absoluteUrl.netLoc = baseUrl.netLoc;
            // step 4
            if (relative.path.indexOf('/') !== 0) {
                // step 5
                if (!relative.path) {
                    absoluteUrl.path = baseUrl.path;
                    // step 5 - a
                    if (!relative.parameters) {
                        absoluteUrl.parameters = baseUrl.parameters;
                        if (!relative.query) {
                            absoluteUrl.query = baseUrl.query;
                        }
                    }
                } else {
                    // step 6
                    const basePath = baseUrl.path.substr(0, baseUrl.path.lastIndexOf('/'));
                    absoluteUrl.path = basePath + '/' + relative.path;
                    // step 6 - a,b
                    absoluteUrl.path = absoluteUrl.path.replace(/(\/\.\/)|(\/\.$)/g, '/');
                    // step 6 - c
                    let tmpPath = '';
                    while (tmpPath !== absoluteUrl.path) {
                        tmpPath = absoluteUrl.path;
                        absoluteUrl.path = absoluteUrl.path.replace(/\/*[^./]+\/\.\.\//, '/');
                    }
                    // step 6 - d
                    absoluteUrl.path = absoluteUrl.path.replace(/\/*[^./]+\/\.\.$/, '/');
                }
            }
        }
        return absoluteUrl;
    },
    getNetLocComponets: function() {
        return this.netLocComponets;
    }
};
export = Url;
