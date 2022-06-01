/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.MyAccount.Layout"/>

import * as _ from 'underscore';
import * as myaccount_layout_tpl from 'myaccount_layout.tpl';
import { MyAccountMenu } from '../../Header/JavaScript/MyAccountMenu';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import ApplicationSkeletonLayout = require('../../../Commons/ApplicationSkeleton/JavaScript/ApplicationSkeleton.Layout');
import MenuTreeView = require('../../../Commons/MenuTree/JavaScript/MenuTree.View');
import HeaderView = require('../../Header/JavaScript/Header.View');
import Backbone = require('../../../Commons/Utilities/JavaScript/backbone.custom');

const SCMyAccountLayout: any = ApplicationSkeletonLayout.extend({
    template: myaccount_layout_tpl,

    className: 'layout-container',

    initialize: function(...args) {
        ApplicationSkeletonLayout.prototype.initialize.apply(this, args);

        const self = this;
        const menuTree = MenuTreeView.getInstance();
        this.on('afterAppendView', function(view) {
            const selected_menu = self.getSelectedMenu(view);

            menuTree.updateSidebar(selected_menu);

            self.updateLayoutSB(selected_menu);
        });
    },
    updateLayoutSB: function(selected_menu) {
        this.selectedMenu = selected_menu || this.selectedMenu;

        if (this.application.getConfig('siteSettings.sitetype') === 'STANDARD') {
            if (Utils.isPhoneDevice() && this.selectedMenu === 'home') {
                // show side nav hide content
                this.$('.myaccount-layout-side-nav').removeClass('hide');
                this.$('.myaccount-layout-main').hide();
            } else if (!Utils.isPhoneDevice()) {
                // show side nav and content
                this.$('.myaccount-layout-side-nav').removeClass('hide');
                this.$('.myaccount-layout-main').show();
            } else {
                // hide side nav show content
                this.$('.myaccount-layout-side-nav').addClass('hide');
                this.$('.myaccount-layout-main').show();
            }
        }
    },
    // @method showContent Extends the original show content and adds support
    // to update the sidebar and the breadcrumb
    showContent: function(view, dont_scroll) {
        const promise = ApplicationSkeletonLayout.prototype.showContent.call(
            this,
            view,
            dont_scroll
        );
        const selected_menu = this.getSelectedMenu(view);

        MenuTreeView.getInstance().updateSidebar(selected_menu);

        this.updateLayoutSB(selected_menu);

        return promise;
    },
    getSelectedMenu: function(view) {
        const myAccountMenu = MyAccountMenu.getInstance();
        let selected_menu = '';
        if (view.getSelectedMenu) {
            selected_menu = view.getSelectedMenu();
        } else {
            selected_menu = myAccountMenu.getMenuIdByUrl(Backbone.history.fragment);
        }
        return selected_menu;
    },
    // @property {Array} breadcrumbPrefix
    breadcrumbPrefix: [
        {
            href: '#',
            'data-touchpoint': 'home',
            'data-hashtag': '#',
            text: Utils.translate('Home')
        },
        {
            href: '#',
            'data-touchpoint': 'customercenter',
            'data-hashtag': '#overview',
            text: Utils.translate('My Account')
        }
    ],

    // @propery {Object} childViews
    childViews: _.extend(ApplicationSkeletonLayout.prototype.childViews, {
        Header: function() {
            return new HeaderView({
                application: this.application
            });
        },
        MenuTree: function() {
            this.menuTreeViewInstance = MenuTreeView.getInstance();
            this.menuTreeViewInstance.addChildViewInstances(
                this.menuTreeViewInstance.childViews,
                true
            );
            return this.menuTreeViewInstance;
        }
    }),
    getContext: function() {
        return {
            // @property {Boolean} isStandalone
            isStandalone: !!this.application.isStandalone
        };
    }
});

export = SCMyAccountLayout;
