define("DSC.SEOContent.DisplayContent.ServiceController", ["ServiceController"], function(
  ServiceController
) {
  "use strict";

  return ServiceController.extend({
    name: "DSC.SEOContent.DisplayContent.ServiceController",

    // The values in this object are the validation needed for the current service.
    options: {
      common: {}
    },

    get: function get() {
      const categoryId = this.request.getParameter("categoryId") || this.data.categoryId;
      const ccData = nlapiLookupField("commercecategory", categoryId, [
        "custrecord_ek_seo_content_details",
      ]);

      return JSON.stringify({
        contentDetails: ccData.custrecord_ek_seo_content_details,
        categoryId: categoryId,
      });
    },

    post: function post() {
      // not implemented
    },

    put: function put() {
      // not implemented
    },

    delete: function() {
      // not implemented
    }
  });
});
