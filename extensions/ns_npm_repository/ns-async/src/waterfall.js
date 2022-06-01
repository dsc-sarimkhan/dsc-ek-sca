function waterfall(fns = [], cb = function() {}, data) {
    const [fn] = fns;
    function innerCb(err, output) {
        // calls itself without the first element in the array of functions
        return err ? cb(err) : waterfall(fns.slice(1), cb, output);
    }
    // call first element in the array of functions
    return fn ? fn(...(data ? [data, innerCb] : [innerCb])) : cb(null, data);
}

module.exports = waterfall;
