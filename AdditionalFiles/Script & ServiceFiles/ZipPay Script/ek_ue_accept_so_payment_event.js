/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 */
var PAYMENT_OPTION_ZIPPAY = "582";
var PAYMENT_OPTION_AFTERPAY = "590";
var PAYMENT_PROCESSING_PROFILE_EWAY_RAPID = "4";
var HANDLING_MODE_RECORD_EXTERNAL_EVENT = "MIMIC";
define(['N/record'], function (record) {
    

    function afterSubmit(context) {
        var title = " afterSubmit() ";
        try {
            var recId = context.newRecord.id;

            var recObj = record.load({
                type: record.Type.SALES_ORDER,
                id: recId,
                // isDynamic: true
            });

            var zipPayCheckoutId = recObj.getValue("custbody_ek_zipcheckaccid");
            var afterPayCheckoutToken = recObj.getValue("custbody_dsc_afterpay_token");
            if (zipPayCheckoutId || afterPayCheckoutToken) {
                if (zipPayCheckoutId) {
                    recObj.setValue('paymentoption', PAYMENT_OPTION_ZIPPAY);
                } else if (afterPayCheckoutToken) {
                    recObj.setValue('paymentoption', PAYMENT_OPTION_AFTERPAY);
                }
                recObj.setValue('paymentprocessingprofile', PAYMENT_PROCESSING_PROFILE_EWAY_RAPID);
                recObj.setValue('handlingmode', HANDLING_MODE_RECORD_EXTERNAL_EVENT);
            }
            var updatedRecId = recObj.save();
            log.debug(title + "updatedRecId", updatedRecId);
        } catch (e) {
            log.error("Error in " + title, e);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});