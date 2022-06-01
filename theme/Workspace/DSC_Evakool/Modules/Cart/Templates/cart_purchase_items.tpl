<aside class="item-relations-correlated">
    <h2>You have purchased</h2>
    <div class="item-relations-correlated-row">
        <br>
        <div class="bx-wrapper" style="max-width: 1140px;">
            <div class="bx-viewport" aria-live="polite">
                <ul class="item-relations-row" data-type="carousel-items"
                    style="width: 10215%; position: relative; transition-duration: 0s; transform: translate3d(-1140px, 0px, 0px);">
                    {{#each cartItem}}
                    <li class="item-relations-cell bx-clone"
                        style="float: left; list-style: none; position: relative; width: 228px;" aria-hidden="true">
                        <div itemprop="itemListElement" data-item-id="{{itemId}}" data-track-productlist-list=""
                            data-track-productlist-category="" data-track-productlist-position="" data-sku="{{sku}}">
                            <a {{{fullLink}}}>
                                {{#ifEquals free_gift true}}
                                <span class="cart-lines-free-badge">{{translate 'FREE'}}</span>
                                {{/ifEquals}}
                                <img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
                            </a>
                            <a {{{fullLink}}} class="cart-lines-name">
                                <span itemprop="name">{{itemname}}</span>
                            </a>
                            <br>
                            <div class="item-relations-related-item-price">
                                <!-- <span class="product-views-price-lead" itemprop="price">{{price.price_formatted}}</span> -->
                                <div class="product-views-price-lead cart-item-summary-item-list-actionable-amount">
                                    <span class="cart-item-summary-amount-value">{{totalFormatted}}</span>&nbsp;
                                    {{#ifEquals showcompareprice true}}
                                    <small
                                        class="muted cart-item-summary-item-view-old-price">{{amount_formatted}}</small>
                                    {{/ifEquals}}
                                </div>
                            </div>
                        </div>
                    </li>
                    {{/each}}
                </ul>
            </div>
        </div>
    </div>
</aside>