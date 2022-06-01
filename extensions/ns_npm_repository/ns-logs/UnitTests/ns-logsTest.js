const { log, color, bold, pad } = require('../index');

describe('ns-logs', () => {
    it('It should call a console log that has the current time and the text passed to the log function', () => {
        const text = 'test';
        const logConsole = jest.spyOn(console, 'log').mockImplementation(() => {});
        const escapedColor = color.GRAY.replace('\\', '\\\\').replace('[', '\\[');
        log(text);
        expect(logConsole).toBeCalledWith(
            expect.stringMatching(
                new RegExp(`\\[${escapedColor}[0-9]{2}:[0-9]{2}:[0-9]{2}\\x1b\\[0m\\] ${text}`)
            )
        );
    });
    describe('bold', () => {
        it('The method bold should return a text in bold', () => {
            const text = 'testBold';
            expect(bold(text)).toBe(`\u001b[1m${text}\u001b[22m`);
        });
    });
    describe('pad', () => {
        it('should add a 0 if number is less than 10', () => {
            const num = 4;
            expect(pad(num)).toBe('04');
        });
        it('should return the number if is 10', () => {
            const num = 10;
            expect(pad(num)).toBe('10');
        });
        it('should return the number if is more than 10', () => {
            const num = 11;
            expect(pad(num)).toBe('11');
        });
    });
});
