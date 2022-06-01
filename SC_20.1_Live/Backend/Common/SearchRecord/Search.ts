/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import {
    Column as NColumn,
    Summary as NSummary,
    createColumn as NcreateColumn,
    PagedData as NPagedData,
    Result as NResult,
    ResultSet as NResultSet,
    create as Ncreate,
    lookupFields as NlookupFields,
    Type as NType,
    Sort as NSort
} from 'N/search';
import { SearchOperatorType } from './SearchOperator';
import { SchemaColumn } from '../Schema/SchemaColumn';
import { FieldValue, RecordType } from '../ActiveRecord/ActiveRecord';
import { Format } from '../Format/Format';
import {
    SearchFilter,
    SearchFilterArray,
    SearchFilterExpression,
    SearchFilterExpressionArray
} from './SearchFilter';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import '../../third_parties/underscore.js';

type Alias<T> = (value: FieldValue, text: FieldValue, type: string) => T;

interface FieldResult {
    value: FieldValue;
    text: FieldValue;
}

interface SearchColumn<T = unknown> {
    column: NColumn;
    alias: Alias<T>;
}

type SearchColumnMap<T> = { [P in keyof T]?: SearchColumn<T[P]> };

export interface QueryResult {
    [key: string]: FieldResult;
}

export enum SearchColumnSort {
    DESC = 'DESC',
    ASC = 'ASC',
    NONE = 'NONE'
}

export { NSummary as SearchColumnSummary };

export class Search<T> {
    private type: RecordType;

    private filters: (SearchFilterArray | SearchOperatorType['Logical'])[];

    private columns: { [key: string]: NColumn } = {};

    private columnMap: SearchColumnMap<T> = {};

    private sort: { [key: string]: SearchColumnSort } = {};

    public constructor(type: RecordType) {
        this.type = type;
    }

    public addColumn(
        column: SchemaColumn,
        alias: { [P in keyof T]?: Alias<T[P]> } = {}
    ): Search<T> {
        const columnFormula = column.formula;
        const columnSummary = column.summary;
        let { columnName } = column;
        let columnJoin: string;

        // default alias
        if (_.isEmpty(alias)) {
            alias[columnName] = Format.getInstance().toValue;
        }

        // handle joins:
        if (columnName.indexOf('.') > -1) {
            [columnJoin, columnName] = columnName.split('.');
        }

        const columnOptions: NColumn = { name: columnName };
        if (columnJoin) {
            columnOptions.join = columnJoin;
        }
        if (columnFormula) {
            columnOptions.formula = columnFormula;
        }
        if (columnSummary) {
            columnOptions.summary = columnSummary;
        }

        // add column
        this.columns[columnName] = NcreateColumn(columnOptions);
        this.columnMap = _.extend(
            this.columnMap,
            _.mapObject(
                alias,
                (converter: Alias<T>): SearchColumn<T> => ({
                    column: this.columns[columnName],
                    alias: converter
                })
            )
        );

        return this;
    }

    public sortBy(alias: keyof T, sort: SearchColumnSort = SearchColumnSort.ASC): Search<T> {
        if (alias) {
            this.sort[<string>alias] = sort;
        }
        return this;
    }

    public setFilters(expressions: SearchFilterExpressionArray): Search<T> {
        const getFilter = (expression: SearchFilterExpression) => {
            if (Array.isArray(expression)) {
                return expression.map(getFilter);
            }
            return expression instanceof SearchFilter ? expression.get() : expression;
        };
        if (!Array.isArray(expressions)) {
            expressions = [expressions];
        }
        this.filters = expressions.map(getFilter);
        return this;
    }

    public getAll(): T[] {
        const result: NResult[] = [];
        this.run().each(function(row): boolean {
            result.push(row);
            return true;
        });
        return this.convertResult(result);
    }

    public getPaginated(page: number = 1, resultsPerPage: number = 20): PaginationResponse<T> {
        const search: NPagedData = this.run(resultsPerPage);

        if (!(page > 0)) {
            page = 1;
        }

        let result: NResult[] = search.count ? search.fetch({ index: page - 1 }).data : [];

        if (result.length && result.length > resultsPerPage) {
            // the Nsearch.fetch minimum results per page is 5.
            result = result.slice(0, resultsPerPage);
        }

        return {
            page: String(page),
            recordsPerPage: resultsPerPage,
            totalRecordsFound: search.count,
            records: this.convertResult(result)
        };
    }

    public getFirst(): T {
        return this.convertResult(this.run().getRange({ start: 0, end: 1 }))[0];
    }

    private convertResult(results): T[] {
        return results.map(
            (result: NResult): T => {
                const fields: T = <T>{};

                _.each(
                    this.columnMap,
                    (columnData: SearchColumn, alias: string): void => {
                        fields[alias] = (columnData.alias || _.identity).call(
                            Format.getInstance(),
                            result.getValue(columnData.column),
                            result.getText(columnData.column),
                            result.recordType
                        );
                    }
                );

                return fields;
            }
        );
    }

    private run(): NResultSet;
    private run(pageRange: number): NPagedData;
    private run(pageRange?: number): NResultSet | NPagedData {
        _.each(
            this.sort,
            (sort: SearchColumnSort, name: string): void => {
                if (this.columnMap[name] && this.columnMap[name].column) {
                    this.columnMap[name].column.sort = <NSort>(<unknown>sort);
                }
            }
        );
        const search = Ncreate({
            type: <string>this.type,
            columns: _.values(this.columns),
            filters: this.filters
        });

        return Number(pageRange) > 0 ? search.runPaged({ pageSize: pageRange }) : search.run();
    }

    public static lookupFields<
        T extends { [name: string]: { value: FieldValue; text?: FieldValue } } = {}
    >(columns: SchemaColumn[], type: RecordType, id: number = 1): T {
        try {
            const resultsArray = NlookupFields({
                type: <string | NType>type,
                id: id,
                columns: columns.map((column): string => column.columnName)
            });
            const results = _.mapObject(
                resultsArray,
                (result): { value: FieldValue; text: FieldValue } => {
                    return result[0];
                }
            );
            return <T>results;
        } catch (e) {
            return null;
        }
    }
}