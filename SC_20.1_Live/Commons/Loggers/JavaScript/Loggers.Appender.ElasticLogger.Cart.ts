/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.ElasticLogger.Cart"/>

import * as _ from 'underscore';
import { Loggers } from './Loggers';

import ComponentContainer = require('../../../Commons/SC/JavaScript/SC.ComponentContainer');

export = {
    mountToApp() {
        const cart = ComponentContainer.getComponent('Cart');
        const logger = Loggers.getLogger();
        let freeItemsBeforeAddLine = [];
        let freeItemsBeforeRemoveLine = [];
        let freeItemsBeforeAddPromotion = [];
        let freeItemsBeforeRemovePromotion = [];
        let submitLines = [];

        cart.on('beforeAddLine', () => {
            cart.getLines().then((lines: any[]) => {
                freeItemsBeforeAddLine = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        freeItemsBeforeAddLine.push(line.item.internalid);
                    }
                });
            });
        });

        cart.on('afterAddLine', () => {
            cart.getLines().then((lines: any[]) => {
                const obj = {
                    componentArea: 'ADDED_TO_CART',
                    freeGiftQty: 0
                };

                const newInternalids = [];

                _.each(lines, (line: any) => {
                    const newLine = _.indexOf(freeItemsBeforeAddLine, line.item.internalid) === -1;

                    if (line.extras.free_gift && newLine && line.item) {
                        newInternalids.push(line.item.internalid);
                    }
                });

                if (newInternalids.length) {
                    obj.freeGiftQty = newInternalids.length;
                    // Because afterAddLine is triggered many times consecutively, we must refresh the old free items.
                    freeItemsBeforeAddLine = [...freeItemsBeforeAddLine, ...newInternalids];
                    logger.info(obj);
                }
            });
        });

        cart.on('beforeAddPromotion', () => {
            cart.getLines().then((lines: any) => {
                freeItemsBeforeAddPromotion = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        freeItemsBeforeAddPromotion.push(line.item.internalid);
                    }
                });
            });
        });

        cart.on('afterAddPromotion', () => {
            cart.getLines().then((lines: any[]) => {
                const obj = {
                    componentArea: 'ADDED_TO_CART',
                    freeGiftQty: 0
                };

                const newInternalids = [];

                _.each(lines, (line: any) => {
                    const newLine =
                        _.indexOf(freeItemsBeforeAddPromotion, line.item.internalid) === -1;

                    if (line.extras.free_gift && newLine && line.item) {
                        newInternalids.push(line.item.internalid);
                    }
                });

                if (newInternalids.length) {
                    obj.freeGiftQty = newInternalids.length;
                    freeItemsBeforeAddPromotion = [
                        ...freeItemsBeforeAddPromotion,
                        ...newInternalids
                    ];
                    logger.info(obj);
                }
            });
        });

        cart.on('beforeRemovePromotion', () => {
            cart.getLines().then((lines: any) => {
                freeItemsBeforeRemovePromotion = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        freeItemsBeforeRemovePromotion.push(line.item.internalid);
                    }
                });
            });
        });

        cart.on('afterRemovePromotion', () => {
            cart.getLines().then((lines: any[]) => {
                const obj = {
                    componentArea: 'REMOVED_FROM_CART',
                    freeGiftQty: 0
                };

                const internalids = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        internalids.push(line.item.internalid);
                    }
                });

                const removedInternalids = _.difference(
                    freeItemsBeforeRemovePromotion,
                    internalids
                );

                if (removedInternalids.length) {
                    obj.freeGiftQty = removedInternalids.length;
                    freeItemsBeforeRemovePromotion = internalids;
                    logger.info(obj);
                }
            });
        });

        cart.on('beforeRemoveLine', () => {
            cart.getLines().then((lines: any) => {
                freeItemsBeforeRemoveLine = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        freeItemsBeforeRemoveLine.push(line.item.internalid);
                    }
                });
            });
        });

        cart.on('afterRemoveLine', () => {
            cart.getLines().then((lines: any[]) => {
                const obj = {
                    componentArea: 'REMOVED_FROM_CART',
                    freeGiftQty: 0
                };

                const internalids = [];

                _.each(lines, (line: any) => {
                    if (line.extras.free_gift && line.item) {
                        internalids.push(line.item.internalid);
                    }
                });

                const removedInternalids = _.difference(freeItemsBeforeRemoveLine, internalids);

                if (removedInternalids.length) {
                    obj.freeGiftQty = removedInternalids.length;
                    freeItemsBeforeRemoveLine = internalids;
                    logger.info(obj);
                }
            });
        });

        cart.on('beforeSubmit', () => {
            cart.getLines().then((lines: any) => {
                submitLines = lines;
            });
        });

        cart.on('afterSubmit', () => {
            const obj = {
                componentArea: 'PLACED_ORDER',
                freeGiftQty: 0
            };

            _.each(submitLines, (line: any) => {
                if (line.extras.free_gift) {
                    obj.freeGiftQty++;
                }
            });

            logger.info(obj);
        });
    }
};
