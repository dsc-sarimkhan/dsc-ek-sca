/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Loggers.ElasticLogger', [
    'SC.Models.Init',
    'ReleaseMetadata',
    'Utils',
    'underscore'
], function(ModelsInit, ReleaseMetadata, Utils, _) {
    const logger = {
        info: [],

        flush: function flush(common_data) {
            try {
                if (!this.info || !this.info.length) {
                    return;
                }

                const product = BuildTimeInf.product.toLowerCase();

                const urlRoot = ModelsInit.session.getSSPApplication().urlroot.replace(/\/$/, '');
                const siteid = ModelsInit.session.getSiteSettings(['siteid']).siteid;
                const url = request
                    .getSSPURL()
                    .replace(
                        new RegExp(urlRoot + '/.*$'),
                        urlRoot +
                            '_ss2/Common/Loggers/ElasticLogger.ss?n=' +
                            siteid
                    );

                common_data = common_data || {};
                common_data.url = Utils.getShoppingDomain();

                const data = {
                    type: product.toUpperCase(),
                    info: this._mergeData(this.info, common_data),
                    error: null
                };

                nlapiRequestURL(
                    url,
                    JSON.stringify(data),
                    { 'Content-Type': 'application/json' },
                    'POST'
                );
            } catch (error) {
                console.log(JSON.stringify(error));
            }

            this.info = [];
        },

        log: function log(info) {
            const product = BuildTimeInf.product.toLowerCase();
            if (
                (product === 'scis' && info.componentArea !== 'SC_BACKEND_CART_COMPONENT') ||
                !info.method_name
            ) {
                return;
            }

            const infoToLog = {
                suiteScriptAppVersion: ReleaseMetadata.getVersion(),
                extensibilityLayerMethodName: info.method_name,
                componentArea: info.componentArea
            };

            if (info.extensionName) {
                infoToLog.extensionName = info.extensionName;
            }

            this.info.push(infoToLog);
        },

        _mergeData: function(data, common_data) {
            if (!common_data) {
                return data;
            }

            const common_data_map = {
                url: { key: 'clientRequestURL', regex: '^https?://([^/]*).*$', replace: '$1' }
            };

            return _.map(data, function(info) {
                _.each(common_data, function(value, key) {
                    const mapped_key = common_data_map[key];
                    if (mapped_key) {
                        if (mapped_key.regex && mapped_key.replace) {
                            value = value.replace(new RegExp(mapped_key.regex), mapped_key.replace);
                        }
                        info[mapped_key.key] = value;
                    }
                });

                return info;
            });
        }
    };

    return logger;
});
