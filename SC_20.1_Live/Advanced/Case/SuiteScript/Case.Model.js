/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Case
define('Case.Model', ['SC.Model', 'Application', 'Utils', 'underscore', 'Configuration'], function(
    SCModel,
    Application,
    Utils,
    _,
    Configuration
) {
    // @class Case.Model Defines the model used by the Case.Service.ss and Case.Fields.Service.ss services.
    // Handles fetching, creating and updating cases. @extends SCModel
    return SCModel.extend({
        name: 'Case',

        // @property configuration general settings
        configuration: Configuration.get('cases'),

        // @property dummy_date for cases with no messages. Not common, but it could happen.
        dummy_date: new Date(),

        // @method getNew
        // @returns a new Case record
        getNew: function() {
            const case_record = nlapiCreateRecord('supportcase');

            const category_field = case_record.getField('category');
            const category_options = category_field.getSelectOptions();
            const category_option_values = [];

            _(category_options).each(function(category_option) {
                const category_option_value = {
                    id: category_option.id,
                    text: category_option.text
                };

                category_option_values.push(category_option_value);
            });

            // Origins
            const origin_field = case_record.getField('origin');
            const origin_options = origin_field.getSelectOptions();
            const origin_option_values = [];

            _(origin_options).each(function(origin_option) {
                const origin_option_value = {
                    id: origin_option.id,
                    text: origin_option.text
                };

                origin_option_values.push(origin_option_value);
            });

            // Statuses
            const status_field = case_record.getField('status');
            const status_options = status_field.getSelectOptions();
            const status_option_values = [];

            _(status_options).each(function(status_option) {
                const status_option_value = {
                    id: status_option.id,
                    text: status_option.text
                };

                status_option_values.push(status_option_value);
            });

            // Priorities
            const priority_field = case_record.getField('priority');
            const priority_options = priority_field.getSelectOptions();
            const priority_option_values = [];

            _(priority_options).each(function(priority_option) {
                const priority_option_value = {
                    id: priority_option.id,
                    text: priority_option.text
                };

                priority_option_values.push(priority_option_value);
            });

            // New record to return
            // @class Case.Fields.Model.Attributes
            const newRecord = {
                // @property {Array<Case.Fields.Model.Attributes.Category>} categories
                // @class Case.Fields.Model.Attributes.Category
                // @property {String} id
                // @property {String} text
                // @class Case.Fields.Model.Attributes
                categories: category_option_values,

                // @property {Array<Case.Fields.Model.Attributes.Origin>} origins
                // @class Case.Fields.Model.Attributes.Origin
                // @property {String} id
                // @property {String} text
                // @class Case.Fields.Model.Attributes
                origins: origin_option_values,

                // @property {Array<Case.Fields.Model.Attributes.Status>} statuses
                // @class Case.Fields.Model.Attributes.Status
                // @property {String} id
                // @property {String} text
                // @class Case.Fields.Model.Attributes
                statuses: status_option_values,

                // @property {Array<Case.Fields.Model.Attributes.Priority>} priorities
                // @class Case.Fields.Model.Attributes.Priority
                // @property {String} id
                // @property {String} text
                // @class Case.Fields.Model.Attributes
                priorities: priority_option_values
            };

            // @class Case.Model
            return newRecord;
        },

        // @method getColumnsArray
        // Helper method for defining search columns.
        getColumnsArray: function() {
            return [
                new nlobjSearchColumn('internalid'),
                new nlobjSearchColumn('casenumber'),
                new nlobjSearchColumn('title'),
                new nlobjSearchColumn('status'),
                new nlobjSearchColumn('origin'),
                new nlobjSearchColumn('category'),
                new nlobjSearchColumn('company'),
                new nlobjSearchColumn('createddate'),
                new nlobjSearchColumn('lastmessagedate'),
                new nlobjSearchColumn('priority'),
                new nlobjSearchColumn('email')
            ];
        },

        // @method get
        // @param {String} id
        // @returns {Case.Model.Attributes}
        get: function(id) {
            const filters = [
                new nlobjSearchFilter('internalid', null, 'is', id),
                new nlobjSearchFilter('isinactive', null, 'is', 'F')
            ];
            const columns = this.getColumnsArray();
            const result = this.searchHelper(filters, columns, 1, true);

            if (result.records.length >= 1) {
                return result.records[0];
            }
            throw notFoundError;
        },

        // @method get
        // @param {String} customer_id
        // @param {Object} list_header_data
        // @returns {Array<Case.Model.Attributes>}
        search: function(customer_id, list_header_data) {
            const filters = [new nlobjSearchFilter('isinactive', null, 'is', 'F')];
            const columns = this.getColumnsArray();
            const selected_filter = parseInt(list_header_data.filter, 10);

            if (!_.isNaN(selected_filter)) {
                filters.push(new nlobjSearchFilter('status', null, 'anyof', selected_filter));
            }

            this.setSortOrder(list_header_data.sort, list_header_data.order, columns);

            return this.searchHelper(filters, columns, list_header_data.page, false);
        },

        // @method searchHelper
        // @param {Array<String>} filters
        // @param {Array<String>} columns
        // @param {Number} page
        // @param {Boolean} join_messages
        // @returns {Array<Case.Model.Attributes>}
        searchHelper: function(filters, columns, page, join_messages) {
            const self = this;
            const result = Application.getPaginatedSearchResults({
                record_type: 'supportcase',
                filters: filters,
                columns: columns,
                page: page
            });

            result.records = _.map(result.records, function(case_record) {
                // @class Case.Model.Attributes
                const current_record_id = case_record.getId();
                const created_date = nlapiStringToDate(case_record.getValue('createddate'));
                const last_message_date = nlapiStringToDate(
                    case_record.getValue('lastmessagedate')
                );
                const support_case = {
                    // @property {String} internalid
                    internalid: current_record_id,

                    // @property {String} caseNumber
                    caseNumber: case_record.getValue('casenumber'),

                    // @property {String} title
                    title: case_record.getValue('title'),

                    // @property {Array<String, Case.Model.Attributes.Message>} grouped_messages
                    // @class Case.Model.Attributes.Message
                    // @property {String} author
                    // @property {String} text
                    // @property {String} messageDate
                    // @property {String} initialDate
                    // @class Case.Model.Attributes
                    grouped_messages: [],

                    // @property {Case.Model.Attributes.Status} status
                    // @class Case.Model.Attributes.Status
                    // @property {String} id
                    // @property {String} text
                    // @class Case.Model.Attributes
                    status: {
                        id: case_record.getValue('status'),
                        name: case_record.getText('status')
                    },

                    // @property {Case.Model.Attributes.Origin} origin
                    // @class Case.Model.Attributes.Origin
                    // @property {String} id
                    // @property {String} text
                    // @class Case.Model.Attributes
                    origin: {
                        id: case_record.getValue('origin'),
                        name: case_record.getText('origin')
                    },

                    // @property {Case.Model.Attributes.Category} category
                    // @class Case.Model.Attributes.Category
                    // @property {String} id
                    // @property {String} text
                    // @class Case.Model.Attributes
                    category: {
                        id: case_record.getValue('category'),
                        name: case_record.getText('category')
                    },

                    // @property {Case.Model.Attributes.Company} company
                    // @class Case.Model.Attributes.Company
                    // @property {String} id
                    // @property {String} text
                    // @class Case.Model.Attributes
                    company: {
                        id: case_record.getValue('company'),
                        name: case_record.getText('company')
                    },

                    // @property {Case.Model.Attributes.Priority} priority
                    // @class Case.Model.Attributes.Priority
                    // @property {String} id
                    // @property {String} text
                    // @class Case.Model.Attributes
                    priority: {
                        id: case_record.getValue('priority'),
                        name: case_record.getText('priority')
                    },
                    // @property {String} createdDate
                    createdDate: nlapiDateToString(created_date || self.dummy_date, 'date'),

                    // @property {String} lastMessageDate
                    lastMessageDate: nlapiDateToString(
                        last_message_date || self.dummy_date,
                        'date'
                    ),

                    // @property {String} email
                    email: case_record.getValue('email')
                };

                if (join_messages) {
                    self.appendMessagesToCase(support_case);
                }

                return support_case;
            });

            // @class Case.Model
            return result;
        },

        // @method stripHtmlFromMessage
        // @param {String} message with HTML
        // @returns {String} message without HTML
        stripHtmlFromMessage: function(message) {
            return message.replace(/<br\s*[\/]?>/gi, '\n').replace(/<(?:.|\n)*?>/gm, '');
        },

        // @method appendMessagesToCase When requesting a case detail, messages are included in the response.
        // @param {Case.Model.Attributes}
        appendMessagesToCase: function(support_case) {
            const message_columns = {
                message_col: new nlobjSearchColumn('message', 'messages'),
                message_date_col: new nlobjSearchColumn('messagedate', 'messages').setSort(true),
                author_col: new nlobjSearchColumn('author', 'messages'),
                message_id: new nlobjSearchColumn('internalid', 'messages')
            };
            const message_filters = [
                new nlobjSearchFilter('internalid', null, 'is', support_case.internalid),
                new nlobjSearchFilter('internalonly', 'messages', 'is', 'F')
            ];
            const message_records = Application.getAllSearchResults(
                'supportcase',
                message_filters,
                _.values(message_columns)
            );
            const grouped_messages = [];
            let messages_count = 0;
            const self = this;

            _(message_records).each(function(message_record) {
                const customer_id = nlapiGetUser() + '';
                const message_date_tmp = nlapiStringToDate(
                    message_record.getValue('messagedate', 'messages')
                );
                const message_date = message_date_tmp || self.dummy_date;
                const message_date_to_group_by =
                    message_date.getFullYear() +
                    '-' +
                    (message_date.getMonth() + 1) +
                    '-' +
                    message_date.getDate();
                const message = {
                    author:
                        message_record.getValue('author', 'messages') === customer_id
                            ? 'You'
                            : message_record.getText('author', 'messages'),
                    text: self.stripHtmlFromMessage(message_record.getValue('message', 'messages')),
                    messageDate: nlapiDateToString(message_date, 'timeofday'),
                    internalid: message_record.getValue('internalid', 'messages'),
                    initialMessage: false
                };

                if (grouped_messages[message_date_to_group_by]) {
                    grouped_messages[message_date_to_group_by].messages.push(message);
                } else {
                    grouped_messages[message_date_to_group_by] = {
                        date: self.getMessageDate(message_date),
                        messages: [message]
                    };
                }

                messages_count++;

                if (messages_count === message_records.length) {
                    message.initialMessage = true;
                }
            });

            support_case.grouped_messages = _(grouped_messages).values();
            support_case.messages_count = messages_count;
        },

        // @method getMessageDate
        // @param {Date} validJsDate
        // @returns {String} string date with the correct format
        getMessageDate: function(validJsDate) {
            const today = new Date();
            const today_dd = today.getDate();
            const today_mm = today.getMonth();
            const today_yyyy = today.getFullYear();
            const dd = validJsDate.getDate();
            const mm = validJsDate.getMonth();
            const yyyy = validJsDate.getFullYear();

            if (today_dd === dd && today_mm === mm && today_yyyy === yyyy) {
                return 'Today';
            }

            return nlapiDateToString(validJsDate, 'date');
        },

        // @method create
        // Creates a new case record
        // @param {String} customerId
        // @param {Object} data
        create: function(customerId, data) {
            customerId = customerId || nlapiGetUser() + '';

            const newCaseRecord = nlapiCreateRecord('supportcase');

            data.title && newCaseRecord.setFieldValue('title', Utils.sanitizeString(data.title));
            data.message &&
                newCaseRecord.setFieldValue('incomingmessage', Utils.sanitizeString(data.message));
            data.category && newCaseRecord.setFieldValue('category', data.category);
            data.email && newCaseRecord.setFieldValue('email', data.email);
            customerId && newCaseRecord.setFieldValue('company', customerId);

            const default_values = this.configuration.defaultValues;

            newCaseRecord.setFieldValue('status', default_values.statusStart.id); // Not Started
            newCaseRecord.setFieldValue('origin', default_values.origin.id); // Web

            return nlapiSubmitRecord(newCaseRecord);
        },

        // @method setSortOrder
        // Adds sort condition to the respective column
        // @param {String} sort column name
        // @param {Number} order
        // @param {Array} columns columns array
        setSortOrder: function(sort, order, columns) {
            switch (sort) {
                case 'createdDate':
                    columns[7].setSort(order > 0);
                    break;

                case 'lastMessageDate':
                    columns[8].setSort(order > 0);
                    break;

                default:
                    columns[1].setSort(order > 0);
            }
        },

        // @method update
        // Updates a Support Case given its id
        // @param {String} id
        // @param {String} data
        update: function(id, data) {
            if (data && data.status) {
                if (data.reply && data.reply.length > 0) {
                    nlapiSubmitField(
                        'supportcase',
                        id,
                        ['incomingmessage', 'messagenew', 'status'],
                        [Utils.sanitizeString(data.reply), 'T', data.status.id]
                    );
                } else {
                    nlapiSubmitField('supportcase', id, ['status'], data.status.id);
                }
            }
        }
    });
});
