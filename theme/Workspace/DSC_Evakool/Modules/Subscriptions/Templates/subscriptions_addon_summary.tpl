{{#if showSummaryContainer}}
    <div class="subscriptions-addon-summary-container">

        {{#if hasItemPrice}}
            <h3 class="subscriptions-addon-summary-title">Summary</h3>
            <div class="subscriptions-addon-summary-subtotal-wrapper">
                <h4 class="subscriptions-addon-summary-subtotal">{{translate 'Subtotal'}}</h4>
                <p class="subscriptions-addon-summary-grid-float">
                    <span class="subscriptions-addon-summary-grid-left">{{itemQuantity}} {{translate 'item'}}(s)</span>
                    <span class="subscriptions-addon-summary-grid-right">{{itemPrice}}</span>
                </p>
            </div>

            {{#if hasDiscount}}
                <div class="subscriptions-addon-summary-discount">
                    <span class="subscriptions-addon-summary-grid-left">{{translate 'Discount '}} {{discount}}</span>
                    <span class="subscriptions-addon-summary-grid-right">{{discountedValue}}</span>
                </div>
            {{/if}}

            <div class="subscriptions-addon-summary-total">
                <p class="subscriptions-addon-summary-grid-float">
                    {{translate 'Total'}} <span class="subscriptions-addon-summary-grid-right">{{itemPriceTotal}}</span>
                    <span class="subscriptions-addon-summary-grid-right subscriptions-addon-summary-frequency"><small>{{frequency}}</small></span>
                </p>
            </div>

        {{else}}

            <div class="subscriptions-addon-summary-discount is-by-usage">
                <span class="subscriptions-addon-summary-grid-left">{{discount}} {{translate 'discount will be applied at billing.'}}</span>
            </div>
        {{/if}}

    </div>
{{/if}}
