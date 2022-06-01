/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { SchemaColumn } from '../Schema/SchemaColumn';
import { FieldValue } from '../ActiveRecord/ActiveRecord';
import { SearchOperatorType } from './SearchOperator';

export type SearchFilterArray<FieldType extends FieldValue = FieldValue> = [
    string,
    SearchOperatorType[keyof SearchOperatorType],
    FieldType,
    FieldType?
];

export type SearchFilterExpression = SearchFilter | SearchOperatorType['Logical'];

interface UnkownDimensionFilterExpression extends Array<SearchFilterExpressionArray> {}

export type SearchFilterExpressionArray = SearchFilterExpression | UnkownDimensionFilterExpression;

export class SearchFilter<T extends FieldValue = FieldValue> {
    private filter: SchemaColumn<T>;

    private operator: SearchOperatorType[keyof SearchOperatorType];

    private fstValue: FieldValue;

    private sndValue: FieldValue;

    public constructor(
        filter: SchemaColumn<T>,
        // operator type is validated based on filter type:
        operator: T extends boolean
            ? SearchOperatorType['Boolean']
            : (T extends number
                  ? SearchOperatorType['Number']
                  : (T extends Date
                        ? SearchOperatorType['Date']
                        : (T extends string
                              ? SearchOperatorType['String']
                              : (T extends string[]
                                    ? SearchOperatorType['Array']
                                    : SearchOperatorType['Select'])))),
        fstValue: FieldValue,
        sndValue?: FieldValue
    ) {
        this.filter = filter;
        this.operator = operator;
        this.fstValue =
            Array.isArray(fstValue) && !fstValue.length ? (this.fstValue = [0]) : fstValue;
        this.sndValue = sndValue;
    }

    public get(): SearchFilterArray {
        return this.sndValue
            ? [this.filter.columnName, this.operator, this.fstValue, this.sndValue]
            : [this.filter.columnName, this.operator, this.fstValue];
    }
}