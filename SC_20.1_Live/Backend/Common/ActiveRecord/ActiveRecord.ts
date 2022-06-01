/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import * as Nrecord from 'N/record';
import { Schema } from '../Schema/Schema';
import { SchemaField } from '../Schema/SchemaField';
import { SchemaSublist } from '../Schema/SchemaSublist';
import { SchemaSublistField } from '../Schema/SchemaSublistField';

export const { Type } = Nrecord;
export type FieldValue = Nrecord.FieldValue;
export type RecordType = string | Nrecord.Type;

export interface RecordCreateOptions<T extends Schema = Schema> extends RecordOptions {
    schema: T;
}
export interface RecordLoadOptions<T extends Schema> extends RecordOptions {
    schema: T;
    recordtype: string;
    id: number;
}
export interface RecordTransformOptions<T extends Schema> {
    isDynamic?: boolean;
    schema: T;
    id: number;
    defaultValues?: T['transformDefaults'];
    fromSchema: Schema;
}

export interface RecordOptions<T extends Schema = Schema> {
    isDynamic?: boolean;
    defaultValues?: T['initializeDefaults'];
}
interface SubRecordOptions {
    record: Nrecord.Record;
}

export class ActiveRecord<T extends Schema = Schema> {
    private record: Nrecord.Record;
    public Schema: T;

    public constructor(recordOptions: RecordLoadOptions<T>);
    public constructor(recordOptions: RecordCreateOptions<T>);
    public constructor(recordOptions: RecordTransformOptions<T>);
    public constructor(recordOptions: SubRecordOptions);
    public constructor(
        recordOptions: RecordLoadOptions<T> &
            RecordCreateOptions<T> &
            RecordTransformOptions<T> &
            SubRecordOptions
    ) {
        recordOptions.isDynamic = recordOptions.isDynamic || true;
        recordOptions.defaultValues = recordOptions.defaultValues || {};
        this.Schema = recordOptions.schema;

        if (recordOptions.record) {
            this.record = recordOptions.record;
        } else if (recordOptions.fromSchema) {
            this.record = Nrecord.transform({
                fromType: recordOptions.fromSchema.type,
                fromId: recordOptions.id,
                toType: recordOptions.schema.type,
                isDynamic: recordOptions.isDynamic,
                defaultValues: recordOptions.defaultValues
            });
        } else if (recordOptions.id) {
            this.record = Nrecord.load({
                id: recordOptions.id,
                type: recordOptions.recordtype || recordOptions.schema.type,
                isDynamic: recordOptions.isDynamic,
                defaultValue: recordOptions.defaultValues
            });
        } else {
            this.record = Nrecord.create({
                type: recordOptions.schema.type,
                isDynamic: recordOptions.isDynamic,
                defaultValues: recordOptions.defaultValues
            });
        }
    }

    public save(
        options: {
            enablesourcing: boolean;
            ignoreMandatoryFields: boolean;
        } = { enablesourcing: true, ignoreMandatoryFields: false }
    ): number {
        return this.record.save({
            enableSourcing: options.enablesourcing,
            ignoreMandatoryFields: options.ignoreMandatoryFields
        });
    }

    private getField(field: SchemaField): Nrecord.Field {
        return this.record.getField({ fieldId: field.fieldId });
    }

    public getValue<T extends FieldValue = string>(field: SchemaField<T>): T {
        // TODO: infer return type from SchemaRecordField (T)
        return <T>this.record.getValue({ fieldId: field.fieldId });
    }

    public getText<T extends FieldValue = string>(field: SchemaField<T>): T {
        return <T>this.record.getText({ fieldId: field.fieldId });
    }

    public getFieldSelectOptions(field: SchemaField): { value: any; text: string }[] {
        return this.getField(field).getSelectOptions();
    }

    public getSublistText(field: SchemaSublistField, line: number): string {
        return this.record.getSublistText({
            sublistId: field.sublistId,
            fieldId: field.fieldId,
            line: line
        });
    }

    public getSublistValue<T extends FieldValue = string>(
        field: SchemaSublistField,
        line: number
    ): T {
        return <T>this.record.getSublistValue({
            sublistId: field.sublistId,
            fieldId: field.fieldId,
            line: line
        });
    }

    public removeLine(sublist: SchemaSublist, line: number): void {
        this.record.removeLine({
            sublistId: sublist.sublistId,
            line: line
        });
    }

    public getLineCount(sublist: SchemaSublist): number {
        return this.record.getLineCount({
            sublistId: sublist.sublistId
        });
    }

    public isFieldMandatory(field: SchemaField): boolean {
        return this.getField(field).isMandatory;
    }

    public setValue(field: SchemaField, value: FieldValue): void {
        this.record.setValue({
            fieldId: field.fieldId,
            value: value
        });
    }

    public setText(field: SchemaField, text: string): void {
        this.record.setText({
            fieldId: field.fieldId,
            text: text
        });
    }

    public cancelLine(sublist: SchemaSublist): void {
        this.record.cancelLine({
            sublistId: sublist.sublistId
        });
    }

    public selectLine(sublist: SchemaSublist, line: number): void {
        this.record.selectLine({
            sublistId: sublist.sublistId,
            line: line
        });
    }

    public insertLine(sublist: SchemaSublist, line: number, ignoreRecalc: boolean = false): void {
        this.record.insertLine({
            sublistId: sublist.sublistId,
            line: line,
            ignoreRecalc: ignoreRecalc
        });
    }

    public selectNewLine(sublist: SchemaSublist): void {
        this.record.selectNewLine({
            sublistId: sublist.sublistId
        });
    }

    public commitLine(sublist: SchemaSublist): void {
        this.record.commitLine({
            sublistId: sublist.sublistId
        });
    }

    public setCurrentSublistText(
        subfield: SchemaSublistField,
        text: string,
        ignoreFieldChange: boolean = false
    ): void {
        this.record.setCurrentSublistText({
            sublistId: subfield.sublistId,
            fieldId: subfield.fieldId,
            text: text,
            ignoreFieldChange: ignoreFieldChange
        });
    }

    public setCurrentSublistValue(
        subfield: SchemaSublistField,
        value: FieldValue,
        ignoreFieldChange: boolean = false
    ): void {
        this.record.setCurrentSublistValue({
            sublistId: subfield.sublistId,
            fieldId: subfield.fieldId,
            value: value,
            ignoreFieldChange: ignoreFieldChange
        });
    }

    public setSublistValue(subfield: SchemaSublistField, line: number, value: FieldValue): void {
        this.record.setSublistValue({
            sublistId: subfield.sublistId,
            fieldId: subfield.fieldId,
            line: line,
            value: value
        });
    }

    public getCurrentSublistText(subfield: SchemaSublistField): string {
        return this.record.getCurrentSublistText({
            sublistId: subfield.sublistId,
            fieldId: subfield.fieldId
        });
    }

    public getCurrentSublistValue(subfield: SchemaSublistField): FieldValue {
        return this.record.getCurrentSublistValue({
            sublistId: subfield.sublistId,
            fieldId: subfield.fieldId
        });
    }

    public executeMacro<T>(id: string, params?: object): T {
        return <T>this.record.executeMacro({
            id: id,
            params: params
        });
    }

    public getSubrecord(recordField: SchemaField): ActiveRecord {
        return new ActiveRecord({
            record: this.record.getSubrecord({ fieldId: recordField.fieldId })
        });
    }

    public getSublistFields(field: SchemaField): string[] {
        return this.record.getSublistFields({
            sublistId: field.fieldId
        });
    }
}