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
                    var registrationid = currentRecord.getValue('custrecord_wrm_reg_registration') ? currentRecord.getValue('custrecord_wrm_reg_registration') : currentRecord.getValue('recordid');
                    var objRecord = record.load({
                        type: 'customrecord_wrm_warrantyreg',
                        id: cid,
                        isDynamic: true,
                    });
                    var entityid = objRecord.getValue('custrecord_wrm_reg_customer');
                    var caseid = objRecord.getValue('custrecord_dsc_warranty_case');
                    var recipientEmail = '';
                    if (caseid) {
                        var caseRecord = record.load({
                            type: record.Type.SUPPORT_CASE,
                            id: caseid,
                            isDynamic: true,
                        });
                        var custEmail = caseRecord.getValue('email');
                        recipientEmail = custEmail;
                    } else {
                        var custRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: entityid,
                            isDynamic: true,
                        });
                        var custEmail = custRecord.getValue('email');
                        recipientEmail = custEmail;
                    }
                    var myMergeResult = render.mergeEmail({
                        templateId: 17
                    });
                    var emailSubject = myMergeResult.subject; // Get the subject for the email
                    var eBody = myMergeResult.body; // Get the body for the email
                    var emailBody = eBody.replace('{registrationid}', registrationid);
                    email.send({
                        author: SENDER_ID,
                        recipients: recipientEmail,
                        subject: emailSubject,
                        body: emailBody,
                        relatedRecords: {
                            entityId: entityid
                        }
                    });
                }
            } catch (e) {
                log.debug({
                    title: "error",
                    details: JSON.stringify(e.message)
                });
            }

        }
        return {
            afterSubmit: afterSubmit
        };
    }
);