/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/https', 'N/xml', 'N/email', 'N/render', 'SuiteBundles/Bundle 374011/dsc_smart_freight_utils.js'],
    function (https, xml, email, render, smartFreightUtils) {
        var INVALID_PROPS = {
            message: '"itemQtyMapObj" and "addresses" are required!',
            data: null,
            status: 400
        }
        var UNEXPECTED_ERROR = {
            message: 'Unexpected Error',
            data: null,
            status: 400
        }

        var SCA_CART_ID = '';
        var EMAIL_RECIPIENTS = 'saad@dynasoftcloud.com';
        // // Test Account Credentials
        // var API_CONFIG = {
        //     username: 'QPU',
        //     password: 'kFyruxBAq7lFdxMwihKLVEPmwujjJYwEQ4',
        //     headers: {
        //         "Content-Type": "text/xml",
        //         "Accept": "*/*"
        //     },
        //     apiUrl: 'https://api-r1.smartfreight.com/api/soap/deliveryoptions'
        // }

        var API_CONFIG = {
            username: 'DFC',
            password: '2BeYNbxC3uo5IRhihBIGvg4U778criSLrs',
            headers: {
                "Content-Type": "text/xml",
                "Accept": "*/*"
            },
            apiUrl: 'https://api-r1.smartfreight.com/api/soap/deliveryoptions'
        }


        function onRequest(context) {

            var title = 'onRequest :: ';
            try {
                var request = context.request;
                var response = context.response;
                response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                })

                if (request.method === 'POST') {
                    var body = JSON.parse(request.body)
                    if (body.shipping_data == 'shipping_packages') {
                        var itemQtyMapObj = body.itemQtyMapObj;
                        log.debug({
                            title: 'itemQtyMapObj',
                            details: JSON.stringify(itemQtyMapObj)
                        })
                        var addresses = body.addresses;
                        var cart_id = body.cart_id;
                        SCA_CART_ID = cart_id;
                        if (!itemQtyMapObj || !addresses) {
                            response.write(JSON.stringify(INVALID_PROPS))
                        }
                        var itemPackageMapObj = smartFreightUtils.getItemPackageMapObj(itemQtyMapObj);
                        log.debug({
                            title: 'itemPackageMapObj0000',
                            details: JSON.stringify(itemPackageMapObj)
                        });
                        if (!itemPackageMapObj) {
                            log.debug({
                                title: title + 'itemPackageMapObj',
                                details: itemPackageMapObj + 'Please Define Packages'
                            });
                            response.write(JSON.stringify(UNEXPECTED_ERROR))
                            return;
                        }

                        var dimenssions = smartFreightUtils.getDimenssions(itemPackageMapObj);

                        if (!dimenssions) {
                            log.debug({
                                title: title + 'dimenssions',
                                details: dimenssions + 'Invalid Dimmensions'
                            });
                            response.write(JSON.stringify(UNEXPECTED_ERROR))
                            return;
                        }
                        var finalDims = [];

                        for (var i = 0; i < dimenssions.length; i++) {
                            if (!dimenssions[i].defaultShipCost) {
                                finalDims.push(dimenssions[i]);
                            }
                        }

                        log.debug(title + 'finalDims', finalDims);
                        var totalDefaultShipCost = smartFreightUtils.getTotalDefaultShipCost(dimenssions) || 0;

                        var onlyDefaultShipItems = false;

                        if (dimenssions.length > 0 && finalDims.length == 0 && totalDefaultShipCost && totalDefaultShipCost > 0) {

                            onlyDefaultShipItems = true;
                        }
                        var requestObj = smartFreightUtils.prepareDeliveryOptionRequest(addresses, dimenssions, API_CONFIG);

                        if (onlyDefaultShipItems && finalDims.length == 0 && dimenssions.length > 0) {
                            var d = new Date();
                            var todayDate = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();
                            var result = [smartFreightUtils.DEFAULT_SCA_RESPONSE];
                            result[0].condate = todayDate;
                            var response_object = {
                                result: result,
                                package_detail: dimenssions,
                                totalDefaultShipCost: totalDefaultShipCost
                            };
                            response.write(JSON.stringify(response_object));
                        } else {
                            requestResource(requestObj, function (err, result) {
                                log.debug({
                                    title: 'result',
                                    details: result
                                })
                                if (err || !result || result.length <= 0) {
                                    log.debug({
                                        title: title + 'err',
                                        details: err
                                    })
                                    response.write(JSON.stringify(UNEXPECTED_ERROR));

                                } else {
                                    var response_object = {
                                        result: result,
                                        package_detail: dimenssions,
                                        totalDefaultShipCost: totalDefaultShipCost
                                    };
                                    response.write(JSON.stringify(response_object));
                                }
                            })
                        }
                    }

                }


            } catch (error) {
                log.debug({
                    title: title,
                    details: JSON.stringify(error)
                })
                if (SCA_CART_ID == 'cart') {
                    shippingEmail(JSON.stringify(error.message));
                }
            }

        }

        function shippingEmail(emailbody) {
            try {
                var myMergeResult = render.mergeEmail({
                    templateId: 18
                });
                var emailSubject = myMergeResult.subject; // Get the subject for the email
                var eBody = myMergeResult.body; // Get the body for the email
                var emailBody = eBody.replace('{data}', emailbody);
                //Following snippet will send email for items missing package details.
                email.send({
                    author: -5,
                    recipients: EMAIL_RECIPIENTS,
                    subject: emailSubject,
                    body: emailBody,
                    relatedRecords: {
                        entityId: -5,
                    }
                });
            } catch (error) {
                throw error;
            }

        }

        function requestResource(requestObj, callback) {
            var title = 'requestResource :: ';
            try {

                var response = https.post(requestObj);

                if (response.code === 500) {
                    callback(new Error('Internal Server Error!'), null);
                    return;
                } else if (response.code !== 200) {
                    callback(new Error('Error Occurred!'), null);
                    return;
                } else {
                    var responseBody = response.body;
                    responseBody = responseBody.replace('/&gt;/g', '>');
                    responseBody = responseBody.replace('/&lt;/g', '<');
                    responseBody = responseBody.replace('/&quot;/g', '"');

                    var xmlStringContent_string = xml.Parser.fromString({
                        text: responseBody
                    });
                    // var xmlStringContent = xml.Parser.toString({
                    //     document : xmlStringContent_string
                    // });
                    var jsonObj = xmlToJson(xmlStringContent_string);
                    var deliveryOptionXml = jsonObj['soap:Envelope']['soap:Body']['GetDeliveryOptionsResponse']['GetDeliveryOptionsResult']['#text'];
                    var xmlDoc = xml.Parser.fromString({
                        text: deliveryOptionXml
                    });

                    var finalJson = xmlToJson(xmlDoc);

                    callback(null, finalJson.deliveryoptionresults.otheroptions.DeliveryOption);
                }

            } catch (error) {

                callback(error, null);
            }
        }

        function xmlToJson(xmlNode) {
            // Create the return object
            var obj = Object.create(null);

            if (xmlNode.nodeType == xml.NodeType.ELEMENT_NODE) { // element
                // do attributes
                if (xmlNode.hasAttributes()) {
                    obj['@attributes'] = Object.create(null);
                    for (var j in xmlNode.attributes) {
                        if (xmlNode.hasAttribute({
                                name: j
                            })) {
                            obj['@attributes'][j] = xmlNode.getAttribute({
                                name: j
                            });
                        }
                    }
                }
            } else if (xmlNode.nodeType == xml.NodeType.TEXT_NODE) { // text
                obj = xmlNode.nodeValue;
            }

            // do children
            if (xmlNode.hasChildNodes()) {
                for (var i = 0, childLen = xmlNode.childNodes.length; i < childLen; i++) {
                    var childItem = xmlNode.childNodes[i];
                    var nodeName = childItem.nodeName;
                    if (nodeName in obj) {
                        if (!Array.isArray(obj[nodeName])) {
                            obj[nodeName] = [
                                obj[nodeName]
                            ];
                        }
                        obj[nodeName].push(xmlToJson(childItem));
                    } else {
                        obj[nodeName] = xmlToJson(childItem);
                    }
                }
            }

            return obj;
        };




        return {
            onRequest: onRequest
        };
    });