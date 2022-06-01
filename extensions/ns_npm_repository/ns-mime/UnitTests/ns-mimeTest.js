const mime = require('../index');

describe('ns-mime', () => {
    it(' should call getType method successfully', () => {
        expect(mime.getType('filepath/file-javascript.js')).toBe('application/javascript');
        expect(mime.getType('filepath/file-without-extension')).toBe(null);
        expect(mime.getType('filepath/file.with-unknown-extension')).toBe(null);
    });

    it(' should call getType method with error', () => {
        expect(() => mime.getType(true)).toThrow(new Error('file path required'));
        expect(() => mime.getType()).toThrow(new Error('file path required'));
    });
});
