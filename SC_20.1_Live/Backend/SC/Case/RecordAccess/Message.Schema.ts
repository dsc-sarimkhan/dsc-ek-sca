/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Schema } from '../../../Common/Schema/Schema';
import { Type } from '../../../Common/ActiveRecord/ActiveRecord';
import { SchemaColumn } from '../../../Common/Schema/SchemaColumn';

class MessageSchema implements Schema {
    public sublists = {};

    public initializeDefaults = {};

    public transformDefaults = {};

    public type = Type.SUPPORT_CASE;

    public fields = {};

    public columns = {
        message: new SchemaColumn<string>('message'),
        messagedate: new SchemaColumn<Date>('messagedate'),
        author: new SchemaColumn<string>('author'),
        internalid: new SchemaColumn<string>('internalid')
    };

    public filters = {
        internalonly: new SchemaColumn<string>('internalonly')
    };

    public joins = {};
}

export default new MessageSchema();