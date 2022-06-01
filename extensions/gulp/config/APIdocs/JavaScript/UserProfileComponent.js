/**
 * The UserProfile component enables you to retrieve information about the current web store visitor. The information available depends on whether the visitor is currently logged in, is a registered user but is not logged in, or is an unregistered user.
 * 
 * Create an instance of this component by calling `container.getComponent("UserProfile")`.
 * 
 * @extends BaseComponent
 * @since SuiteCommerce 2019.1
 */
class UserProfile extends BaseComponent {

    /**
     * Gets read-only credit card information associated with the customer who is currently logged in. You can only use this method on a secure domain; if you use it on a non-secure domain, it returns an error.
     * 
     * In the following example, `getCreditCards()` is used to obtain all credit cards. We then check if any of the credit cards have expired based on the `expirationDate` property of each card in the returned array.  
     * 
     * ```javascript
     *          // Basic validation of credit card expiry date. Returns True if credit card has expired.
     * function creditCardExpired(ccDate) {
     *  var now = new Date();
     *  var currentMonth = now.getMonth() + 1;
     *  var currentYear = now.getFullYear();
     *  var regExpCard = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
     *  var regExpCardMatched = ccDate.match(regExpCard);
     *  var ccCardMonth = regExpCardMatched[1];
     *  var ccCardYear = regExpCardMatched[3];
     *
     *  if (ccCardYear < currentYear) {
     *      return true;
     *  }
     *  else if (ccCardMonth <= currentMonth) {
     *      return true;
     *  }
     *  else {
     *      return false;
     *  }
     * }
     * 
     * var userProfile = container.getComponent('UserProfile');
     * 
     * userprofile.getCreditCards().then(function(creditCards) {
     * 
     *  for (i = 0; i <= creditCards.length; i++) {
     * 
     *      if (creditCardExpired(creditCards[i].expirationDate)) {
     *          alert("Credit card " + creditCards[i].number + " has expired.");
     *          break;
     *      }
     *  }
     * }).fail(function(error) {
     *  console.log(error);
     * });
     * ```
     * @since SuiteCommerce 2021.1
     * @returns {Array<CreditCardData>} Returns a Deferred object. If the promise is resolved, it returns an array of {@link CreditCardData} objects. If the user is not logged in, it returns an empty array. If the promise is rejected, it returns an error. 
     */
    getCreditCards() {
        return null;
    }

    /**
     * Gets read-only information about the current web store visitor. If the visitor is logged in as a user, you can get details such as the user's first name and last name, the user's addresses, credit limit, current balance, and more. Refer to the UserProfileData object for a list of all properties.
     * 
     * If a web store visitor is not logged in, this method returns a smaller set of properties. Note that visitors may be recognised even if they are not logged in. You can check for this with the `isrecognized` property of the UserProfileData object.
     * 
     * This method returns a predefined set of fields from the customer record in NetSuite, as specified in the `UserProfileData` object definition. It may also return custom fields from the customer record. Custom fields are returned only if the Web Site box is checked on the Applies To tab on the custom field record. See {@link https://system.netsuite.com/app/help/helpcenter.nl?topic=EDIT_CUSTENTITYFIELD|Creating a Custom Field} in the NetSuite Help Center for more information about how to create custom fields.
     * 
     * ```javascript
     * var userprofilecomponent = container.getComponent("UserProfile");
     * 
     * userprofilecomponent.getUserProfile().then(function(profile) {
     *     firstname = profile.firstname;
     *     lastname = profile.lastname;
     *     fullname = firstname + " " + lastname;
     * 
     *     console.log("User: Full Name: " + fullname);
     * });
     * ```
     * 
     * @since SuiteCommerce 2019.1
     * @returns {UserProfileData} Returns a Deferred object. If the promise is resolved, it returns a UserProfileData object with a set of predefined properties. Otherwise, the promise is rejected. 
     */
    getUserProfile() {
        return null;
    }
}

// DATA TYPE DEFINITIONS
// ---------------------

/**
 * Holds the information of a customer credit card, including the card holder name, expiry date, and a truncated form of the credit card number. This object is returned by the {@link UserProfile#getCreditCards|getCreditCards()} method of the UserProfile component.
 * @typedef {Object} CreditCardData
 * @property {String} expirationDate The expiry date of the credit card.
 * @property {String} images An array of one or more relative paths to images of the credit card type.
 * @property {String} name The name of the credit card holder.
 * @property {String} number The credit card number. Only the last four digits of the card number are displayed.
 * @property {String} paymentMethodId The internal ID of the credit card type.
 * @property {String} paymentMethodKey 
 * @property {String} paymentMethodName The type of credit card, for example, Visa, Mastercard, or American Express.
 */

/**
 * @typedef {Object} UserProfileData Contains a predefined set of properties with information about the logged in user. If the user is not logged in, it contains a smaller set of properties.
 * @property {Array<Address>} addresses An array of addresses. Each address corresponds to an active address on the customer record.
 * @property {Float} balance Refers to the customer's current accounts receivable balance.
 * @property {Array<CampaignSubscription>} campaignsubscriptions The marketing subscriptions to which the user is subscribed. 
 * @property {String} companyname The customer's company name. If the customer type is 'INDIVIDUAL', the company name is blank.
 * @property {Boolean} creditholdoverride Returns `true` if the user's credit hold was removed manually. 
 * @property {Number} creditlimit The maximum currency amount the customer is allowed to accrue in outstanding receivables.
 * @property {Array<CustomEntityField>} customfields An array of all custom fields and their values. All web store custom fields are in the array, regardless of whether they contain a value.
 * @property {String} email The customer's primary email address.
 * @property {Boolean} emailsubscribe Indicates whether the user has subscribed to at least one marketing subscription. 
 * @property {String} firstname The customer's first name.
 * @property {String} internalid The internal identifier of the customer record in NetSuite.
 * @property {Boolean} isguest Indicates if the visitor is a guest user.
 * @property {Boolean} isloggedin Indicates if the visitor is a logged in user.
 * @property {Boolean} isrecognized Indicates whether the visitor is a recognized user.
 * @property {String} language The customer's preferred language.
 * @property {String} lastname The customer's surname.
 * @property {String} middlename The customer's middlename.
 * @property {String} name Corresponds to the Customer ID field on the customer record in NetSuite.
 * @property {PaymentTerm} paymentterms The payment terms assigned to the customer. 
 * @property {PhoneInfo} phoneinfo Lists the customer's phone and fax numbers.
 * @property {String} pricelevel The price level assigned to the customer.
 * @property {String} subsidiary The subsidiary associated with the customer record.
 * @property {String} type Indicates the type of customer. If the user is a person, the value of `type` is 'INDIVIDUAL'. Otherwise, the value of `type` is 'COMPANY'.
 */

/**
 * @typedef {Object} PaymentTerm The payment terms assigned to the customer.
 * @property {String} internalid The internal ID of the (payment) term record.
 * @property {String} name The name of the payment terms, for example, "Net 30 Days".
 */

/**
 * @typedef {Object} PhoneInfo Contains the customer's phone information.
 * @property {String} alphone The customer's alternative phone number.
 * @property {String} fax The customer's fax number.
 * @property {String} phone The customer's main phone number.
 */

/**
 * @typedef {Object} CustomEntityField Refers to a custom field on the customer record.
 * @property {String} id The identifier of the field in NetSuite. Identifiers always start with the string "custentity". For example, a custom phone number field might have the id "custentity_phonenumber", where "_phonenumber" is the field name entered by the NetSuite user when creating the custom field.
 * @property {String} value The value of the field.
 */

/**
 * @typedef {Object} CampaignSubscription A marketing subscription to which the user is subscribed.
 * @property {String} internalid The identifier of the subscription in NetSuite.
 * @property {String} name The name of the subscription.
 * @property {String} description The description of the campaign subscription.
 */

 // EVENTS
 // ------