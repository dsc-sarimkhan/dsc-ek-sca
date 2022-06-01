/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

///<amd-module name="Backbone"/>
// Type definitions for Backbone 1.4
// Project: http://backbonejs.org/
//          https://github.com/jashkenas/backbone
// Definitions by: Boris Yankov <https://github.com/borisyankov>
//                 Natan Vivo <https://github.com/nvivo>
//                 kenjiru <https://github.com/kenjiru>
//                 jjoekoullas <https://github.com/jjoekoullas>
//                 Julian Gonggrijp <https://github.com/jgonggrijp>
//                 Kyle Scully <https://github.com/zieka>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

/// <reference types="jquery" />

export = Backbone;
//export as namespace Backbone; //This line makes Backbone globally available

import * as _ from 'underscore';

declare namespace Backbone {

    import TextStatus = JQuery.Ajax.TextStatus;

    interface AddOptions extends Silenceable {
        at?: number;
        merge?: boolean;
        sort?: boolean;
    }

    interface CollectionSetOptions extends Silenceable {
        add?: boolean;
        remove?: boolean;
        merge?: boolean;
    }

    interface HistoryOptions extends Silenceable {
        pushState?: boolean;
        root?: string;
    }

    interface NavigateOptions {
        trigger?: boolean;
        replace?: boolean;
    }

    interface RouterOptions {
        routes: any;
    }

    interface Silenceable {
        silent?: boolean;
    }

    interface Validable {
        validate?: boolean;
    }

    interface Waitable {
        wait?: boolean;
    }

    interface Parseable {
        parse?: any;
    }

	interface Killeable {
		killerId?: string;
	}

	interface PersistenceOptions {
        url?: string;
        data?: any;
        beforeSend?: (jqxhr: JQueryXHR) => void;
        success?: (modelOrCollection?: any, response?: any, options?: any) => void;
        error?: (modelOrCollection?: any, jqxhr?: JQueryXHR, options?: any) => void;
    }

    interface ModelSetOptions extends Silenceable, Validable {
    }

    export interface ModelFetchOptions extends PersistenceOptions, ModelSetOptions, Parseable, Killeable {
    }

    interface ModelSaveOptions extends Silenceable, Waitable, Validable, Parseable, PersistenceOptions {
        patch?: boolean;
    }

    interface ModelDestroyOptions extends Waitable, PersistenceOptions {
    }

    interface CollectionFetchOptions extends PersistenceOptions, Parseable, CollectionSetOptions {
        reset?: boolean;
        killerId?: string;
    }

    interface ObjectHash {
        [key: string]: any;
    }

    interface RoutesHash {
        [routePattern: string]: string | {(...urlParts: string[]): void};
    }

    /**
     * DOM events (used in the events property of a View)
     */
    interface EventsHash {
        [selector: string]: string | {(eventObject: JQuery.TriggeredEvent): void};
    }

    /**
     * JavaScript events (used in the methods of the Events interface)
     */
/*
    interface EventHandler {
        (...args: any[]): void;
    }
    interface EventMap {
        [event: string]: EventHandler;
    }
    export const Events: Events;
    interface Events<T> extends EventsMixin<T> { }
*/
    /**
     * Helper shorthands for classes that implement the Events interface.
     * Define your class like this:
     *
     * import {
     *     Events,
     *     Events_On,
     *     Events_Off,
     *     Events_Trigger,
     *     Events_Listen,
     *     Events_Stop,
     * } from 'backbone';
     *
     * class YourClass implements Events {
     *     on: Events_On<YourClass>;
     *     off: Events_Off<YourClass>;
     *     trigger: Events_Trigger<YourClass>;
     *     bind: Events_On<YourClass>;
     *     unbind: Events_Off<YourClass>;
     *
     *     once: Events_On<YourClass>;
     *     listenTo: Events_Listen<YourClass>;
     *     listenToOnce: Events_Listen<YourClass>;
     *     stopListening: Events_Stop<YourClass>;
     *
     *     // ... (other methods)
     * }
     *
     * Object.assign(YourClass.prototype, Events);  // can also use _.extend
     *
     * If you are just writing a class type declaration that doesn't already
     * extend some other base class, you can use the EventsMixin instead;
     * see below.
     */
    /*interface Events_On<BaseT> {
        <T extends BaseT>(this: T, eventName: string, callback: EventHandler, context?: any): T;
        <T extends BaseT>(this: T, eventMap: EventMap, context?: any): T;
    }
    interface Events_Off<BaseT> {
        <T extends BaseT>(this: T, eventName?: string, callback?: EventHandler, context?: any): T;
    }
    interface Events_Trigger<BaseT> {
        <T extends BaseT>(this: T, eventName: string, ...args: any[]): T;
    }
    interface Events_Listen<BaseT> {
        <T extends BaseT>(this: T, object: any, events: string, callback: EventHandler): T;
        <T extends BaseT>(this: T, object: any, eventMap: EventMap): T;
    }
    interface Events_Stop<BaseT> {
        <T extends BaseT>(this: T, object?: any, events?: string, callback?: EventHandler): T;
    }*/

    /**
     * Helper to avoid code repetition in type declarations.
     * Backbone.Events cannot be extended, hence a separate abstract
     * class with a different name. Both classes and interfaces can
     * extend from this helper class to reuse the signatures.
     *
     * For class type declarations that already extend another base
     * class, and for actual class definitions, please see the
     * Events_* interfaces above.
     */

    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends ( ...args: any ) => any ? K : never }[keyof T];
    type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
    type EventMap<T extends object & FunctionProperties<T>, TContext> = object & {[E in FunctionPropertyNames<T>]?: Callback<T[E], TContext>};
    type EventsMixinEvents<T> = T extends EventsMixin<infer Events> ? Events extends FunctionProperties<Events> ? Events: never : never;
    type EventName<T> = FunctionPropertyNames<EventsMixinEvents<T>>;
    type Callback<TOriginal extends ( ...args: any ) => any, TContext> = (this: TContext, ...args: Parameters<TOriginal>) => ReturnType<TOriginal>;

    abstract class EventsMixin<T extends FunctionProperties<T>> /*implements Events */{
        public on<E extends FunctionPropertyNames<T>, TContext=this>(eventName: E, callback: Callback<T[E], TContext>, context?: TContext): this;
        public on<TContext=this>(eventMap: EventMap<T, TContext>, context?: TContext): this;
        public off<E extends FunctionPropertyNames<T>, TContext=this>(eventName?: E, callback?: Callback<T[E], TContext>, context?: TContext): this;
        public trigger<E extends FunctionPropertyNames<T>>(eventName: E, ...args: Parameters<T[E]>): this;
        public once<E extends FunctionPropertyNames<T>, TContext=this>(events: E, callback: Callback<T[E], TContext>, context?: TContext): this;
        public once<TContext=this>(eventMap: EventMap<T, TContext>, context?: TContext): this;
        public listenTo<O extends EventsMixin<EventsMixinEvents<O>>, E extends EventName<O>>(object: O, event: E, callback: Callback<EventsMixinEvents<O>[E], this>): this;
        public listenTo<O extends EventsMixin<EventsMixinEvents<O>>, E extends EventName<O>>(object: O, eventMap: EventMap<EventsMixinEvents<O>, this>): this;
        public listenToOnce<O extends EventsMixin<EventsMixinEvents<O>>, E extends EventName<O>>(object: O, event: E, callback: Callback<EventsMixinEvents<O>[E], this>): this;
        public listenToOnce<O extends EventsMixin<EventsMixinEvents<O>>, E extends EventName<O>>(object: O, eventMap: EventMap<EventsMixinEvents<O>, this>): this;
        public stopListening<O extends EventsMixin<EventsMixinEvents<O>>, E extends EventName<O>>(object?: O, event?: E, callback?: Callback<EventsMixinEvents<O>[E], this>): this;
    }
    type SyncMethod = 'create' | 'update' | 'patch' | 'delete' | 'read';
    interface SyncOptions {
        url?: string;
        data?: any;
        attrs?: any;
        emulateJSON?: boolean;
        emulateHTTP?: boolean;
        beforeSend?: (xhr: JQueryXHR)=>void;
        error?: (xhr: JQuery.jqXHR, textStatus: TextStatus, errorThrown: string) => void
    }
    class ModelBase<TEntity, TServiceContract, TEvents> extends EventsMixin<TEvents> {
        protected parse(response: TServiceContract, options?: never): TEntity;
        protected toJSON(): TEntity;
        protected sync(method: SyncMethod, model:this, options: SyncOptions): JQuery.jqXHR<TServiceContract>;
    }
    type PropertiesName<T> = { [K in keyof T]: K }[keyof T];

    abstract class Model<TEntity, TServiceContract = TEntity, TEvents = {}> extends ModelBase<TEntity, TServiceContract, TEvents>{
        //This attributes are made private because are not expected to be used
        //or re-declared on child classes
        protected attributes: TEntity;
        protected changed: Partial<TEntity>;
        protected cidPrefix: string;
        protected cid: string;
        protected collection: unknown;

        protected _changing: boolean;
        protected _previousAttributes : TEntity;
        protected _pending: boolean;
        protected validationError: never;

        /**
         * Default attributes for the model. It can be an object hash or a method returning an object hash.
         * For assigning an object hash, do it like this: this.defaults = <any>{ attribute: value, ... };
         * That works only if you set it in the constructor or the initialize method.
         **/
        public defaults(): Partial<TEntity>;
        protected id: string;

        protected idAttribute: string;
        /**
         * Returns the relative URL where the model's resource would be located on the server.
         * @memberof Model
         */
        public url: () => string;

        protected urlRoot: () => string;

        /**
         * For use with models as ES classes. If you define a preinitialize
         * method, it will be invoked when the Model is first created, before
         * any instantiation logic is run for the Model.
         * @see https://backbonejs.org/#Model-preinitialize
         */
        private preinitialize(attributes?: TEntity, options?: never): void;

        public constructor(attributes?: TEntity, options?: never);
        private initialize(attributes?: TEntity, options?: never): void;

        public fetch(options?: ModelFetchOptions): JQuery.jqXHR<TServiceContract>;

        public get<E extends PropertiesName<TEntity>>(attributeName: E): TEntity[E];

        public set<E extends PropertiesName<TEntity>>(attributeName: E, value: TEntity[E], options?: ModelSetOptions): this;
        public set(obj: Partial<TEntity>, options?: ModelSetOptions): this;

        /**
         * Return an object containing all the attributes that have changed, or
         * false if there are no changed attributes. Useful for determining what
         * parts of a view need to be updated and/or what attributes need to be
         * persisted to the server. Unset attributes will be set to undefined.
         * You can also pass an attributes object to diff against the model,
         * determining if there *would be* a change. */
        public changedAttributes(attributes?: Partial<TEntity>): Partial<TEntity> | false;
        public clear(options?: Silenceable): void;
        public clone(): this;
        public destroy(options?: ModelDestroyOptions): JQuery.jqXHR | false;
        public escape<E extends PropertiesName<TEntity>>(attribute: E): string;
        public has<E extends PropertiesName<TEntity>>(attribute: E): boolean;
        public hasChanged<E extends PropertiesName<TEntity>>(attribute?: E): boolean;

        public isNew(): boolean;

        protected isValid(options?: never): boolean;
        protected previous<E extends PropertiesName<TEntity>>(attribute: E): TEntity[E];
        public previousAttributes(): TEntity;
        public save(attributes?: Partial<TEntity>, options?: ModelSaveOptions): JQuery.jqXHR<TServiceContract>;
        public unset<E extends PropertiesName<TEntity>>(attribute: E, options?: Silenceable): this;
    }

    type ModelEntity<T> = T extends Model<infer Entity> ? Entity : never;
    type ModelEvents<T> = T extends Model<infer Entity, infer ServiceContract, infer Events> ? Events : never;
    type ModelServiceContract<T> = T extends Model<infer Entity, infer ServiceContract> ? ServiceContract : never;

	type Comparable = string | number | null;
	type Keyable = string | number;

    class Collection<
        TModel extends Model<ModelEntity<TModel>, ModelServiceContract<TModel>, ModelEvents<TModel>>,
        TServiceContract = ModelServiceContract<TModel>[],
        TEvents = {}
        > extends ModelBase<ModelEntity<TModel>[], TServiceContract, TEvents> /*implements Events<TEvents>*/ {

        public model: new (...args:any[]) => TModel;
        public models: TModel[];
        public length: number;

        /**
         * For use with collections as ES classes. If you define a preinitialize
         * method, it will be invoked when the Collection is first created and
         * before any instantiation logic is run for the Collection.
         * @see https://backbonejs.org/#Collection-preinitialize
         */
        private preinitialize(models?: TModel[] | Object[], options?: never): void;

        constructor(models?: TModel[] | Object[], options?: never);
        private initialize(models?: TModel[] | Object[], options?: never): void;

        public fetch(options?: CollectionFetchOptions): JQuery.jqXHR<TServiceContract>;

        /**
         * Specify a model attribute name (string) or function that will be used to sort the collection.
         */
        protected comparator: string | { bivarianceHack(element: TModel): number | string }["bivarianceHack"] | { bivarianceHack(compare: TModel, to?: TModel): number }["bivarianceHack"];

        public add(model: ModelEntity<TModel> | TModel, options?: AddOptions): TModel;
        public add(models: (ModelEntity<TModel> | TModel)[], options?: AddOptions): TModel[];
        public at(index: number): TModel;
        /**
         * Get a model from a collection, specified by an id, a cid, or by passing in a model.
         **/
        public get(id: number|string): TModel;
        public has(key: number|string): boolean;
        public clone(): this;
        public create(attributes: ModelEntity<TModel>, options?: ModelSaveOptions): TModel;
        public pluck<K extends keyof TModel>(attribute: string): TModel[K][];
        public push(model: TModel, options?: AddOptions): TModel;
        public pop(options?: Silenceable): TModel;
        public remove(model: number|string, options?: Silenceable): TModel;
        public remove(models: (number|string)[], options?: Silenceable): TModel[];
        public reset(models?: TModel[], options?: Silenceable): TModel[];

        /**
         *
         * The set method performs a "smart" update of the collection with the passed list of models.
         * If a model in the list isn't yet in the collection it will be added; if the model is already in the
         * collection its attributes will be merged; and if the collection contains any models that aren't present
         * in the list, they'll be removed. All of the appropriate "add", "remove", and "change" events are fired as
         * this happens. Returns the touched models in the collection. If you'd like to customize the behavior, you can
         * disable it with options: {add: false}, {remove: false}, or {merge: false}.
         * @param models
         * @param options
         */
        public set(models: TModel[], options?: CollectionSetOptions): TModel[];
        public shift(options?: Silenceable): TModel;
        public sort(options?: Silenceable): Collection<TModel>;
        public unshift(model: TModel, options?: AddOptions): TModel;
        public where(properties: Partial<TModel>): TModel[];
        public findWhere(properties: Partial<TModel>): TModel;
        protected modelId(attrs: Partial<TModel>) : Keyable;

        protected _prepareModel(attributes?: any, options?: any): any;
        protected _removeReference(model: TModel): void;
        protected _onModelEvent(event: string, model: TModel, collection: Collection<TModel>, options: any): void;
        protected _isModel(model: TModel): boolean;

        /**
         * Return a shallow copy of this collection's models, using the same options as native Array#slice.
         */
        public slice(min?: number, max?: number): TModel[];

        // mixins from underscore

        public all(iterator?: _.ListIterator<TModel, boolean>, context?: never): boolean;
        public any(iterator?: _.ListIterator<TModel, boolean>, context?: never): boolean;
        public chain(obj: any): any;
        public collect<TResult>(iterator: _.ListIterator<TModel, TResult>, context?: never): TResult[];
        public contains(value: TModel): boolean;
        public countBy(iterator?: _.ListIterator<TModel, Keyable>): _.Dictionary<number>;
        public countBy(iterator: string): _.Dictionary<number>;
        public detect(iterator: _.ListIterator<TModel, boolean>, context?: never): TModel;
        public difference(others: TModel[]): TModel[];
        public drop(n?: number): TModel[];
        public each(iterator: _.ListIterator<TModel, void>, context?: never): TModel[];
        public every(iterator: _.ListIterator<TModel, boolean>, context?: never): boolean;
        public filter(iterator: _.ListIterator<TModel, boolean>, context?: never): TModel[];
        public find(iterator: _.ListIterator<TModel, boolean>, context?: never): TModel;
        public findIndex(predicate: _.ListIterator<TModel, boolean>, context?: never): number;
        public findLastIndex(predicate: _.ListIterator<TModel, boolean>, context?: never): number;
        public first(): TModel;
        public first(n: number): TModel[];
        public foldl<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: never): TResult;
        public foldr<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: never): TResult;
        public forEach(iterator: _.ListIterator<TModel, void>, context?: never): TModel[];
        public groupBy(iterator: _.ListIterator<TModel, Keyable>, context?: never): _.Dictionary<TModel[]>;
        public groupBy(iterator: string, context?: never): _.Dictionary<TModel[]>;
        public head(): TModel;
        public head(n: number): TModel[];
        public include(value: TModel): boolean;
        public includes(value: TModel): boolean;
        public indexBy<E extends PropertiesName<TModel>>(iterator: _.ListIterator<TModel, E>, context?: never): _.Dictionary<TModel>;
        public indexBy(iterator: string, context?: never): _.Dictionary<TModel>;
        public indexOf(value: TModel, isSorted?: boolean): number;
        public initial(): TModel;
        public initial(n: number): TModel[];
        public inject<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: never): TResult;
        public invoke(methodName: string, ...args: any[]): any;
        public isEmpty(): boolean;
        public last(): TModel;
        public last(n: number): TModel[];
        public lastIndexOf(value: TModel, from?: number): number;
        public map<TResult>(iterator: _.ListIterator<TModel, TResult>, context?: never): TResult[];
        public max(iterator?: _.ListIterator<TModel, Comparable>, context?: never): TModel;
        public min(iterator?: _.ListIterator<TModel, Comparable>, context?: never): TModel;
        public partition(iterator: _.ListIterator<TModel, boolean>): TModel[][];
        public reduce<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: never): TResult;
        public reduceRight<TResult>(iterator: _.MemoIterator<TModel, TResult>, memo?: TResult, context?: never): TResult;
        public reject(iterator: _.ListIterator<TModel, boolean>, context?: never): TModel[];
        public rest(n?: number): TModel[];
        public sample(): TModel;
        public sample(n: number): TModel[];
        public select(iterator: _.ListIterator<TModel, boolean>, context?: never): TModel[];
        public shuffle(): TModel[];
        public size(): number;
        public some(iterator?: _.ListIterator<TModel, boolean>, context?: never): boolean;
        public sortBy<TSort>(iterator?: _.ListIterator<TModel, TSort>, context?: never): TModel[];
        public sortBy(iterator: string, context?: never): TModel[];
        public take(): TModel;
		public tail(n?: number): TModel[];
        public take(n: number): TModel[];
        public toArray(): TModel[];

        /**
         * Sets the url property (or function) on a collection to reference its location on the server.
         *
         * @memberof Collection
         */
        public url: () => string;

        public without(...values: TModel[]): TModel[];
    }

    class Router extends EventsMixin<{}> /*implements Events*/ {

        /**
        * Do not use, prefer TypeScript's extend functionality.
        **/
        public static extend(properties: any, classProperties?: any): any;

        /**
        * Routes hash or a method returning the routes hash that maps URLs with parameters to methods on your Router.
        * For assigning routes as object hash, do it like this: this.routes = <any>{ "route": callback, ... };
        * That works only if you set it in the constructor or the initialize method.
        **/
        routes: RoutesHash | any;

        /**
         * For use with Router as ES classes. If you define a preinitialize method,
         * it will be invoked when the Router is first created, before any
         * instantiation logic is run for the Router.
         * @see https://backbonejs.org/#Router-preinitialize
         */
        preinitialize(options?: RouterOptions): void;

        constructor(options?: RouterOptions);
        initialize(options?: RouterOptions): void;
        route(route: string|RegExp, name: string, callback?: Function): Router;
        navigate(fragment: string, options?: NavigateOptions): Router;
        navigate(fragment: string, trigger?: boolean): Router;

        execute(callback: Function, args: any[], name: string) : void;

        private _bindRoutes(): void;
        private _routeToRegExp(route: string): RegExp;
        private _extractParameters(route: RegExp, fragment: string): string[];
    }

    var history: History;

    class History extends EventsMixin<{}> /*implements Events*/ {

        handlers: any[];
        interval: number;

        start(options?: HistoryOptions): boolean;

        getHash(window?: Window): string;
        getFragment(fragment?: string): string;
        decodeFragment(fragment: string): string;
        getSearch(): string;
        stop(): void;
        route(route: string|RegExp, callback: Function): number;
        checkUrl(e?: any): void;
        getPath(): string;
        matchRoot(): boolean;
        atRoot(): boolean;
        loadUrl(fragmentOverride?: string): boolean;
        navigate(fragment: string, options?: any): boolean;
        static started: boolean;
        options: any;

        private _updateHash(location: Location, fragment: string, replace: boolean): void;
    }

   interface ViewOptions<TModel extends Model<ModelEntity<TModel>, ModelServiceContract<TModel>, ModelEvents<TModel>> = Model<{}>> {
      model?: TModel;
       // TODO: quickfix, this can't be fixed easy. The collection does not need to have the same model as the parent view.
      collection?: Backbone.Collection<any>; //was: Collection<TModel>;
      el?: any;
      events?: EventsHash;
      id?: string;
      className?: string;
      tagName?: string;
      attributes?: {[id: string]: any};
    }
    class View<TEvents> extends EventsMixin<TEvents> /*implements Events<ModelEvents<TModel>> */{

        /**
        * Do not use, prefer TypeScript's extend functionality.
        **/
        private static extend(properties: never, classProperties?: never): never;

        /**
         * For use with views as ES classes. If you define a preinitialize
         * method, it will be invoked when the view is first created, before any
         * instantiation logic is run.
         * @see https://backbonejs.org/#View-preinitialize
         */
        private preinitialize(): void;

        /**
         * Constructor arguments were intentionally removed,
         * adds unneeded darkness
         */
        public constructor();
        private initialize(): void;
        protected template: (json, options?) => string;
        public setElement(element: HTMLElement|JQuery, delegate?: boolean): this;
        protected id: string;
        protected cid: string;
        protected className: string;
        protected tagName: string;
        public el: string | Element | JQuery;
        protected $el: JQuery;
        protected attributes: () => { [k in string]: number | string | boolean };

        public $(selector: JQuery.Selector): JQuery;
        public render(): this;
        public remove(): this;

        public delegateEvents(events?: EventsHash): this;
        public delegate(eventName: string, selector: string, listener: Function): this;
        public undelegateEvents(): this;
        public undelegate(eventName: string, selector?: string, listener?: Function): this;

        private _removeElement(): void;
        private _createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
        private _ensureElement(): void;
        private _configure(options: never): void;
        private _setAttributes(attributes: never): void;
        private _setElement(element: string | Element | JQuery): void;
    }

    // SYNC
    function sync<T>(method: string, model: Model<T> | Collection<Model<T>>, options?: JQueryAjaxSettings): any;
    function ajax(options?: JQueryAjaxSettings): JQueryXHR;
    var emulateHTTP: boolean;
    var emulateJSON: boolean;

    // Utility
    function noConflict(): typeof Backbone;
    var $: JQueryStatic;
}
