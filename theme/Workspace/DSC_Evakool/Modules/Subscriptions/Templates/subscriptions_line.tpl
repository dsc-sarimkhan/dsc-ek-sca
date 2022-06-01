<section class="subscriptions-line">
    <p class="subscriptions-line-info-card-content subscriptions-line-info-container">
        {{#unless isPhoneDevice}}
            <span class="subscriptions-line-status" data-view="StatusView"></span>
        {{/unless}}
        <span class="subscriptions-line-info-card-content">
            <a data-id="{{subscriptionLineNumber}}" data-action="change" class="subscriptions-line-button-edit">
                {{name}}
            </a>
        </span>
    </p>
    <div class="subscriptions-line-price" data-view="Pricing.View"></div>
    <p class="subscriptions-line-info-card-content subscriptions-line-info-container">
        <span class="subscriptions-line-type">{{translate 'Type'}}: <strong>{{type}}</strong></span>
        {{#unless isChargeTypeUsage}}
            <span class="subscriptions-line-quantity">{{translate 'Quantity'}}: <strong>{{quantity}}</strong></span>
        {{/unless}}
        {{#if isLineTypeOptional}}
            <span class="subscriptions-line-added">{{translate 'Added'}}: <strong>{{startDate}}</strong></span>
        {{/if}}
        {{#if isPhoneDevice}}
            <span class="subscriptions-line-status" data-view="StatusView"></span>
        {{/if}}
    </p>
</section>
