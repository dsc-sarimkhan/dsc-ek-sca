module.exports = {
    mock() {
        return {
            request: jest.fn(() => ({
                on: jest.fn(() => ({
                    write: jest.fn(),
                    end: jest.fn()
                }))
            }))
        };
    }
};
