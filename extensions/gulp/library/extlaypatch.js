/* jshint esversion: 5 */

// This should be deleted ASAP!!! And never more used in future
// This is a workaround to avoid break sites due to the modules
// that changed the way they're exported

// HEADS UP! Keep this using "var" instead const/let because
// it's not being transpiled and needs to run in SEO
(function() {
    srcRequire = require;
    var srcDefine = define;

    var modulesMap = {
        'Footer.Simplified.View': 'FooterSimplifiedView',
        'Footer.View': 'FooterView',
        'GlobalViews.Message.View': 'GlobalViewsMessageView',
        'GlobalViews.Pagination.View': 'GlobalViewsPaginationView',
        'GlobalViews.ShowingCurrent.View': 'GlobalViewsShowingCurrentView',
        'ListHeader.View': 'ListHeaderView',
        'Profile.Model': 'ProfileModel',
        Configuration: 'Configuration',
        'Address.Model': 'AddressModel',
        'Address.Details.View': 'AddressDetailsView',
        AjaxRequestsKiller: 'AjaxRequestsKiller',
        'Categories.Model': 'CategoriesModel',
        'Newsletter.Model': 'NewsletterModel',
        'Newsletter.View': 'NewsletterView',
        MyAccountMenu: 'MyAccountMenu',
        'RecordViews.View': 'RecordViewsView',
        'ReorderItems.Actions.Quantity.View': 'ReorderItemsActionsQuantityView',
        'SC.MyAccount.Layout': 'MyAccountLayout',
        'Transaction.Line.Views.Cell.Navigable.View': 'TransactionLineViewsCellNavigableView',
        'Quote.Details.View': 'QuoteDetailsView',
        ApplicationLayout: 'ApplicationLayout',
        Application: 'Application',
        'SC.BaseComponent': 'SCBaseComponent'
    };
    var namesMap = {
        'SC.Configuration': 'Configuration',
        'ApplicationSkeleton.Layout': 'ApplicationLayout'
    };

    // Core Modules considered part of the extLay. Extensions can use them
    var extLayModules = [
        'Backbone',
        'Backbone.Validation',
        'Backbone.Model',
        'Backbone.View',
        'Backbone.CompositeView',
        'Backbone.CachedModel',
        'Backbone.CollectionView',
        'Backbone.FormView',
        'Backbone.CachedCollection',
        'Handlebars', // Needed for gulp local
        'Handlebars.CompilerNameLookup', // Needed for gulp local
        'jQuery',
        'Wizard.Module',
        'CustomContentType.Base.View',
        'PageTypeView',
        'PageType.Base.View',
        'SCCollection',
        'SCCollectionView',
        'SCFormView',
        'SCModel',
        'SCView',
        'Utils',
        'underscore',
        'require' // Needed for gulp local
    ];
    // Core Modules currently (20.2) being used by extensions.
    // We allow extensions to keep using them for a while.
    // This list should be empty some day in the future.
    var coreModulesWhiteList = [
        'Account.ForgotPassword.Model',
        'Account.Login.Model',
        'Address.Details.View',
        'Address.Edit.Fields.View',
        'Address.Edit.View',
        'AjaxRequestsKiller',
        'ApplicationSkeleton.Layout',
        'Cart.AddToCart.Button.View',
        'Cart.Confirmation.Helpers',
        'Cart.Confirmation.View',
        'Cart.Detailed.View',
        'Cart.Item.Actions.View',
        'Cart.Item.Summary.View',
        'Cart.Lines.Free.View',
        'Cart.Lines.View',
        'Cart.Promocode.List.Item.View',
        'Cart.Promocode.Notifications.View',
        'Cart.QuickAddToCart.View',
        'Cart.Summary.View',
        'Categories',
        'Categories.Utils',
        'CreditCard',
        'CreditCard.Edit.Form.View',
        'CreditCard.View',
        'ErrorManagement',
        'ErrorManagement.PageNotFound.View',
        'ErrorManagement.ResponseErrorParser',
        'Facets.Browse.CategoryHeading.View',
        'Facets.Browse.View',
        'Facets.CategoryCell.View',
        'Facets.Helper',
        'Facets.ItemCell.View',
        'Facets.Model',
        'Facets.Router',
        'Facets.Translator',
        'Footer.Simplified.View',
        'Footer.View',
        'GlobalViews.BackToTop.View',
        'GlobalViews.Breadcrumb.View',
        'GlobalViews.Confirmation.View',
        'GlobalViews.CountriesDropdown.View',
        'GlobalViews.Message.View',
        'GlobalViews.Modal.View',
        'GlobalViews.Pagination.View',
        'GlobalViews.ShowingCurrent.View',
        'GlobalViews.StarRating.View',
        'GlobalViews.States.View',
        'GoogleTagManager',
        'GoogleTagManager.Model',
        'GoogleTagManager.NavigationHelper.Plugins.Standard',
        'Header.Logo.View',
        'Header.Menu.MyAccount.View',
        'Header.Menu.View',
        'Header.MiniCart.View',
        'Header.MiniCartItemCell.View',
        'Header.Profile.View',
        'Header.Simplified.View',
        'Header.View',
        'Home.View',
        'Invoice.Collection',
        'Invoice.Details.View',
        'Invoice.OpenList.View',
        'Invoice.PaidList.View',
        'Item.Collection',
        'Item.KeyMapping',
        'Item.Model',
        'Item.Option.Collection',
        'ItemDetails.Collection',
        'ItemDetails.View',
        'ItemRelations.Correlated.Collection',
        'ItemRelations.Correlated.View',
        'ItemRelations.Related.Collection',
        'ItemRelations.RelatedItem.View',
        'ItemsSearcher.Item.View',
        'ItemsSearcher.View',
        'ListHeader.View',
        'LiveOrder.Line.Model',
        'LiveOrder.Model',
        'Location',
        'Location.Collection',
        'Location.Model',
        'LoginRegister.CheckoutAsGuest.View',
        'LoginRegister.ForgotPassword.View',
        'LoginRegister.Login.View',
        'LoginRegister.Register.View',
        'LoginRegister.Utils',
        'LoginRegister.View',
        'MenuTree.View',
        'Merchandising.View',
        'MyAccountMenu',
        'NavigationHelper',
        'Newsletter.Model',
        'Newsletter.View',
        'Notifications.Order.Promocodes.View',
        'Notifications.Order.View',
        'Notifications.Profile.View',
        'OrderHistory.Details.View',
        'OrderHistory.Item.Actions.View',
        'OrderHistory.Line.Collection',
        'OrderHistory.List.Tracking.Number.View',
        'OrderHistory.List.View',
        'OrderHistory.Packages.View',
        'OrderHistory.Summary.View',
        'OrderWizard.Model',
        'OrderWizard.Module.Address',
        'OrderWizard.Module.Address.Billing',
        'OrderWizard.Module.Address.Shipping',
        'OrderWizard.Module.CartItems',
        'OrderWizard.Module.CartItems.PickupInStore',
        'OrderWizard.Module.CartItems.PickupInStore.List',
        'OrderWizard.Module.CartItems.Ship',
        'OrderWizard.Module.CartSummary',
        'OrderWizard.Module.Confirmation',
        'OrderWizard.Module.MultiShipTo.EnableLink',
        'OrderWizard.Module.MultiShipTo.Package.Creation',
        'OrderWizard.Module.MultiShipTo.Package.List',
        'OrderWizard.Module.MultiShipTo.Select.Addresses.Shipping',
        'OrderWizard.Module.MultiShipTo.Shipmethod',
        'OrderWizard.Module.NonShippableItems',
        'OrderWizard.Module.PaymentMethod',
        'OrderWizard.Module.PaymentMethod.Creditcard',
        'OrderWizard.Module.PaymentMethod.GiftCertificates',
        'OrderWizard.Module.PaymentMethod.Invoice',
        'OrderWizard.Module.PaymentMethod.PurchaseNumber',
        'OrderWizard.Module.PaymentMethod.Selector',
        'OrderWizard.Module.PromocodeForm',
        'OrderWizard.Module.PromocodeNotifications',
        'OrderWizard.Module.RegisterEmail',
        'OrderWizard.Module.RegisterGuest',
        'OrderWizard.Module.Shipmethod',
        'OrderWizard.Module.ShowPayments',
        'OrderWizard.Module.ShowShipments',
        'OrderWizard.Module.SubmitButton',
        'OrderWizard.Module.TermsAndConditions',
        'OrderWizard.Module.Title',
        'OrderWizard.Router',
        'OrderWizard.Step',
        'Overview.Home.View',
        'Overview.Shipping.View',
        'PaymentInstrument.CreditCard.Edit.Form.View',
        'PaymentInstrument.CreditCard.View',
        'PaymentWizard.Module.Confirmation',
        'PaymentWizard.Module.ConfirmationSummary',
        'PaymentWizard.Module.CreditTransaction',
        'PaymentWizard.Module.Invoice',
        'PaymentWizard.Module.PaymentMethod.Creditcard',
        'PaymentWizard.Module.PaymentMethod.Selector',
        'PaymentWizard.Module.ShowCreditTransaction',
        'PaymentWizard.Module.ShowInvoices',
        'PaymentWizard.Module.ShowPayments',
        'PaymentWizard.Module.Summary',
        'PickupInStore.FulfillmentOptions.View',
        'PickupInStore.View',
        'PluginContainer',
        'PrintStatement.View',
        'Product.Model',
        'Product.Option.Model',
        'ProductComparison.Helper',
        'ProductDetailToQuote.View',
        'ProductDetails.Base.View',
        'ProductDetails.Component',
        'ProductDetails.Full.View',
        'ProductDetails.ImageGallery.View',
        'ProductDetails.Information.View',
        'ProductDetails.Options.Selector.Pusher.View',
        'ProductDetails.Options.Selector.View',
        'ProductDetails.Quantity.View',
        'ProductDetails.QuickView.View',
        'ProductLine.Common.Url',
        'ProductLine.Sku.View',
        'ProductLine.Stock.View',
        'ProductLine.StockDescription.View',
        'ProductList.Control.View',
        'ProductList.DetailsLaterMacro.View',
        'ProductList.Edit.View',
        'ProductList.Item.Edit.View',
        'ProductList.Item.Model',
        'ProductList.Model',
        'ProductReviews.Center.View',
        'ProductViews.Option.View',
        'ProductViews.Price.View',
        'Profile.Information.View',
        'Profile.Model',
        'Profile.Router',
        'QuantityPricing.Utils',
        'QuantityPricing.View',
        'QuickAdd.Item.View',
        'QuickAdd.ItemsSearcher.Plugins',
        'QuickAdd.Model',
        'QuickAdd.View',
        'QuickOrder.View',
        'Quote',
        'Quote.Details.View',
        'Quote.List.View',
        'Quote.ListExpirationDate.View',
        'QuoteToSalesOrderWizard.Module.Confirmation',
        'QuoteToSalesOrderWizard.Module.PaymentMethod.Selector',
        'QuoteToSalesOrderWizard.Module.QuoteDetails',
        'QuoteToSalesOrderWizard.Router',
        'Receipt.Details.View',
        'RecordViews.Actionable.View',
        'RecordViews.View',
        'ReferenceMap',
        'ReorderItems.Actions.AddToCart.View',
        'ReorderItems.Actions.Quantity.View',
        'RequestQuoteWizard.Configuration',
        'RequestQuoteWizard.Module.Comments',
        'RequestQuoteWizard.Module.Confirmation',
        'RequestQuoteWizard.Module.Header',
        'RequestQuoteWizard.Module.Items',
        'RequestQuoteWizard.Module.Message',
        'RequestQuoteWizard.Module.QuickAdd',
        'ReturnAuthorization.Collection',
        'SC.Configuration',
        'SC.MyAccount.Layout',
        'SC.Shopping.Configuration',
        'Session',
        'Singleton',
        'SiteSearch.View',
        'SocialSharing.Flyout.Hover.View',
        'SocialSharing.Flyout.View',
        'Tracker',
        'Transaction.Collection',
        'Transaction.Line.Model',
        'Transaction.Line.Views.Cell.Actionable.Expanded.View',
        'Transaction.Line.Views.Cell.Actionable.View',
        'Transaction.Line.Views.Cell.Navigable.View',
        'Transaction.Line.Views.Cell.Selectable.View',
        'Transaction.Line.Views.Option.View',
        'Transaction.Line.Views.Options.Selected.View',
        'Transaction.Line.Views.Price.View',
        'Transaction.Line.Views.QuantityAmount.View',
        'Transaction.List.View',
        'Transaction.Model',
        'Transaction.Paymentmethod.Model',
        'TransactionHistory.List.View',
        'TransactionHistory.Model',
        'Url',
        'Utilities.ResizeImage',
        'Wizard.Router',
        'Wizard.Step',
        'Wizard.View',
        'bignumber',
        'jQuery.bxSlider',
        'jQuery.scPush',
        'js.cookie',
        'zoom'
    ];

    function mapNames(deps) {
        // Workaround for Modules that changed its name
        for (var i = 0; i < (deps || []).length; i++) {
            var newName = namesMap[deps[i]];
            if (newName) {
                deps[i] = newName;
            }
        }

        return deps;
    }

    function mapModules(modules, deps) {
        for (var i = 0; i < (deps || []).length; i++) {
            var exportedName = modulesMap[deps[i]];
            if (exportedName) {
                modules[i] = modules[i][exportedName];
            }

            if (deps[i] === 'require') {
                modules[i] = require;
            }
        }

        return modules;
    }

    function getNewCallback(deps, callback) {
        function newCallback() {
            var modules = mapModules(arguments, deps);
            return callback && callback.apply(null, modules);
        }

        return newCallback;
    }

    function copyProperties(source, dest) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                dest[property] = source[property];
            }
        }
    }

    function checkCoreModulesUsage(name, deps) {
        if (!(SC.CONFIGURATION || SC.Configuration || {}).isSafeMode) {
            return;
        }

        var coreModules = extLayModules.concat(coreModulesWhiteList);
        var invalidModules = [];
        var warningModules = [];

        for (var i = 0; i < (deps || []).length; i++) {
            var dependency = deps[i];
            var isCoreModule = SC.ENVIRONMENT.JS_MODULE_NAMES.indexOf(dependency) > -1;
            var isWhiteListed = coreModules.indexOf(dependency) > -1;

            if (isCoreModule && !isWhiteListed) {
                invalidModules.push(dependency);
            } else if (coreModulesWhiteList.indexOf(dependency) > -1) {
                warningModules.push(dependency);
            }
        }

        if (invalidModules.length || warningModules.length) {
            var msg =
                'Extension ' +
                name.replace(/^([^.]+\.[^.]+)\..*$/, '$1') +
                (invalidModules.length
                    ? ' has not been loaded due to is using private core modules'
                    : ' uses private core modules') +
                ' and that might break your site.\nIts ' +
                name +
                ' module is using:\n\t' +
                (invalidModules.length ? invalidModules : warningModules).join(', ') +
                '\nSafe Mode is on. It can be turn off in SC Configuration: Advanced/Extensions';

            if (invalidModules.length) {
                throw new Error(msg);
            }
            console.warn(msg);
        }
    }

    require = function(deps, callback, failCallback) {
        if (deps.splice) {
            deps = mapNames(deps);
            return srcRequire(deps, getNewCallback(deps, callback), failCallback);
        }

        var newName = mapNames([deps])[0];
        var module = srcRequire(newName);
        return mapModules([module], [newName])[0];
    };

    define = function(name, deps, callback) {
        if (typeof name !== 'string' || SC.ENVIRONMENT.JS_MODULE_NAMES.indexOf(name) !== -1) {
            return srcDefine.call(null, name, deps, callback);
        }

        checkCoreModulesUsage(name, deps);

        deps = mapNames(deps);

        // Workaround for the other affected modules
        var newCallback = getNewCallback(deps, callback);

        if (typeof name !== 'string') {
            // Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
            // This module may not have dependencies
            if (!deps.splice) {
                callback = deps;
                deps = null;
                return srcDefine.call(null, newCallback);
            }
            return srcDefine.call(null, deps, newCallback);
        }
        return srcDefine.call(null, name, deps, newCallback);
    };

    copyProperties(srcDefine, define);
    copyProperties(srcRequire, require);
})();
