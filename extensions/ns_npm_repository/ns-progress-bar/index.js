function ProgressBar(fmt, options) {
    this.stream = process.stderr;

    if (typeof fmt !== 'string') {
        throw new Error('format required');
    }
    if (typeof options.total !== 'number') {
        throw new Error('total required');
    }

    this.fmt = fmt;
    this.current = 0;
    this.total = options.total;
    this.width = options.width || this.total;
    this.chars = {
        complete: options.complete || '=',
        incomplete: options.incomplete || '-',
        head: options.complete || '='
    };
    this.renderThrottle = 10;
    this.lastRender = 0;
    this.lastDraw = '';
}

ProgressBar.prototype.tick = function(len) {
    len = len !== 0 ? len : 1;
    this.current += len;

    this.render();

    if (this.current >= this.total) {
        this.render(true);
        this.complete = true;
        this.stream.write('\n');
    }
};

ProgressBar.prototype.render = function(force) {
    force = force !== undefined ? force : false;

    if (!this.stream.isTTY) {
        return;
    }

    const now = Date.now();
    const delta = now - this.lastRender;
    if (!force && delta < this.renderThrottle) {
        return;
    }
    this.lastRender = now;

    let ratio = this.current / this.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    const percent = Math.floor(ratio * 100);
    let incomplete;
    let complete;
    let completeLength;

    let str = this.fmt.replace(':percent', `${percent.toFixed(0)}%`);

    let availableSpace = Math.max(0, this.stream.columns - str.replace(':bar', '').length);
    if (availableSpace && process.platform === 'win32') {
        availableSpace -= 1;
    }

    const width = Math.min(this.width, availableSpace);

    completeLength = Math.round(width * ratio);
    complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
    incomplete = Array(Math.max(0, width - completeLength + 1)).join(this.chars.incomplete);

    if (completeLength > 0) {
        complete = complete.slice(0, -1) + this.chars.head;
    }

    str = str.replace(':bar', complete + incomplete);

    if (this.lastDraw !== str) {
        this.stream.cursorTo(0);
        this.stream.write(str);
        this.stream.clearLine(1);
        this.lastDraw = str;
    }
};

module.exports = ProgressBar;
