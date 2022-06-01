/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="MyAccountMenu"/>
import * as _ from 'underscore';
import { EventEmitter, DefaultEventEmitter } from '../../../Commons/Core/JavaScript/EventEmitter';

interface BasicMenu {
    id: string;
    name: string;
    index: number;
    permissionOperator?: 'AND' | 'OR';
    permission?: string;
}
export interface Entry extends BasicMenu {
    url?: string;
}
export interface SubEntry extends BasicMenu {
    entryId: string;
    url: string;
}

interface MyAccountMenuEvents {
    entriesChanged: () => void;
}

export interface Menu extends Entry {
    children: SubEntry[];
    showChildren: boolean;
}

export class MyAccountMenu {
    private readonly emitter: EventEmitter<MyAccountMenuEvents>;

    private readonly entries: Entry[];

    private readonly subEntries: SubEntry[];

    private static instance: MyAccountMenu;

    private correctUrl(url: string = '') {
        if (url && url[0] !== '/') {
            return '/' + url;
        }

        return url;
    }

    public constructor() {
        this.entries = [];
        this.emitter = new DefaultEventEmitter();
        this.entries = [];
        this.subEntries = [];
    }

    public addEntry(entry: Entry): void {
        if (!_.some(this.entries, elem => elem.id === entry.id)) {
            entry.url = this.correctUrl(entry.url);
            this.entries.push(entry);
            this.getEmitter().emit('entriesChanged');
        }
    }

    public addSubEntry(subEntry: SubEntry) {
        if (!_.some(this.subEntries, elem => elem.id === subEntry.id)) {
            subEntry.url = this.correctUrl(subEntry.url);
            this.subEntries.push(subEntry);
            this.getEmitter().emit('entriesChanged');
        }
    }

    public replaceEntry(entryId: string, newEntry: Entry): void {
        const entryToDelete = _.find(this.entries, entry => entry.id === entryId);
        if (entryToDelete) {
            this.entries.splice(this.entries.indexOf(entryToDelete), 1);
            this.addEntry(newEntry);
            this.getEmitter().emit('entriesChanged');
        }
    }

    public replaceSubEntry(subEntryId: string, newSubEntry: SubEntry) {
        const subEntryToDelete = _.find(this.subEntries, entry => entry.id === subEntryId);
        if (subEntryToDelete) {
            this.subEntries.splice(this.subEntries.indexOf(subEntryToDelete), 1);
            this.addSubEntry(newSubEntry);
            this.getEmitter().emit('entriesChanged');
        }
    }

    private remove(menu: BasicMenu[], id: string): void {
        const toDelete = _.find(menu, entry => entry.id === id);
        if (toDelete) {
            menu.splice(menu.indexOf(toDelete), 1);
            this.getEmitter().emit('entriesChanged');
        }
    }

    public removeEntry(entryId: string) {
        this.remove(this.entries, entryId);
    }

    public removeSubEntry(subEntryId: string) {
        this.remove(this.subEntries, subEntryId);
    }

    public getEmitter() {
        return this.emitter;
    }

    public getEntries(): Menu[] {
        const order = (a, b) => a.index - b.index;
        const entries = this.entries.sort(order);
        const menu: Menu[] = [];
        _.each(entries, (entry: Entry) => {
            const menuEntry = { ...entry, children: [], showChildren: false };
            menuEntry.children = _.filter(
                this.subEntries,
                subEntry => subEntry.entryId === entry.id
            ).sort(order);
            menuEntry.showChildren = menuEntry.url !== '' ? false : menuEntry.children.length > 0;
            menu.push(menuEntry);
        });
        return menu;
    }

    public getMenuIdByUrl(url: string): string {
        const menu = _.find(this.entries, entry => entry.url === url);
        if (menu) {
            return menu.id;
        }
        const subMenu = _.find(this.subEntries, subEntry => subEntry.url === url);
        return subMenu ? subMenu.id : '';
    }

    public static getInstance() {
        this.instance = this.instance || new MyAccountMenu();
        return this.instance;
    }
}
