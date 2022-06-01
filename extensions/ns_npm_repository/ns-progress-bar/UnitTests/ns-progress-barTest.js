const Progress = require('../index');

const fmt = 'Uploading [:bar] :percent';
const options = {
    complete: '=',
    incomplete: ' ',
    width: 50,
    total: 100
};

describe('ns-progress-bar', () => {
    describe('constructor method', () => {
        it('should create a new progress bar successfully', () => {

            const bar = new Progress(fmt, options);

            expect(bar.stream).not.toBe(null);
            expect(bar.fmt).toBe(fmt);
            expect(bar.total).toBe(options.total);
            expect(bar.width).toBe(options.width);
            expect(bar.chars.complete).toBe(options.complete);
            expect(bar.chars.incomplete).toBe(options.incomplete);
            expect(bar.chars.head).toBe(options.complete);

        });

        it('should throw an error creating a new progress without format string', () => {
            expect(() => new Progress({
                complete: '=',
                incomplete: ' ',
                width: 50,
                total: 100
            })).toThrow(
                new Error('format required')
            );
        });

        it('should throw an error creating a new progress without total number', () => {
            expect(() => new Progress('Uploading [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 50
            })).toThrow(
                new Error('total required')
            );
        });
    });

    describe('tick method', () => {
        it('should call tick method successfully with unfinished progress', () => {
            const bar = new Progress(fmt, options);
            expect(bar.current).toBe(0);
            const len = 1;

            spyOn(bar, 'render');
            bar.tick(len);

            expect(bar.current).toBe(len);
            expect(bar.render).toHaveBeenCalled();
        });

        it('should call tick method successfully ending the progress', () => {
            const bar = new Progress(fmt, options);
            expect(bar.current).toBe(0);
            const len = 10;

            spyOn(bar, 'render');
            spyOn(bar.stream, 'write');
            let i;
            for(i=0; i<10; i++) {
                bar.tick(len);
            }

            expect(bar.current).toBe(len * i);
            expect(bar.render).toHaveBeenCalledWith(true);
            expect(bar.complete).toBe(true);
            expect(bar.stream.write).toHaveBeenCalledWith('\n');
        });
    });

    describe('render method', () => {
        it('should call render method successfully with force param', () => {
            const bar = new Progress(fmt, options);
            bar.tick(1);
            bar.render(true);
            expect(bar.lastDraw).not.toBe(null);
            expect(bar.lastDraw).not.toBe('');
        });

        it('should call render method successfully without params', () => {
            const bar = new Progress(fmt, options);
            bar.tick(1);
            bar.render();
            expect(bar.lastDraw).not.toBe(null);
            expect(bar.lastDraw).not.toBe('');
        });
    });
});
