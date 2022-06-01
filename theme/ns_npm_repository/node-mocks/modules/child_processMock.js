module.exports = {
    mock() {
        return {
            exec: jest.fn(() => ({
                on: jest.fn()
            }))
        };
    }
};
