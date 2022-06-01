/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/https','N/error'],
 function (record, https,error) {
     function beforeSubmit(context) {
        //  try {
             if (context.type == context.UserEventType.CREATE) {
                 var rec = context.newRecord;
                 var afterpay_Token = rec.getValue('custbody_dsc_afterpay_token');
                 var total_amount = rec.getValue('total');
                 if (afterpay_Token) {
                     var data = {
                        "token": afterpay_Token
                     }

                     if (data != undefined && data != '') {
                        var AUTH_HEADER = {
                            "Authorization": "Basic NDIyMzc6ZTI5ZmQ0NWU1YzNkMDkzZDJjMTRmOWE4ZjYxOWNkM2I5NmI2Yzc4ZDBmNjhiZDBlYWE0NzdlYzBiOTJhY2M4MzljNjdjZGJhNTQ2ZWM1YWFlMWU1MDc5Yjc0MjJkNzVhM2QwZjNlMmNkYjA2YTAxZDY2NmQ1ZGQ2YzJlNjVkMjE=",
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        };

                         var response = https.post({
                            url: 'https://api-sandbox.afterpay.com/v2/payments/capture',
                            body: JSON.stringify(data),
                             headers: AUTH_HEADER
                         });

                         var response_data=JSON.parse(response.body)
                         if (!response_data.errorCode) {
                             rec.setValue('custbody_dsc_afterpay_payment_id',response_data.id)
                             rec.setValue('custbody_dsc_afterpay_payment_data',JSON.stringify(response_data))
                             rec.setValue('handlingmode','MIMIC');
                             if(response_data.status.toLowerCase() == 'declined' || response_data.paymentState.toLowerCase() == 'auth_declined')
                             {
                                rec.setValue('undepfunds','T');
                                rec.setValue('handlingmode','SAVE_ONLY')
                             }
                             // zipPayErrorStatus('SUCCESS!', ' Payment Successfully '+response_data.state+' with Receipt Number <strong>'+response_data.receipt_number +'</strong> & Total Capture Amount <strong>'+response_data.captured_amount+'</strong>', message.Type.CONFIRMATION);
                         } else {
                             var error_Data = response_data;
                             log.debug('error_Data', error_Data);
                             throw error_Data.errorCode +"  , Error Id : "+  error_Data.errorId +"  , Message : "+ error_Data.message;
                             // zipPayErrorStatus(error_Data.code, error_Data.message, message.Type.ERROR);
                         }
                     }

                 }
             }

        //  } catch (e) {
        //      log.error("ERROR IN:: " , e.message);

        //  }
     }
     return {
         beforeSubmit: beforeSubmit
     };
 }
);