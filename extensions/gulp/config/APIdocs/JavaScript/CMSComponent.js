/**
 * The CMS component lets you work with Site Management Tools. Use this component to register a new custom content type at application startup. See {@link CustomContentTypeBaseView}. Get an instance of this component by calling `container.getComponent("CMS")`.
 * @extends BaseComponent
 * @hideconstructor
 * @global
 */
class CMS extends BaseComponent {
    /**
     * Registers a new custom content type (CCT) in the application.
     * @param {RegisterCustomContentType} cct An object with two required properties, `id` and `view`, to register the custom content type.
     * 
     * ```javascript
     *          var cct = container.getComponent('CMS');
     * cct.registerCustomContentType({
     *  id: 'cct_acmeinc_slideshow',
     *  view: CCTSlideshowView
     * });
     * ```
     */
    registerCustomContentType (cct)
    {
        return null;
    }
}

/**
 * @typedef {Object} RegisterCustomContentType
 * @property {String} id The ID of the CCT to be registered. IDs must be unique per account/domain. 
 * @property {CustomContentTypeBaseView} view View class that implements the CCT.
 */