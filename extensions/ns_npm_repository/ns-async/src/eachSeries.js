function eachSeriesObject(iterateOver, index, iteratorFunction, onEnd) {
    const objKeys = Object.keys(iterateOver);
    if (index === objKeys.length) {
        onEnd();
    } else {
        iteratorFunction(iterateOver[objKeys[index]], function(err) {
            eachSeriesObject(iterateOver, index + 1, iteratorFunction, () => onEnd(err));
        });
    }
}

function eachSeriesArray(iterateOver, index, iteratorFunction, onEnd) {
    if (index === iterateOver.length) {
        onEnd();
    } else {
        iteratorFunction(iterateOver[index], function(err) {
            eachSeriesArray(iterateOver, index + 1, iteratorFunction, () => onEnd(err));
        });
    }
}

function eachSeries(iterateOver, iteratorFunction, onEnd) {
    if (Array.isArray(iterateOver)) {
        eachSeriesArray(iterateOver, 0, iteratorFunction, onEnd);
    } else {
        eachSeriesObject(iterateOver, 0, iteratorFunction, onEnd);
    }
}

module.exports = eachSeries;
