/**

	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.


 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */

enum LogicalSearchOperator {
    AND = 'and',
    OR = 'or',
    NOT = 'not'
}

enum StringSearchOperator {
    ANY = 'any',
    CONTAINS = 'contains',
    DOESNOTCONTAIN = 'doesnotcontain',
    DOESNOTSTARTWITH = 'doesnotstartwith',
    EQUALTO = 'equalto',
    HASKEYWORDS = 'haskeywords',
    IS = 'is',
    ISEMPTY = 'isempty',
    ISNOT = 'isnot',
    STARTSWITH = 'startwith'
}

enum NumberSearchOperator {
    ANY = 'any',
    BETWEEN = 'between',
    EQUALTO = 'equalto',
    GREATERTHAN = 'greaterthan',
    GREATERTHANOREQUALTO = 'greaterthanorequalto',
    ISEMPTY = 'isempty',
    ISNOTEMPTY = 'isnotempty',
    LESSTHAN = 'lessthan',
    LESSTHANOREQUALTO = 'lessthanorequalto',
    NOTBETWEEN = 'notbetween',
    NOTEQUALTO = 'notequalto',
    NOTGREATERTHAN = 'notgreaterthan',
    NOTGREATERTHANOREQUALTO = 'notgreaterthanorequalto',
    NOTLESSTHAN = 'notlessthan',
    NOTLESSTHANOREQUALTO = 'notlessthanorequalto'
}

enum SelectSearchOperator {
    ANYOF = 'anyof',
    NONEOF = 'noneof'
}

enum DateSearchOperator {
    AFTER = 'after',
    BEFORE = 'before',
    ISEMPTY = 'isempty',
    ISNOTEMPTY = 'isnotempty',
    NOTAFTER = 'notafter',
    NOTBEFORE = 'notbefore',
    NOTON = 'noton',
    NOTONORAFTER = 'notonorafter',
    NOTONORBEFORE = 'notonorbefore',
    NOTWITHIN = 'notwithin',
    ON = 'on',
    ONORAFTER = 'onorafter',
    ONORBEFORE = 'onorbefore',
    STARTSWITH = 'startwith',
    WITHIN = 'within'
}

enum ArraySearchOperator {
    ALLOF = 'allof',
    ANYOF = 'anyof',
    NONEOF = 'noneof',
    NOTALLOF = 'notallof'
}

enum BooleanSearchOperator {
    EQUALTO = 'equalto',
    IS = 'is'
}

export interface SearchOperatorType {
    Logical: LogicalSearchOperator;
    String: StringSearchOperator;
    Number: NumberSearchOperator;
    Select: SelectSearchOperator;
    Date: DateSearchOperator;
    Array: ArraySearchOperator;
    Boolean: BooleanSearchOperator;
}

export const SearchOperator = {
    Logical: LogicalSearchOperator,
    String: StringSearchOperator,
    Number: NumberSearchOperator,
    Select: SelectSearchOperator,
    Date: DateSearchOperator,
    Array: ArraySearchOperator,
    Boolean: BooleanSearchOperator
};