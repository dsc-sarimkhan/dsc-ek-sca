/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Case.Model"/>

import { Model } from '../../../Commons/Core/JavaScript/Model';
import { ValidationConfig } from '../../../Commons/Core/JavaScript/backbone/BackboneValidationExtras';

import * as Utils from '../../../Commons/Utilities/JavaScript/Utils';
import { Case } from '../../../ServiceContract/SC/Case/Case';

interface CaseForm {
    category: string;
    email: string;
    include_email: boolean;
    internalid: string | undefined;
    isNewCase: boolean;
    message: string;
    reply: string | undefined;
    title: string;
}
export class CaseModel extends Model<Case> {
    protected urlRoot = (): string => Utils.getAbsoluteUrl('SC/Case/Case.ss', true);

    protected validation: ValidationConfig = {
        title: {
            required: true,
            msg: Utils.translate('Subject is required')
        },

        message: {
            fn: this.validateMessage
        },

        reply: {
            fn: this.validateReply
        },

        email: {
            required: (value: string, name: string, form: CaseForm): boolean => {
                return !!form.include_email;
            },
            pattern: 'email',
            msg: Utils.translate('Please provide a valid email')
        }
    };

    public isClosing: boolean = false;

    public constructor(
        attributes: Case = {
            caseNumber: '',
            title: '',
            status: { id: '', name: '' },
            origin: { id: '', name: '' },
            category: { id: '', name: '' },
            company: { id: '', name: '' },
            priority: { id: '', name: '' },
            createdDate: '',
            lastMessageDate: '',
            email: '',
            messages_count: 0,
            grouped_messages: []
        },
        options?: never
    ) {
        super(attributes, options);
    }

    private validateReply(value: string | undefined, name: string): string {
        if (!this.get('isNewCase') && !value && !this.isClosing) {
            return Utils.translate('$(0) is required', name);
        }
        return '';
    }

    private validateMessage(value: string | undefined, name: string): string {
        if (this.get('isNewCase')) {
            if (!value) {
                return Utils.translate('$(0) is required', name);
            }

            return CaseModel.validateLength(value, name);
        }
        return '';
    }

    // Validates message length. (0 < length <= 4000)
    private static validateLength(value: string, name: string): string {
        const max_length = 4000;

        if (value && value.length > max_length) {
            return Utils.translate('$(0) must be at most $(1) characters', name, max_length);
        }
        return '';
    }
}
