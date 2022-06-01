const async = require('../async');

describe('ns-async', () => {
    describe('waterfall', () => {
        it('should call final callback after calling all functions and their callbacks', done => {
            const callOrder = [];
            async.waterfall(
                [
                    cb =>
                        setTimeout(() => {
                            callOrder.push(1);
                            cb();
                        }, 50),
                    cb => {
                        callOrder.push(2);
                        cb();
                    }
                ],
                () => {
                    expect(callOrder).toStrictEqual([1, 2]);
                    done();
                }
            );
        });
        it('should pass error as first argument to final callback if any', done => {
            const testError = new Error('Test error');
            async.waterfall(
                [
                    cb => {
                        cb(testError);
                    }
                ],
                err => {
                    expect(err).toBe(testError);
                    done();
                }
            );
        });
        it('should pass result as second argument to final callback if success', done => {
            const testResult = 'Test result';
            async.waterfall(
                [
                    cb => {
                        cb(null, testResult);
                    }
                ],
                (err, result) => {
                    expect(err).toBeNull();
                    expect(result).toBe(testResult);
                    done();
                }
            );
        });
    });
    describe('eachSeries', () => {
        it('should add 1 to each element in the iterator function', async done => {
            const testResult = [];
            await async.eachSeries(
                [1, 2, 3, 4, 5],
                function(element, next) {
                    testResult.push(element + 1);
                    next();
                },
                done
            );
            expect([2, 3, 4, 5, 6]).toEqual(expect.arrayContaining(testResult));
        });
        it('should add Test to each object property value in the iterator function', async done => {
            const testResult = {};
            await async.eachSeries(
                { name: 'async', description: 'description' },
                function(element, next) {
                    testResult[element] = `${element}Test`;
                    next();
                },
                done
            );
            expect(testResult).toMatchObject({
                async: 'asyncTest',
                description: 'descriptionTest'
            });
        });
    });
    describe('each', () => {
        it('should add 2 to each element in the each iterator function', done => {
            const testResult = [];
            async.each(
                [1, 2, 3, 4, 5],
                function(element, cb) {
                    setTimeout(() => {
                        testResult.push(element + 2);
                        cb();
                    }, 0);
                },
                () => {
                    expect([3, 4, 5, 6, 7]).toEqual(expect.arrayContaining(testResult));
                    done();
                }
            );
        });
        it('should call the end function after have been called all each iterator functions', done => {
            const testResult = [];
            let index = 1;
            async.each(
                [56, 78, 23],
                function(element, cb) {
                    testResult.push(index);
                    index++;
                    cb();
                },
                () => {
                    expect([1, 2, 3]).toEqual(expect.arrayContaining(testResult));
                    done();
                }
            );
        });
    });
    describe('series', () => {
        it('should return an array with its element ordered like the series of function passed as the first parameter', done => {
            async.series(
                [
                    function(callback) {
                        setTimeout(function() {
                            callback(null, 'one');
                        }, 200);
                    },
                    function(callback) {
                        setTimeout(function() {
                            callback(null, 'two');
                        }, 100);
                    }
                ],
                function(err, results) {
                    expect(results[0]).toBe('one');
                    expect(results[1]).toBe('two');
                    done();
                }
            );
        });
        it('should return stop the execution of the series because the callback has an error', done => {
            async.series(
                [
                    function(callback) {
                        setTimeout(function() {
                            callback(null, 'one');
                        }, 200);
                    },
                    function(callback) {
                        setTimeout(function() {
                            callback('error', 'two');
                        }, 100);
                    },
                    function(callback) {
                        setTimeout(function() {
                            callback(null, 'three');
                        }, 0);
                    }
                ],
                function(err, results) {
                    expect(err).toBe('error');
                    expect(results[2]).toBeUndefined();
                    done();
                }
            );
        });
    });
    describe('parallel', () => {
        it('should run both functions and return a promise', () => {
            const parallelFunctionTest = [];
            async
                .parallel([
                    function(callback) {
                        setTimeout(function() {
                            parallelFunctionTest.push(1);
                            callback();
                        }, 0);
                    },
                    function(callback) {
                        setTimeout(function() {
                            parallelFunctionTest.push(2);
                            callback();
                        }, 0);
                    }
                ])
                .then(() => {
                    expect(parallelFunctionTest[0]).toBe(1);
                    expect(parallelFunctionTest[1]).toBe(2);
                });
        });
    });
    describe('doUntil', () => {
        it('should run the iteratee function until the untilFunction returns true', done => {
            let cont = 0;
            async.doUntil(
                function(doUntilFunction) {
                    setTimeout(function() {
                        cont++;
                        doUntilFunction();
                    }, 0);
                },
                async function() {
                    return cont === 4;
                },
                function() {
                    expect(cont).toBe(4);
                    done();
                }
            );
        });
    });
});
