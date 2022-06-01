/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Bootstrap.Slider"/>

import * as $ from '../../Core/JavaScript/jQuery';

const Slider = function(element, options) {
    this.init(element, options);
};

Slider.prototype = {
    init: function(element, options) {
        const $element = $(element);
        const $children = $element.children();

        this.$element = $element;
        this.options = options;

        this.values = this.parseValues(options.values, $element.data());
        this.$bar = $children.filter('[data-control="bar"]');

        this.controls = {
            $low: $children.filter('[data-control="low"]'),
            $high: $children.filter('[data-control="high"]')
        };

        this.slideToInitial(true);
        this.listen();
    },

    parseValues: function(defaults, dom_data) {
        const values = {
            min: dom_data.min || defaults.min,
            max: dom_data.max || defaults.max
        };

        $.extend(values, {
            low: Math.max(dom_data.low || defaults.min, values.min),
            high: Math.min(dom_data.high || defaults.high, values.max)
        });

        return values;
    },

    listen: function() {
        const { proxy } = $;

        // handle event for stoplisten 'html'
        this.proxyHandleMouseDown = proxy(this.handleMouseDown, this);
        this.proxyHandleMouseMove = proxy(this.handleMouseMove, this);
        this.proxyHandleMouseUp = proxy(this.handleMouseUp, this);

        this.$element
            .on('mousedown.slider.data-api', this.proxyHandleMouseDown)
            .on('touchstart.slider.data-api', this.proxyHandleMouseDown);

        $('html')
            .on('mousemove.slider.data-api', this.proxyHandleMouseMove)
            .on('touchmove.slider.data-api', this.proxyHandleMouseMove)

            .on('mouseup.slider.data-api', this.proxyHandleMouseUp)
            .on('touchend.slider.data-api', this.proxyHandleMouseUp)
            .on('touchcancel.slider.data-api', this.proxyHandleMouseUp);
    },

    stopListen: function() {
        $('html')
            .off('mousemove.slider.data-api', this.proxyHandleMouseMove)
            .off('touchmove.slider.data-api', this.proxyHandleMouseMove)

            .off('mouseup.slider.data-api', this.proxyHandleMouseUp)
            .off('touchend.slider.data-api', this.proxyHandleMouseUp)
            .off('touchcancel.slider.data-api', this.proxyHandleMouseUp);
    },

    getMinBoundary: function() {
        return this.$element.offset().left;
    },

    getMaxBoundary: function() {
        return this.getMinBoundary() + this.$element.innerWidth();
    },

    handleMouseDown: function(e) {
        if (e.which !== 1 && e.type !== 'touchstart') {
            return;
        }

        const page_x = this.getPageX(e);
        let $target = $(e.target);

        if ($target.is('a') || $target.is('button')) {
            if (this.values.low === this.values.max || this.values.high === this.values.min) {
                $target = this.controls[
                    '$' +
                        (page_x < this.$element.offset().left + this.$element.innerWidth() / 2
                            ? 'high'
                            : 'low')
                ];
            }

            this.$dragging = $target;
            this.$element.trigger('start', this);
        } else {
            this.$dragging = this.getClosestControl(page_x);
            this.slideToValue(this.getSlidValue(page_x));
        }

        e.preventDefault();
    },

    handleMouseMove: function(e) {
        if (!this.$dragging) {
            return;
        }

        const page_x = this.getPageX(e);
        const slid_value = this.getSlidValue(page_x);
        const is_low = this.$dragging.data('control') === 'low';
        const value = Math[is_low ? 'min' : 'max'](
            slid_value,
            this.values[is_low ? 'high' : 'low']
        );

        this.slideToValue(value);

        e.preventDefault();
    },

    handleMouseUp: function(e) {
        if (!this.$dragging) {
            return;
        }

        this.$dragging = null;
        this.$element.trigger('stop', this);

        e.preventDefault();
    },

    getPageX: function(e) {
        const touch =
            e.originalEvent && e.originalEvent.touches
                ? e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]
                : null;
        return touch ? touch.pageX : e.pageX;
    },

    getSlidValue: function(page_x) {
        const minBoundary = this.getMinBoundary();
        const maxBoundary = this.getMaxBoundary();
        const location =
            page_x > maxBoundary ? maxBoundary : page_x < minBoundary ? minBoundary : page_x;

        return (
            ((location - minBoundary) / this.$element.innerWidth()) * this.getSizeInValue() +
            this.values.min
        );
    },

    getClosestControl: function(page_x) {
        const value = this.getSlidValue(page_x);
        const distance_low = Math.abs(this.values.low - value);
        const distance_high = Math.abs(this.values.high - value);
        const { $low } = this.controls;

        if (distance_low !== distance_high) {
            return distance_low < distance_high ? $low : this.controls.$high;
        }
        return page_x < $low.offset().left ? $low : this.controls.$high;
    },

    getSizeInValue: function() {
        return this.values.max - this.values.min;
    },

    moveControl: function($control, value) {
        return $control.css({
            left: ((value - this.values.min) * 100) / this.getSizeInValue() + '%'
        });
    },

    resizeBar: function() {
        return this.$bar.css({
            left: ((this.values.low - this.values.min) * 100) / this.getSizeInValue() + '%',
            width: ((this.values.high - this.values.low) / this.getSizeInValue()) * 100 + '%'
        });
    },

    slideToInitial: function(trigger) {
        this.slideControls();
        this.resizeBar();

        if (trigger) {
            this.$element.trigger('slide', this);
        }
    },

    slideControls: function() {
        this.moveControl(this.controls.$low, this.values.low);
        this.moveControl(this.controls.$high, this.values.high);
    },

    slideToValue: function(value) {
        const is_low = this.$dragging.data('control') === 'low';
        this.values[is_low ? 'low' : 'high'] = value;

        this.moveControl(this.$dragging, value);
        this.resizeBar();

        this.$element.trigger('slide', this);
    }
};

/* SLIDER PLUGIN DEFINITION
 * ======================== */

// standar jQuery plugin definition
(<any>$.fn).slider = function(option) {
    return this.each(function() {
        const $this = $(this);
        let data = $this.data('slider');

        // if it wasn't initialized, we do so
        if (!data) {
            // we extend the passed options with the default ones
            var options = $.extend(
                {},
                (<any>$.fn).slider.defaults,
                typeof option === 'object' && options
            );
            $this.data('slider', (data = new Slider(this, options)));
        }
    });
};

(<any>$.fn).slider.Constructor = Slider;

(<any>$.fn).slider.defaults = {
    values: {
        min: 0,
        max: 100
    }
};

/* SLIDER DATA-API
 * =============== */

$(window).on('load', function() {
    (<any>$('[data-toggle="slider"]')).slider();
});

export = Slider;
