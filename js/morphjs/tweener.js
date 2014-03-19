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
vi.Tween = (function () {
    //private static properties:
    var _masterList = [],
        _reservedProps = {
            ease: "linear",
            delay: 0,
            onStart: null,
            onStartParams: null,
            onUpdate: null,
            onUpdateParams: null,
            onComplete: null,
            onCompleteParams: null,
            startPauseTime: 0
        };

    //private static methods:
    function step() {
        var n = _masterList.length,
            easing = vi.Tween.easing,
            duration,
            target,
            ratio,
            time,
            i,
            t,
            propArr,
            propTweens,
            currentTime = vi.Update.getCurrentTime();

        while (~(--n)) {
            t = _masterList[n];

            if (t.startPauseTime) continue;

            if (!t.startTime) {
                t.startTime = currentTime + t.vars.delay;
                if (t.vars.onStart) if (t.vars.onStartParams) t.vars.onStart.apply(null, t.vars.onStartParams); else t.vars.onStart();
            }

            duration = t.duration;
            target = t.target;
            time = currentTime - t.startTime;

            if (time >= duration) {
                time = duration;
                ratio = 1;
            } else if (time <= 0) {
                ratio = 0;
            } else {
                ratio = easing[t.vars.ease](time, 0, 1, duration);
            }

            propTweens = t.propTweens;
            i = propTweens.length;
            while (~(--i)) {
                propArr = propTweens[i];
                target[propArr[0]] = propArr[1] + (ratio * propArr[2]);
            }

            if (t.vars.onUpdate) if (t.vars.onUpdateParams) t.vars.onUpdate.apply(null, t.vars.onUpdateParams); else t.vars.onUpdate();
            if (time == duration) {
                if (t.vars.onComplete) if (t.vars.onCompleteParams) t.vars.onComplete.apply(null, t.vars.onCompleteParams); else t.vars.onComplete();
                _masterList.splice(n, 1);
                if (t.__next) {
                    t = t.__next;
                    for (var p in t.vars) if (!(p in _reservedProps))
                        t.propTweens[t.propTweens.length] = [p, t.target[p], (typeof(t.vars[p]) == "number") ? t.vars[p] - t.target[p] : Number(t.vars[p])];

                    _masterList[_masterList.length] = t;
                }
            }
        }

        if (!_masterList.length)
            vi.Update.delUpdateFunc(step);
    }


    //public static methods:
    /**
     * @function to
     * @memberOf! vi.Tween
     * @param {Object} target Target object whose properties this tween affects.
     * @param {Number} duration Duration in seconds
     * @param {Object} vars An object containing the end values of the properties you're tweening.
     * @param {boolean} round
     */
    function to(target, duration, vars, round) {
        var p,
            t = {};

        t.target = target;
        t.duration = duration;
        t.vars = vars;
        t.propTweens = [];

        for (p in _reservedProps)  if (!(p in t.vars))
            t.vars[p] = _reservedProps[p];

        if (t.vars.__t) {
            t.vars.__t.__next = t;
        } else {
            for (p in t.vars) if (!(p in _reservedProps))
                t.propTweens[t.propTweens.length] = [p, t.target[p], (typeof(t.vars[p]) == "number") ? t.vars[p] - t.target[p] : Number(t.vars[p])];

            _masterList[_masterList.length] = t;

            vi.Update.addUpdateFunc(step);
        }

        return {
            to: function (target, duration, vars) {
                vars.__t = t;
                return vi.Tween.to(target, duration, vars);
            }
        };
    }


    /**
     * Kills the tween  of a particular object.
     * @function killTween
     * @memberOf! vi.Tween
     * @param {Object} target Object whose tween should be immediately killed.
     */
    function killTween(target) {
        var n = _masterList.length;
        while (~(--n))if (_masterList[n].target == target) {
            _masterList.splice(n, 1);
        }
    }

    /**
     * Pauses the tween  of a particular object.
     * @function pauseTween
     * @memberOf! vi.Tween
     * @param {Object} target Object whose tween should be immediately paused.
     */
    function pauseTween(target) {
        var n = _masterList.length;
        while (~(--n))if (_masterList[n].target == target)
            _masterList[n].startPauseTime = vi.Update.getCurrentTime();
    }

    /**
     * Resumes the tween  of a particular object.
     * @function resumeTween
     * @memberOf! vi.Tween
     * @param {Object} target Object whose tween should be immediately resumed.
     */
    function resumeTween(target) {
        var n = _masterList.length,
            t;
        while (~(--n))if (_masterList[n].target == target) {
            t = _masterList[n];
            t.startTime = vi.Update.getCurrentTime() - (t.startPauseTime - t.startTime);
            t.startPauseTime = 0;
        }
    }

    return {to: to, killTween: killTween, pauseTween: pauseTween, resumeTween: resumeTween};

})();


/**
 * <b>Easing Equations</b></br>
 * (c) 2003 Robert Penner, all rights reserved.</br>
 * This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html.
 * @memberOf! vi.Tween
 * @property easing
 * @type {Object}
 */
vi.Tween.easing = {
    linear: function (t, b, c, d) {
        return c * t / d + b;
    },
    easeInQuad: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeOutInCubic: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutCubic(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInCubic((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInQuart: function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeOutInQuart: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutQuart(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInQuart((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInQuint: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeOutInQuint: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutQuint(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInQuint((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeOutInSine: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutSine(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInSine((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInExpo: function (t, b, c, d) {
        return(t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
    },
    easeOutExpo: function (t, b, c, d) {
        return(t == d) ? b + c : c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 0.0005;
        return c / 2 * 1.0005 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeOutInExpo: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutExpo(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInExpo((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInCirc: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeOutInCirc: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutCirc(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInCirc((t * 2) - d, b + c / 2, c / 2, d);
    },
    easeInElastic: function (t, b, c, d, a, p) {
        var s;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (t, b, c, d, a, p) {
        var s;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return(a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    easeInOutElastic: function (t, b, c, d, a, p) {
        var s;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeOutInElastic: function (t, b, c, d, a, p) {
        if (t < d / 2) return vi.Tween.easing.easeOutElastic(t * 2, b, c / 2, d, a, p);
        return vi.Tween.easing.easeInElastic((t * 2) - d, b + c / 2, c / 2, d, a, p);
    },
    easeInBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeOutInBack: function (t, b, c, d, s) {
        if (t < d / 2) return vi.Tween.easing.easeOutBack(t * 2, b, c / 2, d, s);
        return vi.Tween.easing.easeInBack((t * 2) - d, b + c / 2, c / 2, d, s);
    },
    easeInBounce: function (t, b, c, d) {
        return c - vi.Tween.easing.easeOutBounce(d - t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
        else return vi.Tween.easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    },
    easeOutInBounce: function (t, b, c, d) {
        if (t < d / 2) return vi.Tween.easing.easeOutBounce(t * 2, b, c / 2, d);
        return vi.Tween.easing.easeInBounce((t * 2) - d, b + c / 2, c / 2, d);
    }
};