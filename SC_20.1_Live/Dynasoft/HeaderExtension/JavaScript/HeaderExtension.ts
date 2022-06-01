/// <amd-module name="HeaderExtension"/>

import { MyAccountMenu } from '../../../Advanced/Header/JavaScript/MyAccountMenu';

export function mountToApp(application): void {
    const myAccountMenu = MyAccountMenu.getInstance();
    
    //remove entries from my account menu
    myAccountMenu.removeSubEntry('quotes');
    myAccountMenu.removeSubEntry('returns');
}
