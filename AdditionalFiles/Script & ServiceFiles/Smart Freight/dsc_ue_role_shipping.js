/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var customRole = 1103;
define(['N/record'], function (record) {
    function afterSubmit(context) {
        var title = "afterSubmit() :: ";
        try {
            if (context.type == context.UserEventType.CREATE) {
                var currentRecord = context.newRecord;
                var cid = currentRecord.id;

                if (cid) {
                    var custRecord = record.load({
                        type: record.Type.LEAD,
                        id: cid,
                        isDynamic: true,
                    });

                    var role = custRecord.getValue('accessrole')
                    if (role != customRole) {
                        custRecord.setValue('accessrole', customRole);
                       
                        custRecord.save();
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
    }
});