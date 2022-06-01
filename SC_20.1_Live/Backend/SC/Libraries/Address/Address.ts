/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

import { WebsiteSetting } from '../../../Common/Website/Website';
import { Configuration } from '../Configuration/Configuration';
import { AddressBook } from '../../../../ServiceContract/SC/AddressBook/AddressBook';
import { Environment } from '../../../Common/Environment/Environment';
import '../../../third_parties/backbone.validation';

export class Address {
    private configuration = Configuration.getInstance();

    private countries =
        Environment.getInstance()
            .getCurrentWebsite()
            .getSiteSettings([WebsiteSetting.shiptocountries]) || [];

    private validation = {
        addressee: {
            required: true,
            msg: 'Full Name is required'
        },
        addr1: {
            required: true,
            msg: 'Address is required'
        },
        country: {
            required: true,
            msg: 'Country is required'
        },
        city: {
            required: true,
            msg: 'City is required'
        },
        zip: (value, attr, computedState): string => {
            const selected_country = computedState.country;

            if (
                (!selected_country && !value) ||
                (selected_country &&
                    this.countries[selected_country] &&
                    this.countries[selected_country].isziprequired === 'T' &&
                    !value)
            ) {
                return 'State is required';
            }
        },
        phone: (value): string => {
            if (
                this.configuration.get('addresses') &&
                this.configuration.get('addresses.isPhoneMandatory') &&
                !value
            ) {
                return 'Phone Number is required';
            }
        }
    };

    private internalid: string;
    private country: string;
    private state: string;
    private city: string;
    private zip: string;
    private addr1: string;
    private addr2: string;
    private phone: string;
    private attention: string;
    private addressee: string;
    private fullname: string;
    private company: string;
    private valid: boolean;

    public constructor(data: {
        country: string;
        state: string;
        city: string;
        zip: string;
        addr1: string;
        addr2: string;
        phone?: string;
        attention: string;
        addressee: string;
    }) {
        this.country = data.country;
        this.state = data.state;
        this.city = data.city;
        this.zip = data.zip;
        this.addr1 = data.addr1;
        this.addr2 = data.addr2;
        this.phone = data.phone;
        this.attention = data.attention;
        this.addressee = data.addressee;
        this.fullname = this.attention || this.addressee;
        this.company = this.attention && this.attention !== this.addressee ? this.addressee : null;
        this.valid = this.isValid();
        this.internalid =
            // this.country &&
            [
                this.country,
                this.state,
                this.city,
                this.zip,
                this.addr1,
                this.addr2,
                this.fullname,
                this.company
            ]
                .join('-')
                .replace(/\s/g, '-');
    }

    public getId(): string {
        return this.internalid;
    }

    public getAddressBook(): AddressBook {
        return {
            internalid: this.internalid,
            country: this.country,
            state: this.state,
            city: this.city,
            zip: this.zip,
            addr1: this.addr1,
            addr2: this.addr2,
            phone: this.phone,
            fullname: this.fullname,
            company: this.company,
            isvalid: this.valid ? 'T' : 'F'
        };
    }

    public isValid(): boolean {
        const validator = _.extend(
            {
                validation: this.validation,
                attributes: {
                    internalid: this.internalid,
                    country: this.country,
                    state: this.state,
                    city: this.city,
                    zip: this.zip,
                    addr1: this.addr1,
                    addr2: this.addr2,
                    phone: this.phone,
                    attention: this.attention,
                    addressee: this.addressee
                }
            },
            Backbone.Validation.mixin
        );

        validator.validate();
        return validator.isValid();
    }
}