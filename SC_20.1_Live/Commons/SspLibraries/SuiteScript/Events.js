/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module ssp.libraries

Contains the core utilities and base classes to build high level back-end entity models that then are used by .ss services.

This code is based on SuiteScript and Commerce API.

 * Supports a simple events infrastructure (inspired on Backbone.Events)

 * Supports an Application object that can be used for high level operations like obtaining environment data,
paginated search results

 * Supports console.log, console.err, etc

 * High level utilities for mapping search results, format dates and currencies, records meta information, etc.


@class Events
A module that can be mixed in to *any object* in order to provide it with
custom events. You may bind with `on` or remove with `off` callback functions
to an event; triggering an event fires all callbacks in succession.

	var object = {};
	_.extend(object, Events);
	object.on('expand', function(){ alert('expanded'); });
	object.trigger('expand');

*/
define('Events', ['underscore'], function(_) {
    const { slice } = Array.prototype;
    // Regular expression used to split event strings
    const eventSplitter = /\s+/;

    // Backbone.Events
    // -----------------
    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback functions
    // to an event; trigger`-ing an event fires all callbacks in succession.
    //
    //     var object = {};
    //     _.extend(object, Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    const Events = {
        // @method on Bind one or more space separated events, `events`, to a `callback`
        // function. Passing `"all"` will bind the callback to all events fired.
        // @param {String|Array<String>} events
        // @param {Function} callback
        // @param {Object} context
        // return {Backbone.Events}
        on: function(events, callback, context) {
            let calls;
            let event;
            let node;
            let tail;
            let list;

            if (!callback) {
                return this;
            }

            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            // Create an immutable callback list, allowing traversal during
            // modification.  The tail is an empty object that will always be used
            // as the next node.
            while ((event = events.shift())) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = { tail: tail, next: list ? list.next : node };
            }

            return this;
        },

        // @method off Remove one or many callbacks. If `context` is null, removes all callbacks
        // with that function. If `callback` is null, removes all callbacks for the
        // event. If `events` is null, removes all bound callbacks for all events.
        // @param {String|Array<String>} events
        // @param {Function} callback
        // @param {Object} context
        // @return {Backbone.Events}
        off: function(events, callback, context) {
            let event;
            let calls;
            let node;
            let tail;
            let cb;
            let ctx;

            // No events, or removing *all* events.
            if (!(calls = this._callbacks)) {
                return;
            }

            if (!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }

            // Loop through the listed events and contexts, splicing them out of the
            // linked list of callbacks if appropriate.
            events = events ? events.split(eventSplitter) : _.keys(calls);
            while ((event = events.shift())) {
                node = calls[event];
                delete calls[event];

                if (!node || !(callback || context)) {
                    continue;
                }

                // Create a new list, omitting the indicated callbacks.
                tail = node.tail;
                while ((node = node.next) !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    if ((callback && cb !== callback) || (context && ctx !== context)) {
                        this.on(event, cb, ctx);
                    }
                }
            }

            return this;
        },

        // @param trigger Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        // @param {String|Array<String>} events
        trigger: function(events) {
            let event;
            let node;
            let calls;
            let tail;
            let args;
            let all;
            let rest;
            if (!(calls = this._callbacks)) {
                return this;
            }
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            // For each event, walk through the linked list of callbacks twice,
            // first to trigger the event, then to trigger any `"all"` callbacks.
            while ((event = events.shift())) {
                if ((node = calls[event])) {
                    tail = node.tail;
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, rest);
                    }
                }
                if ((node = all)) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return this;
        }
    };

    // Aliases for backwards compatibility.
    Events.bind = Events.on;
    Events.unbind = Events.off;

    return Events;
});
