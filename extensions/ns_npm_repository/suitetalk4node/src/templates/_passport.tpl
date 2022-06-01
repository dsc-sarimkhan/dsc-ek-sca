<ns:tokenPassport actor="http://schemas.xmlsoap.org/soap/actor/next" mustUnderstand="0" xmlns:ns="urn:messages_2020_1.platform.webservices.netsuite.com">
   {{#if credentials.account}}<ns:account>{{credentials.account}}</ns:account>{{/if}}
   {{#if credentials.consumerKey}}<ns:consumerKey>{{credentials.consumerKey}}</ns:consumerKey>{{/if}}
   {{#if credentials.token}}<ns:token>{{credentials.token}}</ns:token>{{/if}}
   {{#if credentials.nonce}}<ns:nonce>{{credentials.nonce}}</ns:nonce>{{/if}}
   {{#if credentials.timestamp}}<ns:timestamp>{{credentials.timestamp}}</ns:timestamp>{{/if}}
   {{#if credentials.signature}}<ns:signature algorithm="HMAC_SHA256">{{credentials.signature}}</ns:signature>{{/if}}
</ns:tokenPassport>

{{#if credentials.applicationId}}
<nsmessages:applicationInfo>
	<nscore:applicationId>{{credentials.applicationId}}</nscore:applicationId>
</nsmessages:applicationInfo>
{{/if}}
