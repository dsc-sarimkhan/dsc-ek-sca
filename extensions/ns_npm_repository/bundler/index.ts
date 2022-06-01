import through2 = require('through2');
import path = require('path');
import VinylFile = require('vinyl');

interface EntryPointConfigurationMap {
    map: { [key: string]: { [key: string]: string } };
}
interface AmdMetadata {
    dependencies: string[];
    amdModuleName: string;
}
interface AmdData {
    dependencies: string[];
    content: string;
    fileName: string;
}

interface FileData {
    content: string;
    dependencies?: string[];
    amdModuleName?: string;
}

interface EntryPoint {
    names: string[];
    output: Output[];
    skipDependencies?: string[];
    skipManifestDependencies?: string[];
    config?: EntryPointConfigurationMap;
    throwCyclingError?: true;
}

interface Output {
    name: string;
    patterns: string[];
    order: number;
    exportManifest?: string;
    includeConfig?: true;
}

export interface BundlerConfiguration {
    entryPoints: EntryPoint[];
    paths?: { [key: string]: string };
    shim?: { [key: string]: { exports?: string; deps?: string[] } };
}

class Bundler {
    public files: Map<string, FileData>;
    public filesWithRelationsByAmdModuleName: Map<string, AmdData>;
    public config: BundlerConfiguration;
    private amdModulesName: string[];
    private DefineAndDependenciesRegex = /define\s*\((\s*("([^"]+)"|'([^']+)')\s*,)?\s*(\[([^\]]*)\])?/g;
    public errorCyclingCount: number;

    public constructor(config: BundlerConfiguration) {
        this.config = config;
        this.files = new Map<string, FileData>();
        this.filesWithRelationsByAmdModuleName = new Map<string, AmdData>();
        this.amdModulesName = [];
        this.errorCyclingCount = 0;
        this.config.entryPoints.forEach((entryPoint: EntryPoint) => {
            entryPoint.output.sort(Bundler.compare);
        });
    }

    private static compare<T extends { order: number }>(a: T, b: T): number {
        const orderA = a.order;
        const orderB = b.order;
        return orderA > orderB ? 1 : -1;
    }

    private shimTemplate(
        moduleDefine: string,
        content: string,
        shimModuleName: string = '',
        dependencies: string[] = []
    ): string {
        const dependenciesWithinQuotes = dependencies.map(dependency => `"${dependency}"`);
        const dependenciesValues =
            dependencies.length > 0 ? `${dependenciesWithinQuotes.join(',')}` : '';

        return `${'(function(root) {define("'}${moduleDefine}", [${dependenciesValues}], function() {
                return (function() {${content}
                ${shimModuleName ? `return root.${shimModuleName}=${shimModuleName};` : ''}})
                .apply(root, arguments);});}(this));`;
    }

    private getShimFileContent(keyValue: string, content: string): string {
        return this.shimTemplate(
            keyValue,
            content,
            this.config.shim[keyValue].exports,
            this.config.shim[keyValue].deps
        );
    }

    private getPathKeyValue(fileName: string) {
        let pathKeyValue = '';
        if (this.config.paths) {
            Object.keys(this.config.paths).forEach((pathKey: string) => {
                if (this.config.paths[pathKey] === fileName && !pathKeyValue) {
                    pathKeyValue = pathKey;
                }
            });
        }
        return pathKeyValue;
    }

    private applyShim(content: string, fileName: string): string {
        let resultContent = content;
        const pathKeyValue = this.getPathKeyValue(fileName);
        if (this.config.shim[pathKeyValue]) {
            resultContent = this.getShimFileContent(pathKeyValue, content);
        } else {
            const fileWithoutExtension = fileName.substr(
                0,
                fileName.lastIndexOf(path.extname(fileName))
            );
            if (this.config.shim[fileWithoutExtension]) {
                resultContent = this.getShimFileContent(fileWithoutExtension, content);
            }
        }
        return resultContent;
    }

    // require and exports are passed by the require implementation
    // these dependencies are not necessary to look for its content
    private removeRequireAndExports(dependencies: string[]): void {
        if (dependencies.indexOf('require') !== -1) {
            dependencies.splice(dependencies.indexOf('require'), 1);
        }
        if (dependencies.indexOf('exports') !== -1) {
            dependencies.splice(dependencies.indexOf('exports'), 1);
        }
    }

    private checkForDuplicatedDependencies(dependencies: string[], fileName: string) {
        const findDuplicates = (arr: string[]) =>
            arr.filter((item: string, index: number) => arr.indexOf(item) !== index);
        const duplicates = findDuplicates(dependencies);
        if (duplicates.length > 0) {
            throw Error(
                `The dependencies ${duplicates.join(',')} are duplicated in the file ${fileName}`
            );
        }
    }

    private checkForBlankDependencies(dependencies: string[], fileName: string) {
        if (dependencies.indexOf('') > -1) {
            throw Error(
                `In the file ${fileName} are empty dependencies or there is a ","
                 at the end of the dependencies declaration`
            );
        }
    }

    private setupMetadataDependencies(dependencies: string[], fileName: string) {
        this.checkForBlankDependencies(dependencies, fileName);
        this.removeRequireAndExports(dependencies);
        this.checkForDuplicatedDependencies(dependencies, fileName);
    }

    private extractAMDMetadata(content: string, fileName: string): AmdMetadata[] {
        const result = [];
        let match;
        do {
            match = this.DefineAndDependenciesRegex.exec(content);
            let dependencies = [];
            let amdModuleName;
            if (match) {
                amdModuleName = match[2] && match[2].replace(/['"]*/g, '');
                dependencies =
                    (match[6] &&
                        match[6]
                            .replace(/['"]+/g, '')
                            .split(',')
                            .map(a => a.trim())) ||
                    [];
                this.setupMetadataDependencies(dependencies, fileName);
                result.push({
                    amdModuleName,
                    dependencies
                });
            }
        } while (match);
        return result;
    }
    /**
     * Set Amd module name on anonymous modules definition
     * */
    private setAmdModuleName(content: string, newModuleName: string): string {
        return content.replace(
            this.DefineAndDependenciesRegex,
            (original, a, moduleName, b, c, dependencies) => {
                if (!moduleName) {
                    return dependencies
                        ? `define("${newModuleName}", ${dependencies}`
                        : `define("${newModuleName}", `;
                }
                return original;
            }
        );
    }

    private checkDuplicatesAmdModules(amdModuleName: string): void {
        if (this.amdModulesName.indexOf(amdModuleName) !== -1) {
            throw Error(`The amd module ${amdModuleName} is duplicated`);
        }
        this.amdModulesName.push(amdModuleName);
    }

    public addFile(file) {
        const normalizedPath = path.resolve(file.path);
        const fileName = path.basename(normalizedPath);
        let content = file.contents.toString();
        if (this.config.shim) {
            content = this.applyShim(content, fileName);
        }
        const pathKeyValue = this.getPathKeyValue(fileName);
        const amdMetadata = this.extractAMDMetadata(content, fileName);
        let mainAmdModuleName: string = amdMetadata[0] ? amdMetadata[0].amdModuleName : undefined;
        const mainAmdDependencies: string[] = amdMetadata[0] ? amdMetadata[0].dependencies : [];
        if (pathKeyValue && !mainAmdModuleName) {
            mainAmdModuleName = pathKeyValue;
        }
        if (mainAmdModuleName) {
            content = this.setAmdModuleName(content, mainAmdModuleName);
            this.checkDuplicatesAmdModules(mainAmdModuleName);
            this.files.set(fileName, {
                content,
                amdModuleName: mainAmdModuleName,
                dependencies: mainAmdDependencies
            });
        } else {
            this.files.set(fileName, { content, dependencies: mainAmdDependencies });
        }
    }

    public initFilesByAMDModules(): void {
        this.files.forEach((value: FileData, key: string) => {
            if (value.amdModuleName) {
                this.filesWithRelationsByAmdModuleName.set(value.amdModuleName, {
                    content: value.content,
                    fileName: key,
                    dependencies: value.dependencies
                });
            }
        });
    }

    private static throwCircularDependencyError(
        parents: string[],
        entryPoint: string,
        throwCyclingDependenciesError: boolean = false
    ): void {
        console.log(`Circular dependency: ${parents.join(' -> ')} -> ${entryPoint}`);
        if (throwCyclingDependenciesError) {
            throw Error(`Circular dependency: ${parents.join(' -> ')} -> ${entryPoint}`);
        }
    }

    private mergeBranches(branch1: string[], branch2: string[]): string[] {
        let branch1Index = 0;
        let branch2Index = 0;
        let mergeResult = [];
        const mergedElements = {};
        while (branch1Index < branch1.length || branch2Index < branch2.length) {
            if (branch1Index < branch1.length) {
                const searchedElementIndex = branch2.indexOf(branch1[branch1Index], branch2Index);
                if (searchedElementIndex >= 0) {
                    while (branch2Index <= searchedElementIndex) {
                        if (!mergedElements[branch2[branch2Index]]) {
                            mergeResult.push(branch2[branch2Index]);
                            mergedElements[branch2[branch2Index]] = true;
                        }
                        branch2Index++;
                    }
                } else if (!mergedElements[branch1[branch1Index]]) {
                    mergeResult.push(branch1[branch1Index]);
                    mergedElements[branch1[branch1Index]] = true;
                }
                branch1Index++;
            } else {
                // add all elements in  branch2 that were not included yet
                mergeResult = mergeResult.concat(branch2.slice(branch2Index));
                branch2Index = branch2.length;
            }
        }
        return mergeResult;
    }

    private overrideMapDependency(
        entryPointMap: EntryPointConfigurationMap | {},
        dependency: string,
        amdModuleName: string = ''
    ) {
        let resultDependency = dependency;
        const mapKeys = Object.keys(entryPointMap);
        if (mapKeys.length > 0) {
            let index = 0;
            while (resultDependency === dependency && index < mapKeys.length) {
                if (
                    (mapKeys[index] === '*' || mapKeys[index] === amdModuleName) &&
                    entryPointMap[mapKeys[index]][dependency]
                ) {
                    resultDependency = entryPointMap[mapKeys[index]][dependency];
                }
                index++;
            }
        }
        return resultDependency;
    }

    private skipDependency(dependency, dependencies: string[] = []) {
        let skipDependency = false;
        if (dependencies.length > 0) {
            const regexPattern = new RegExp(dependencies.join('|'));
            skipDependency = regexPattern.test(dependency);
        }
        return skipDependency;
    }

    /**
     * @return Amd dependencies in order,
     * the rightest dependency is the most independent one
     */
    private getAmdDependenciesInOrder(
        entryPoint: string,
        parents: string[],
        cachedMapDependencies: {},
        entryPointMap: EntryPointConfigurationMap | {},
        skipDependencies: string[] = [],
        throwCyclingDependenciesError: boolean = false
    ): string[] {
        let orderedDependencies: string[] = [];
        if (parents.indexOf(entryPoint) > -1) {
            this.errorCyclingCount++;
            if (this.errorCyclingCount === 1) {
                Bundler.throwCircularDependencyError(
                    parents,
                    entryPoint,
                    throwCyclingDependenciesError
                );
            }
        } else if (!this.skipDependency(entryPoint, skipDependencies)) {
            const entryPointModule = this.filesWithRelationsByAmdModuleName.get(entryPoint);
            if (!entryPointModule) {
                throw Error(
                    `Missing module. Check that module ${entryPoint} is an existing module`
                );
            }
            parents.push(entryPoint);
            entryPointModule.dependencies.forEach((dependency: string) => {
                let transitiveDependencies = cachedMapDependencies[dependency];
                if (!transitiveDependencies) {
                    transitiveDependencies = this.getAmdDependenciesInOrder(
                        this.overrideMapDependency(entryPointMap, dependency, entryPoint),
                        parents,
                        cachedMapDependencies,
                        entryPointMap,
                        skipDependencies,
                        throwCyclingDependenciesError
                    );
                    cachedMapDependencies[dependency] = transitiveDependencies;
                }
                if (orderedDependencies.length) {
                    // merge two sets of ordered dependencies
                    orderedDependencies = this.mergeBranches(
                        orderedDependencies,
                        transitiveDependencies
                    );
                } else {
                    orderedDependencies = transitiveDependencies;
                }
            });
            parents.pop();
            orderedDependencies.push(entryPoint);
        }
        return orderedDependencies;
    }
    public getFilesInOrder(entryPoint: EntryPoint): Set<string> {
        const orderedFiles: Set<string> = new Set<string>();
        const cachedMapDependencies = {};
        entryPoint.names.forEach((entryPointName: string) => {
            const file = this.files.get(entryPointName);
            if (file) {
                const parent = [];
                if (file.amdModuleName) {
                    parent.push(file.amdModuleName);
                }
                const entryPointMap =
                    (entryPoint && entryPoint.config && entryPoint.config.map) || {};
                file.dependencies.forEach(dependency => {
                    const amdDependencies = this.getAmdDependenciesInOrder(
                        this.overrideMapDependency(entryPointMap, dependency, file.amdModuleName),
                        parent,
                        cachedMapDependencies,
                        entryPointMap,
                        entryPoint.skipDependencies,
                        entryPoint.throwCyclingError
                    );
                    for (let i = 0; i < amdDependencies.length; i++) {
                        const amdDependency = amdDependencies[i];
                        orderedFiles.add(
                            this.filesWithRelationsByAmdModuleName.get(amdDependency).fileName
                        );
                    }
                });
                orderedFiles.add(entryPointName);
            } else {
                throw Error(
                    `Entry point ${entryPointName} does not exist(file extension required)`
                );
            }
        });
        return orderedFiles;
    }

    private addConfigContent(
        configMap: EntryPointConfigurationMap | undefined,
        content: string
    ): string {
        let addComma = false;
        if (this.config.shim || this.config.paths || (configMap && configMap.map)) {
            let requireConfig = `require.config({`;
            if (configMap && configMap.map) {
                addComma = true;
                requireConfig += `"map":${JSON.stringify(configMap.map)}`;
            }
            if (this.config.paths) {
                requireConfig += `${addComma ? ',' : ''}"paths":${JSON.stringify(
                    this.config.paths
                )}`;
                addComma = true;
            }
            if (this.config.shim) {
                requireConfig += `${addComma ? ',' : ''}"shim":${JSON.stringify(this.config.shim)}`;
            }
            requireConfig += `});`;
            content += requireConfig;
        }

        return content;
    }

    private initFilesResult(entryOutputs: Output[]): Map<string, string> {
        const filesResult = new Map<string, string>();
        entryOutputs.forEach((output: Output) => {
            filesResult.set(output.name, '');
        });
        return filesResult;
    }

    private addConfigToFiles(entryPoint: EntryPoint, filesResult: Map<string, string>) {
        entryPoint.output.forEach((output: Output) => {
            if (output.includeConfig) {
                filesResult.set(
                    output.name,
                    this.addConfigContent(entryPoint.config, filesResult.get(output.name))
                );
            }
        });
    }

    private findRightOutputIndex(entryPointOutput: Output[], fileName: string): number {
        let start = 0;
        let rightOutputIndex = -1;
        while (start < entryPointOutput.length && rightOutputIndex === -1) {
            const output = entryPointOutput[start];
            const regexPattern = new RegExp(output.patterns.join('|'));
            const dependencyMatchRegex = regexPattern.test(fileName);
            if (dependencyMatchRegex) {
                rightOutputIndex = start;
            }
            start++;
        }
        return rightOutputIndex;
    }

    private buildManifestFile(
        manifestMap: Map<string, string[]>,
        amdModuleName: string,
        skipManifestDependencies: string[] = [],
        manifestName = ''
    ) {
        if (manifestName) {
            const manifest = manifestMap.get(manifestName) || [];
            if (
                manifest.indexOf(amdModuleName) === -1 &&
                !this.skipDependency(amdModuleName, skipManifestDependencies)
            ) {
                manifestMap.set(manifestName, [...manifest, amdModuleName]);
            }
        }
    }

    private buildOutputFile(
        entryPoint: EntryPoint,
        filesInOrder: Set<string>,
        filesResult: Map<string, string>
    ): void {
        const manifestMap: Map<string, string[]> = new Map<string, string[]>();
        filesInOrder.forEach((fileName: string) => {
            const outputIndex = this.findRightOutputIndex(entryPoint.output, fileName);
            if (outputIndex > -1) {
                const output = entryPoint.output[outputIndex];
                const file = this.files.get(fileName);
                filesResult.set(output.name, filesResult.get(output.name) + file.content);
                if (file.amdModuleName) {
                    this.buildManifestFile(
                        manifestMap,
                        file.amdModuleName,
                        entryPoint.skipManifestDependencies,
                        output.exportManifest
                    );
                }
            }
        });
        manifestMap.forEach((manifestContent: string[], fileName: string) => {
            filesResult.set(fileName, JSON.stringify(manifestContent));
        });
        this.addConfigToFiles(entryPoint, filesResult);
    }

    public buildFiles(entryPoint: EntryPoint, filesInOrder: Set<string>) {
        const filesResult: Map<string, string> = this.initFilesResult(entryPoint.output);
        this.buildOutputFile(entryPoint, filesInOrder, filesResult);
        return filesResult;
    }
}

function checkConfigEntryPoint(config: BundlerConfiguration) {
    const errorConfigPrefix = 'Wrong value in the config:';
    if (Object.keys(config).indexOf('entryPoints') === -1) {
        throw Error(`${errorConfigPrefix} The entryPoints attribute is required`);
    }
    config.entryPoints.forEach((entryPoint: EntryPoint) => {
        if (!entryPoint.output) {
            throw Error(
                `${errorConfigPrefix} The output attribute is required in the entry point array`
            );
        }
        if (!entryPoint.names) {
            throw Error(
                `${errorConfigPrefix} The attribute names is required in the entryPoints object`
            );
        }
        entryPoint.output.forEach((output: Output) => {
            if (!output.order) {
                throw Error(`${errorConfigPrefix} The order attribute is required`);
            }
            if (!output.name) {
                throw Error(
                    `${errorConfigPrefix} The attribute name is required in the output object`
                );
            }
            if (!output.patterns) {
                output.patterns = ['.js$'];
            }
        });
    });
}

export function bundler(config: BundlerConfiguration) {
    checkConfigEntryPoint(config);
    const bundlerProcess = new Bundler(config);
    return through2(
        { objectMode: true },
        function(file, type, cb) {
            try {
                bundlerProcess.addFile(file);
                cb();
            } catch (error) {
                cb(error.message.toString());
            }
        },
        function(cb) {
            bundlerProcess.initFilesByAMDModules();
            try {
                config.entryPoints.forEach((entryPoint: EntryPoint) => {
                    const filesInOrder = bundlerProcess.getFilesInOrder(entryPoint);
                    const files = bundlerProcess.buildFiles(entryPoint, filesInOrder);
                    files.forEach((value: string, key: string) => {
                        const file = new VinylFile({
                            path: key,
                            contents: Buffer.from(value)
                        });
                        this.push(file);
                    });
                });
                if (bundlerProcess.errorCyclingCount > 0) {
                    console.log(
                        `There has been ${bundlerProcess.errorCyclingCount} cycling errors`
                    );
                }
                cb();
            } catch (error) {
                cb(error.message.toString());
            }
        }
    );
}
