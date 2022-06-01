const httpsMock = require('./httpsMock');

module.exports = {
    mock() {
        return httpsMock.mock();
    }
};
