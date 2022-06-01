const types = {
    css: 'text/css',
    eot: 'application/vnd.ms-fontobject',
    gif: 'image/gif',
    html: 'text/html',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    json: 'application/json',
    mp4: 'video/mp4',
    otf: 'application/font-otf',
    png: 'image/png',
    scss: 'text/x-scss',
    svg: 'image/svg+xml',
    tpl: 'application/vnd.groove-tool-template',
    ttf: 'font/ttf',
    txt: 'text/plain',
    wav: 'audio/wav',
    woff: 'font/woff',
    woff2: 'font/woff2'
};

const getType = filePath => {
    if (typeof filePath !== 'string') {
        throw new Error('file path required');
    }
    return types[filePath.split('.').pop()] || null;
}

module.exports = { getType };
