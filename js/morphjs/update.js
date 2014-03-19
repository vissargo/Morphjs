//namespace
/**
 * @namespace
 * @type {{}}
 */
this.vi = this.vi || {};

window.requestAnimFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
        return function (callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

/**
 * @namespace
 * @memberof vi
 * @inner
 * @type {{}}
 */
vi.Update = (function () {
    //private static properties:
    var _updateFuncList = [],
        _currentTime = new Date().getTime(),
        _lastTime = _currentTime,
        _elapsed,
        _fps,
        _fpsInterval;

    //init
    setFps(60);
    step();

    //private static methods:
    function step() {
        _currentTime = new Date().getTime();
        _elapsed = _currentTime - _lastTime;

        if (_elapsed > _fpsInterval) {
            _lastTime = _currentTime - (_elapsed % _fpsInterval);

            var n = _updateFuncList.length;
            while (~(--n))
                _updateFuncList[n]();
        }
        requestAnimFrame(step);
    }

    //public static methods:
    /**
     * @function addUpdateFunc
     * @memberOf! vi.Update
     * @param {Function} func
     */
    function addUpdateFunc(func) {
        if (!~_updateFuncList.indexOf(func))// ==-1
            _updateFuncList.unshift(func);
    }

    /**
     * @function delUpdateFunc
     * @memberOf! vi.Update
     * @param {Function} func
     */
    function delUpdateFunc(func) {
        var i = _updateFuncList.indexOf(func);
        if (~i)
            _updateFuncList.splice(i, 1);
    }

    // setters
    /**
     * @function setFps
     * @memberOf! vi.Update
     * @param {Number} fps
     */
    function setFps(fps) {
        fps > 0 && fps <= 60 && (_fps = fps );
        _fpsInterval = 1000 / _fps;
    }

    // getters
    /**
     * @function getFps
     * @memberOf! vi.Update
     * @return {Number}
     */
    function getFps() {
        return _fps;
    }

    /**
     * @function getFps
     * @memberOf! vi.Update
     * @return {Number}
     */
    function getCurrentTime() {
        return _currentTime * .001;
    }


    return {
        setFps: setFps,
        getFps: getFps,
        getCurrentTime: getCurrentTime,
        addUpdateFunc: addUpdateFunc,
        delUpdateFunc: delUpdateFunc
    };

})();