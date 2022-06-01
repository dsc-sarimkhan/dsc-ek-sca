/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var SENDER_ID = '3120';
define(['N/record', 'N/log', 'N/email', 'N/render'],
    function (record, log, email, render) {
        function afterSubmit(context) {
            try {
                if (context.type == context.UserEventType.CREATE) {
                    var currentRecord = context.newRecord;
                    var cid = currentRecord.id;

                    var entity = currentRecord.getValue('entity');
                    var transdate = currentRecord.getValue('trandate');
                    var type = currentRecord.getValue('type');

                    var lineCount = currentRecord.getLineCount({
                        sublistId: 'item'
                    });
                    for (var i = 0; i < lineCount; i++) {
                        var itemid = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });
                        var qty = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });
                        var item_location = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            line: i
                        });
                        var item_class = currentRecord.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'class',
                            line: i
                        });
                        qty = parseInt(qty);
                        for (var j = 1; j <= qty; j++) {
                            var reg_date = new Date();
                            var regno = reg_date.getTime();
                            var warrantyRecord = record.create({
                                type: 'customrecord_wrm_warrantyreg',
                                isDynamic: true
                            });
                            warrantyRecord.setValue('custrecord_wrm_reg_customer', entity)
                            warrantyRecord.setValue('custrecord_wrm_reg_ref_invoice', type + '' + cid)
                            warrantyRecord.setValue('custrecord_wrm_reg_item', itemid)
                            warrantyRecord.setValue('custrecord_wrm_reg_location', item_location)
                            warrantyRecord.setValue('custrecord_wrm_reg_class', item_class)
                            warrantyRecord.setValue('custrecord_wrm_reg_invoicedate', transdate)
                            warrantyRecord.setValue('custrecord_wrm_reg_registration', "" + regno)
                            warrantyRecord.setValue('custrecord_wrm_reg_ref_seriallot', itemid + '' + j)
                            var id = warrantyRecord.save();
                            if (id) {
                                var custRecord = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: entity,
                                    isDynamic: true,
                                });
                                var warrentyRecord = record.load({
                                    type: 'customrecord_wrm_warrantyreg',
                                    id: id,
                                    isDynamic: true,
                                });
                                var myMergeResult = render.mergeEmail({
                                    templateId: 17
                                });
                                var emailSubject = myMergeResult.subject; // Get the subject for the email
                                var eBody = myMergeResult.body // Get the body for the email
                                var custEmail = custRecord.getValue('email');
                                var recipientEmail = custEmail;
                                var registrationid = warrentyRecord.getValue('custrecord_wrm_reg_registration') ? warrentyRecord.getValue('custrecord_wrm_reg_registration') : id;
                                var emailBody = eBody.replace('{registrationid}', registrationid);
                                email.send({
                                    author: SENDER_ID,
                                    recipients: recipientEmail,
                                    subject: emailSubject,
                                    body: emailBody,
                                    relatedRecords: {
                                        entityId: entity
                                    }
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                log.error();
                ({
                    title: "ERROR",
                    details: JSON.stringify(e.message)
                });
            }

        }
        return {
            afterSubmit: afterSubmit
        };
    }
);