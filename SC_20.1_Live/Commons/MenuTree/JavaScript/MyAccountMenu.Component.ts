/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccountMenu.Component"/>

import * as _ from 'underscore';
import { Entry, MyAccountMenu, SubEntry } from '../../../Advanced/Header/JavaScript/MyAccountMenu';

import SCBaseComponent = require('../../SC/JavaScript/SC.BaseComponent');
import MenuTreeView = require('./MenuTree.View');

interface MyAccountMenuPermission {
    id: string;
    group: string;
    level: '0' | '1' | '2' | '3' | '4';
}
type PermissionOperator = 'AND' | 'OR';
interface MyAccountMenuGroup {
    id: string;
    name: string;
    url?: string;
    index: number;
    permission: MyAccountMenuPermission[];
    permissionoperator: PermissionOperator;
}
interface MyAccountMenuGroupEntry {
    id: string;
    groupid: string;
    index: number;
    name: string;
    permission: MyAccountMenuPermission[];
    permissionoperator: PermissionOperator;
    url: string;
}

function parsePermission(permissions: MyAccountMenuPermission[]): string {
    let concat = '';
    _.each(permissions, function(item: MyAccountMenuPermission) {
        concat = concat + item.group + '.' + item.id + '.' + item.level + ', ';
    });
    return concat.substring(0, concat.length - 2);
}

export = {
    mountToApp: function(container) {
        container.registerComponent(this.componentGenerator(container));
    },

    componentGenerator: function(container) {
        const menu = MenuTreeView.getInstance();
        const myAccountMenu = MyAccountMenu.getInstance();

        return SCBaseComponent.extend({
            componentName: 'MyAccountMenu',

            application: container,

            addGroup: function(g: MyAccountMenuGroup) {
                const entry: Entry = {
                    id: g.id,
                    index: g.index,
                    name: g.name,
                    permissionOperator: g.permissionoperator,
                    permission: parsePermission(g.permission)
                };
                if (g.url) {
                    entry.url = g.url;
                }
                myAccountMenu.addEntry(entry);
                menu.updateMenuItemsUI();
            },

            addGroupEntry: function(e: MyAccountMenuGroupEntry) {
                const subEntry: SubEntry = {
                    id: e.id,
                    name: e.name,
                    index: e.index,
                    url: e.url,
                    entryId: e.groupid,
                    permission: parsePermission(e.permission),
                    permissionOperator: e.permissionoperator
                };
                myAccountMenu.addSubEntry(subEntry);
                menu.updateMenuItemsUI();
            }
        });
    }
};
