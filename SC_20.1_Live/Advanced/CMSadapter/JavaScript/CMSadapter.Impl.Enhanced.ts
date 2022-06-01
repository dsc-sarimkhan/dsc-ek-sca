/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="CMSadapter.Impl.Enhanced"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import * as jQuery from '../../../Commons/Core/JavaScript/jQuery';
/*

@module CMSadapter
@class CMSadapterImpl.Enhanced the class that  the enhanced pages of CMS
*/

function AdapterEnhanced(application, router) {
    this.application = application;
    this.router = router;

    const self = this;
    const layout = application.getLayout();
    const show_content_wrapper = function(fn, view) {
        const promise = jQuery.Deferred();
        const args = arguments;
        const page = router && router.getPageForFragment();

        view.enhancedPage = true;

        const pageTypeComponent = application.getComponent('PageType');
        const pageContext = pageTypeComponent.getContext();
        const pageType = pageTypeComponent._getPageType(pageContext.page_type);

        const pageTypeTemplate = pageType && pageType.get('template');
        const pageTemplate = String(page && page.get('template') || '').trim();

        const templateKey = (pageTemplate !== 'default' && pageTemplate) || pageTypeTemplate || '';

        if (templateKey) {
            let template;

            try {
                template = Utils.requireModules(templateKey);
            } catch (error) {}

            if (template) {
                view.template = template;
            }
        }

        // Calls the original function with all the parameters (slice to exclude fn)
        fn.apply(layout, Array.prototype.slice.call(args, 1)).done(function() {
            // once the original function is done this reads the attributes of the view and
            // sets title, metas and adds banners
            self.enhancePage(view, layout, page);

            // only after enhancing the view we resolve the promise
            promise.resolveWith(this, arguments);
        });

        return promise;
    };

    // Wraps the layout.showContent and Layout.showInModal methods
    // This make sure that every time you try to show content in the
    // application the page will be enhanced by setting title, header, meta tags and banners
    layout.showContent = _.wrap(layout.showContent, show_content_wrapper);
    layout.showInModal = _.wrap(layout.showInModal, show_content_wrapper);
}

_.extend(AdapterEnhanced.prototype, {
    enhancePage: function(view, _layout, page) {
        const $head = jQuery('head');

        // first, initialize head tags if they are not present
        $head
            .not(':has(title)')
            .append('<title/>')
            .end()
            .not(':has(link[rel="canonical"])')
            .append('<link rel="canonical"/>')
            .end()
            .not(':has(meta[name="keywords"])')
            .append('<meta name="keywords"/>')
            .end()
            .not(':has(meta[name="description"])')
            .append('<meta name="description"/>')
            .end();

        view.title = (page && page.get('page_title')) || view.getTitle();
        view.metaDescription = (page && page.get('meta_description')) || view.getMetaDescription();
        view.metaKeywords = (page && page.get('meta_keywords')) || view.getMetaKeywords();

        // set title in DOM
        const title = view.getTitle();

        if (title) {
            document.title = title;
        }

        // Sets the text of the title element if we are in the server
        // we only do it on the server side due to an issue modifying
        // the title tag on IE :(
        if (SC.ENVIRONMENT.jsEnvironment === 'server') {
            $head.find('title').text(title);
        }

        // meta keywords and meta description. We aren't adding the tags but reusing existing ones
        $head
            .find('meta[name="description"]')
            .attr('content', view.metaDescription || view.getMetaDescription())
            .end()
            .find('meta[name="keywords"]')
            .attr('content', view.metaKeywords || view.getMetaKeywords())
            .end()
            .append(
                view
                    .getMetaTags()
                    .not('[name="description"]')
                    .not('[name="keywords"]')
            );

        $head
            .find('link[rel="canonical"]')
            .attr('href', view.getCanonical())
            .end()
            // we remove any existing next/prev tags every time
            // a page is rendered in case the previous view was paginated
            .find('link[rel="next"], link[rel="prev"]')
            .remove();

        // if the current page is paginated
        // set prev/next link rel
        this.setLinkRel('prev', view.getRelPrev(), $head);
        this.setLinkRel('next', view.getRelNext(), $head);

        // addition to head. Heads up! Each element added is stored and when the view is destroyed we remove these
        // elements from the DOM. If not the head will be polluted each time the user navigates.
        const additionToHead = (page && page.get('addition_to_head')) || view.getAddToHead();

        view.enhancedNodes = [];

        if (additionToHead && String(additionToHead + '').trim()) {
            const $additionToHead = jQuery(additionToHead);
            $additionToHead.each(function() {
                const $node = jQuery(this);
                $head.append($node);
                view.enhancedNodes.push($node);
            });
        }

        view.destroy = _.wrap(view.destroy, function(fn) {
            const args = Array.prototype.slice.call(arguments, 1);
            fn.apply(this, args);

            _.each(this.enhancedNodes, function($node: any) {
                $node.remove();
            });
        });
    },

    setLinkRel: function(rel, link, $head) {
        link &&
            jQuery('<link />', {
                rel: rel,
                href: link
            }).appendTo($head);
    }
});

export = AdapterEnhanced;
