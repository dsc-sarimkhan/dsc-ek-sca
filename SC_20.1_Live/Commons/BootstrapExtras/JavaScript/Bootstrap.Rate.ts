/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Bootstrap.Rate"/>

import * as $ from '../../Core/JavaScript/jQuery';

const Rater = function(element, options) {
    this.init(element, options);
};

Rater.prototype = {
    init: function(element, options) {
        this.options = options;
        this.$element = $(element);

        // The element that displays the rating selection
        this.$fill = this.$element.children('.global-views-star-rating-area-fill');

        const data = this.$element.data();

        this.max = data.max;
        this.value = data.value;

        // used as an identifier from the outside
        this.name = data.name;

        if (this.value) {
            this.setValue(data.value, true);
        }

        this.listen();
    },

    listen: function() {
        const self = this;

        // The .rater and .data-api are namespacing convention
        this.$element
            .on('click.rater.data-api', function(e) {
                self.handleClick.call(self, e);
            })
            .on('mousemove.rater.data-api', function(e) {
                self.handleMouseMove.call(self, e);
            })
            .on('mouseleave.rater.data-api', function(e) {
                self.handleMouseLeave.call(self, e);
            });
    },

    handleClick: function(e) {
        e.preventDefault();

        // our rating area is composed by buttons
        // when one is clicked, we set its value to this
        if (e.target.tagName.toLowerCase() === 'button') {
            this.setValue(e.target.value);
        }
    },

    handleMouseMove: function(e) {
        e.preventDefault();

        // our rating area is composed by buttons
        // when one is hovered, we fill the bar with that value
        if (e.target.tagName.toLowerCase() === 'button') {
            this.setFillStatus(e.target.value);
        }
    },

    handleMouseLeave: function() {
        // on mouse leave we reset the value
        this.setFillStatus(this.value);
    },

    setValue: function(value, silent) {
        this.value = typeof value === 'number' ? Math.round(value) : parseInt(value, 10);

        // we set the value so it can be listened from the outside
        this.$element.data('value', this.value);
        // then fill the rating selection with that value
        this.setFillStatus(this.value);

        !silent && this.$element.trigger('rate', this);
    },

    setFillStatus: function(value) {
        if (this.$element.hasClass('global-views-star-rating-area-review-mode')) {
            const starsToFill = this.$fill.children().children();

            starsToFill.each(function(index: any, element: any) {
                if (index < value) {
                    $(element).css('visibility', 'visible');
                } else {
                    $(element).css('visibility', 'hidden');
                }
            });
        } else {
            // the percentage value is calculated
            // and the area to be filled is filled
            this.$fill.css('width', (value * 100) / this.max + '%');
        }
    }
};

/* RATER PLUGIN DEFINITION
 * ======================= */

// standar jQuery plugin definition
(<any>$.fn).rater = function(options) {
    return this.each(function() {
        const $this = $(this);
        let data = $this.data('rater');

        if (!data) {
            $this.data('rater', (data = new Rater(this, options)));
        }
    });
};

(<any>$.fn).rater.Constructor = Rater;

(<any>$.fn).rater.defaults = {};

/* Rater DATA-API
 * ============== */

$(window).on('load', () => {
    (<any>$('[data-toggle="rater"]')).rater();
});

export = Rater;
