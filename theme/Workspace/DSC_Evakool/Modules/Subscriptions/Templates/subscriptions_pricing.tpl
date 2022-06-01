<div class="subscriptions-pricing{{#if isFullMode}} fullMode{{/if}}">
    <div class="subscriptions-pricing-wrapper">
        <span class="subscriptions-pricing-title">{{translate option}} </span>
        <span class="subscriptions-pricing-price">{{defaultPrice}} </span>
        <span class="subscriptions-pricing-type">{{translate type}} </span>
        {{#unless showMinimum}}
        <span class="subscriptions-pricing-frequency">{{translate frequency}}</span>
        {{/unless}}
    </div>
    {{#if isFullMode}}
        {{#if showMinimumMaximum}}
        <div class="subscriptons-pricing-minmax-wrapper">
            {{#if showMinimum}}
            <div class="subscriptions-pricing-minimum">
                <span class="subscriptions-pricing-minimum-title">{{translate 'Minimum'}}</span>
                <span class="subscriptions-pricing-minimum-price">{{minimumValue}}</span>
            </div>
            {{/if}}
            {{#if showMaximum}}
            <div class="subscriptions-pricing-maximum">
                <span class="subscriptions-pricing-maximum-title">{{translate 'Maximum'}}</span>
                <span class="subscriptions-pricing-maximum-price">{{maximumValue}}</span>
            </div>
            {{/if}}
        </div>
        {{/if}}
        <div class="subscriptions-pricing-details-wrapper">
            <h4>Pricing details</h4>
            <table>
                <thead>
                    <tr>
                        <th class="quantity-pricing-table-header-quantity">{{translate pricingColumnTitle}}</th>
                        <th class="quantity-pricing-table-header-price">{{translate 'Price'}}</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each priceSchedule}}
                        {{#if show_as_number}}
                            <tr>
                                <td class="quantity-pricing-table-body-quantity">{{maximumquantity}}</td>
                                <td class="quantity-pricing-table-body-price">{{price_formatted}}</td>
                            </tr>
                        {{else}}
                            <tr>
                                {{#if maximumquantity}}
                                    <td class="quantity-pricing-table-body-quantity">{{tdPreppend}}{{minimumquantity}} - {{maximumquantity}}</td>
                                    {{#if is_range}}
                                        <td class="quantity-pricing-table-body-price">{{price_range.min_formatted}} - {{price_range.max_formatted}}</td>
                                    {{else}}
                                        <td class="quantity-pricing-table-body-price">{{price_formatted}} {{tdAppend}}</td>
                                    {{/if}}
                                {{else}}
                                    <td class="quantity-pricing-table-body-quantity">{{tdPreppend}} {{minimumquantity}}</td>
                                    {{#if is_range}}
                                        <td class="quantity-pricing-table-body-price">{{price_range.min_formatted}} - {{price_range.max_formatted}} {{tdAppend}}</td>
                                    {{else}}
                                        <td class="quantity-pricing-table-body-price">{{price_formatted}} {{tdAppend}}</td>
                                    {{/if}}
                                {{/if}}
                            </tr>
                        {{/if}}
                    {{/each}}
                </tbody>
            </table>
        </div>
    {{/if}}
</div>
