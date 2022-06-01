/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

var CLIENT_SCRIPT_PATH = 'SuiteScripts/dsc_cs_zippzy.js';
define(['N/record', 'N/file'],
    function (record, file) {
        function beforeLoad(context) {
            try {
                var rec = context.newRecord;
                var saleRecord = record.load({
                    type: record.Type.SALES_ORDER,
                    id: rec.id,
                    isDynamic: true,
                });

                var checkoutID=saleRecord.getValue('custbody_ek_zipcheckaccid');
                
                if (context.type == "view" && checkoutID) {
                    context.form.clientScriptFileId = getFileId();
                    var obj = {};
                    obj.recordId = saleRecord.id;
                    obj.Zippay_checkoutID=checkoutID;
                    obj.Total_amount=saleRecord.getValue('total');
                    context.form.addButton({
                        id: 'custpage_warranty',
                        label: 'Create ZipPay Charge',
                        functionName: 'createcharge(' + JSON.stringify(obj) + ')'
                    });
                }
            } catch (e) {
                log.error("ERROR IN:: ", e.message);

            }
        }

        function getFileId() {
            try {
                var fileObj = file.load({
                    id: CLIENT_SCRIPT_PATH
                });

                return fileObj.id;

            } catch (e) {
                return e;
            }
        }
        return {
            beforeLoad: beforeLoad
        };
    }
);