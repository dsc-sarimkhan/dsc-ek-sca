/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/ui/dialog'], function (dialog) {
    function isToday(date) {
        var value;
        var today = new Date();
        if (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()) {
            value = 'today';
        } else if (date.getTime() > today.getTime()) {
            value = "greater"
        } else {
            value = "less"
        }
        return value;
    }

    function dateCompare(startdate, enddate) {
        var startDate = new Date(startdate);
        var endDate = new Date(enddate);
        if (startDate.getTime() <= endDate.getTime()) {
            return true;
        } else {
            return false;
        }
    }
    ////////////////////Function to check Running Promotion////////////
    function checkPromotion(context) {

        var currentRecord = context.currentRecord;
        var startDate = currentRecord.getValue({
            fieldId: 'custitem_promo_startdate'
        });
        var endDate = currentRecord.getValue({
            fieldId: 'custitem_promo_enddate'
        })
        if (startDate) {
            startDate = new Date(startDate);
            if (isToday(startDate) == 'today' || isToday(startDate) == 'less') {

                if (endDate) {
                    endDate = new Date(endDate);
                    if (isToday(endDate) == 'today' || isToday(endDate) == 'greater') {
                        return true
                     } else {
                        return false
                     }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    ////////Page Init/////////
    function pageInit(context) {
        var currentRecord = context.currentRecord;
        var startDate = currentRecord.getValue({
            fieldId: 'custitem_promo_startdate'
        });

        if (!startDate) {
            var field = currentRecord.getField({
                fieldId: 'custitem_discount_saleprice'
            });
            field.isDisabled = true;
        }
        var endDate = currentRecord.getValue({
            fieldId: 'custitem_promo_enddate'
        })
        if (endDate && endDate != '') {
            var startDate = currentRecord.getValue({
                fieldId: 'custitem_promo_startdate'
            });
            if (!dateCompare(startDate, endDate)) {
                currentRecord.setValue({
                    fieldId: 'custitem_promo_enddate',
                    value: ''
                })
            }
        }
    }

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var fieldname = context.fieldId;

        ////////Field Change for Online Price Change////////
        if (fieldname == 'price') {
            var linecountprice = currentRecord.getLineCount({
                sublistId: 'price1'
            });
            var onlinePrice = currentRecord.getMatrixSublistValue({
                sublistId: 'price1',
                fieldId: 'price',
                column: 0,
                line: linecountprice - 1
            });
            var discountPrice = currentRecord.getValue({
                fieldId: 'custitem_discount_saleprice'
            });
            if (onlinePrice != discountPrice && discountPrice) {
                if (checkPromotion(context)) {
                    dialog.alert({
                        title: "Alert",
                        message: "Promotion is currently active on this item. If you want to change Online Price kindly change it's DISCOUNTED SALE PRICE"
                    });
                    currentRecord.selectLine({
                        sublistId: 'price1',
                        line: linecountprice - 1
                    });
                    currentRecord.setCurrentMatrixSublistValue({
                        sublistId: 'price1',
                        fieldId: 'price',
                        column: 0,
                        value: discountPrice,
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    });
                }
            }
        }
        ////////Field Change for Promotion Start Date////////
        if (fieldname == 'custitem_promo_startdate') {

            var startDate = currentRecord.getValue({
                fieldId: 'custitem_promo_startdate'
            });

            if (startDate && startDate != '') {

                startDate = new Date(startDate);
                if (isToday(startDate) == 'today' || isToday(startDate) == 'greater') {
                    var discountPriceField = currentRecord.getField({
                        fieldId: 'custitem_discount_saleprice'
                    });
                    discountPriceField.isDisabled = false;
                    var promoEndDate = currentRecord.getField({
                        fieldId: 'custitem_promo_enddate'
                    });
                    promoEndDate.isDisabled = false;
                    if (isToday(startDate) == 'today') {

                        var linecountprice = currentRecord.getLineCount({
                            sublistId: 'price1'
                        });
                        var onlinePrice = currentRecord.getMatrixSublistValue({
                            sublistId: 'price1',
                            fieldId: 'price',
                            column: 0,
                            line: linecountprice - 1
                        });
                        var tempOnlinePrice = currentRecord.getValue({
                            fieldId: 'custitem_temp_onlineprice'
                        })
                        if (!tempOnlinePrice) {
                            currentRecord.setValue({
                                fieldId: 'custitem_temp_onlineprice',
                                value: onlinePrice
                            })
                        }
                        var discountPrice = currentRecord.getValue({
                            fieldId: 'custitem_discount_saleprice'
                        });
                        if (discountPrice && discountPrice != '') {
                            currentRecord.selectLine({
                                sublistId: 'price1',
                                line: linecountprice - 1
                            });
                            currentRecord.setCurrentMatrixSublistValue({
                                sublistId: 'price1',
                                fieldId: 'price',
                                column: 0,
                                value: discountPrice,
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            });
                        }
                    } else {
                        var previousOnlinePrice = currentRecord.getValue({
                            fieldId: 'custitem_temp_onlineprice'
                        });

                        if (previousOnlinePrice) {
                            var linecountprice = currentRecord.getLineCount({
                                sublistId: 'price1'
                            });
                            currentRecord.selectLine({
                                sublistId: 'price1',
                                line: linecountprice - 1
                            });
                            currentRecord.setCurrentMatrixSublistValue({
                                sublistId: 'price1',
                                fieldId: 'price',
                                column: 0,
                                value: previousOnlinePrice,
                                ignoreFieldChange: true,
                                forceSyncSourcing: true
                            });
                        }



                        dialog.alert({
                            title: 'Info',
                            message: 'Your Promotion Will be applied on PROMOTION START DATE :' + startDate
                        });
                    }

                } else {
                    dialog.alert({
                        title: 'ERROR',
                        message: 'You cannot enter previous date in PROMOTION START DATE field'
                    });
                    currentRecord.setValue({
                        fieldId: 'custitem_promo_startdate',
                        value: ''
                    });
                }
            } else {
                var discountPrice = currentRecord.getField({
                    fieldId: 'custitem_discount_saleprice'
                });
                discountPrice.isDisabled = true;
                var promoEndDate = currentRecord.getField({
                    fieldId: 'custitem_promo_enddate'
                });
                promoEndDate.isDisabled = true;
                currentRecord.setValue({
                    fieldId: 'custitem_promo_enddate',
                    value: ''
                });
                var previousOnlinePrice = currentRecord.getValue({
                    fieldId: 'custitem_temp_onlineprice'
                });
                if (previousOnlinePrice) {
                    var linecountprice = currentRecord.getLineCount({
                        sublistId: 'price1'
                    });
                    currentRecord.selectLine({
                        sublistId: 'price1',
                        line: linecountprice - 1
                    });
                    currentRecord.setCurrentMatrixSublistValue({
                        sublistId: 'price1',
                        fieldId: 'price',
                        column: 0,
                        value: previousOnlinePrice,
                        ignoreFieldChange: true,
                        forceSyncSourcing: true
                    });
                    currentRecord.setValue({
                        fieldId: 'custitem_temp_onlineprice',
                        value: ''
                    });
                }
            }

        }


        ////////Field Change for Discount Price////////
        if (fieldname == 'custitem_discount_saleprice') {
            var startDate = currentRecord.getValue({
                fieldId: 'custitem_promo_startdate'
            });
            var endDate = currentRecord.getValue({
                fieldId: 'custitem_promo_enddate'
            });
            endDate = new Date(endDate);
            startDate = new Date(startDate);
            if (isToday(startDate) == 'today' || isToday(startDate) == 'less') {
                var discountPrice = currentRecord.getValue({
                    fieldId: 'custitem_discount_saleprice'
                });
                if (discountPrice && discountPrice != '') {
                    var linecountprice = currentRecord.getLineCount({
                        sublistId: 'price1'
                    });
                    var onlinePrice = currentRecord.getMatrixSublistValue({
                        sublistId: 'price1',
                        fieldId: 'price',
                        column: 0,
                        line: linecountprice - 1
                    });
                    var tempOnlinePrice = currentRecord.getValue({
                        fieldId: 'custitem_temp_onlineprice'
                    })
                    if (!tempOnlinePrice) {
                        currentRecord.setValue({
                            fieldId: 'custitem_temp_onlineprice',
                            value: onlinePrice
                        })
                    }
                    if (endDate && isToday(endDate) == 'less') {
                        return;
                    } else {
                        currentRecord.selectLine({
                            sublistId: 'price1',
                            line: linecountprice - 1
                        });
                        currentRecord.setCurrentMatrixSublistValue({
                            sublistId: 'price1',
                            fieldId: 'price',
                            column: 0,
                            value: discountPrice,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                    }
                } else {

                    var previousOnlinePrice = currentRecord.getValue({
                        fieldId: 'custitem_temp_onlineprice'
                    });

                    if (previousOnlinePrice) {
                        var linecountprice = currentRecord.getLineCount({
                            sublistId: 'price1'
                        });
                        currentRecord.selectLine({
                            sublistId: 'price1',
                            line: linecountprice - 1
                        });
                        currentRecord.setCurrentMatrixSublistValue({
                            sublistId: 'price1',
                            fieldId: 'price',
                            column: 0,
                            value: previousOnlinePrice,
                            ignoreFieldChange: true,
                            forceSyncSourcing: true
                        });
                    }
                }
            }
        }


        ////////Field Change for End Date////////
        if (fieldname == 'custitem_promo_enddate') {
            var endDate = currentRecord.getValue({
                fieldId: 'custitem_promo_enddate'
            })
            if (endDate && endDate != '') {
                var startDate = currentRecord.getValue({
                    fieldId: 'custitem_promo_startdate'
                });
                if (!dateCompare(startDate, endDate)) {
                    dialog.alert({
                        title: 'ERROR',
                        message: 'End Date Cannot be less than Start Date'
                    });
                    currentRecord.setValue({
                        fieldId: 'custitem_promo_enddate',
                        value: ''
                    })
                }

            }
        }

    }
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    }
});