/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var CATEGORY_ID = '7'; //Warranty Registration
var CLIENT_SCRIPT_PATH = 'SuiteScripts/dsc_cs_register_warranty.js';

define(['N/record', 'N/file', 'N/search'],
    function (record, file, search) {
        function beforeLoad(context) {
            var title = 'beforeLoad() :: ';
            try {
                var rec = context.newRecord;
                var custRecord = record.load({
                    type: record.Type.SUPPORT_CASE,
                    id: rec.id,
                    isDynamic: true,
                });
                var categoryid = custRecord.getValue('category');
                if (context.type == "view" && categoryid == CATEGORY_ID) {
                    context.form.clientScriptFileId = getFileId();
                    var obj = {};
                    obj.recordId = custRecord.id;
                    obj.title = custRecord.getValue('title') || "";
                    obj.customerName = obj.title ? obj.title.split(' - ')[1] : "";
                    obj.casenumber = custRecord.getValue('casenumber') || "";
                    obj.itemid = custRecord.getValue('item') || "";
                    obj.msgcheck = custRecord.getValue('incomingmessage') || "";
                    obj.caseemail = custRecord.getValue('email') || "";
                    var incomingMessage = custRecord.getValue('incomingmessage');
                    obj.incomingMessage = incomingMessage ? incomingMessage.split('\n') : "";
                    obj.customerId = getCustomerId(obj.caseemail);
                    context.form.addButton({
                        id: 'custpage_warranty',
                        label: 'Create Warranty Register',
                        functionName: 'registerWarranty(' + JSON.stringify(obj) + ')'
                    });
                    log.debug("test title: :",'testing ok')
                }
            } catch (e) {
                log.error("ERROR IN:: " + title, e.message);

            }
        }

        function getCustomerId(caseEmail) {
            var title = "getCustomerId() :: ";
            try {

                var custSearch = search.create({
                    type: search.Type.CUSTOMER,
                    columns: ['entityid', 'internalid'],
                    filters: ['email', 'is', caseEmail]
                });

                var searchData = custSearch.run();
                var result = searchData.getRange({
                    start: 0,
                    end: 5
                });

                return (result.length > 0) ? result[0].getValue('internalid') : -999;
            } catch (e) {
                log.error("ERROR IN:: " + title, e.message);
                return -999;

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