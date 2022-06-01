// webdriverio script that opens a jasmine spec page and will
// output results to stdout. the client js code will notify when the test
// finish running - and this is done in the jasmine generator defined at gulp/tasks/unit-test.js

const webdriverio = require('webdriverio');
const args = require('yargs').argv;

const options = {
    capabilities: {
        browserName: 'chrome'
    },
    logLevel: 'error',
    maxInstances: 10
};
const url = 'http://localhost:7777/test1.html';

// for supporting gulp unit-test --instrument-frontend - the spawner
// is passing us args.coverageServer - we are responsible of posting after the test finish
const { coverageServer } = args;
const coverageServerPostJs = !coverageServer
    ? ''
    : `
	SC.dontSetRequestHeaderTouchpoint = true;
	jQuery.post('${coverageServer}/__coverage__', JSON.stringify(window.__coverage__));
`;

(async () => {
    const browser = await webdriverio.remote(options);
    await browser.url(url);

    browser.setTimeout({ script: 5 * 60 * 1000 });
    await browser.executeAsync(function(coverageServerPostJs, done) {
        const timer = setInterval(function() {
            if (window.jasmineDone) {
                clearInterval(timer);
                if (coverageServerPostJs) {
                    eval(coverageServerPostJs);
                    setTimeout(function(){done(true)}, 2000)
                } else {
                    done(true);
                }
            }
        }, 100);
    }, coverageServerPostJs);

    const result = await browser.execute(function() {
        const selectors = document.querySelectorAll('.jasmine-alert .jasmine-passed');
        const errorSelectors = document.querySelectorAll('.jasmine-failed');
        const failed = errorSelectors.length;

        let msg = selectors.length ? selectors[0].innerText : 'fail';
        if (failed) {
            msg = document.querySelectorAll('.jasmine-overall-result')[0].innerText;
        }

        return JSON.stringify({
            failed: failed,
            msg: msg
        });
    });

    const value = JSON.parse(result);
    console.log(value.msg);
    process.exit(value.failed ? 1 : 0);
})().catch(console.error);
