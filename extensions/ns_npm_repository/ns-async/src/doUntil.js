function doUntil(iterateeFunction, doUntilFunction, onEnd) {
    iterateeFunction(async () => {
        const stopIteration = await doUntilFunction();
        if (stopIteration) {
            onEnd();
        } else {
            doUntil(iterateeFunction, doUntilFunction, onEnd);
        }
    });
}

module.exports = doUntil;
