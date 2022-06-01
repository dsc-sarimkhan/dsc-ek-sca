module.exports = {
    mock() {
        return { format: jest.fn(() => 'http://test.com') };
    }
};
