function series(iterateOver, onEnd, index = 0, seriesResult = [], err = null) {
    if (err) {
        onEnd(err, seriesResult);
    } else if (index === iterateOver.length) {
        onEnd(null, seriesResult);
    } else {
        iterateOver[index]((error, result) => {
            seriesResult[index] = result;
            series(iterateOver, onEnd, index + 1, seriesResult, error);
        });
    }
}

module.exports = series;
