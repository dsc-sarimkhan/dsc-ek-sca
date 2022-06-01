/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="ProductDetails.ImageGallery.View"/>

import * as _ from 'underscore';
import '../../../Commons/Utilities/JavaScript/zoom';
import '../../../Commons/Utilities/JavaScript/jQuery.bxslider.custom';
import * as product_details_image_gallery_tpl from 'product_details_image_gallery.tpl';
import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';

import BackboneCompositeView = require('../../../Commons/Backbone.CompositeView/JavaScript/Backbone.CompositeView');
import resizeImage = require('../../../Commons/Utilities/JavaScript/Utilities.ResizeImage');
import SocialSharingFlyoutHoverView = require('../../../Commons/SocialSharing/JavaScript/SocialSharing.Flyout.Hover.View');
import BackboneView = require('../../../Commons/BackboneExtras/JavaScript/Backbone.View');

// @class ProductDetails.ImageGallery.View @extends Backbone.View
const ProductDetailsImageGalleryView: any = BackboneView.extend({
    template: product_details_image_gallery_tpl,

    initialize: function initialize() {
        BackboneView.prototype.initialize.apply(this, arguments);
        BackboneCompositeView.add(this);

        this.application = this.options.application;

        this.images = this.model.getImages();

        this.model.on(
            'change',
            function() {
                const modelImages = this.model.getImages();
                const forceInitSlider = true;
                if (!_.isEqual(this.images, modelImages)) {
                    this.images = modelImages;
                    this.render();
                    this.initSliderZoom(forceInitSlider);
                }
            },
            this
        );
        this.isZoomEnabled = SC.CONFIGURATION.isZoomEnabled;
        this.application.getLayout().on('afterAppendView', this.initSliderZoom, this);
        //check if images loaded correctly on PDP else reload page to load images
        this.application.getLayout().on('afterAppendView', this.initImageGallery, this);
    },

    initImageGallery: function initImageGallery(){
        var imageWidth = $("li.product-details-image-gallery-container").eq(1).css('width');
        if(imageWidth && imageWidth == '0px' && this.parentView.el.id.indexOf('QuickView') === -1){
            window.location.reload();
        }
    },

    initSliderZoom: function initSliderZoom(forceInit) {
        if (this.isZoomEnabled) {
            this.initZoom();
        }        
        this.initSlider(forceInit);
    },

    // @method destroy
    // @returns {Void}
    destroy: function destroy() {
        this.model.off('change', this.render, this);
        this.application.getLayout().off('afterAppendView', this.initSliderZoom, this);
        this.application.getLayout().off('afterAppendView', this.initImageGallery, this);
        this._destroy();
    },

    // @method initSlider Initialize the bxSlider
    // @return {Void}
    initSlider: function initSlider(forceInit) {
        if (this.images.length > 1 && (!this.$slider || forceInit === true)) {
            this.$slider = Utils.initBxSlider(this.$('[data-slider]'), {
                buildPager: _.bind(this.buildSliderPager, this),
                startSlide: 0,
                adaptiveHeight: true,
                touchEnabled: true,
                nextText:
                    '<a class="product-details-image-gallery-next-icon" data-action="next-image"></a>',
                prevText:
                    '<a class="product-details-image-gallery-prev-icon" data-action="prev-image"></a>',
                controls: true
            });

            this.$('[data-action="next-image"]').off();
            this.$('[data-action="prev-image"]').off();

            this.$('[data-action="next-image"]').click(_.bind(this.nextImageEventHandler, this));
            this.$('[data-action="prev-image"]').click(
                _.bind(this.previousImageEventHandler, this)
            );
        }
    },

    // @method previousImageEventHandler Handle the clicking over the previous button to show the previous main image. It does it by triggering a cancelable event.
    // @return {Void}
    previousImageEventHandler: function previousImageEventHandler() {
        const self = this;
        const current_index = self.$slider.getCurrentSlide();
        const next_index =
            current_index === 0 ? self.$slider.getSlideCount() - 1 : current_index - 1;

        // IMPORTANT This event is used to notify the ProductDetails.Component that the images have changed
        // @event {ProductDetails.ImageGallery.ChangeEvent} 'afterChangeImage
        self.model
            .cancelableTrigger('beforeChangeImage', {
                currentIndex: current_index,
                nextIndex: next_index
            })
            .then(function() {
                self.$slider.goToPrevSlide();
                self.model.cancelableTrigger('afterChangeImage', next_index);
            });
    },

    // @method nextImageEventHandler Handle the clicking over the next button to show the next main image. It does it by triggering a cancelable event
    // @return {Void}
    nextImageEventHandler: function nextImageEventHandler() {
        const self = this;
        const current_index = self.$slider.getCurrentSlide();
        const next_index =
            current_index === self.$slider.getSlideCount() - 1 ? 0 : current_index + 1;

        // IMPORTANT This event is used to notify the ProductDetails.Component that the images have changed
        // @event {ProductDetails.ImageGallery.ChangeEvent} beforeChangeImage
        self.model
            .cancelableTrigger(
                'beforeChangeImage',
                // @class ProductDetails.ImageGallery.ChangeEvent Image change event information container
                {
                    // @property {Number} currentIndex
                    currentIndex: current_index,
                    // @property {Number} nextIndex
                    nextIndex: next_index
                }
                // @class ProductDetails.ImageGallery.View
            )
            .then(function() {
                self.$slider.goToNextSlide();
                self.model.cancelableTrigger('afterChangeImage', next_index);
            });
    },

    // @property {ChildViews} childViews
    childViews: {
        'SocialSharing.Flyout.Hover': function() {
            return new SocialSharingFlyoutHoverView({});
        }
    },

    // @method initZoom If this.$slider exists, zoom script is already applied.
    // @return {Void}
    initZoom: function() {
        const self = this;
        if (!SC.ENVIRONMENT.isTouchEnabled && !self.$slider) {
            const { images } = this;
            this.$('[data-zoom]:not(.bx-clone)').each(function(slide_index) {
                self.$(this).zoom(resizeImage(images[slide_index].url, 'zoom'), slide_index);
            });
        }
    },

    // @method buildSliderPager
    // @param {Number} slide_index
    // @return {String}
    buildSliderPager: function(slide_index) {
        const image = this.images[slide_index];
        if (image) {
            return (
                '<img src="' +
                resizeImage(image.url, 'tinythumb') +
                '" alt="' +
                image.altimagetext +
                '">'
            );
        }
    },

    // @method getContext
    // @returns {ProductDetails.ImageGallery.View.Context}
    getContext: function() {
        var DEFAULT_IMAGE = "https://6457383.secure.netsuite.com/core/media/media.nl?id=228826&c=6457383&h=eF0sFVSmu7ZSBYuCqHNPwUS03HNXM6Mjr5YlPrAOxwsCQZCt";
        if(this.model.get('item').get('custitem_product_video')){      
            var obj = {
                "iframe": this.model.get('item').get('custitem_product_video'),
                "url": this.model.get('item').get('custitem_product_vid_thumbnail') ? this.model.get('item').get('custitem_product_vid_thumbnail') :DEFAULT_IMAGE
            }
            this.images.push(obj);
        }
        // @class ProductDetails.ImageGallery.View.Context
        return {
            // @property {String} imageResizeId
            imageResizeId: Utils.getViewportWidth() < 768 ? 'thumbnail' : 'main',
            // @property {Array<ImageContainer>} images
            images: this.images || [],

            // @property {ImageContainer} firstImage
            firstImage: this.images[0] || {},
            // @property {Boolean} showImages
            showImages: this.images.length > 0,
            // @property {Boolean} showImageSlider
            showImageSlider: this.images.length > 1
        };
        // @class ProductDetails.ImageGallery.View
    }
});

export = ProductDetailsImageGalleryView;