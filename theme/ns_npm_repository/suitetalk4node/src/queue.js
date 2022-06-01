const Queue = function() {
    let lastPromise = null;
    this.add = (context, fn) => {
        lastPromise = new Promise(resolve => {
            const queueDeferred = this.setup();

            if (context === undefined) {
                context = this;
            }

            // execute next queue method
            queueDeferred.then(function() {
                // call actual method and wrap output in deferred
                setTimeout(function() {
                    fn.call(context, function() {
                        resolve();
                    });
                }, 0);
            });
        });
    };

    this.setup = () => {
        // when the previous method returns, resolve this one
        if (!lastPromise) {
            lastPromise = new Promise(resolve => {
                resolve();
            });
        }
        return new Promise(resolve => {
            resolve();
        });
    };
};

module.exports = Queue;
