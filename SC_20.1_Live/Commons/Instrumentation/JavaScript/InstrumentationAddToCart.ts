/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="InstrumentationAddToCart"/>

import * as _ from 'underscore';
import { ItemTrack } from './APMTrackerParameters';

export function itemToTrack(line): ItemTrack {
    const itemTrack: ItemTrack = {
        itemQuantity: 0,
        itemId: 0
    };
    if (line.get('quantity')) {
        itemTrack.itemQuantity = line.get('quantity');
    }
    if (line.get('item')) {
        if (line.get('item').get('internalid')) {
            itemTrack.itemId = line.get('item').get('internalid');
        }
    }
    return itemTrack;
}

export function getAddToCartOperationId(cartModels, currentLine): string[] {
    let addToCartOperationIds: string[] = [];
    _.each(cartModels, (cartLine: any) => {
        if (
            cartLine.get('item') &&
            cartLine.get('item').id &&
            (currentLine.get('item') && currentLine.get('item').id) &&
            cartLine.get('item').id === currentLine.get('item').id
        ) {
            addToCartOperationIds = cartLine.getOperationIds();
        }
    });
    return addToCartOperationIds;
}

export function addOperationIdToCartLine(cartModels, lines): void {
    _.each(lines.models, (line: any) => {
        let lineId = 0;
        if (line.get('item') && line.get('item').id) {
            lineId = line.get('item').id;
        }
        _.each(cartModels, (cartLine: any) => {
            if (
                cartLine.get('item') &&
                cartLine.get('item').id &&
                cartLine.get('item').id === lineId
            ) {
                cartLine.addOperationId(lines.getOperationIds());
            }
        });
    });
}
