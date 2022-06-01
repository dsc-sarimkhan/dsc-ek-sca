const color = {
    MAGENTA: '\x1b[35m',
    GRAY: '\x1b[90m',
    CYAN: '\x1b[36m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    GREEN: '\x1b[32m'
};

const colorText = (textColor, text) => `${textColor}${text}\x1b[0m`;
const bold = text => `\u001b[1m${text}\u001b[22m`;

const pad = num => (num >= 10 ? String(num) : `0${num}`);

const log = message => {
    const today = new Date();
    console.log(
        `[${colorText(
            color.GRAY,
            `${pad(today.getHours())}:${pad(today.getMinutes())}:${pad(today.getSeconds())}`
        )}] ${message}`
    );
};

module.exports = {
    log,
    pad,
    color,
    colorText,
    bold
};
