/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="TrackingServices"/>
// @module TrackingServices Implements the feature present in myaccount to physically track an order's items.
// It support UPS, USPS and FedEx outof the box but others can be added in the services object. It uses google search page as the 'default service'.

import * as _ from 'underscore';

// sums up all elements in the array
const sum = function(numbers) {
    return _.reduce(
        numbers,
        function(memo, num) {
            return <any>memo + num;
        },
        0
    );
};
const parse = function(string) {
    if (!string) {
        return '';
    }

    return _.isString(string)
        ? string
              .replace(' ', '')
              .replace('	', '')
              .replace('-', '')
              .toUpperCase()
        : string + '';
};

// @class TrackingServices
const TrackingServices: any = {
    // @property {Object<String,TrackingService>} services
    // [Tracking URLs](http://verysimple.com/2011/07/06/ups-tracking-url/)
    // [Carriers Algorithms](http://answers.google.com/answers/threadview/id/207899.html)
    services: {
        UPS: {
            name: 'UPS',
            url: 'http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=',
            validate: function(numbers) {
                numbers = parse(numbers);

                if (numbers.substring(0, 2) !== '1Z' || numbers.length !== 18) {
                    return false;
                }

                const check_digit = parseInt(_.last(numbers), 10);
                const ups_chart = {
                    A: 2,
                    B: 3,
                    C: 4,
                    D: 5,
                    E: 6,
                    F: 7,
                    G: 8,
                    H: 9,
                    I: 0,
                    J: 1,
                    K: 2,
                    L: 3,
                    M: 4,
                    N: 5,
                    O: 6,
                    P: 7,
                    Q: 8,
                    R: 9,
                    S: 0,
                    T: 1,
                    U: 2,
                    V: 3,
                    W: 4,
                    X: 5,
                    Y: 6,
                    Z: 7
                };

                return (
                    check_digit ===
                    sum(
                        _.map(numbers.substring(2, numbers.length), function(character, index) {
                            return (
                                (ups_chart[<any>character] || parseInt(<any>character, 10)) *
                                (index % 2 ? 2 : 1)
                            );
                        })
                    ) %
                        10
                );
            }
        },
        USPS: {
            name: 'USPS',
            url: 'https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=',
            validate: function(numbers) {
                numbers = parse(numbers);

                const { length } = numbers;

                if (length !== 13 && length !== 20 && length !== 22) {
                    return false;
                }

                if (_.last(numbers, 2).join('') === 'US') {
                    numbers = numbers.substring(2, 11);
                }

                const check_digit = parseInt(_.last(numbers), 10);
                const validation_1 =
                    sum(
                        _.map(numbers, function(num, index) {
                            return parseInt(<any>num, 10) * (index % 2 ? 1 : 3);
                        })
                    ) % 10;

                // Usps
                if (check_digit === 10 - validation_1 || validation_1 === 0) {
                    return true;
                }

                const usps_chart = [8, 6, 4, 2, 3, 5, 9, 7];
                const validation_map = {
                    0: 5,
                    1: 0
                };
                let validation_2 =
                    sum(
                        _.map(_.initial(numbers), function(num, index) {
                            return <any>num * usps_chart[index];
                        })
                    ) % 11;

                validation_2 = validation_map[validation_2] || 11 - validation_2;

                // Usps Exp
                return check_digit === validation_2;
            }
        },
        FedEx: {
            name: 'FedEx',
            url: 'http://www.fedex.com/Tracking?action=track&tracknumbers=',
            validate: function(numbers) {
                numbers = parse(numbers);

                const { length } = numbers;

                if (length !== 12 && length !== 15 && length !== 22) {
                    return false;
                }

                if (length === 22) {
                    if (parseInt(numbers.substring(0, 2), 10) === 96) {
                        numbers = numbers.substring(0, 7);
                    } else {
                        return false;
                    }
                }

                // Fedex Ground
                const check_digit = parseInt(_.last(numbers), 10);
                // All the numbers but the check_digit in reverse order
                const initial_numbers = _.initial(numbers).reverse();
                // math for the check digit
                const validation_1 =
                    10 -
                    (sum(
                        _.map(initial_numbers, function(number, index) {
                            return <any>number * (index % 2 ? 1 : 3);
                        })
                    ) %
                        10);

                // Fedex Ground
                if (check_digit === validation_1) {
                    return true;
                }

                let counter = 0;
                const digits = [1, 3, 7];
                const getDigit = function() {
                    const to_be_returned = counter;
                    counter = counter + 1 < digits.length ? counter + 1 : 0;
                    return to_be_returned;
                };
                const validation_2 =
                    (sum(
                        _.map(initial_numbers, function(number) {
                            return <any>number * digits[getDigit()];
                        })
                    ) %
                        11) %
                    10;

                // Fedex Express
                return check_digit === validation_2;
            }
        }
    },

    // @property {String} defaultUrl the default url to resolve unknown service names
    defaultUrl: 'http://www.google.com/search?q=',

    // @method getServiceUrl @param {String} tracking_number @return {String}
    getServiceUrl: function(tracking_number) {
        const service = _.find(this.services, function(service) {
            return (<any>service).validate(parse(tracking_number));
        });

        return (service ? (<any>service).url : this.defaultUrl) + tracking_number;
    },

    // @property {String} defaultName
    defaultName: null,

    // @method getServiceName @param {String} tracking_number @return {String}
    getServiceName: function(tracking_number) {
        const service = _.find(this.services, function(service) {
            return (<any>service).validate(parse(tracking_number));
        });

        return service ? (<any>service).name : this.defaultName;
    }
};

export = TrackingServices;
// @class TrackingService @property {String} name @property {String} url
// @method validate @param {String} numbers @return {Boolean}
