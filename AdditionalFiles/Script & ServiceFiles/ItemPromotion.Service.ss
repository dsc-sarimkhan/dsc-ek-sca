function service(request) {
    'use strict';
    var Application = require('Application');
    try {
        var itemId = request.getParameter('itemId');
        var custId = request.getParameter('custId');
        var promotioncodeSearch = nlapiSearchRecord("promotioncode", null,
            [
                ["item", "anyof", itemId.split(',')],
                "AND",
                [
                    ["startdate", "onorbefore", "today"], "OR", ["startdate", "isempty", ""]
                ],
                "AND",
                [
                    ["enddate", "onorafter", "today"], "OR", ["enddate", "isempty", ""]
                ],
                "AND",
                [
                    ["ispublic", "is", "T"]
                ]
            ],
            [
                new nlobjSearchColumn("name")
            ]
        );
        var promotionArray = [];
        if (custId && custId != 'null') {
            var promotionCustomer = nlapiSearchRecord("promotioncode", null,
                [
                    ["item", "anyof", itemId.split(',')],
                    "AND",
                    [
                        ["startdate", "onorbefore", "today"], "OR", ["startdate", "isempty", ""]
                    ],
                    "AND",
                    [
                        ["enddate", "onorafter", "today"], "OR", ["enddate", "isempty", ""]
                    ],
                    "AND",
                    [
                        ["customers", "anyof", custId]
                    ]
                ],
                [
                    new nlobjSearchColumn("name")
                ]
            );
            if(promotionCustomer){
                promotioncodeSearch = promotioncodeSearch.concat(promotionCustomer)
            }

        }
        if (promotioncodeSearch) {
            if (promotioncodeSearch.length) {
                for (var x = 0; x < promotioncodeSearch.length; x++) {
                    promotionItems = {};
                    var id = promotioncodeSearch[x].id;
                    if (id) {

                        var record = nlapiLoadRecord('promotioncode', id);
                        promotionItems.name = record.getFieldValue('name');
                        promotionItems.promotionform = record.getFieldValue('customform');
                        promotionItems.couponType = record.getFieldValue('usetype');
                        promotionItems.discountType = record.getFieldValue('discounttype');
                        promotionItems.rate = record.getFieldValue('rate');
                        promotionItems.couponCode = record.getFieldValue('code');
                        promotionItems.rate = record.getFieldValue('rate');
                        var linecount = record.getLineItemCount('discounteditems');
                        promotionItems.discountedItems = [];
                        if (linecount) {
                            for (var y = 1; y <= linecount; y++) {
                                promotionItems.discountedItems.push({
                                    discountedItemId: record.getLineItemValue('discounteditems', 'discounteditem', y),
                                    discountedItemName: record.getLineItemValue('discounteditems', 'discounteditem_display', y)
                                })
                            }
                        }
                    }
                    promotionArray.push(promotionItems);
                }
            }
        }


        // nlapiLogExecution('debug','ResultSet :: resultPromotions Array ' , JSON.stringify(promotionArray));
        Application.sendContent(promotionArray);
    } catch (e) {
        Application.sendError(e);
    }
}