function parallel(iterateOver) {
    return new Promise(resolveParent => {
        const parallelFunction = iterateOver.map(item => {
            return new Promise(resolve => {
                item(() => {
                    resolve();
                });
            });
        });
        Promise.all(parallelFunction).then(() => {
            resolveParent();
        });
    });
}

module.exports = parallel;
