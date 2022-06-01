function service(request)
{
	'use strict';
	var Application = require('Application');
	try
	{
        var itemId = request.getParameter('itemId');
        var aFilter = new Array();
        aFilter.push(["isinactive","is","F"]);
        aFilter.push("AND");
        aFilter.push(["custrecord_dsc_show_on_store","is","T"]);
        aFilter.push("AND");
        if(itemId)
        {
            aFilter.push(["custrecord_dsc_item_name","is",itemId]);
        }else{
            aFilter.push(["custrecord_dsc_is_manual","is","T"]);
        }
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('custrecord_dsc_url');
        columns[1] = new nlobjSearchColumn('custrecord_dsc_attachment_file');
        columns[2] = new nlobjSearchColumn('custrecord_dsc_item_name');
        var aResult = nlapiSearchRecord('customrecord_dsc_ek_attachments', null, aFilter, columns);

        var resultSet = new Array();
        if(aResult){
            aResult.forEach(function(v, i){
                resultSet.push({"file_name": v.getText('custrecord_dsc_attachment_file'),"item_name": v.getText('custrecord_dsc_item_name'), "file_url" : v.getValue('custrecord_dsc_url')});
            });
        }

        Application.sendContent(resultSet);
	}
	catch (e)
	{
		Application.sendError(e);
	}
}