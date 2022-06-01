/**
 * @NApiVersion 2.0
 * @NScriptType suitelet
 */
define(['N/https','N/log'],
    function(https,log) {
      function testRequest(context) {  
        log.debug({
          title: 'object',
          details: JSON.stringify({'new request':'suitelet success'})
        });
          var responseData = context.response.write('<h1><em><span style="color:#0066b9">Thanks, Your Request has been Submitted.</span></em>  We will be in touch with you shortly.</h1>');
        }
      return {
        onRequest: testRequest
      };
    }
  );