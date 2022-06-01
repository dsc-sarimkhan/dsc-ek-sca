/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/https','N/error'],
    function (record, https,error) {
        function beforeSubmit(context) {
            // try {
                if (context.type == context.UserEventType.CREATE) {
                    var rec = context.newRecord;
                    var zippay_checkoutID = rec.getValue('custbody_ek_zipcheckaccid');
                    var total_amount = rec.getValue('total');
                    if (zippay_checkoutID && total_amount > 0) {
                        var data = {
                            "authority": {
                                "type": "checkout_id",
                                "value": zippay_checkoutID
                            },
                            "amount": total_amount,
                            "currency": "AUD"
                        }

                        if (data != undefined && data != '') {
                            var AUTH_HEADER = {
                                "Authorization": "Bearer e9afHktO6oNt1drVFiUu9QfkP8knqFBVG51guG5YAXY=", //sandbox key: CL3OLanNTaibrv/X4f8oIHf+hPQG6mda8ITEh3gcNWo=
                                "Zip-Version": "2017-03-01",
                                "Content-Type": "application/json"
                            };

                            var response = https.post({
                                url: 'https://api.zipmoney.com.au/merchant/v1/charges',
                                body: JSON.stringify(data),
                                headers: AUTH_HEADER
                            });

                            var response_data=JSON.parse(response.body)
                            if (!response_data.error) {
                                log.debug('response_data', response_data);
                                rec.setValue('custbody_dsc_zippay_charge_id',response_data.id)
                                rec.setValue('custbody_dsc_zippay_charge_data',JSON.stringify(response_data))
                                // zipPayErrorStatus('SUCCESS!', ' Payment Successfully '+response_data.state+' with Receipt Number <strong>'+response_data.receipt_number +'</strong> & Total Capture Amount <strong>'+response_data.captured_amount+'</strong>', message.Type.CONFIRMATION);
                            } else {
                                var error_Data = response_data.error;
                                log.debug('error_Data', error_Data);
                                throw error_Data.code+ " " +error_Data.message;
                                // zipPayErrorStatus(error_Data.code, error_Data.message, message.Type.ERROR);
                            }
                        }

                    }

                    rec.setValue('handlingmode','MIMIC')
                }

            // } catch (e) {
            //     log.error("ERROR IN:: " , e.message);

            // }
        }
        return {
            beforeSubmit: beforeSubmit
        };
    }
);