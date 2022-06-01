/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Utilities.Interfaces"/>

export interface UrlParams {
    param: string;
    value: string;
}

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export interface JSONArray extends Array<JSONPrimitive | JSONArray | JSONObject> {}
export interface JSONObject {
    [key: string]: JSONPrimitive | JSONArray | JSONObject;
}
