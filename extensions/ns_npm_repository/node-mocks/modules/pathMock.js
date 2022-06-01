module.exports = {
    mock() {
        return {
            join: jest.fn(),
            resolve: jest.fn(),
            extname: jest.fn(),
            basename: jest.fn(),
            dirname: jest.fn()
        };
    }
};
