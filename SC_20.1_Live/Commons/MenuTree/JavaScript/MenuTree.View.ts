/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MenuTree.View"/>

import * as _ from 'underscore';
import * as menu_tree_tpl from 'menu_tree.tpl';
import { Menu, MyAccountMenu } from '../../../Advanced/Header/JavaScript/MyAccountMenu';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneCollectionView = require('../../Backbone.CollectionView/JavaScript/Backbone.CollectionView');
import MenuTreeNodeView = require('./MenuTree.Node.View');
import Singleton = require('../../Main/JavaScript/Singleton');
import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View');

// @class MenuTree.View Implements the tree menu items that is
// present in MyAccount. It's a Singleton. @extends Backbone.View
export = BackboneView.extend(
    {
        // @property {Function} template
        template: menu_tree_tpl,

        events: {
            'click [data-action="expander"]': 'menuClick'
        },

        render: function(...args) {
            this.fixedMenuItems = this.backwardCompatibilitySanitize(
                MyAccountMenu.getInstance().getEntries()
            );
            BackboneView.prototype.render.apply(this, args);
        },

        backwardCompatibilitySanitize: function(menu: Menu[]) {
            const entries = [];
            _.each(menu, entry => {
                const newSubEntries = [];
                _.each(entry.children, subEntry => {
                    const { entryId, ...rest } = subEntry;
                    newSubEntries.push({ ...rest, children: [] });
                });
                entries.push({ ...entry, children: newSubEntries });
            });
            return entries;
        },

        // @method menuClick Note: cant use bootstrap collapse due to the divs
        // introduced by collection view. @param {HTMLEvent} e
        menuClick: function(e, synthetic) {
            const target = jQuery(e.currentTarget);
            const this_expander = target.next('[data-type="menu-tree-node-expander"]');
            const this_expander_is_opened = this_expander.hasClass('in');
            const this_expandable = target.closest('[data-type="menu-tree-node-expandable"]');
            const all_expandables = this.$('[data-type="menu-tree-node-expandable"]');

            all_expandables.removeClass('open');
            this_expandable.addClass('open');

            // if inside a closed expander: close others open this one
            const expanding_expander = this.$(target.data('target'));
            if (!this_expander_is_opened) {
                const open_expanders = this.$('[data-type="menu-tree-node-expander"].in');

                (<any>jQuery.fn).collapse.call(open_expanders, 'hide');
                (<any>jQuery.fn).collapse.call(expanding_expander, 'show');
            }

            if (synthetic === undefined && this_expander_is_opened) {
                (<any>jQuery.fn).collapse.call(expanding_expander, 'hide');
                this_expandable.removeClass('open');
            }
        },

        // @method updateSidebar @param {String} label
        updateSidebar: function(label) {
            this.currentLabel = label || this.currentLabel;

            const target = this.$('[data-id="' + this.currentLabel + '"]');
            const target_expandable = target.closest('[data-type="menu-tree-node-expandable"]');
            const anchors = this.$('[data-id]');

            // remove active for all anchors and add for this one
            anchors.removeClass('active');
            target.addClass('active');

            // triggers click for the correct expander
            target_expandable
                .find('[data-action="expander"]:first')
                .trigger('click', { synthetic: true });

            // edge case for home, should close other expanders
            if (label === 'home') {
                const all_expandables = this.$('[data-type="menu-tree-node-expandable"]');
                const open_expanders = this.$('[data-type="menu-tree-node-expander"].in');

                all_expandables.removeClass('open');
                (<any>jQuery.fn).collapse.call(open_expanders, 'hide');
            }
        },

        // @method updateMenuItemsUI re-render the menu items menu - useful for dynamic menu items
        // that need to re-render when something changes. Each module is responsible of calling
        // this method when appropiate.
        updateMenuItemsUI: function() {
            this.render();
            this.updateSidebar();
        },

        // @method getContext @returns MenuTree.View.Context
        getContext: function() {
            // @class MenuTree.View.Context
            return {
                // @propery {Array} menuItems
                menuItems: this.fixedMenuItems
            };
            // @class MenuTree.View
        },

        childViews: {
            'MenuItems.Collection': function() {
                return new BackboneCollectionView({
                    collection: this.fixedMenuItems,
                    childView: MenuTreeNodeView,
                    viewsPerRow: 1,
                    childViewOptions: {
                        level: 1
                    }
                });
            }
        }
    },
    Singleton
);
