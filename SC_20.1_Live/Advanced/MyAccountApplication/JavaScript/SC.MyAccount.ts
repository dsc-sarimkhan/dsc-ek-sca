/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="SC.MyAccount"/>

import IMyAccount = require('./IMyAccount');
import MyAccountStandAlone = require('./MyAccount.Alone');
import MyAccountFull = require('./MyAccount.Full');

class SCMyAccount {
  static _instance:SCMyAccount;
  static getInstance(): IMyAccount {
    if (SC.ENVIRONMENT.standalone) {
      return new MyAccountStandAlone('MyAccount.Alone');
    }
    return new MyAccountFull('MyAccount.Full');
  }
}

export = SCMyAccount;
