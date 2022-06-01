/* eslint-disable */
/* global define: false */
/* global require: false */
/* global requirejs: false */

(function loadTemplateSafe()
{
	'use strict';

    define('SC.LoadTemplateSafe', [], function() {
        return {
            load: function(name, req, onload, config) {
                try {
                    req(
                        [name],
                        function(value) {
                            onload(value);
                        },
                        function() {
                            onload(null);
                        }
                    );
                } catch (e) {}
            }
        };
    });

    function copyProperties(source, dest) {
		for (var property in source)
		{
            if (source.hasOwnProperty(property)) {
                dest[property] = source[property];
            }
        }
    }

    function insertPlugin(deps) {
        if(deps.splice){
            for (var i = 0; i < deps.length; i++) {
                if (
                    deps[i].indexOf('.tpl') !== -1 &&
                    deps[i].indexOf('SC.LoadTemplateSafe!') === -1
                ) {
                    deps[i] = 'SC.LoadTemplateSafe!' + deps[i];
                }
            }
        }
    }
    function isInEcmaScriptModule(module, component) {
        if (typeof module === 'object' && module.__esModule){
            for (var exportedElement in module) {
                if (module.hasOwnProperty(exportedElement) &&
                    module[exportedElement] === component) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    function setModuleName(module, name) {
        if(module._AMDModuleName === undefined){
            module._AMDModuleName = [name];
            return;
        }
        var existingModule = (srcRequire || require)(module._AMDModuleName[0]);
        if (existingModule === module || isInEcmaScriptModule(existingModule, module)) {
            module._AMDModuleName.push(name);
        } else {
            module._AMDModuleName = [name];
        }
    }

    function wrapDefine(func) {
        // define = function (name, deps, callback)
        function newFunc(name, deps, callback) {

            /* add AMD module name to modules that are functions or
             to functions exported in ECMA SCRIPT modules
             this is required by extensibility layer, especially by
             the visual component. The AMD name is used to enhance
             views */
            function newCallback() {
                var module = callback.apply(null, arguments);
                //In gulp-local some module could have no name
                if (name) {
                    // ECMA SCRIPT modules are not returned by the callback, they are
                    // passed as argument to the callback
                    if (deps.length >= 2 && deps[1] === 'exports' && arguments[1].__esModule) {
                        module = arguments[1];
                    }
                    if (module && typeof module === 'object' && module.__esModule) {
                        // Assign the AMD module name to each function exported in
                        // an ECMAScript module
                        for (var property in module) {
                            if (module.hasOwnProperty(property) &&
                                typeof module[property] === 'function') {
                                setModuleName(module[property], name);
                            }
                        }
                    } else if (typeof module === 'function') {
                        setModuleName(module, name);
                    }
                }
                return module;
            }
            if(SC.isDevelopment){
                // if gulp-local (uses requirejs)
                if (typeof name !== 'string') {
                    //Adjust args appropriately
                    callback = deps;
                    deps = name;
                    name = null;
                    //This module may not have dependencies
                    if (!deps.splice) {
                        callback = deps;
                        deps = null;
                        return func.call(null, newCallback);
                    }
                    insertPlugin(deps);
                    return func.call(null, deps, newCallback);
                }
                insertPlugin(deps);
                return func.call(null, name, deps, newCallback);
            } else {
                if (!deps.splice) {
                    //deps is not an array, so probably means
                    //an object literal or factory function for
                    //the value. Adjust args.
                    callback = deps;
                    deps = [];
                } else {
                    //apply plugin only if are dependencies
                    insertPlugin(deps);
                }
                return func.call(null, name, deps, newCallback);
            }

        }
        copyProperties(func, newFunc);

        return newFunc;
    }
    // require = function (deps, callback, relName, forceSync, alt)
    function wrapRequire(func) {
        function newFunc(deps, callback, relName, forceSync, alt) {
            insertPlugin(arguments[0]);
            if(!SC.isDevelopment){
                // if not gulp-local force almond.js to execute synchronously,
                // it's required to avoid issue with seo engine, if forceSync is 'false'
                // errors can not be captured!!
                if (typeof relName === 'function') {
                    //if relName is a function, the actual forceSync parameter will be the last one (alt)
                    return func.call(null, deps, callback, relName, forceSync, true);
                }
                return func.call(null, deps, callback, relName, true, alt);
            }
            return func.apply(null, arguments);
        }
        copyProperties(func, newFunc);

        return newFunc;
    }

    define = wrapDefine(define);
    requirejs = require = wrapRequire(require);
})();
