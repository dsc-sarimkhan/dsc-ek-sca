const c = require('ansi-colors');

const logs = message => {
    const today = new Date();
    const minutes = today.getMinutes() > 10 ? today.getMinutes() : `0${today.getMinutes()}`;
    const seconds = today.getSeconds() > 10 ? today.getSeconds() : `0${today.getSeconds()}`;
    console.log(`[${c.gray(`${today.getHours()}:${minutes}:${seconds}`)}] ${message}`);
};

module.exports = logs;
