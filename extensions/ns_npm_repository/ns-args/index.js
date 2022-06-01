const args = process.argv.slice(2);
let processedArgs = {};

// method for initialize arguments and values
function initProcessedArgs() {
    const argKeyPrefix = '--';
    const argKeyShortPrefix = '-';
    const argKeyPrefixNo = argKeyPrefix + 'no-';
    if (Object.keys(processedArgs).length === 0) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith(argKeyPrefix) ||
                (args[i].startsWith(argKeyShortPrefix) && args[i].length === 2)
            ) {
                if (args[i].startsWith(argKeyPrefixNo)) {
                    processedArgs[args[i].replace(argKeyPrefixNo, '')] = false;
                } else if (args[i].startsWith(argKeyPrefix)) {
                    processedArgs[args[i].replace(argKeyPrefix, '')] = true;
                } else {
                    processedArgs[args[i].replace(argKeyShortPrefix, '')] = true;
                }
            } else if (args[i - 1]) {
                if (args[i - 1].startsWith(argKeyPrefix)) {
                    processedArgs[args[i - 1].replace(argKeyPrefix, '')] = args[i];
                } else if (args[i - 1].startsWith(argKeyShortPrefix)) {
                    processedArgs[args[i - 1].replace(argKeyShortPrefix, '')] = args[i];
                }
            }
        }
        processedArgs['_'] = process.argv.slice(2);
    }
    convertParamsWithDashToCamelCase();
    convertParamsWithDotsToObject();
}

function argv() {
    return processedArgs;
}

function convertParamsWithDashToCamelCase() {
    const params = Object.keys(processedArgs);

    const dashArgs = params.filter(function(key) {
        return key.indexOf('-') > 0;
    });
    for (let i = 0; i < dashArgs.length; i++) {
        processedArgs[dashToCamelCase(dashArgs[i])] = processedArgs[dashArgs[i]];
    }

    const camelCaseArgs = params.filter(function(key) {
        return /[A-Z]/.test(key);
    });
    for (let i = 0; i < camelCaseArgs.length; i++) {
        processedArgs[camelCaseToDash(camelCaseArgs[i])] = processedArgs[camelCaseArgs[i]];
    }
}

function convertParamsWithDotsToObject() {
    const params = Object.keys(processedArgs);
    const dotsArgs = params.filter(function(key) {
        return key.indexOf('.') !== -1;
    });
    for (let i = 0; i < dotsArgs.length; i++) {
        processedArgs = mergeDeep(
            processedArgs,
            valueToObject(dotsArgs[i], processedArgs[dotsArgs[i]])
        );
        delete processedArgs[dotsArgs[i]];
    }
}

// method to transform words with dashes to camelCase
// ex: dashToCamelCase(h-ello) => hEllo
function dashToCamelCase(input) {
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

// method to transform words camelCase to separated by dash
// ex: camelCaseToDash(hEllo) => h-ello
function camelCaseToDash(input) {
    return input.replace(/[A-Z]/g, function(m) {
        return '-' + m.toLowerCase();
    });
}

// method to put the param value as value of an object defined in keys
// ex: valueToObject('a.b.c', true) => {a: {b: {c: true}}}
function valueToObject(keys, value) {
    const tempObject = {};
    let container = tempObject;
    keys.split('.').map((k, i, values) => {
        container = container[k] = i == values.length - 1 ? value : {};
    });
    return tempObject;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// method to merge objects in deep
// ex: mergeDeep({ a: { a: 1 } }, { a: { b: 1 } }) => { a: { a: 1, b: 1 } }
function mergeDeep(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}

// method to add alias to an argument
function option(argKey, value) {
    let options = [];
    options.push(argKey);
    if (Array.isArray(value.alias)) {
        options = options.concat(value.alias);
    } else {
        options.push(value.alias);
    }
    const paramsWithOptions = Object.keys(processedArgs).filter(function(val) {
        return options.includes(val);
    });

    const argument = paramsWithOptions.find(function(param) {
        return processedArgs[param] !== null;
    });

    if (processedArgs[argument]) {
        for (let i = 0; i < options.length; i++) {
            processedArgs[options[i]] = processedArgs[argument];
        }

        convertParamsWithDashToCamelCase();
        convertParamsWithDotsToObject();
    }
}

// method to add a hidden argument
function addHiddenParam(argName, argValue) {
    processedArgs[argName] = argValue || true;
    convertParamsWithDashToCamelCase();
    convertParamsWithDotsToObject();
}

initProcessedArgs();

module.exports = {
    argv,
    option,
    addHiddenParam
}
