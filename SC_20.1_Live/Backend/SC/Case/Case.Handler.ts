/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import {
    CaseFields,
    Case,
    CaseField,
    CaseFieldText,
    Message
} from '../../../ServiceContract/SC/Case/Case';
import { PaginationResponse } from '../../../ServiceContract/SC/PaginationResponse';
import { Listable } from '../../../ServiceContract/SC/Listable';
import { Format } from '../../Common/Format/Format';
import { Configuration } from '../Libraries/Configuration/Configuration';
import { SearchOperator } from '../../Common/SearchRecord/SearchOperator';
import { SearchFilter, SearchFilterExpression } from '../../Common/SearchRecord/SearchFilter';
import { Search, SearchColumnSort } from '../../Common/SearchRecord/Search';
import { CaseDao } from './RecordAccess/CaseDao';
import { User } from '../Libraries/Auth/User';

export class CaseHandler {
    private caseDao: CaseDao = new CaseDao();

    private schema = this.caseDao.getSchema();

    private configuration = Configuration.getInstance();

    private format = Format.getInstance();

    private user: User = User.getInstance();

    private searchCase(
        filters: SearchFilterExpression[],
        sort?: keyof Case,
        order: SearchColumnSort = SearchColumnSort.ASC
    ): Search<Case> {
        const toCaseField = (value: string, text: string): CaseField => ({ id: value, name: text });
        const search: Search<Case> = this.caseDao.createSearch<Case>();
        search
            .sortBy(sort, order)
            .setFilters(filters)
            .addColumn(this.schema.columns.internalid)
            .addColumn(this.schema.columns.title)
            .addColumn(this.schema.columns.email)
            .addColumn(this.schema.columns.status, { status: toCaseField })
            .addColumn(this.schema.columns.origin, { origin: toCaseField })
            .addColumn(this.schema.columns.category, { category: toCaseField })
            .addColumn(this.schema.columns.company, { company: toCaseField })
            .addColumn(this.schema.columns.priority, { priority: toCaseField })
            .addColumn(this.schema.columns.casenumber, { caseNumber: this.format.toValue })
            .addColumn(this.schema.columns.createddate, { createdDate: this.format.toDateString })
            .addColumn(this.schema.columns.lastmessagedate, {
                lastMessageDate: this.format.toDateString
            });

        return search;
    }

    private searchMessage(caseId: string): Message[] {
        const search: Search<Message> = this.caseDao.createSearch();
        search.setFilters([
            new SearchFilter(this.schema.filters.internalid, SearchOperator.String.IS, caseId),
            SearchOperator.Logical.AND,
            new SearchFilter(
                this.schema.joins.messages.filters.internalonly,
                SearchOperator.String.IS,
                'F'
            )
        ]);

        return search
            .addColumn(this.schema.joins.messages.columns.author, {
                author: (value, text): string =>
                    <string>(value === String(this.user.getId()) ? 'You' : text)
            })
            .addColumn(this.schema.joins.messages.columns.internalid, {
                internalid: this.format.toValue
            })
            .addColumn(this.schema.joins.messages.columns.message, { text: this.format.stripHTML })
            .addColumn(this.schema.joins.messages.columns.messagedate, {
                messageDate: this.format.toValue
            })
            .sortBy('messageDate', SearchColumnSort.DESC)
            .getAll();
    }

    private appendMessagesToCase(record: Case): Case {
        const caseRecord: Case = record;
        const messageResult = this.searchMessage(caseRecord.internalid);
        caseRecord.messages_count = messageResult.length;
        const messagesByDate = _.groupBy(
            messageResult,
            (message: Message, index: number): string => {
                const todayDate: string = this.format.toDateString(new Date());
                const msgDate: string = this.format.toDateString(message.messageDate);
                const dateToShow: string = todayDate === msgDate ? 'Today' : msgDate;
                message.messageDate = this.format.toTimeOfDay(message.messageDate);
                message.initialMessage = index === messageResult.length - 1;
                return dateToShow;
            }
        );
        caseRecord.grouped_messages = _.map(
            messagesByDate,
            (messages: Message[], date: string): { date: string; messages: Message[] } => ({
                date,
                messages
            })
        );

        return caseRecord;
    }

    public get(id: string): Case {
        const search = this.searchCase([
            new SearchFilter(this.schema.filters.internalid, SearchOperator.String.IS, id),
            SearchOperator.Logical.AND,
            new SearchFilter(this.schema.filters.isinactive, SearchOperator.String.IS, 'F')
        ]);
        const record: Case = search.getFirst();
        return record ? this.appendMessagesToCase(record) : null;
    }

    public search(listHeaderData: Listable<Case>): PaginationResponse<Case> {
        const selectedFilter = parseInt(listHeaderData.filter, 10);
        const filters: SearchFilterExpression[] = [
            new SearchFilter(this.schema.filters.isinactive, SearchOperator.String.IS, 'F')
        ];
        if (selectedFilter) {
            filters.push(SearchOperator.Logical.AND);
            filters.push(
                new SearchFilter(
                    this.schema.filters.status,
                    SearchOperator.Select.ANYOF,
                    selectedFilter
                )
            );
        }

        const search = this.searchCase(
            filters,
            listHeaderData.sort,
            listHeaderData.order > 0 ? SearchColumnSort.DESC : SearchColumnSort.ASC
        );
        return search.getPaginated(
            listHeaderData.page,
            this.configuration.get('suitescriptResultsPerPage')
        );
    }

    public getCaseFields(): CaseFields {
        const record = this.caseDao.createRecord();
        const createCaseField = (
            selectOptions: { value: string; text: string }[]
        ): CaseFieldText[] => {
            return _(selectOptions).map(
                (selectOption: { value: string; text: string }): CaseFieldText => ({
                    id: selectOption.value,
                    text: selectOption.text
                })
            );
        };
        return {
            origins: createCaseField(record.getFieldSelectOptions(this.schema.fields.origin)),
            categories: createCaseField(record.getFieldSelectOptions(this.schema.fields.category)),
            statuses: createCaseField(record.getFieldSelectOptions(this.schema.fields.status)),
            priorities: createCaseField(record.getFieldSelectOptions(this.schema.fields.priority))
        };
    }

    public create(
        data: Partial<Case> & { statusid; title; message; email; category: number }
    ): number {
        const record = this.caseDao.createRecord();
        record.setValue(this.schema.fields.title, this.format.sanitizeHTML(data.title));
        record.setValue(this.schema.fields.incomingmessage, this.format.sanitizeHTML(data.message));
        record.setValue(this.schema.fields.category, data.category);
        record.setValue(this.schema.fields.email, data.email);
        record.setValue(this.schema.fields.company, this.user.getId());
        record.setValue(
            this.schema.fields.origin,
            this.configuration.getDefault('cases.defaultValues.origin.id')
        );
        record.setValue(
            this.schema.fields.status,
            this.configuration.getDefault('cases.defaultValues.statusStart.id')
        );
        return record.save();
    }

    public update(data: Partial<Case> & { id; statusid; reply }): void {
        const fields: { incomingmessage?: string; messagenew?: string; status: string } = {
            status: data.statusid
        };
        if (data.reply && data.reply.length) {
            fields.incomingmessage = this.format.sanitizeHTML(data.reply);
            fields.messagenew = 'T';
        }
        this.caseDao.submitFields(fields, data.id);
    }
}