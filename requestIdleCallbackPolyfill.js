window.requestIdleCallback = window.requestIdleCallback || function (callback) {
    const start = Date.now();
    return setTimeout(() => {
        callback({
            didMount: false,
            timeRemaining: function () {
                return Math.max(0, 50 - (Date.now() - start))
            } 
        })
    }, 1);
}
window.clearIdleCallback = function (id) {
    clearTimeout(id)
}