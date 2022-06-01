/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="View"/>
import * as Backbone from './backbone/BackboneExtras';

export class View<TEvents extends object = {}> extends Backbone.View<TEvents> {
    public render(): this {
        return this;
    }
}
