"use strict";
exports.__esModule = true;
var through2 = require("through2");
var path = require("path");
var VinylFile = require("vinyl");
var Bundler = /** @class */ (function () {
    function Bundler(config) {
        this.DefineAndDependenciesRegex = /define\s*\((\s*("([^"]+)"|'([^']+)')\s*,)?\s*(\[([^\]]*)\])?/g;
        this.config = config;
        this.files = new Map();
        this.filesWithRelationsByAmdModuleName = new Map();
        this.amdModulesName = [];
        this.errorCyclingCount = 0;
        this.config.entryPoints.forEach(function (entryPoint) {
            entryPoint.output.sort(Bundler.compare);
        });
    }
    Bundler.compare = function (a, b) {
        var orderA = a.order;
        var orderB = b.order;
        return orderA > orderB ? 1 : -1;
    };
    Bundler.prototype.shimTemplate = function (moduleDefine, content, shimModuleName, dependencies) {
        if (shimModuleName === void 0) { shimModuleName = ''; }
        if (dependencies === void 0) { dependencies = []; }
        var dependenciesWithinQuotes = dependencies.map(function (dependency) { return "\"" + dependency + "\""; });
        var dependenciesValues = dependencies.length > 0 ? "" + dependenciesWithinQuotes.join(',') : '';
        return "" + '(function(root) {define("' + moduleDefine + "\", [" + dependenciesValues + "], function() {\n                return (function() {" + content + "\n                " + (shimModuleName ? "return root." + shimModuleName + "=" + shimModuleName + ";" : '') + "})\n                .apply(root, arguments);});}(this));";
    };
    Bundler.prototype.getShimFileContent = function (keyValue, content) {
        return this.shimTemplate(keyValue, content, this.config.shim[keyValue].exports, this.config.shim[keyValue].deps);
    };
    Bundler.prototype.getPathKeyValue = function (fileName) {
        var _this = this;
        var pathKeyValue = '';
        if (this.config.paths) {
            Object.keys(this.config.paths).forEach(function (pathKey) {
                if (_this.config.paths[pathKey] === fileName && !pathKeyValue) {
                    pathKeyValue = pathKey;
                }
            });
        }
        return pathKeyValue;
    };
    Bundler.prototype.applyShim = function (content, fileName) {
        var resultContent = content;
        var pathKeyValue = this.getPathKeyValue(fileName);
        if (this.config.shim[pathKeyValue]) {
            resultContent = this.getShimFileContent(pathKeyValue, content);
        }
        else {
            var fileWithoutExtension = fileName.substr(0, fileName.lastIndexOf(path.extname(fileName)));
            if (this.config.shim[fileWithoutExtension]) {
                resultContent = this.getShimFileContent(fileWithoutExtension, content);
            }
        }
        return resultContent;
    };
    // require and exports are passed by the require implementation
    // these dependencies are not necessary to look for its content
    Bundler.prototype.removeRequireAndExports = function (dependencies) {
        if (dependencies.indexOf('require') !== -1) {
            dependencies.splice(dependencies.indexOf('require'), 1);
        }
        if (dependencies.indexOf('exports') !== -1) {
            dependencies.splice(dependencies.indexOf('exports'), 1);
        }
    };
    Bundler.prototype.checkForDuplicatedDependencies = function (dependencies, fileName) {
        var findDuplicates = function (arr) {
            return arr.filter(function (item, index) { return arr.indexOf(item) !== index; });
        };
        var duplicates = findDuplicates(dependencies);
        if (duplicates.length > 0) {
            throw Error("The dependencies " + duplicates.join(',') + " are duplicated in the file " + fileName);
        }
    };
    Bundler.prototype.checkForBlankDependencies = function (dependencies, fileName) {
        if (dependencies.indexOf('') > -1) {
            throw Error("In the file " + fileName + " are empty dependencies or there is a \",\"\n                 at the end of the dependencies declaration");
        }
    };
    Bundler.prototype.setupMetadataDependencies = function (dependencies, fileName) {
        this.checkForBlankDependencies(dependencies, fileName);
        this.removeRequireAndExports(dependencies);
        this.checkForDuplicatedDependencies(dependencies, fileName);
    };
    Bundler.prototype.extractAMDMetadata = function (content, fileName) {
        var result = [];
        var match;
        do {
            match = this.DefineAndDependenciesRegex.exec(content);
            var dependencies = [];
            var amdModuleName = void 0;
            if (match) {
                amdModuleName = match[2] && match[2].replace(/['"]*/g, '');
                dependencies =
                    (match[6] &&
                        match[6]
                            .replace(/['"]+/g, '')
                            .split(',')
                            .map(function (a) { return a.trim(); })) ||
                        [];
                this.setupMetadataDependencies(dependencies, fileName);
                result.push({
                    amdModuleName: amdModuleName,
                    dependencies: dependencies
                });
            }
        } while (match);
        return result;
    };
    /**
     * Set Amd module name on anonymous modules definition
     * */
    Bundler.prototype.setAmdModuleName = function (content, newModuleName) {
        return content.replace(this.DefineAndDependenciesRegex, function (original, a, moduleName, b, c, dependencies) {
            if (!moduleName) {
                return dependencies
                    ? "define(\"" + newModuleName + "\", " + dependencies
                    : "define(\"" + newModuleName + "\", ";
            }
            return original;
        });
    };
    Bundler.prototype.checkDuplicatesAmdModules = function (amdModuleName) {
        if (this.amdModulesName.indexOf(amdModuleName) !== -1) {
            throw Error("The amd module " + amdModuleName + " is duplicated");
        }
        this.amdModulesName.push(amdModuleName);
    };
    Bundler.prototype.addFile = function (file) {
        var normalizedPath = path.resolve(file.path);
        var fileName = path.basename(normalizedPath);
        var content = file.contents.toString();
        if (this.config.shim) {
            content = this.applyShim(content, fileName);
        }
        var pathKeyValue = this.getPathKeyValue(fileName);
        var amdMetadata = this.extractAMDMetadata(content, fileName);
        var mainAmdModuleName = amdMetadata[0] ? amdMetadata[0].amdModuleName : undefined;
        var mainAmdDependencies = amdMetadata[0] ? amdMetadata[0].dependencies : [];
        if (pathKeyValue && !mainAmdModuleName) {
            mainAmdModuleName = pathKeyValue;
        }
        if (mainAmdModuleName) {
            content = this.setAmdModuleName(content, mainAmdModuleName);
            this.checkDuplicatesAmdModules(mainAmdModuleName);
            this.files.set(fileName, {
                content: content,
                amdModuleName: mainAmdModuleName,
                dependencies: mainAmdDependencies
            });
        }
        else {
            this.files.set(fileName, { content: content, dependencies: mainAmdDependencies });
        }
    };
    Bundler.prototype.initFilesByAMDModules = function () {
        var _this = this;
        this.files.forEach(function (value, key) {
            if (value.amdModuleName) {
                _this.filesWithRelationsByAmdModuleName.set(value.amdModuleName, {
                    content: value.content,
                    fileName: key,
                    dependencies: value.dependencies
                });
            }
        });
    };
    Bundler.throwCircularDependencyError = function (parents, entryPoint, throwCyclingDependenciesError) {
        if (throwCyclingDependenciesError === void 0) { throwCyclingDependenciesError = false; }
        console.log("Circular dependency: " + parents.join(' -> ') + " -> " + entryPoint);
        if (throwCyclingDependenciesError) {
            throw Error("Circular dependency: " + parents.join(' -> ') + " -> " + entryPoint);
        }
    };
    Bundler.prototype.mergeBranches = function (branch1, branch2) {
        var branch1Index = 0;
        var branch2Index = 0;
        var mergeResult = [];
        var mergedElements = {};
        while (branch1Index < branch1.length || branch2Index < branch2.length) {
            if (branch1Index < branch1.length) {
                var searchedElementIndex = branch2.indexOf(branch1[branch1Index], branch2Index);
                if (searchedElementIndex >= 0) {
                    while (branch2Index <= searchedElementIndex) {
                        if (!mergedElements[branch2[branch2Index]]) {
                            mergeResult.push(branch2[branch2Index]);
                            mergedElements[branch2[branch2Index]] = true;
                        }
                        branch2Index++;
                    }
                }
                else if (!mergedElements[branch1[branch1Index]]) {
                    mergeResult.push(branch1[branch1Index]);
                    mergedElements[branch1[branch1Index]] = true;
                }
                branch1Index++;
            }
            else {
                // add all elements in  branch2 that were not included yet
                mergeResult = mergeResult.concat(branch2.slice(branch2Index));
                branch2Index = branch2.length;
            }
        }
        return mergeResult;
    };
    Bundler.prototype.overrideMapDependency = function (entryPointMap, dependency, amdModuleName) {
        if (amdModuleName === void 0) { amdModuleName = ''; }
        var resultDependency = dependency;
        var mapKeys = Object.keys(entryPointMap);
        if (mapKeys.length > 0) {
            var index = 0;
            while (resultDependency === dependency && index < mapKeys.length) {
                if ((mapKeys[index] === '*' || mapKeys[index] === amdModuleName) &&
                    entryPointMap[mapKeys[index]][dependency]) {
                    resultDependency = entryPointMap[mapKeys[index]][dependency];
                }
                index++;
            }
        }
        return resultDependency;
    };
    Bundler.prototype.skipDependency = function (dependency, dependencies) {
        if (dependencies === void 0) { dependencies = []; }
        var skipDependency = false;
        if (dependencies.length > 0) {
            var regexPattern = new RegExp(dependencies.join('|'));
            skipDependency = regexPattern.test(dependency);
        }
        return skipDependency;
    };
    /**
     * @return Amd dependencies in order,
     * the rightest dependency is the most independent one
     */
    Bundler.prototype.getAmdDependenciesInOrder = function (entryPoint, parents, cachedMapDependencies, entryPointMap, skipDependencies, throwCyclingDependenciesError) {
        var _this = this;
        if (skipDependencies === void 0) { skipDependencies = []; }
        if (throwCyclingDependenciesError === void 0) { throwCyclingDependenciesError = false; }
        var orderedDependencies = [];
        if (parents.indexOf(entryPoint) > -1) {
            this.errorCyclingCount++;
            if (this.errorCyclingCount === 1) {
                Bundler.throwCircularDependencyError(parents, entryPoint, throwCyclingDependenciesError);
            }
        }
        else if (!this.skipDependency(entryPoint, skipDependencies)) {
            var entryPointModule = this.filesWithRelationsByAmdModuleName.get(entryPoint);
            if (!entryPointModule) {
                throw Error("Missing module. Check that module " + entryPoint + " is an existing module");
            }
            parents.push(entryPoint);
            entryPointModule.dependencies.forEach(function (dependency) {
                var transitiveDependencies = cachedMapDependencies[dependency];
                if (!transitiveDependencies) {
                    transitiveDependencies = _this.getAmdDependenciesInOrder(_this.overrideMapDependency(entryPointMap, dependency, entryPoint), parents, cachedMapDependencies, entryPointMap, skipDependencies, throwCyclingDependenciesError);
                    cachedMapDependencies[dependency] = transitiveDependencies;
                }
                if (orderedDependencies.length) {
                    // merge two sets of ordered dependencies
                    orderedDependencies = _this.mergeBranches(orderedDependencies, transitiveDependencies);
                }
                else {
                    orderedDependencies = transitiveDependencies;
                }
            });
            parents.pop();
            orderedDependencies.push(entryPoint);
        }
        return orderedDependencies;
    };
    Bundler.prototype.getFilesInOrder = function (entryPoint) {
        var _this = this;
        var orderedFiles = new Set();
        var cachedMapDependencies = {};
        entryPoint.names.forEach(function (entryPointName) {
            var file = _this.files.get(entryPointName);
            if (file) {
                var parent_1 = [];
                if (file.amdModuleName) {
                    parent_1.push(file.amdModuleName);
                }
                var entryPointMap_1 = (entryPoint && entryPoint.config && entryPoint.config.map) || {};
                file.dependencies.forEach(function (dependency) {
                    var amdDependencies = _this.getAmdDependenciesInOrder(_this.overrideMapDependency(entryPointMap_1, dependency, file.amdModuleName), parent_1, cachedMapDependencies, entryPointMap_1, entryPoint.skipDependencies, entryPoint.throwCyclingError);
                    for (var i = 0; i < amdDependencies.length; i++) {
                        var amdDependency = amdDependencies[i];
                        orderedFiles.add(_this.filesWithRelationsByAmdModuleName.get(amdDependency).fileName);
                    }
                });
                orderedFiles.add(entryPointName);
            }
            else {
                throw Error("Entry point " + entryPointName + " does not exist(file extension required)");
            }
        });
        return orderedFiles;
    };
    Bundler.prototype.addConfigContent = function (configMap, content) {
        var addComma = false;
        if (this.config.shim || this.config.paths || (configMap && configMap.map)) {
            var requireConfig = "require.config({";
            if (configMap && configMap.map) {
                addComma = true;
                requireConfig += "\"map\":" + JSON.stringify(configMap.map);
            }
            if (this.config.paths) {
                requireConfig += (addComma ? ',' : '') + "\"paths\":" + JSON.stringify(this.config.paths);
                addComma = true;
            }
            if (this.config.shim) {
                requireConfig += (addComma ? ',' : '') + "\"shim\":" + JSON.stringify(this.config.shim);
            }
            requireConfig += "});";
            content += requireConfig;
        }
        return content;
    };
    Bundler.prototype.initFilesResult = function (entryOutputs) {
        var filesResult = new Map();
        entryOutputs.forEach(function (output) {
            filesResult.set(output.name, '');
        });
        return filesResult;
    };
    Bundler.prototype.addConfigToFiles = function (entryPoint, filesResult) {
        var _this = this;
        entryPoint.output.forEach(function (output) {
            if (output.includeConfig) {
                filesResult.set(output.name, _this.addConfigContent(entryPoint.config, filesResult.get(output.name)));
            }
        });
    };
    Bundler.prototype.findRightOutputIndex = function (entryPointOutput, fileName) {
        var start = 0;
        var rightOutputIndex = -1;
        while (start < entryPointOutput.length && rightOutputIndex === -1) {
            var output = entryPointOutput[start];
            var regexPattern = new RegExp(output.patterns.join('|'));
            var dependencyMatchRegex = regexPattern.test(fileName);
            if (dependencyMatchRegex) {
                rightOutputIndex = start;
            }
            start++;
        }
        return rightOutputIndex;
    };
    Bundler.prototype.buildManifestFile = function (manifestMap, amdModuleName, skipManifestDependencies, manifestName) {
        if (skipManifestDependencies === void 0) { skipManifestDependencies = []; }
        if (manifestName === void 0) { manifestName = ''; }
        if (manifestName) {
            var manifest = manifestMap.get(manifestName) || [];
            if (manifest.indexOf(amdModuleName) === -1 &&
                !this.skipDependency(amdModuleName, skipManifestDependencies)) {
                manifestMap.set(manifestName, manifest.concat([amdModuleName]));
            }
        }
    };
    Bundler.prototype.buildOutputFile = function (entryPoint, filesInOrder, filesResult) {
        var _this = this;
        var manifestMap = new Map();
        filesInOrder.forEach(function (fileName) {
            var outputIndex = _this.findRightOutputIndex(entryPoint.output, fileName);
            if (outputIndex > -1) {
                var output = entryPoint.output[outputIndex];
                var file = _this.files.get(fileName);
                filesResult.set(output.name, filesResult.get(output.name) + file.content);
                if (file.amdModuleName) {
                    _this.buildManifestFile(manifestMap, file.amdModuleName, entryPoint.skipManifestDependencies, output.exportManifest);
                }
            }
        });
        manifestMap.forEach(function (manifestContent, fileName) {
            filesResult.set(fileName, JSON.stringify(manifestContent));
        });
        this.addConfigToFiles(entryPoint, filesResult);
    };
    Bundler.prototype.buildFiles = function (entryPoint, filesInOrder) {
        var filesResult = this.initFilesResult(entryPoint.output);
        this.buildOutputFile(entryPoint, filesInOrder, filesResult);
        return filesResult;
    };
    return Bundler;
}());
function checkConfigEntryPoint(config) {
    var errorConfigPrefix = 'Wrong value in the config:';
    if (Object.keys(config).indexOf('entryPoints') === -1) {
        throw Error(errorConfigPrefix + " The entryPoints attribute is required");
    }
    config.entryPoints.forEach(function (entryPoint) {
        if (!entryPoint.output) {
            throw Error(errorConfigPrefix + " The output attribute is required in the entry point array");
        }
        if (!entryPoint.names) {
            throw Error(errorConfigPrefix + " The attribute names is required in the entryPoints object");
        }
        entryPoint.output.forEach(function (output) {
            if (!output.order) {
                throw Error(errorConfigPrefix + " The order attribute is required");
            }
            if (!output.name) {
                throw Error(errorConfigPrefix + " The attribute name is required in the output object");
            }
            if (!output.patterns) {
                output.patterns = ['.js$'];
            }
        });
    });
}
function bundler(config) {
    checkConfigEntryPoint(config);
    var bundlerProcess = new Bundler(config);
    return through2({ objectMode: true }, function (file, type, cb) {
        try {
            bundlerProcess.addFile(file);
            cb();
        }
        catch (error) {
            cb(error.message.toString());
        }
    }, function (cb) {
        var _this = this;
        bundlerProcess.initFilesByAMDModules();
        try {
            config.entryPoints.forEach(function (entryPoint) {
                var filesInOrder = bundlerProcess.getFilesInOrder(entryPoint);
                var files = bundlerProcess.buildFiles(entryPoint, filesInOrder);
                files.forEach(function (value, key) {
                    var file = new VinylFile({
                        path: key,
                        contents: Buffer.from(value)
                    });
                    _this.push(file);
                });
            });
            if (bundlerProcess.errorCyclingCount > 0) {
                console.log("There has been " + bundlerProcess.errorCyclingCount + " cycling errors");
            }
            cb();
        }
        catch (error) {
            cb(error.message.toString());
        }
    });
}
exports.bundler = bundler;
