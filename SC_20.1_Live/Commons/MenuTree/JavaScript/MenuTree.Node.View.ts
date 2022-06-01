/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MenuTree.Node.View"/>

import * as menu_tree_node_tpl from 'menu_tree_node.tpl';

import BackboneCompositeView = require('../../Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class MenuTree.Node.View @extends Backbone.View
const MenuTreeNodeView: any = BackboneView.extend({
    // @propery {Function} template
    template: menu_tree_node_tpl,

    // @method initialize
    initialize: function(options) {
        this.node = options.model;
        this.level = options.level;
        BackboneCompositeView.add(this);
    },

    // @propery {Object} childViews
    childViews: {
        'MenuItems.Collection': function() {
            return new BackboneCollectionView({
                collection: this.node.get('children'),
                childView: MenuTreeNodeView,
                viewsPerRow: 1,
                childViewOptions: {
                    level: this.level + 1
                }
            });
        }
    },

    // @method getContext @returns MenuTree.Node.View.Context
    getContext: function() {
        // @class MenuTree.Node.View.Context
        return {
            // @propery {Model} node
            node: this.node,
            // @propery {Number} level
            level: this.level
        };
    }
});

export = MenuTreeNodeView;
