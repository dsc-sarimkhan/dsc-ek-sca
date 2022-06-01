/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

// @ts-ignore // TODO: update NrecordView d.ts and remove ts-ignore
import * as NrecordView from 'N/commerce/recordView';
import { missingWebsiteIdParameter } from '../Controller/RequestErrors';

// A WebsiteSchema may be a better option than this enum.
export enum WebsiteSetting {
    imagesizes = 'imagesizes',
    wsdkcancelcarturl = 'wsdkcancelcarturl',
    paymentmethods = 'paymentmethods',
    wsdkcancelcheckouturl = 'wsdkcancelcheckouturl',
    analytics = 'analytics',
    defaultpricelevel = 'defaultpricelevel',
    wsdkcompleteloginurl = 'wsdkcompleteloginurl',
    scripttemplateinvoice = 'scripttemplateinvoice',
    autoapplypromotionsenabled = 'autoapplypromotionsenabled',
    siteid = 'siteid',
    entrypoints = 'entrypoints',
    id = 'id',
    multipleshippingenabled = 'multipleshippingenabled',
    showshippingestimator = 'showshippingestimator',
    touchpoints = 'touchpoints',
    sitelanguage = 'sitelanguage',
    wsdkcompletecheckouturl = 'wsdkcompletecheckouturl',
    defaultshippingcountry = 'defaultshippingcountry',
    shipstoallcountries = 'shipstoallcountries',
    iswsdk = 'iswsdk',
    shipallcountries = 'shipallcountries',
    loginallowed = 'loginallowed',
    registration = 'registration',
    custromeregistrationtype = 'custromeregistrationtype',
    sortfield = 'sortfield',
    requireloginforpricing = 'requireloginforpricing',
    isinactive = 'isinactive',
    siteregion = 'siteregion',
    showextendedcart = 'showextendedcart',
    shipstocountries = 'shipstocountries',
    siteloginrequired = 'siteloginrequired',
    pricesincludevat = 'pricesincludevat',
    cartsharingmode = 'cartsharingmode',
    checkout = 'checkout',
    defaultshipcountry = 'defaultshipcountry',
    loginrequired = 'loginrequired',
    languages = 'languages',
    shiptocountries = 'shiptocountries',
    requireshippinginformation = 'requireshippinginformation',
    wsdkcancelloginurl = 'wsdkcancelloginurl',
    includevatwithprices = 'includevatwithprices',
    defaultshippingmethod = 'defaultshippingmethod',
    iswebstoreoffline = 'iswebstoreoffline',
    shippingrequired = 'shippingrequired',
    sitecurrency = 'sitecurrency',
    displayname = 'displayname',
    facetfield = 'facetfield',
    subsidiaries = 'subsidiaries',
    cookiepolicy = 'cookiepolicy',
    showcookieconsentbanner = 'showcookieconsentbanner',
    currencies = 'currencies',
    groupseparator = 'groupseparator',
    decimalseparator = 'decimalseparator',
    negativeprefix = 'negativeprefix',
    negativesuffix = 'negativesuffix'
}

interface Currency {
    currency: number; // internalid
    isdefault: boolean;
    minimumorderamount: string;
    name: string;
    displaysymbol: string; // symbol ($)
    symbol: string; // code
    symbolplacement: number;
}

interface WebsiteSettingType {
    currencies: Currency[];
    groupseparator: string;
    decimalseparator: string;
    cartsharingmode: string;
    negativeprefix: string;
    negativesuffix: string;
}

export class Website {
    private id: number;

    public constructor(id: number) {
        if (!id) {
            throw missingWebsiteIdParameter;
        }
        this.id = id;
    }

    public getSiteSettings(settings: WebsiteSetting[]): Partial<WebsiteSettingType> {
        return NrecordView.viewWebsite({
            id: this.id,
            fields: _.flatten(settings.map((field): string[] => field.split('|')))
        });
    }

    public getCurrency(currencyId?: number): Partial<Currency> {
        const { currencies } = this.getSiteSettings([WebsiteSetting.currencies]);
        const currency = _.find(currencies, { currency: currencyId });
        return currency || (currencies ? currencies[0] : { displaysymbol: '$' });
    }

    public getId(): number {
        return this.id;
    }
}