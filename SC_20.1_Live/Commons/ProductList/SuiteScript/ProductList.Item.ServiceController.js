/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// ProductList.Item.ServiceController.js
// ----------------
// Service to manage product list items requests
define('ProductList.Item.ServiceController', [
    'ServiceController',
    'SC.Models.Init',
    'Application',
    'ProductList.Item.Model'
], function(ServiceController, ModelsInit, Application, ProductListItemModel) {
    // @class ProductList.Item.ServiceController Manage product list items requests
    // @extend ServiceController
    return ServiceController.extend({
        // @property {String} name Mandatory for all ssp-libraries model
        name: 'ProductList.Item.ServiceController',

        // @property {Service.ValidationOptions} options. All the required validation, permissions, etc.
        // The values in this object are the validation needed for the current service.
        // Can have values for all the request methods ('common' values) and specific for each one.
        options: {
            common: {
                requireLoggedInPPS: true
            }
        },

        // @method getUser
        // @return {Integer} User id
        getUser: function() {
            const role = ModelsInit.context.getRoleId();
            let user = nlapiGetUser();

            // This is to ensure customers can't query other customer's product lists.
            if (role !== 'shopper' && role !== 'customer_center') {
                user = parseInt(
                    this.request.getParameter('user') ||
                        (this.data.productList && this.data.productList.owner) ||
                        user,
                    10
                );
            }
            return user;
        },

        // @method getId
        // @return {String} internalid
        getId: function() {
            return this.request.getParameter('internalid')
                ? this.request.getParameter('internalid')
                : this.data.internalid;
        },

        // @method get The call to ProductList.Item.Service.ss with http method 'get' is managed by this function
        // @return {ProductList.Item.Model.Get.Result || ProductList.Item.Model.List.Result}
        get: function() {
            const product_list_id = this.request.getParameter('productlistid')
                ? this.request.getParameter('productlistid')
                : this.data.productlistid;
            const id = this.getId();
            const user = this.getUser();

            return id
                ? ProductListItemModel.get(user, id)
                : ProductListItemModel.search(user, product_list_id, true, {
                      sort: this.request.getParameter('sort')
                          ? this.request.getParameter('sort')
                          : this.data.sort, // Column name
                      order: this.request.getParameter('order')
                          ? this.request.getParameter('order')
                          : this.data.order, // Sort direction
                      page: this.request.getParameter('page') || -1
                  });
        },

        // @method post The call to ProductList.Item.Service.ss with http method 'post' is managed by this function
        // @return {StatusObject}
        post: function() {
            const user = this.getUser();
            // Do not return this value, just send the content
            this.sendContent(ProductListItemModel.create(user, this.data), { status: 201 });
        },

        // @method put The call to ProductList.Item.Service.ss with http method 'put' is managed by this function
        // @return {ProductList.Item.Model.Get.Result}
        put: function() {
            const id = this.getId();
            const user = this.getUser();
            ProductListItemModel.update(user, id, this.data);
            return ProductListItemModel.get(user, id);
        },

        // @method delete The call to ProductList.Item.Service.ss with http method 'delete' is managed by this function
        // @return {StatusObject}
        delete: function() {
            const id = this.getId();
            const user = this.getUser();
            ProductListItemModel.delete(user, id);

            return { status: 'ok' };
        }
    });
});
