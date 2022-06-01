/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="jQuery.overflowing"/>

import * as jQuery from '../../Core/JavaScript/jQuery';

(<any>jQuery.fn).overflowing = function(options, callback) {
    const self = this;
    const overflowed = [];
    const hasCallback = !!(callback && typeof callback === 'function');
    let status = false;
    this.options = options || window;

    this.each(function() {
        const $this = jQuery(this);
        const elPosition = $this.position();
        const elWidth = $this.width();
        const elHeight = $this.height();
        const parents = <any>$this.parentsUntil(self.options);
        const $parentsTo = jQuery(self.options);

        parents.push($parentsTo);

        for (let i = 0; i < parents.length; i++) {
            const parentPosition = jQuery(parents[i]).position();
            const parentWidth = jQuery(parents[i]).width();
            const parentHeight = jQuery(parents[i]).height();

            if (
                elPosition.top < 0 ||
                elPosition.left < 0 ||
                elPosition.top > parentHeight + parentPosition.top ||
                elPosition.left > parentWidth + parentPosition.left ||
                elPosition.top + elHeight > parentHeight + parentPosition.top ||
                elPosition.left + elWidth > parentWidth + parentPosition.left
            ) {
                status = true;
                jQuery(parents[i]).addClass('overflowed');
                overflowed.push(parents[i]);
                if (hasCallback) {
                    callback(parents[i]);
                }
            }
        }

        if ($this.parents(self.options).hasClass('overflowed')) {
            $this.addClass('overflowing');
        }
    });

    if (!hasCallback) {
        return overflowed.length > 1 ? overflowed : status;
    }
};

const jQueryOverflowingModule = (<any>jQuery.fn).overflowing;
export = jQueryOverflowingModule;
