module.exports = {
    mock() {
        return {
            existsSync: jest.fn(),
            readFileSync: jest.fn(),
            writeFileSync: jest.fn(),
            statSync: jest.fn()
        };
    }
};
