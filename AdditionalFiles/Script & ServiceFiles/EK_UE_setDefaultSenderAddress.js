/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/record'], function (log, record) {

    function beforeLoad(context) {


        if (context.request.parameters.activity && context.request.parameters.templatetype == 'EMAIL') {
            var recordid = context.request.parameters.activity;
            var objRecord = record.load({
                type: record.Type.SUPPORT_CASE,
                id: recordid,
                isDynamic: true,
            });
            var emailAddress = objRecord.getValue({
                fieldId: 'email'
            });
            if (context.type == context.UserEventType.CREATE) {
                var field = context.form.addField({
                    id: 'custpageinjectcode',
                    type: 'INLINEHTML',
                    label: 'Inject Code'
                });

                field.defaultValue = "<script>jQuery( document ).ready(function() {if(document.getElementsByClassName('radio')[1].value== 'USER'){document.getElementsByClassName('radio')[1].checked= true;}}); if('"+emailAddress+"'){setTimeout(function () {console.log('Yes working..." + emailAddress.toString() + "');nlapiSetFieldValue('recipientemail', '" + emailAddress.toString() + "')}, 100);} </script>";

            }
        }
    }
    return {
        beforeLoad: beforeLoad
    }
});