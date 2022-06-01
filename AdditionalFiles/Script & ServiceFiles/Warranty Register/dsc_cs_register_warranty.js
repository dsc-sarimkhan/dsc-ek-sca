/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
var SUBSIDIARY_ID = 2; //Nexberg Australia
define(['N/record', 'N/ui/message'],
    function (record, message) {
        function pageInit() {}

        function registerWarranty(objData) {
            try {
                var caseRecord = record.load({
                    type: record.Type.SUPPORT_CASE,
                    id: objData.recordId,
                    isDynamic: true,
                });
                var warranty_status=caseRecord.getValue('custevent_dsc_warranty_register_created');
                var customerId = 0;
                var serialnumber = '';

                if (objData.customerId == -999) {
                    var customerRecord = record.create({
                        type: record.Type.CUSTOMER,
                        isDynamic: true
                    });
                    customerRecord.setValue('subsidiary', SUBSIDIARY_ID);
                    customerRecord.setValue('email', objData.caseemail);
                    customerRecord.setValue('companyname', objData.customerName);
                    customerId = customerRecord.save();
                } else {
                    customerId = objData.customerId;
                }

                if (objData.msgcheck.indexOf('Serial Number :') != -1) {
                    var msg = objData.incomingMessage;
                    var found = msg.find(function (element) {
                        return element.indexOf('Serial Number') !== -1;
                    });
                    if (found) {
                        serialnumber = found.split(':')[1].trim();
                    }
                } else {
                    serialnumber = objData.casenumber;
                }
                if (objData.itemid && (warranty_status==false)) {
                    var warrantyRecord = record.create({
                        type: 'customrecord_wrm_warrantyreg',
                        isDynamic: true
                    });
                    warrantyRecord.setValue('custrecord_wrm_reg_customer', customerId)
                    warrantyRecord.setValue('custrecord_wrm_reg_item', objData.itemid)
                    warrantyRecord.setValue('custrecord_dsc_warranty_case', objData.recordId)
                    warrantyRecord.setValue('custrecord_wrm_reg_ref_seriallot', serialnumber)
                    var id = warrantyRecord.save();
                    caseRecord.setValue('custevent_dsc_warranty_register_created',true);
                    caseRecord.save();
                    warrantyError('SUCCESS!', 'Warranty registration successfully created, Warranty Register : <a href="/app/common/custom/custrecordentry.nl?rectype=297&id=' + id + '">' + id + '</a>', message.Type.CONFIRMATION);
                    
                } else {
                    if(warranty_status==true)
                    {
                        warrantyError('ERROR', 'Warranty has already Register on this Case', message.Type.ERROR);
                    }
                    else
                    {
                        warrantyError('ERROR', 'Item Not Available. Please Select an Item and Try Again', message.Type.ERROR);
                    }
                }
            } catch (e) {
                if (e.message.indexOf('Invalid custrecord_wrm_reg_item reference') != -1) {
                    warrantyError('ERROR', 'This Item currently not available for Warranty Registeration', message.Type.ERROR);
                } else {
                    warrantyError('ERROR', e.message, message.Type.ERROR);
                }

            }
        }

        function warrantyError(errorTitle, errorMsg, errortype) {
            var warrError = message.create({
                title: errorTitle,
                message: errorMsg,
                type: errortype
            });
            warrError.show();
        }
        return {
            pageInit: pageInit,
            registerWarranty: registerWarranty
        };
    });