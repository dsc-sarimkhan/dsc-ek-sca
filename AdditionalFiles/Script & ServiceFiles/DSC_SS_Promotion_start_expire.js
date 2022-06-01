/**
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/record'], function (search, record) {

    function _execute() {
        var title = '_execute :: ';
        try {

            ////////////////////Start Promotions///////////////////////////////////////
            var startItemIds = searchItems(true);
            if (startItemIds) {
                startItemIds.forEach(function (id) {
                    var rec = record.load({
                        type: record.Type.INVENTORY_ITEM,
                        id: id,
                        isDynamic: true
                    });

                    var discountPrice = rec.getValue({
                        fieldId: 'custitem_discount_saleprice'
                    });
                    if (discountPrice) {
                        var linecountprice = rec.getLineCount({
                            sublistId: 'price1'
                        });
                        rec.selectLine({
                            sublistId: 'price1',
                            line: linecountprice - 1
                        });
                        var onlinePrice = rec.getMatrixSublistValue({
                            sublistId: 'price1',
                            fieldId: 'price',
                            column: 0,
                            line: linecountprice - 1
                        });

                        if (onlinePrice) {
                            var tempOnlinePrice = rec.getValue({
                                fieldId: 'custitem_temp_onlineprice'
                            });
                            if(!tempOnlinePrice && tempOnlinePrice == ''){
                            rec.setValue({
                                fieldId: 'custitem_temp_onlineprice',
                                value: onlinePrice
                            });
                        }
                            rec.setCurrentMatrixSublistValue({
                                sublistId: 'price1',
                                fieldId: 'price',
                                column: 0,
                                value: discountPrice,
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            });
                        }
                    }
                    rec.save();

                    log.debug({
                        title: title + ' END HERE',
                        details: 'END HERE'
                    });
                })

            }

            ////////////////////End/Expire Promotions///////////////////////////////////////
            var itemIds = searchItems(false);
            if (itemIds) {
                itemIds.forEach(function (id) {
                    var itemRec = record.load({
                        type: record.Type.INVENTORY_ITEM,
                        id: id,
                        isDynamic: true
                    });
                    var previousOnlinePrice = itemRec.getValue({
                        fieldId: 'custitem_temp_onlineprice'
                    });

                    if (previousOnlinePrice) {
                        itemRec.setValue({
                            fieldId: 'custitem_promo_startdate',
                            value: ''
                        })
                        itemRec.setValue({
                            fieldId: 'custitem_promo_enddate',
                            value: ''
                        })
                        var linecountprice = itemRec.getLineCount({
                            sublistId: 'price1'
                        });
                        itemRec.selectLine({
                            sublistId: 'price1',
                            line: linecountprice - 1
                        });
                        itemRec.setCurrentMatrixSublistValue({
                            sublistId: 'price1',
                            fieldId: 'price',
                            column: 0,
                            value: previousOnlinePrice,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                        itemRec.setValue({
                            fieldId: 'custitem_temp_onlineprice',
                            value: ''
                        });
                    }
                    itemRec.save();

                })
            }
        } catch (error) {
            log.debug({
                title: title,
                details: error
            })
        }
    }

    function searchItems(startFlag) {
        var title = 'searchItems :: ';
        try {
            var date = new Date();
            if (!startFlag) {
                date = new Date(date.setDate(date.getDate() - 1));
            }
            var month = date.getMonth() + 1;
            var todayDate = date.getUTCDate() + '/' + month + '/' + date.getFullYear();

            log.debug({
                title: title + 'Today',
                details: todayDate
            });
            var itemSearch = search.create({
                type: search.Type.ITEM,
                columns: [
                    search.createColumn({
                        name: 'internalid'
                    }),
                    search.createColumn({
                        name: 'custitem_promo_enddate'
                    })
                ],
                filters: [
                    search.createFilter({
                        name: startFlag ? 'custitem_promo_startdate' : 'custitem_promo_enddate',
                        operator: search.Operator.ON,
                        values: [todayDate]
                    }),
                    search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: ['Assembly', 'InvtPart', 'NonInvtPart']
                    })
                ]
            });


            var results = itemSearch.run().getRange({
                start: 0,
                end: 1000
            });

            log.debug({
                title: title + 'search results',
                details: results
            });

            var itemIdsArr = []
            results.forEach(function (resultsItem) {
                var internalId = resultsItem.getValue('internalid');
                itemIdsArr.push(internalId);
            });

            return itemIdsArr;

        } catch (error) {
            log.debug({
                title: title,
                details: error
            })
        }
    }

    return {
        execute: _execute
    }
})