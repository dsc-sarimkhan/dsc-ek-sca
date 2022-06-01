/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.ThemeCustomizerPreview"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />
/// <reference path="./CMS.d.ts" />
import * as _ from 'underscore';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';

import Url = require('../../../Commons/Utilities/JavaScript/Url');
import Sass = require('../../../Commons/Utilities/JavaScript/Sass');

const EDITABLE_REGEX = /\/\*\s+<<\s+var:([^\s]+)\s+\*\/\s+([^\/]+)\s+\/\*\s+>>\s+\*\//gi;
const ESCAPED_INTERPOLATION_REGEX = /\\#{/gi;
const VARIABLE_REGEX = /\$[A-Za-z0-9_-]*|([_a-zA-Z][A-Za-z0-9_-]*)\s*\(/g;
const FUNCTION_WHITELIST = [
    'rgb',
    'rgba',
    'red',
    'green',
    'blue',
    'mix',
    'hsl',
    'hsla',
    'hue',
    'saturation',
    'lightness',
    'adjust-hue',
    'lighten',
    'darken',
    'saturate',
    'desaturate',
    'grayscale',
    'complement',
    'invert',
    'alpha',
    'rgba',
    'opacify',
    'transparentize',
    'adjust-color',
    'scale-color',
    'change-color',
    'ie-hex-str',
    'unquote',
    'quote',
    'str-length',
    'str-insert',
    'str-index',
    'str-slice',
    'to-upper-case',
    'to-lower-case',
    'percentage',
    'round',
    'ceil',
    'floor',
    'abs',
    'min',
    'max',
    'random',
    'length',
    'nth',
    'set-nth',
    'join',
    'append',
    'zip',
    'index',
    'list-separator',
    'is-bracketed',
    'map-get',
    'map-merge',
    'map-remove',
    'map-keys',
    'map-values',
    'map-has-key',
    'keywords',
    'selector-nest',
    'selector-append',
    'selector-extend',
    'selector-replace',
    'selector-unify',
    'is-superselector',
    'simple-selectors',
    'selector-parse',
    'feature-exists',
    'variable-exists',
    'global-variable-exists',
    'function-exists',
    'mixin-exists',
    'content-exists',
    'inspect',
    'type-of',
    'unit',
    'unit-less',
    'comprable',
    'call',
    'get-function',
    'if',
    'unique-id',
    'fade_in',
    'expression',
    'calc'
];
const URL_REGEX = /url\(([^)]+)(\))/g;
const METADATA_REGEX = /\/\* values \*\/[\s]*\/\*(([^*]|\*(?!\/))*)\*\/[\s]*\/\* groups \*\/[\s]*\/\*(([^*]|\*(?!\/))*)\*\/([\s]*\/\* warnings \*\/[\s]*\/\*(([^*]|\*(?!\/))*)\*\/)?/;
interface Variable {
    expr: string;
    derived: Variable[];
    name: string;
    editable: true;
    parents?: { [variableName: string]: true };
    nonCompilable?: true;
    defaultValue?: string;
}
interface VariablesValue {
    [variableName: string]: string;
}
export class CMSAdapterImplThemeCustomizerPreview {
    private applicationName: string;

    private CMS: any;

    private sassCompiler: any;

    private previewCSS: string;

    private originalPreviewCSS: string;

    private originalChangedVariables;

    private completeSetOfVariablesInOrder: Variable[];

    private readonly variablesByName: { [varName: string]: Variable } = {};

    private toProcess: any;

    private isCompiling: boolean;

    private stylesheetHref: string;

    private reloadCSSRequestId: any;

    private compileEndpoint: any;

    private saveEndpoint: any;

    private skinsEndpoint: any;

    public constructor(application, CMS) {
        this.applicationName = application.name;
        Sass.setWorkerUrl(Utils.getAbsoluteUrl('javascript/sass.worker.js'));
        this.CMS = CMS;
        this.sassCompiler = null;
        this.previewCSS = '';
        this.originalPreviewCSS = '';
        this.originalChangedVariables = {};
        // Ordered list, if element A depends of B, A will appear first
        this.completeSetOfVariablesInOrder = [];
        this.toProcess = null;
        this.isCompiling = false;
        // URL of the css with the metadata
        this.stylesheetHref = '';
        // variables used to synchronize CSS reloading
        this.reloadCSSRequestId = null;
        this.listenForCMS();
    }

    public listenForCMS() {
        if (SC.ENVIRONMENT.isExtended && SC.ENVIRONMENT.embEndpointUrl) {
            this.CMS.on('theme:config:get', (promise: CMSPromise) => {
                this.loadPreviewEnvironment(
                    CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise)
                );
            });
            this.CMS.on('theme:styles:overrideCss', (promise: CMSPromise, changedVariables) => {
                if (_.size(changedVariables) > 0) {
                    this.toProcess = {
                        promise: CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise),
                        changedVariables: changedVariables
                    };
                    this.previewChangedVariables();
                } else {
                    // Restore theme defaults
                    this.restoreThemeDefaults(
                        CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise)
                    );
                }
            });
            this.CMS.on('theme:styles:save', (promise: CMSPromise, changedVariables, skinId) => {
                this.saveThemeStyles(
                    CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise),
                    changedVariables,
                    skinId
                );
            });
            this.CMS.on('theme:styles:revertCss', (promise: CMSPromise) => {
                // cancel button click
                this.themeRevertCss(CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise));
            });
            this.CMS.on('theme:skins:add', (promise: CMSPromise, skin) => {
                this.addSkin(CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise), skin);
            });
            this.CMS.on('theme:skins:remove', (promise: CMSPromise, skinId) => {
                this.removeSkin(
                    CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise),
                    skinId
                );
            });
            this.CMS.on('theme:skins:edit', (promise: CMSPromise, skin) => {
                this.editSkin(CMSAdapterImplThemeCustomizerPreview.wrapForLogging(promise), skin);
            });
        }
    }

    /**
     * By calling this method the sass.js compiler is going to be loaded as well as
     * the css+metadata for the current application(shopping, my account, checkout)
     * This method should be triggered when SMT admin is opened
     **/
    private loadPreviewEnvironment(promise) {
        // Prevent to get the css url when edition is canceled
        !this.stylesheetHref && this.setStylesheetHref();
        let loadedCSS;
        const self = this;
        // Load and add the css with metadata to the DOM
        const variablesCalculatedValuePromise = jQuery
            .ajax({
                url: self.stylesheetHref,
                dataType: 'text'
            })
            .then(function(css) {
                loadedCSS = css;
                const variablesMetadata = self.extractVariablesMetadata(css);
                self.completeSetOfVariablesInOrder = self.identifyNonCompilableVariables(
                    self.getDependenciesInOrder(variablesMetadata.values)
                );
                self.setVariablesByName();
                self.setVariablesParent(self.completeSetOfVariablesInOrder);
                return variablesMetadata;
            });
        const themeDataPromise = jQuery
            .ajax(SC.ENVIRONMENT.embEndpointUrl)
            .then(function(themeData) {
                self.saveEndpoint = themeData.saveEndpoint;
                self.compileEndpoint = themeData.compileEndpoint;
                self.skinsEndpoint = themeData.skinsEndpoint;
                return themeData;
            });
        jQuery
            .when(variablesCalculatedValuePromise, themeDataPromise)
            .then(function(variablesMetadata, themeData) {
                const areEditableVariables = _.findWhere(self.completeSetOfVariablesInOrder, {
                    editable: true
                });
                if (areEditableVariables) {
                    self.applyLoadedCSS(loadedCSS, themeData.editedSettings)
                        .then(function(calculatedVariablesValue) {
                            // Used if theme edition is canceled
                            self.originalPreviewCSS = self.previewCSS;
                            self.originalChangedVariables = themeData.editedSettings;
                            // Remove defaults css from the dom, all stylesheets in the header are
                            // going to be removed
                            self.removeDefaultStyles();
                            const themeSettings: ThemeSettings = {
                                skins: themeData.skins,
                                userSkins: themeData.userSkins,
                                formData: {
                                    values: variablesMetadata.values,
                                    structure: variablesMetadata.groups,
                                    warnings: variablesMetadata.warnings
                                },
                                editedSettings: themeData.editedSettings,
                                currentSettings: calculatedVariablesValue
                            };
                            const activeSkin: Skin = _.find(
                                themeData.userSkins,
                                (skin: any) => skin.current === true
                            );
                            if (activeSkin) {
                                themeSettings.skinId = activeSkin.id;
                            }
                            promise.resolve(themeSettings);
                        })
                        .fail(function(error) {
                            promise.reject({
                                errors:
                                    'Error loading or processing metadata. Details: ' +
                                    JSON.stringify(error)
                            });
                        });
                } else {
                    // if there are not editable variables, the theme is not editable
                    promise.resolve({});
                }
            })
            .fail(function(error) {
                promise.reject({
                    errors:
                        'Error loading or processing metadata. Details: ' + JSON.stringify(error)
                });
            });
    }

    private setVariablesParent(variables: Variable[], parent?: string): void {
        variables.forEach(variable => {
            if (parent) {
                if (!this.variablesByName[variable.name].parents) {
                    this.variablesByName[variable.name].parents = {};
                }
                this.variablesByName[variable.name].parents[parent] = true;
            }
            if (variable.derived) {
                this.setVariablesParent(variable.derived, variable.name);
            }
        });
    }

    private setVariablesByName(): void {
        for (let i = this.completeSetOfVariablesInOrder.length - 1; i >= 0; i--) {
            const variable = this.completeSetOfVariablesInOrder[i];
            this.variablesByName[variable.name] = variable;
        }
    }

    private themeRevertCss(promise): void {
        this.discardReload();
        this.applyLoadedCSS(this.originalPreviewCSS, this.originalChangedVariables)
            .then(promise.resolve)
            .fail(function(error) {
                promise.reject({
                    errors: 'Error reverting the changes. Details: ' + JSON.stringify(error)
                });
            });
    }

    private previewChangedVariables(): void {
        if (this.toProcess !== null && !this.isCompiling) {
            this.isCompiling = true;
            const self = this;
            const { promise } = this.toProcess;
            const { changedVariables } = this.toProcess;
            this.toProcess = null;
            // The back-end compilation needs to be planned before starting fron-end
            // compilation because of concurrency management
            this.themeStylesReloadValues(changedVariables);
            const { reloadCSSRequestId } = this;
            this.getVariablesCalculatedValue(changedVariables, true)
                .then(function(variablesComputedValue) {
                    if (self.toProcess === null) {
                        const newCSS = self.replaceVariablesValueOnPreviewCSS(
                            variablesComputedValue
                        );
                        self.applyPreviewCSS(newCSS);
                        promise.resolve(self.getEditableVariablesOnly(variablesComputedValue));
                    }
                })
                .fail(function(error) {
                    if (self.toProcess === null) {
                        // if the front-end compilation fails, the back-end compilation
                        // should be canceled
                        if (reloadCSSRequestId === self.reloadCSSRequestId) {
                            self.discardReload();
                        }
                        promise.reject({
                            errors: 'Error previewing. Details: ' + JSON.stringify(error)
                        });
                    }
                })
                .always(function() {
                    self.isCompiling = false;
                    self.previewChangedVariables();
                });
        }
    }

    private saveThemeStyles(promise: CMSPromise, changedVariables, skinId?: number) {
        const self = this;
        const callbacks = {
            then: function(variablesValue) {
                promise.resolve(variablesValue);
                // Used if theme edition is canceled
                self.originalPreviewCSS = self.previewCSS;
                self.originalChangedVariables = changedVariables;
            },
            fail: function(error) {
                promise.reject({
                    errors: 'Error saving the theme. Details: ' + JSON.stringify(error)
                });
            }
        };
        self.reloadCSS(changedVariables, true, callbacks, skinId);
    }

    private addSkin(promise: CMSPromise, skin) {
        const endpoint = Utils.deepCopy(this.skinsEndpoint);
        endpoint.data.operation = 'create';
        endpoint.data.name = skin.name;
        endpoint.data.values = JSON.stringify(skin.values);
        jQuery
            .ajax(endpoint)
            .then(response => {
                if (response.header && response.header.status.code !== 'SUCCESS') {
                    promise.reject({
                        errors:
                            'Error loading or processing metadata. Details: ' +
                            JSON.stringify(response)
                    });
                } else {
                    promise.resolve(response.result.skin_id);
                }
            })
            .fail(error => {
                promise.reject({
                    errors:
                        'Error loading or processing metadata. Details: ' + JSON.stringify(error)
                });
            });
    }

    private restoreThemeDefaults(promise: CMSPromise) {
        const self = this;
        const callbacks = {
            then: function(variablesValue) {
                promise.resolve(variablesValue);
            },
            fail: function(error) {
                promise.reject({
                    errors: 'Error restoring theme defaults. Details:' + JSON.stringify(error)
                });
            }
        };
        self.reloadCSS({}, false, callbacks);
    }

    private reloadCSS(changedVariables, save, callbacks, skinId?: number) {
        const self = this;
        const endPoint = save ? this.saveEndpoint : this.compileEndpoint;
        if (save && skinId) {
            endPoint.data.skin_id = skinId;
        }
        // Build endpoint url
        endPoint.data.skin = JSON.stringify(changedVariables);
        endPoint.data.app = this.applicationName.toLowerCase();
        // discard reloadCSS or planned reloadCSS
        self.discardReload();
        const { reloadCSSRequestId } = self;

        function doIfIsLastReloadExec(fn) {
            reloadCSSRequestId === self.reloadCSSRequestId && fn();
        }

        const promise = jQuery.ajax(endPoint).then(function(response) {
            if (response.header && response.header.status.code !== 'SUCCESS') {
                if (callbacks && callbacks.fail) {
                    doIfIsLastReloadExec(function() {
                        callbacks.fail(response);
                    });
                }
            } else {
                doIfIsLastReloadExec(function() {
                    self.applyLoadedCSS(response.css, changedVariables).then(function(
                        variablesValue
                    ) {
                        if (callbacks && callbacks.then) {
                            callbacks.then(variablesValue);
                        }
                    });
                });
            }
        });
        if (callbacks) {
            callbacks.fail &&
            promise.fail(function(xhr, textStatus, errorThrown) {
                doIfIsLastReloadExec(function() {
                    callbacks.fail(textStatus + '--' + errorThrown);
                });
            });
            callbacks.always &&
            promise.always(function(result) {
                doIfIsLastReloadExec(function() {
                    callbacks.always(result);
                });
            });
        }
    }

    /**
     * After previewing the changed variables a server side compilation is performed,
     * this method triggers that compilation after a wait time. If there is a pending
     * server side compilation, it will be canceled an rescheduled a new one
     */
    private themeStylesReloadValues(changedVariables): void {
        const self = this;
        // discard reloadCSS or planned reloadCSS
        this.discardReload();
        self.reloadCSSRequestId = setTimeout(function() {
            const callbacks = {
                then: function(variablesValue) {
                    self.CMS.trigger('theme:styles:reloadValues', {
                        errors: null,
                        values: variablesValue
                    });
                },
                fail: function(error) {
                    self.CMS.trigger('theme:styles:reloadValues', {
                        errors:
                            'Error reloading values from server. Details: ' + JSON.stringify(error)
                    });
                }
            };
            self.reloadCSS(changedVariables, false, callbacks);
        }, 7000);
    }

    private fixRelativeURLs(css: string, baseURL: string): string {
        const output = css.replace(URL_REGEX, function(_matched, relative) {
            // remove spaces, single and double quotes
            relative = relative.trim();
            if (relative[0] === "'" || relative[0] === '"') {
                relative = relative.substr(1, relative.length - 2);
            }
            return (
                'url(' +
                new Url()
                    .parse(relative)
                    .resolve(baseURL)
                    .toString() +
                ')'
            );
        });
        return output;
    }

    private getEditableVariablesOnly(variablesCalculatedValue): VariablesValue {
        // Filter the variables to return only the editable ones
        const editableVariables: VariablesValue = {};
        _.each(this.completeSetOfVariablesInOrder, function(variable: Variable) {
            if (variable.editable && variablesCalculatedValue[variable.name] !== undefined) {
                editableVariables[variable.name] = variablesCalculatedValue[variable.name];
            }
        });
        return editableVariables;
    }

    private applyPreviewCSS(css: string): void {
        const tagId = 'nsCSSWithMetadata';
        let styleTag = document.getElementById(tagId);
        if (!styleTag) {
            styleTag = window.document.createElement('style');
            styleTag.id = tagId;
            window.document.body.appendChild(styleTag);
        }
        styleTag.innerHTML = css;
    }

    private applyLoadedCSS(css, changedVariables) {
        const self = this;
        this.previewCSS = this.fixRelativeURLs(css, this.stylesheetHref);
        this.applyPreviewCSS(this.previewCSS);
        const variablesValuesFromCSS = this.extractVariablesValuesFromCSS(this.previewCSS);
        this.setVariablesDefaultValue(variablesValuesFromCSS);
        return this.getVariablesCalculatedValue(changedVariables).then(function(
            calculatedVariablesValue
        ) {
            return self.getEditableVariablesOnly(calculatedVariablesValue);
        });
    }

    private extractVariablesMetadata(css: string) {
        const matches = css.match(METADATA_REGEX);
        return {
            values: JSON.parse(this.unescapeNumberSign(matches[1])).values,
            groups: JSON.parse(matches[3]).groups,
            warnings: matches[5]
        };
    }

    private getAffectedVariables(editedVariables: VariablesValue): Variable[] {
        const affectedVariables = [];
        const derivedVars = {};

        function addToDerivedVars(derivedVar: Variable) {
            derivedVars[derivedVar.name] = true;
        }

        for (let i = this.completeSetOfVariablesInOrder.length - 1; i >= 0; i--) {
            const variableName = this.completeSetOfVariablesInOrder[i].name;
            // Avoid to add duplicated variables in "affectedVariables" array
            if (
                editedVariables[variableName] !== undefined ||
                derivedVars[variableName] !== undefined
            ) {
                affectedVariables.push(this.completeSetOfVariablesInOrder[i]);
                _.each(this.completeSetOfVariablesInOrder[i].derived, addToDerivedVars);
            }
        }
        return affectedVariables.reverse();
    }

    private buildDummySass(affectedVariables: Variable[], editedVariables: VariablesValue): string {
        const self = this;
        const wrapFunction =
            '@function quotes-verbatim($value) {\n' +
            '  @if (type-of($value) == "string") {\n' +
            "    // SASS doesn't have str-is-quoted, and quoted and unquoted strings compare\n" +
            '    // equal. I noticed that list expressions give away whether a string is quoted,\n' +
            "    // though, so here's how we can return a string with explicit quotes.\n" +
            '    $list-expr: "#{inspect(($value, ""))}";\n' +
            '    @return str-slice($list-expr, 0, str-length($list-expr) - 4);\n' +
            '  }\n' +
            '  @else {\n' +
            '    @return $value;\n' +
            '  }\n' +
            '}\n' +
            '  \n' +
            '@function wrap($name, $value) {\n' +
            '  @if (outputstyle() != "COMPRESSED") {\n' +
            '    @if ($value) {\n' +
            '      @return unquote("/* << var:" + $name + " */ " + quotes-verbatim($value) + " /* >> */");\n' +
            '    }\n' +
            '    @return null;\n' +
            '  }\n' +
            '  @return $value;\n' +
            '};';
        let variablesDeclaration = '';
        let dummyClassBody = '';
        for (let i = affectedVariables.length - 1; i >= 0; i--) {
            const variableName = affectedVariables[i].name;
            var variableValue;
            if (editedVariables[variableName] !== undefined) {
                variableValue = editedVariables[variableName];
            } else if (affectedVariables[i].nonCompilable) {
                // use the value in the css
                variableValue = affectedVariables[i].defaultValue;
            } else {
                variableValue = affectedVariables[i].expr;
            }
            if (variableValue !== undefined) {
                variablesDeclaration += self.buildSASSVariableDeclaration(
                    variableName,
                    variableValue
                );
                dummyClassBody += self.buildSASSVariableUsageStatement(variableName);
            }
        }
        return (
            wrapFunction + variablesDeclaration + '\n' + '.dummyClass {\n' + dummyClassBody + '\n}'
        );
    }

    private buildDummyCSS(sassStr) {
        const self = this;
        const promise = jQuery.Deferred();
        let retried = false;

        function compilerHandler(compilerOutput) {
            if (compilerOutput.status === 0) {
                promise.resolve(compilerOutput.text);
            } else if (!retried) {
                retried = true;
                self.getSassCompiler(true).compile(sassStr, compilerHandler);
            } else {
                promise.reject(
                    compilerOutput.message
                        ? compilerOutput.message
                        : 'Unexpected error compiling front-end SASS variables'
                );
            }
        }

        self.getSassCompiler().compile(sassStr, compilerHandler);
        return promise;
    }

    private extractVariablesValuesFromCSS(css: string): VariablesValue {
        let result;
        const variables: VariablesValue = {};
        while ((result = EDITABLE_REGEX.exec(css)) !== null) {
            const name = result[1];
            variables[name] = result[2];
        }
        return variables;
    }

    /**
     * @method replaceVariablesValueOnPreviewCSS
     * @param {variableName: String} editedVariables
     * @returns {string} copy the the attribute "previewCSS" with the supplied values changed
     */
    private replaceVariablesValueOnPreviewCSS(editedVariables) {
        const output = this.previewCSS.replace(EDITABLE_REGEX, function(matched, name) {
            const editedValue = editedVariables[name] !== undefined;
            if (!editedValue) {
                return matched;
            }
            return '/* << var:' + name + ' */ ' + editedVariables[name] + ' /* >> */';
        });
        return output;
    }

    private addMissingDependenciesOfAffectedVariables(affectedVariables: Variable[]): Variable[] {
        const variablesToCompile = [];
        const includedVariables = {};
        const addDependencies = (variable: Variable) => {
            if (!includedVariables[variable.name]) {
                if (variable.parents) {
                    Object.keys(variable.parents).forEach((parentName: string) => {
                        const parent: Variable = this.variablesByName[parentName];
                        addDependencies(parent);
                    });
                }
                variablesToCompile.push(variable);
                includedVariables[variable.name] = true;
            }
        };
        for (let i = affectedVariables.length - 1; i >= 0; i--) {
            addDependencies(affectedVariables[i]);
        }
        return variablesToCompile.reverse();
    }

    /**
     *    @method getVariablesCalculatedValue For each variable in the metadata compute his value
     *    using the supplied changes"
     *    @param changedVariables {Object} Map with all edited variables
     *    @return Promise The promise is resolved with an object with each variables and his
     *    calculated value
     * */
    private getVariablesCalculatedValue(changedVariables, affectedsOnly?: boolean) {
        const self = this;
        const variablesToCompile: Variable[] = affectedsOnly
            ? this.addMissingDependenciesOfAffectedVariables(
                  this.getAffectedVariables(changedVariables)
              )
            : this.completeSetOfVariablesInOrder;
        const sass = this.buildDummySass(variablesToCompile, changedVariables || {});
        return this.buildDummyCSS(sass).then(function(css) {
            return self.extractVariablesValuesFromCSS(css);
        });
    }

    /**
     * @method getDependenciesInOrder The method should be called only once, when the environment
     * is initialised
     * @param Array<Object> siblings SASS variables metadata
     * @return Array<Object> Ordered list, if element A depends of B, A will appear first
     * */
    private getDependenciesInOrder(siblings: Variable[]): Variable[] {
        let orderedDependencies = [];
        function find(startIndex, array, elementName) {
            for (let i = startIndex; i < array.length; i++) {
                if (array[i].name === elementName) {
                    return i;
                }
            }
            return -1; // not found
        }

        function mergeBranches(branch1: Variable[], branch2: Variable[]): Variable[] {
            let branch1Index = 0;
            let branch2Index = 0;
            let mergeResult = [];
            const mergedElements = {};

            while (branch1Index < branch1.length || branch2Index < branch2.length) {
                if (branch1Index < branch1.length) {
                    const searchedElementIndex = find(
                        branch2Index,
                        branch2,
                        branch1[branch1Index].name
                    );
                    if (searchedElementIndex >= 0) {
                        while (branch2Index <= searchedElementIndex) {
                            if (!mergedElements[branch2[branch2Index].name]) {
                                mergeResult.push(branch2[branch2Index]);
                                mergedElements[branch2[branch2Index].name] = true;
                            }
                            branch2Index++;
                        }
                    } else if (!mergedElements[orderedDependencies[branch1Index].name]) {
                        mergeResult.push(orderedDependencies[branch1Index]);
                        mergedElements[orderedDependencies[branch1Index].name] = true;
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

        const self = this;
        _.each(siblings, function(sibling: Variable) {
            if (sibling.derived && sibling.derived.length) {
                const branchOrderedDependencies = self.getDependenciesInOrder(sibling.derived);
                if (orderedDependencies.length) {
                    // merge two sets of ordered dependencies
                    orderedDependencies = mergeBranches(
                        orderedDependencies,
                        branchOrderedDependencies
                    );
                } else {
                    orderedDependencies = branchOrderedDependencies;
                }
            }
        });
        return mergeBranches(orderedDependencies, siblings);
    }

    private buildSASSVariableDeclaration(name: string, value: string) {
        return name + ':' + value + ';';
    }

    private buildSASSVariableUsageStatement(name: string) {
        const cssPropertyName = name.substring(1);
        return '\t' + cssPropertyName + ": wrap('" + name + "', " + name + ');';
    }

    private getSassCompiler(cleanUp: boolean = false) {
        if (!this.sassCompiler) {
            this.sassCompiler = new Sass();
        } else if (cleanUp) {
            this.sassCompiler.destroy();
            this.sassCompiler = new Sass();
        }
        return this.sassCompiler;
    }

    private identifyNonCompilableVariables(variables: Variable[]): Variable[] {
        const availableVariables = {};

        function setAsNotCompilable(variable: Variable) {
            variable.nonCompilable = true;
            _.each(variable.derived, function(derived: Variable) {
                setAsNotCompilable(derived);
            });
        }

        function findInFunctionsWhiteList(func) {
            return _.find(FUNCTION_WHITELIST, function(validFunc) {
                return validFunc === func;
            });
        }

        for (let i = variables.length - 1; i >= 0; i--) {
            const variable = variables[i];
            /* The $overrides variable should not be part of metadata, is used to apply
             * new variables values during backend compilation, pre-processor is adding
             * it so need's to be removed during frontend compilation*/
            if (variable.name === '$overrides') {
                setAsNotCompilable(variable);
            } else if (!variable.nonCompilable) {
                // if has not been labeled as not compilable yet, check the expression
                // parse expression to extract variables and functions
                const parsed = variable.expr.match(VARIABLE_REGEX);
                if (parsed) {
                    for (let j = 0; j < parsed.length; j++) {
                        let member = parsed[j];
                        if (member[0] !== '$') {
                            // if is a function must exist in the white list
                            member = member.substring(0, member.indexOf('('));
                            const isValidFunc = findInFunctionsWhiteList(member);
                            if (!isValidFunc) {
                                setAsNotCompilable(variable);
                            }
                        } else {
                            // if is a variable must exist in "availableVariables"
                            if (!availableVariables[member]) {
                                setAsNotCompilable(variable);
                            }
                        }
                    }
                }
                if (!variable.nonCompilable) {
                    // set the variable as existing and compilable
                    availableVariables[variables[i].name] = true;
                }
            }
        }
        return variables;
    }

    private unescapeNumberSign(str: string): string {
        return str.replace(ESCAPED_INTERPOLATION_REGEX, '#{');
    }

    private setVariablesDefaultValue(variablesDefaultValue) {
        _.each(this.completeSetOfVariablesInOrder, function(variable: Variable) {
            variable.defaultValue = variablesDefaultValue[variable.name];
        });
    }

    private setStylesheetHref() {
        const stylesheets = jQuery('link[rel="stylesheet"]', window.document.head);
        // Build the path to the css with the metadata
        // Get a non IE url
        let stylesheetHref: any = _.find(stylesheets.get(), function(linkDomElement) {
            if (!(<any>linkDomElement).href.match(/((_\d+){2}\.css(\?.*)*)$/)) {
                return true;
            }
            return false;
        });
        // Get the url of the production css without the extension
        stylesheetHref = stylesheetHref.href.match(/(.*)(\.css(\?.*)*)$/)[1];
        this.stylesheetHref =
            stylesheetHref.substring(0, stylesheetHref.lastIndexOf('/') + 1) +
            'smt_' +
            stylesheetHref.substring(stylesheetHref.lastIndexOf('/') + 1) +
            '.css?t=' +
            new Date().getTime();
    }

    private removeDefaultStyles(): void {
        const stylesheets = jQuery('link[rel="stylesheet"]', window.document.head);
        stylesheets.remove();
    }

    private discardReload(): void {
        // discard reloadCSS or planned reloadCSS
        clearTimeout(this.reloadCSSRequestId);
        this.reloadCSSRequestId = _.uniqueId('id_');
    }

    private removeSkin(promise: CMSPromise, skinId: number): void {
        const endpoint = Utils.deepCopy(this.skinsEndpoint);
        endpoint.data.operation = 'delete';
        endpoint.data.id = skinId;

        jQuery
            .ajax(endpoint)
            .then(response => {
                if (response.header && response.header.status.code !== 'SUCCESS') {
                    promise.reject({
                        errors:
                            'Error loading or processing metadata. Details: ' +
                            JSON.stringify(response)
                    });
                } else {
                    promise.resolve();
                }
            })
            .fail(error => {
                promise.reject({
                    errors:
                        'Error loading or processing metadata. Details: ' + JSON.stringify(error)
                });
            });
    }

    private editSkin(promise: CMSPromise, skin: any): void {
        const endpoint = Utils.deepCopy(this.skinsEndpoint);
        endpoint.data.operation = 'edit';
        endpoint.data.id = skin.id;
        endpoint.data.name = skin.name;
        endpoint.data.values = JSON.stringify(skin.values);

        jQuery
            .ajax(endpoint)
            .then(response => {
                if (response.header && response.header.status.code !== 'SUCCESS') {
                    promise.reject({
                        errors:
                            'Error loading or processing metadata. Details: ' +
                            JSON.stringify(response)
                    });
                } else {
                    promise.resolve();
                }
            })
            .fail(error => {
                promise.reject({
                    errors:
                        'Error loading or processing metadata. Details: ' + JSON.stringify(error)
                });
            });
    }

    private static wrapForLogging(promise: CMSPromise): CMSPromise {
        return {
            resolve(...args): void {
                promise.resolve(...args);
            },
            reject(error): void {
                promise.reject(error);
                console.log('Theme customizer error: ', error);
            }
        };
    }
}
