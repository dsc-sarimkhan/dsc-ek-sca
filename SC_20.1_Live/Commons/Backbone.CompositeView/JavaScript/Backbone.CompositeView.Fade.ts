/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.CompositeView.Fade"/>
/// <reference path="../../Utilities/JavaScript/UnderscoreExtended.d.ts" />

import * as _ from 'underscore';

import * as jQuery from '../../Core/JavaScript/jQuery';

const BackboneCompositeViewFade: any = {
    /**
     * 3rd (final) step. Destroys the fadefrom view and fades in the new view
     * @param  {Backbone.View} fadeFrom     view instance to fade from
     * @param  {Backbone.View} fadeTo 		view instance to fade to
     */
    _destroyAndFadeIn: function(fadeFrom, fadeTo) {
        fadeFrom && fadeFrom._destroy(true);
        fadeFrom && fadeFrom.$el.addClass('hidden');

        if (!fadeTo) {
            return;
        }
        fadeTo.$el.removeClass('hidden');
        this.trigger('fade.show');

        const self = this;
        window.requestAnimationFrame(function() {
            fadeTo.$el
                .addClass('in')
                .emulateTransitionEnd(500)
                .one(_.result(jQuery.support.transition, 'end') || {}, function() {
                    self.trigger('fade.shown');
                });
        });
    },

    /**
     * 2nd step. Fades out the view removing the class in
     * @param  {Backbone.View} fadeFrom     view instance to fade from
     * @param  {Backbone.View} fadeTo 		view instance to fade to
     */
    _fadeOutViewTo: function(fadeFrom, fadeTo) {
        const self = this;
        fadeFrom.$el
            .removeClass('in')
            .emulateTransitionEnd(500)
            .one(_.result(jQuery.support.transition, 'end') || {}, function() {
                self._destroyAndFadeIn(fadeFrom, fadeTo);
            });
    },

    /**
     * Fade one view to another using fade in classes. The view which
     * is faded out is destroyed, and then the other view is rendered
     * and faded in. The whole process takes 300ms so it's quite fast.
     *
     * @param  {string} fadeFromViewName name of fade out view
     * @param  {string} fadeToViewName   name of fade in view
     */
    fadeViews: function(fadeFromViewName, fadeToViewName) {
        const self = this;
        const fadeFrom = this.getChildViewInstance(fadeFromViewName);
        const fadeTo = this.renderChild(fadeToViewName);

        if (!fadeFrom || !fadeTo) {
            return;
        }

        fadeTo.$el.addClass('fade hidden').removeClass('in');
        fadeFrom.$el.addClass('fade in');
        window.requestAnimationFrame(function() {
            self._fadeOutViewTo(fadeFrom, fadeTo);
        });
    },

    /**
     * Fades in a view
     * @param  {string} childViewName the view which will fade in
     */
    fadeInView: function(childViewName) {
        const fadeTo = this.renderChild(childViewName);

        if (!fadeTo) {
            return;
        }

        fadeTo.$el.addClass('fade hidden').removeClass('in');
        const self = this;
        window.requestAnimationFrame(function() {
            self._destroyAndFadeIn(null, fadeTo);
        });
    },

    /**
     * Fades out a view
     * @param  {string} childViewName the view which will fade out
     */
    fadeOutView: function(childViewName) {
        const self = this;
        const fadeTo = this.getChildViewInstance(childViewName);

        if (!fadeTo) {
            return;
        }

        fadeTo.$el.addClass('fade in').removeClass('hidden');
        window.requestAnimationFrame(function() {
            self._fadeOutViewTo(fadeTo, null);
        });
    },

    add: function(view) {
        _.extend(view, this);
    }
};

export = BackboneCompositeViewFade;
