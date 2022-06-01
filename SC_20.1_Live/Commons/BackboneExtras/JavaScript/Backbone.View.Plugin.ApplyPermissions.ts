/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Backbone.View.Plugin.ApplyPermissions"/>
import * as _ from 'underscore';
import * as jQuery from '../../Core/JavaScript/jQuery';

import BackboneView = require('../../BackboneExtras/JavaScript/Backbone.View.render');

export = {
    mountToApp: function() {
        if (!_.result(SC, 'isPageGenerator')) {
            BackboneView.postRender.install({
                name: 'applyPermissions',
                priority: 10,
                // Given a DOM template, removes the elements from the DOM that
                // do not comply with the list of permissions level
                // The permission level is specified by using the data-permissions attribute and data-permissions-operator (the latter is optional)
                // on any html tag in the following format:
                // <permission_category>.<permission_name>.<minimum_level>
                // permission_category and permission_name come from SC.ENVIRONMENT.permissions. (See commons.js)
                // e.g:
                //     <div data-permissions="transactions.tranFind.1"></div>
                //     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1"></div>
                // Notice several permissions can be separated by space or comma, by default (in case that data-permissions-operator is missing) all permission will be evaluates
                // as AND, otherwise data-permissions-operator should have the value OR
                // e.g:
                //     <div data-permissions="transactions.tranFind.1"></div>
                //     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1" data-permissions-operator="OR" ></div>
                execute: function(template) {
                    // We need to wrap the template in a container so then we can find
                    // and remove parent nodes also (jQuery.find only works in descendants).
                    const $permissioned_elements = template.find('[data-permissions]');

                    $permissioned_elements.each(function() {
                        const $el = jQuery(this);
                        const element_permission = $el.data('permissions');
                        const perms = element_permission.split(/[\s,]+/);
                        const perm_operator = $el.data('permissions-operator') || 'AND';
                        let perm_eval;
                        let perm_evaluation = perm_operator !== 'OR';

                        _.each(perms, function(perm: any) {
                            const perm_tokens = perm.split('.');

                            perm_eval = !(
                                perm_tokens.length === 3 &&
                                perm_tokens[2] < 5 &&
                                SC.ENVIRONMENT.permissions &&
                                SC.ENVIRONMENT.permissions[perm_tokens[0]] &&
                                SC.ENVIRONMENT.permissions[perm_tokens[0]][perm_tokens[1]] <
                                    perm_tokens[2]
                            );

                            if (perm_operator === 'OR') {
                                perm_evaluation = perm_evaluation || perm_eval;
                            } else {
                                perm_evaluation = perm_evaluation && perm_eval;
                            }
                        });

                        if (!perm_evaluation) {
                            $el.remove();
                        }
                    });

                    return template;
                }
            });
        }
    }
};
