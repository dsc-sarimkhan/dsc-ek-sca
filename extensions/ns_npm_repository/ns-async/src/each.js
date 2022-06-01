function each(iterateOver, eachFunction, onEnd) {
    const eachFunctions = iterateOver.map(item => {
        return new Promise(resolve => {
            eachFunction(item, () => {
                resolve();
            });
        });
    });
    Promise.all(eachFunctions).then(() => {
        onEnd();
    });
}

module.exports = each;
