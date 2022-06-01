const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const tool = require('./tool');
const _ = require('underscore');
const { OAuth1 } = require('oauth1');

// @module suitetalk @class SuiteTalk

_(tool).extend({

	// @method templatesInit initialize handlebars partials and helpers
	templatesInit: function ()
	{
		var self = this;
		//partials
		//TODO: dont hardcode here, perform this automatically - template files starting with '_'
		[
			'_passport.tpl'
		,	'_searchPreferences.tpl'
		,	'_namespaces.tpl'
		].forEach(function(partial_file_name)
		{
			Handlebars.registerPartial(partial_file_name.replace('.tpl', ''), fs.readFileSync(
				path.join(__dirname, '/templates/', partial_file_name)
			,	{encoding: 'utf8'}).toString());
		});

		// helpers

		// addRecord helper: prints an entire record to be added. Used in add and addList operations.
		Handlebars.registerHelper('addRecord', function(record)
		{
			var s = self.addRecord(record);
			return new Handlebars.SafeString(s);
		});

		Handlebars.registerHelper('baseRef', function(baseRef)
		{
			var s = self.baseRef(baseRef);
			return new Handlebars.SafeString(s);
		});

		Handlebars.registerHelper('searchBasicFilterPrint', function(filter)
		{
			var result = self.searchBasicFilterPrint(filter);
			return new Handlebars.SafeString(result);
		});

		Handlebars.registerHelper('initializeRecord', function(record)
		{
			var s = self.initializeRecord(record);
			return new Handlebars.SafeString(s);
		});

	}

	// @method _initTemplateContext
,	_initTemplateContext: function(context)
	{
		context.nsVersion = this.nsVersion;
		context.searchPreferences = context.searchPreferences || {};
		context.searchPreferences = _(_(this.searchPreferences).clone()).extend(context.searchPreferences);
		// context.searchPreferences || {};
		// context.searchPreferences.pageSize = context.searchPreferences.pageSize || '50';
		// context.searchPreferences.returnSearchColumns = context.searchPreferences.returnSearchColumns || 'true';
		// context.searchPreferences.bodyFieldsOnly = context.searchPreferences.bodyFieldsOnly || 'false';

		if(context.recordType)
		{
			context.RecordType = context.recordType.substring(0,1).toUpperCase() + context.recordType.substring(1,context.recordType.length);
		}
		_(context.records).each(function(record)
		{
			var recordType = context.recordType || record.recordType;
			const upperRecordType = recordType.substring(0,1).toUpperCase() + recordType.substring(1,recordType.length);
			record.RecordType = upperRecordType;
		});

		if (context.joins) {
			_(context.joins).each(function(joinEntry, joinIndex)
			{
				context.joins[joinIndex].RecordType = joinEntry.recordType.substring(0,1).toUpperCase() + joinEntry.recordType.substring(1,joinEntry.recordType.length);
			});
		}

		return context;
	}

	// @method _template
,	_template: async function(file_name, params)
	{
		const oauth1 = new OAuth1(this.credentials);
		const credentials = await oauth1.soapAuthorize(this.credentials.authID);
		params.credentials = { ...this.credentials, ...credentials };
		this._initTemplateContext(params);
		var fileName = path.join(__dirname, '/templates/', file_name);
		var template = Handlebars.compile(fs.readFileSync(fileName, {encoding: 'utf8'}).toString());
		return template(params);
	}
});


module.exports = tool;
