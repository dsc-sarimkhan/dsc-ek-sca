
function service(request, response)
{
	'use strict';
	try 
	{
		require('DSC.SEOContent.DisplayContent.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('DSC.SEOContent.DisplayContent.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}