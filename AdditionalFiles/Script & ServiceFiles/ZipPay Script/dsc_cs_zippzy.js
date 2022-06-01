/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/record', 'N/ui/message', 'N/https'],
    function (record, message, https) {
        function pageInit() {}

        function createcharge(objData) {
            try {

                console.log('objData id', JSON.stringify(objData))
                var data = {
                    "authority": {
                        "type": "checkout_id",
                        "value": objData.Zippay_checkoutID
                    },
                    "amount": objData.Total_amount,
                    "currency": "AUD"
                }
                // var AUTH_HEADER = {
                //     name: 'Authorization',
                //     value: 'Bearer CL3OLanNTaibrv/X4f8oIHf+hPQG6mda8ITEh3gcNWo='
                // };
                // var ZIP_VERSION = {
                //     name: 'Zip-Version',
                //     value: '2017-03-01'
                // };
                // var CONTENT_TYPE = {
                //     name: 'Content-Type',
                //     value: 'application/json'
                // };
                if (data != undefined && data != '') {
                    var AUTH_HEADER = {
                        "Authorization": "Bearer CL3OLanNTaibrv/X4f8oIHf+hPQG6mda8ITEh3gcNWo=",
                        "Zip-Version": "2017-03-01",
                        "Content-Type": "application/json"
                    };
                    https.post.promise({
                            url: 'https://api.sandbox.zipmoney.com.au/merchant/v1/charges',
                            body: JSON.stringify(data),
                            headers: AUTH_HEADER
                        })
                        .then(function (response) {
                            var response_data=JSON.parse(response.body)
                            console.log('response ',JSON.parse(response.body))
                            if(!response_data.error)
                            {

                                zipPayErrorStatus('SUCCESS!', ' Payment Successfully '+response_data.state+' with Receipt Number <strong>'+response_data.receipt_number +'</strong> & Total Capture Amount <strong>'+response_data.captured_amount+'</strong>', message.Type.CONFIRMATION);
                            }
                            else
                            {
                                var error_Data=response_data.error;
                                zipPayErrorStatus(error_Data.code, error_Data.message, message.Type.ERROR);
                            }

                        })
                        .catch(function onRejected(reason) {
                           console.log('Failed ',reason)
                        })
                }

            } catch (e) {

                log.error("ERROR IN:: " + title, e.message);
            }
        }
        function zipPayErrorStatus(errorTitle, errorMsg, errortype) {
            var zippay_Status = message.create({
                title: errorTitle,
                message: errorMsg,
                type: errortype
            });
            zippay_Status.show();
        }
        return {
            pageInit: pageInit,
            createcharge: createcharge
        };
    });