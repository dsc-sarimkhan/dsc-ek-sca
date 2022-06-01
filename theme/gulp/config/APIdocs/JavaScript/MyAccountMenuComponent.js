/**
 * The MyAccountMenu component lets you add menu groups and menu items to the main menu on the My Account page of a SuiteCommerce webstore. 
 * 
 * You can specify the order in which items appear in the menu by specifying a number in the `index` property. Menu groups or menu items with lower index numbers appear higher in the menu. If two or more items have the same index number, the position of the items will be indeterminate.
 * 
 * It is not possible to remove menu groups or menu items from the My Account menu. 
 * 
 * Get an instance of this component by calling `container.getComponent("MyAccountMenu")`;
 * 
 * *Note*: This component adds and displays new items in the main menu on the My Account page only. It does not display those new items in the header menu.
 * 
 * @extends BaseComponent
 * @since SuiteCommerce 2019.1
 */
class MyAccountMenu extends BaseComponent {

    constructor() {

    }

    /**
     * Adds a menu group to the menu on the My Account page. A menu group is a top-level item in the My Account menu that may contain one or more subitems. 
     * 
     * <img src="MyAccountMenu_menugroup.png" title="Example of menu group in the My Account menu.">
     * 
     * In the following example, a menu group is added to the My Account menu. The menu group will be displayed as the second menu group in the menu, it has the name Preorders, and it requires either of two permissions to be viewed by the logged in user. The menu group has the ID `preorders`. Use the ID to add menu items to the menu group. 
     * ```javascript 
     * var myaccountmenu = container.getComponent("MyAccountMenu");
     * var preordersmenugroup = {
     *      id: "preorders",
     *      name: "Preorders",
     *      index: 2,
     *      permissionoperator: "OR",
     *      permission: [
     *          {
     *              group: "transactions",
     *              id: "tranSalesOrd",
     *              level: "1"
     *          },
     *          {
     *              group: "transactions",
     *              id: "tranEstimate",
     *              level: "1"
     *          }
     *      ] 
     * }
     * 
     * myaccountmenu.addGroup(preordersmenugroup);
     * ```
     * 
     * @param {MyAccountMenuGroup} MyAccountMenuGroup An object representing the menu group you want to add to the My Account menu. 
     * @returns {Deferred} Returns a Deferred object.
     */
    addGroup(MyAccountMenuGroup) {
        return null;
    }

    /**
     * Adds a menu item to a menu group on the My Account page. 
     * 
     * <img src="MyAccountMenu_menugroupentry.png" title="Example of a menu group entry in the My Account menu.">
     * 
     * In the following example, a menu item is added as the first subitem of the menu group with the id `preorders`. The menu item points to a landing page called `preorders-view`. To view the menu item, the user must have either of the two permissions specified in the `permission` property.
     * ```javascript
     *      var myaccountmenu = container.getComponent("MyAccountMenu");
     * var preordersviewall = {
     *  id: "preordersviewall",
     *  groupid: "preorders",
     *  name: "View All",
     *  index: 1,
     *  url: "preorders-view",
     *  permissionoperator: "OR",
     *  permission: [
     *      {
     *          group: "transactions",
     *          id: "tranSalesOrd",
     *          level: "1"
     *      },
     *      {
     *          group: "transactions",
     *          id: "tranEstimate",
     *          level: "1"
     *      }
     *  ]
     * }
     * 
     * myaccountmenu.addGroupEntry(preordersviewall);
     * ```
     * @param {MyAccountMenuGroupEntry} MyAccountMenuGroupEntry 
     * @returns {Deferred} Returns a Deferred object.
     */
    addGroupEntry(MyAccountMenuGroupEntry) {
        return null;
    }
    
}


// DATA TYPE DEFINITIONS
// ---------------------

/**
 * @typedef {Object} MyAccountMenuGroup Represents a menu group in the menu on the My Account page.
 * @property {String} name The name of the menu group as it appears in the menu. 
 * @property {String} id A unique ID for the menu group.
 * @property {Integer} index A number that indicates the position of the menu group in the menu.
 * @property {Array<MyAccountMenuPermission>} permission An array of permissions to apply to the menu group. Each permission is an object in the array. If the user has the relevant permissions, the menu group is displayed.
 * @property {String} permissionoperator Specifies how permissions are evaluated. To indicate that the user must have all the specified permissions, set this property to `AND`. Otherwise, to indicate that any one of the permissions are required, set this property to `OR`. 
 */

/**
 * @typedef {Object} MyAccountMenuGroupEntry Represents a menu item in the menu on the My Account page.
 * @property {String} id A unique ID for the menu item.
 * @property {String} groupid The ID of the menu group to which you want to add the menu item.
 * @property {String} index A number that indicates the position of the menu item in the menu group. 
 * @property {String} name The name of the menu item as it appears in the menu.
 * @property {Array<MyAccountMenuPermission>} permission The permissions required to view the menu item and its associated landing page. Specify the permissions as an array of permissions to apply to the menu item. Each permission in the array is an object. If the user has the relevant permissions, the menu item is displayed.
 * @property {String} permissionoperator Specifies how permissions are evaluated. To indicate that the user must have all the specified permissions, set this property to `AND`. Otherwise, to indicate that any one of the permissions are required, set this property to `OR`. 
 * @property {String} url The URL of a landing page you want to display on the My Account page.
 */

/**
 * @typedef {Object} MyAccountMenuPermission A permission that can be applied to a menu group or menu item.
 * @property {String} id The permission ID that can be applied to a menu group or menu item (menu group entry).
 * @property {String} group Permissions available for SuiteCommerce extensions are organised into two groups: `transactions` and `lists`. See {@link https://system.netsuite.com/app/help/helpcenter.nl?fid=scadvancedreferenceimplementations.pdf|SuiteCommerce Advanced & Reference Implementations} for more information about working with permissions.
 * @property {String} level The permission level for the menu group or menu item. `level` can be one of the following:
 * * 0 - None
 * * 1 - View
 * * 2 - Create
 * * 3 - Edit
 * * 4 - Full
 */

 
// EVENTS
// ------
// No events.
