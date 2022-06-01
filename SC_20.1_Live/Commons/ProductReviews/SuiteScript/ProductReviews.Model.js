/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductReviews.Model.js
// ----------------
// Handles creating, fetching and updating ProductReviews
define('ProductReviews.Model', [
    'SC.Model',
    'SC.Models.Init',
    'Application',
    'Utils',
    'Configuration',
    'underscore'
], function(SCModel, ModelsInit, Application, Utils, Configuration, _) {
    return SCModel.extend({
        name: 'ProductReview',
        // ## General settings
        // maxFlagsCount is the number at which a review is marked as flagged by users
        maxFlagsCount: Configuration.get('productReviews.maxFlagsCount'),
        loginRequired: Configuration.get('productReviews.loginRequired'),
        // the id of the flaggedStatus. If maxFlagsCount is reached, this will be its new status.
        flaggedStatus: Configuration.get('productReviews.flaggedStatus'),
        // id of the approvedStatus
        approvedStatus: Configuration.get('productReviews.approvedStatus'),
        // id of pendingApprovalStatus
        pendingApprovalStatus: Configuration.get('productReviews.pendingApprovalStatus'),
        resultsPerPage: Configuration.get('productReviews.resultsPerPage'),

        // Returns a review based on the id
        get: function(id) {
            const review = nlapiLoadRecord('customrecord_ns_pr_review', id);

            if (review) {
                /// Loads Review main information
                const result = {
                    internalid: review.getId(),
                    status: review.getFieldValue('custrecord_ns_prr_status'),
                    isinactive: review.getFieldValue('isinactive') === 'T',
                    title: review.getFieldValue('name') || '',
                    // we parse the line breaks and get it ready for html
                    text: review.getFieldValue('custrecord_ns_prr_text')
                        ? review.getFieldValue('custrecord_ns_prr_text').replace(/\n/g, '<br>')
                        : '',
                    itemid: review.getFieldValue('custrecord_ns_prr_item_id'),
                    rating: review.getFieldValue('custrecord_ns_prr_rating'),
                    useful_count: review.getFieldValue('custrecord_ns_prr_useful_count'),
                    not_useful_count: review.getFieldValue('custrecord_ns_prr_not_useful_count'),
                    falgs_count: review.getFieldValue('custrecord_ns_prr_falgs_count'),
                    isVerified: review.getFieldValue('custrecord_ns_prr_verified') === 'T',
                    created_on:
                        review.getFieldValue('custrecord_ns_prr_creation_date') ||
                        review.getFieldValue('created'),
                    writer: {
                        id: review.getFieldValue('custrecord_ns_prr_writer'),
                        name:
                            review.getFieldValue('custrecord_ns_prr_writer_name') ||
                            review.getFieldText('custrecord_ns_prr_writer')
                    },
                    rating_per_attribute: {}
                };
                // Loads Attribute Rating
                const filters = [
                    new nlobjSearchFilter('custrecord_ns_prar_review', null, 'is', id)
                ];
                const columns = [
                    new nlobjSearchColumn('custrecord_ns_prar_attribute'),
                    new nlobjSearchColumn('custrecord_ns_prar_rating')
                ];
                // we search for the individual attribute rating records
                const ratings_per_attribute = Application.getAllSearchResults(
                    'customrecord_ns_pr_attribute_rating',
                    filters,
                    columns
                );

                _.each(ratings_per_attribute, function(rating_per_attribute) {
                    result.rating_per_attribute[
                        rating_per_attribute.getText('custrecord_ns_prar_attribute')
                    ] = rating_per_attribute.getValue('custrecord_ns_prar_rating');
                });

                return result;
            }
            throw notFoundError;
        },

        search: function(filters, order, page, records_per_page) {
            const review_filters = [
                // only approved reviews
                new nlobjSearchFilter('custrecord_ns_prr_status', null, 'is', this.approvedStatus),
                // and not inactive
                new nlobjSearchFilter('isinactive', null, 'is', 'F')
            ];
            let review_columns = {};
            let result = {};

            // Creates the filters for the given arguments
            if (filters.itemid) {
                review_filters.push(
                    new nlobjSearchFilter(
                        'custrecord_ns_prr_item_id',
                        null,
                        'equalto',
                        filters.itemid
                    )
                );
            }

            // Only by verified buyer
            if (filters.writer) {
                review_filters.push(
                    new nlobjSearchFilter(
                        'custrecord_ns_prr_writer',
                        null,
                        'equalto',
                        filters.writer
                    )
                );
            }

            // only by a rating
            if (filters.rating) {
                review_filters.push(
                    new nlobjSearchFilter(
                        'custrecord_ns_prr_rating',
                        null,
                        'equalto',
                        filters.rating
                    )
                );
            }

            if (filters.q) {
                review_filters.push(
                    new nlobjSearchFilter('custrecord_ns_prr_text', null, 'contains', filters.q)
                );
            }

            // Selects the columns
            review_columns = {
                internalid: new nlobjSearchColumn('internalid'),
                title: new nlobjSearchColumn('name'),
                text: new nlobjSearchColumn('custrecord_ns_prr_text'),
                itemid: new nlobjSearchColumn('custrecord_ns_prr_item_id'),
                rating: new nlobjSearchColumn('custrecord_ns_prr_rating'),
                isVerified: new nlobjSearchColumn('custrecord_ns_prr_verified'),
                useful_count: new nlobjSearchColumn('custrecord_ns_prr_useful_count'),
                not_useful_count: new nlobjSearchColumn('custrecord_ns_prr_not_useful_count'),
                writer: new nlobjSearchColumn('custrecord_ns_prr_writer'),
                writer_name: new nlobjSearchColumn('custrecord_ns_prr_writer_name'),
                created_on: new nlobjSearchColumn('created')
            };

            const custom_created_field_exists = Utils.recordTypeHasField(
                'customrecord_ns_pr_review',
                'custrecord_ns_prr_creation_date'
            );

            if (custom_created_field_exists === true) {
                review_columns.custom_created_on = new nlobjSearchColumn(
                    'custrecord_ns_prr_creation_date'
                );
            }

            // Sets the sort order
            const order_tokens = (order && order.split(':')) || [];
            const sort_column = order_tokens[0] || 'created';
            const sort_direction = order_tokens[1] || 'ASC';

            review_columns[sort_column] &&
                review_columns[sort_column].setSort(sort_direction === 'DESC');

            // Makes the request and format the response
            result = Application.getPaginatedSearchResults({
                record_type: 'customrecord_ns_pr_review',
                filters: review_filters,
                columns: _.values(review_columns),
                page: parseInt(page, 10) || 1,
                results_per_page: parseInt(records_per_page, 10) || this.resultsPerPage
            });

            const reviews_by_id = {};
            const review_ids = [];

            _.each(result.records, function(review) {
                review_ids.push(review.getId());

                reviews_by_id[review.getId()] = {
                    internalid: review.getId(),
                    title: review.getValue('name'),
                    text: review.getValue('custrecord_ns_prr_text')
                        ? review.getValue('custrecord_ns_prr_text').replace(/\n/g, '<br>')
                        : '',
                    itemid: review.getValue('custrecord_ns_prr_item_id'),
                    rating: review.getValue('custrecord_ns_prr_rating'),
                    useful_count: review.getValue('custrecord_ns_prr_useful_count'),
                    not_useful_count: review.getValue('custrecord_ns_prr_not_useful_count'),
                    isVerified: review.getValue('custrecord_ns_prr_verified') === 'T',
                    created_on:
                        review.getValue('custrecord_ns_prr_creation_date') ||
                        review.getValue('created'),
                    writer: {
                        id: review.getValue('custrecord_ns_prr_writer'),
                        name:
                            review.getValue('custrecord_ns_prr_writer_name') ||
                            review.getText('custrecord_ns_prr_writer')
                    },
                    rating_per_attribute: {}
                };
            });

            if (review_ids.length) {
                /// Loads Attribute Rating
                const attribute_filters = [
                    new nlobjSearchFilter('custrecord_ns_prar_review', null, 'anyof', review_ids)
                ];
                const attribute_columns = [
                    new nlobjSearchColumn('custrecord_ns_prar_attribute'),
                    new nlobjSearchColumn('custrecord_ns_prar_rating'),
                    new nlobjSearchColumn('custrecord_ns_prar_review')
                ];
                const ratings_per_attribute = Application.getAllSearchResults(
                    'customrecord_ns_pr_attribute_rating',
                    attribute_filters,
                    attribute_columns
                );

                _.each(ratings_per_attribute, function(rating_per_attribute) {
                    const review_id = rating_per_attribute.getValue('custrecord_ns_prar_review');
                    const attribute_name = rating_per_attribute.getText(
                        'custrecord_ns_prar_attribute'
                    );
                    const rating = rating_per_attribute.getValue('custrecord_ns_prar_rating');

                    if (reviews_by_id[review_id]) {
                        reviews_by_id[review_id].rating_per_attribute[attribute_name] = rating;
                    }
                });
            }

            result.records = _.values(reviews_by_id);

            return result;
        },

        create: function(data) {
            if (this.loginRequired && !ModelsInit.session.isLoggedIn2()) {
                throw unauthorizedError;
            }

            const review = nlapiCreateRecord('customrecord_ns_pr_review');

            if (ModelsInit.session.isLoggedIn2()) {
                review.setFieldValue('custrecord_ns_prr_writer', nlapiGetUser() + '');
            }

            if (data.writer) {
                data.writer.name &&
                    review.setFieldValue(
                        'custrecord_ns_prr_writer_name',
                        Utils.sanitizeString(data.writer.name)
                    );
                data.writer.id && review.setFieldValue('custrecord_ns_prr_writer', data.writer.id);
            }
            data.rating && review.setFieldValue('custrecord_ns_prr_rating', data.rating);
            data.title && review.setFieldValue('name', Utils.sanitizeString(data.title));

            if (data.text) {
                const sanitized_text = Utils.sanitizeString(data.text);

                review.setFieldValue('custrecord_ns_prr_text', sanitized_text);
                data.text = sanitized_text.replace(/\n/g, '<br>');
            }

            data.itemid && review.setFieldValue('custrecord_ns_prr_item_id', data.itemid);

            const review_id = nlapiSubmitRecord(review);
            data.review_id = review_id;

            _.each(data.rating_per_attribute, function(rating, name) {
                const review_attribute = nlapiCreateRecord('customrecord_ns_pr_attribute_rating');

                review_attribute.setFieldValue('custrecord_ns_prar_item', data.itemid);
                review_attribute.setFieldValue('custrecord_ns_prar_review', review_id);
                review_attribute.setFieldValue('custrecord_ns_prar_rating', rating);
                review_attribute.setFieldText('custrecord_ns_prar_attribute', name);

                nlapiSubmitRecord(review_attribute);
            });

            return data;
        },
        // This function updates the quantity of the counters
        update: function(id, data) {
            const { action } = data;
            const field_name_by_action = {
                flag: 'custrecord_ns_prr_falgs_count',
                'mark-as-useful': 'custrecord_ns_prr_useful_count',
                'mark-as-not-useful': 'custrecord_ns_prr_not_useful_count'
            };
            const field_name = field_name_by_action[action];

            if (field_name) {
                const review = nlapiLoadRecord('customrecord_ns_pr_review', id);
                const current_count = review.getFieldValue(field_name);

                review.setFieldValue(field_name, parseInt(current_count, 10) + 1 || 1);
                // if the review is beeing flagged, check the maxFlagsCount
                if (action === 'flag' && current_count >= this.maxFlagsCount) {
                    // flag the review
                    review.setFieldValue('custrecord_ns_prr_status', this.flaggedStatus);
                }

                nlapiSubmitRecord(review);
            }
        }
    });
});
