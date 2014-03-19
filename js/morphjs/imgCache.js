//namespace
/**
 * @namespace
 * @type {{}}
 */
this.vi = this.vi || {};

/**
 * @namespace
 * @memberof vi
 * @inner
 * @type {{}}
 */
vi.ImgCache = (function () {
    //private static properties:
    var _cacheImgList = {},
        _cachePatternList = {},
        _ctx = document.createElement('canvas').getContext('2d');

    //public static methods:
    /**
     * @function load
     * @memberOf vi.ImgCache
     * @param {(string|string[])} srcArr Image URL or [Image URL, Image URL,...Image URL]
     * @param {Function} completeCallBackFunc Executed when the download is complete.
     * @param {Function} progressCallBackFunc returns as a percentage from 0 to 100.
     */
    function load(srcArr, completeCallBackFunc, progressCallBackFunc) {
        if (!srcArr)
            return;
        else if (typeof srcArr == "string")
            srcArr = [srcArr];
        else if (Object.prototype.toString.call(srcArr) !== '[object Array]')
            return;


        var countdown = srcArr.length,
            i = 0,
            n = countdown;

        for (; i < n; i++)
            loadImg(srcArr[i]);

        function loadImg(src) {
            if(_cacheImgList[src]) {
                checkComplete();
                return;
            }

            var img = new Image();
            img.onload = function () {
                _cacheImgList[src] = this;
                checkComplete();
            };
            img.src = src;

            function checkComplete() {
                countdown--;
                progressCallBackFunc && progressCallBackFunc((n - countdown) * 100 / n);
                countdown || completeCallBackFunc && completeCallBackFunc();
            }
        }
    }

    /**
     * @function addImgFromBase64
     * @memberOf vi.ImgCache
     * @param {String} src Image URL
     * @param {String} base64 Image in Base64
     */
    function addImgFromBase64(src, base64) {
        if(_cacheImgList[src])
            return;

        var img = new Image();
        img.src = base64;
        _cacheImgList[src] = img;
    }

    /**
     * @function getImg
     * @memberOf vi.ImgCache
     * @param {String} src Image URL
     * @return {Image}
     */
    function getImg(src) {
        return _cacheImgList[src];
    }

    /**
     * @function getPattern
     * @memberOf vi.ImgCache
     * @param {String} src Image URL
     * @param {boolean} repeatX
     * @param {boolean} repeatY
     * @return {CanvasPattern}
     */
    function getPattern(src, repeatX, repeatY) {
        var img;
        if (!_cachePatternList[src]) {
            img = getImg(src);
            img && (_cachePatternList[src] = _ctx.createPattern(img,
                repeatX && repeatY
                    ? 'repeat'
                    : repeatX && !repeatY
                        ? 'repeat-x'
                        : !repeatX && repeatY
                            ? 'repeat-y'
                            : 'no-repeat'));
        }
        return _cachePatternList[src];
    }

    return {getImg: getImg, getPattern: getPattern, load: load, addImgFromBase64: addImgFromBase64};

}());