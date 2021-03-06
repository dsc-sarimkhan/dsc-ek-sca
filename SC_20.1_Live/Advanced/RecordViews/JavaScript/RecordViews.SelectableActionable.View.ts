/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="RecordViews.SelectableActionable.View"/>

import * as _ from 'underscore';
import * as recordviews_selectable_actionable_tpl from 'recordviews_selectable_actionable.tpl';

import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import RecordViewsView = require('./RecordViews.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

// @class RecordViews.SelectableActionable.View @extend RecordViews.View
const RecordViewsSelectableActionableView: any = RecordViewsView.extend({
    // @property {Function} template
    template: recordviews_selectable_actionable_tpl,

    // @method initialize
    // @param {RecordViews.SelectableActionable.View.Initialize} options
    // @return {Void}
    initialize: function() {
        RecordViewsView.prototype.initialize.apply(this, arguments);
    },

    // @property {Object} childViews Override the base property by adding a default Action.View composite View
    childViews: {
        'Action.View': function() {
            const action_options = _.extend(
                {
                    model: this.model
                },
                this.options.actionOptions || {}
            );
            const view = this.options.actionView;

            return new view(action_options);
        }
    },

    // @method getContext @return {RecordViews.SelectableActionable.View.Context}
    getContext: function() {
        // @class RecordViews.SelectableActionable.View.Context
        return {
            // @property {RecordViews.SelectableActionable.View.Initialize.Model} model
            model: this.model,
            // @property {String} id
            id: this.model.id,

            // @property {Boolean} isChecked
            isChecked: !!this.model.get('check'),
            // @property {Boolean} isActive
            isActive: !!this.model.get('active'),
            // @property {Boolean} isChecked
            checkboxIsHidden: _.isUndefined(this.options.checkboxIsHidden)
                ? false
                : !!this.options.checkboxIsHidden,

            // @property {String} actionType
            actionType: this.model.get('actionType') || '',
            // @property {Boolean} isNavigable
            isNavigable: !!(this.options.navigable || this.model.get('navigable')),

            // @property {String} url
            url: this.model.get('url'),
            // @property {String} title
            title: this.model.get('title'),

            // @property {Array<RecordViews.View.Column>} columns
            columns: this.normalizeColumns()
        };
    }
});

export = RecordViewsSelectableActionableView;

// @class RecordViews.SelectableActionable.View.Initialize
// @property {RecordViews.SelectableActionable.View.Initialize.Model} model
// @property {Object} actionOptions
// @property {Backbone.View} actionView
// @property {Boolean} navigable This value will takes precedence over the value of the model

// @class RecordViews.SelectableActionable.View.Initialize.Model @extends Backbone.Model
// @property {String} id
// @property {Boolean} isChecked
// @property {Boolean} active
// @property {String?} actionType Default value is ''
// @property {String} title
// @property {String} url
// @property {Boolean} navigable
// @property {Array<RecordViews.View.Column>} columns
