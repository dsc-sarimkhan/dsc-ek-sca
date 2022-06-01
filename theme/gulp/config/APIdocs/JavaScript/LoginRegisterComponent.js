/**
 * The LoginRegister component lets you create listeners for events that occur on the Log In / Register page in a web store. It also lets you capture additional information from the login or register form when a web store visitor logs in or registers.
 * 
 * You can listen for the following events on the Log In / Register page. The 'before' events let you interrupt the login or registration process, do something else (such as validate input data or call an external API), and depending on the outcome, either cancel the event or let the event complete.
 * * beforeLogin - A cancelable event that occurs before login is completed.
 * * beforeRegister - A cancelable event that occurs before registration is completed.
 * * afterRegister - A cancelable event that occurs after registration is completed.
 * 
 * To capture field input from the login or registration forms, the LoginRegister component utilizes placeholders in the default base theme templates. The placeholders are positioned below the last field in each form. Here are the template files in which you can find the relevant placeholders:   
 * 
 * <table class="table">
 * <tr><th>Form</th><th>Template File</th><th>Placeholder</th></tr>
 * <tr><td>Login</td><td>login_register_login.tpl</td><td>`<div data-view="Login.CustomFields"></div>`</td></tr>
 * <tr><td>Register</td><td>login_register_register.tpl</td><td>`<div data-view="Register.CustomFields"></div>`</td></tr>
 * </table>
 * 
 * Get an instance of this component by calling `container.getComponent("LoginRegisterPage")`;
 * 
 * *Note:* This class has no methods.
 * 
 * @extends VisualComponent
 * @since SuiteCommerce 2019.1
 */
class LoginRegister extends VisualComponent {

}

// EVENTS
// ------

/**
 * A cancelable event triggered before a user is logged in. The event occurs after the Log In button is clicked and before any data is sent to the NetSuite backend. Login data is passed to the event as an object with the following structure:
 * ```javascript
 * {
 *      email: "johnsmith@example.com",
 *      password: "password",
 *      redirect: true
 * }
 * ```
 * 
 * If there are custom fields on the login form, they are passed as additional properties of the object. For example, if a two-factor authentication code field is included on the login form and the value of its name attribute is `twofacode`, the object will include a property called `twofacode`. 
 * *Note*: With the `beforeLogin` event, data from custom fields is discarded and is not saved in NetSuite.
 * ```javascript
 * {
 *      email: "johnsmith@example.com",
 *      password: "password",
 *      redirect: true,
 *      twofacode: "123456"
 * }
 * ```
 * @event LoginRegister#beforeLogin 
 */

/**
 * A cancelable event triggered before a visitor is registered in the system. The event occurs after the Register button is clicked and before any data is sent to the NetSuite backend. Registration data is passed to the event as an object with the following structure:
 * ```javascript
 * {
 * firstname: "John",
 * lastname: "Smith",
 * company: "NetSuite",
 * email: "johnsmith@example.com",
 * password: "123-abc-*&%",
 * password2: "123-abc-*&%",
 * emailsubscribe: "T"
 *  }
 * ```
 * 
 * If there are custom fields on the registration form, they are passed as additional properties of the object. The data from custom fields are persisted in NetSuite, provided the corresponding custom field records exist in the system. The field names on the registration form must match the internal ID of the fields in NetSuite.
 * @event LoginRegister#beforeRegister
 */

/**
 * A cancelable event triggered after registration has been completed successfully. If you use the `afterRegister` event, you must explicitly redirect to the registration success page or to another landing page.
 * 
 * In the following example, the web store visitor is redirected to a different URL if the value of the custom field `custentity_vatno` starts with the string `DE`.
 * ```javascript
 * var loginRegisterPageComponent = container.getComponent('LoginRegisterPage');
 * 
 * if (loginRegisterPageComponent) {
 *      loginRegisterPageComponent.on('afterRegister', function(formFields) {
 *          
 *          if (formFields.custentity_vatno.indexOf('DE') == 0) {
 *              location.href = 'https://example.com/de/';
 *          }
 *          else {
 *              location.href = 'https://example.com/';
 *          }
 *      })
 * }
 * 
 * ```
 * @event LoginRegister#afterRegister
 */

 