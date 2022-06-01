/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { Schema, Select } from '../../../Common/Schema/Schema';
import { Type } from '../../../Common/ActiveRecord/ActiveRecord';
import { SchemaColumn } from '../../../Common/Schema/SchemaColumn';
import { SchemaField } from '../../../Common/Schema/SchemaField';
import { SchemaJoin } from '../../../Common/Schema/SchemaJoin';
import MessageSchema from './Message.Schema';

class CaseSchema implements Schema {
    public sublists = {};

    public initializeDefaults = {};

    public transformDefaults = {};

    public type = Type.SUPPORT_CASE;

    public fields = {
        internalid: new SchemaField<string>('internalid'),
        casenumber: new SchemaField<string>('casenumber'),
        title: new SchemaField<string>('title'),
        status: new SchemaField<string>('status'),
        origin: new SchemaField<string>('origin'),
        category: new SchemaField<string>('category'),
        company: new SchemaField<string>('company'),
        priority: new SchemaField<string>('priority'),
        createddate: new SchemaField<Date>('createddate'),
        lastmessagedate: new SchemaField<Date>('lastmessagedate'),
        incomingmessage: new SchemaField<string>('incomingmessage'),
        email: new SchemaField<string>('email')
    };

    public columns = {
        internalid: new SchemaColumn<string>('internalid'),
        casenumber: new SchemaColumn<string>('casenumber'),
        title: new SchemaColumn<string>('title'),
        status: new SchemaColumn<string>('status'),
        origin: new SchemaColumn<string>('origin'),
        category: new SchemaColumn<string>('category'),
        company: new SchemaColumn<string>('company'),
        priority: new SchemaColumn<string>('priority'),
        createddate: new SchemaColumn<Date>('createddate'),
        lastmessagedate: new SchemaColumn<Date>('lastmessagedate'),
        email: new SchemaColumn<string>('email')
    };

    public filters = {
        internalid: new SchemaColumn<string>('internalid'),
        status: new SchemaColumn<Select>('status'),
        isinactive: new SchemaColumn<string>('isinactive')
    };

    public joins = {
        messages: new SchemaJoin('messages', MessageSchema)
    };
}

export default new CaseSchema();