let nsArgs;
let args;

describe('ns-args', () => {
    beforeAll(() => {
        // editing process.argv to simulate input of arguments
        // Note: should be made before the require to work fine
        process.argv.push('--arg1', 'A', '--arg2', '--arg-with-dashes', 'C', '--argObject.b', 'B', '--argCamelCase', '1', '--no-argument', '-m', 'M');
        nsArgs = require('../index');
    });

    describe('argv method', () => {
        beforeAll(() => {
            args = nsArgs.argv();
        });
        it('should execute successfully', () => {
            expect(args._).toBeDefined();
            expect(args.arg1).toBe('A');
        });

        it('should return arguments without values as boolean true', () => {
            expect(args.arg2).toBe(true);
        });

        it('should transform arguments with dashes to camelCase', () => {
            expect(args['arg-with-dashes']).toBe('C');
            expect(args.argWithDashes).toBe('C');
        });

        it('should transform arguments camelCase to separated by dash', () => {
            expect(args.argCamelCase).toBe('1');
            expect(args['arg-camel-case']).toBe('1');
        });

        it('should transform arguments with dots to objects', () => {
            expect(args.argObject.b).toBe('B');
        });

        it('should transform arguments starting with no- to falsy', () => {
            expect(args.argument).toBe(false);
        });

        it('should accept arguments in short mode', () => {
            expect(args.m).toBe('M');
        });
    });

    describe('option method', () => {
        it('should add alias for arguments successfully', () => {
            let optionKey1 = 'argKey';
            let optionValue1 = { alias: ['arg1', 'aliasArg1', 'object.alias', 'alias-camel-case'] };

            nsArgs.option(optionKey1, optionValue1);

            let args = nsArgs.argv();

            expect(args.aliasArg1).toBe('A');
            expect(args.argKey).toBe('A');
            expect(args.arg1).toBe('A');
            expect(args.object.alias).toBe('A');
            expect(args['alias-camel-case']).toBe('A');
            expect(args.aliasCamelCase).toBe('A');
        });
    });

    describe('addHiddenParam method', () => {
        it('should add an arguments programmatically', () => {
            let hiddenParamValue = 'hiddenValue';
            nsArgs.addHiddenParam('hiddenArg', hiddenParamValue);
            nsArgs.addHiddenParam('hiddenArg2');

            let args = nsArgs.argv();

            expect(args.hiddenArg).toBe(hiddenParamValue);
            expect(args.hiddenArg2).toBe(true);
        });
    });
});
