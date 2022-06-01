{{#if showBackToAccount}}
	<a href="/" class="subscriptions-list-button-back">
		<i class="subscriptions-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="subscriptions-list">
	<header class="subscriptions-list-title">
		<h2>{{pageHeader}}</h2>
	</header>

        <div data-view="ListHeader.View"></div>

		<div class="subscriptions-list-results-container">
		{{#if isThereAnyResult}}
			<table class="subscriptions-list-results-table">
				<thead class="subscriptions-list-actionable-header">
					<tr>
						<th class="subscriptions-list-title-header-details">
							<span>{{translate 'Plan Name'}}</span>
						</th>
                        <th class="subscriptions-list-title-header-activation-date">
                            <span>{{translate 'Activation'}}</span>
                        </th>
						<th class="subscriptions-list-table-header-row-date">
							<span>{{translate 'Last Billing'}}</span>
						</th>
						<th class="subscriptions-list-table-header-row-date">
							<span>{{translate 'Next Billing'}}</span>
						</th>
						<th class="subscriptions-list-table-header-row-renewal">
							<span>{{translate 'Renewal'}}</span>
						</th>
						<th class="subscriptions-list-title-header-status">
							<span>{{translate 'Status'}}</span>
						</th>
					</tr>
				</thead>
				<tbody data-view="Records.Collection" class="subscriptions-list-collection"></tbody>
			</table>
			{{else}}
                <div class="transaction-history-list-empty-section">
                    <h5>{{translate 'No subscriptions were found'}}</h5>
                </div>
            {{/if}}
		</div>

		{{#if showPagination}}
			<div class="subscriptions-list-paginator">
				<div data-view="GlobalViews.Pagination"></div>
				{{#if showCurrentPage}}
					<div data-view="GlobalViews.ShowCurrentPage"></div>
				{{/if}}
			</div>
		{{/if}}

</section>




{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	hasTerms (Boolean)
	isThereAnyResult (Boolean)
	isLoading (Boolean)
	showPagination (Boolean)
	showBackToAccount (Boolean)

----}}
