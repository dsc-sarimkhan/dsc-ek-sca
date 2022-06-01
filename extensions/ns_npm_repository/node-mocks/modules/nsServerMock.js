module.exports = {
    mock() {
        return {
            createServer: jest.fn(() => ({
                use: jest.fn(),
                listen: jest.fn()
            }))
        };
    }
};
