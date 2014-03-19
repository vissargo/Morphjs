//namespace
/**
 * @namespace
 * @type {{}}
 */
this.vi = this.vi || {};

vi.Morphing = (function () {
    //private static properties:
    var _masterList = [],
        _reservedProps = {
            loop: true,
            yoyo: true,
            flexible: false
        };

    //private static methods:
    function switchAnimPosition(newAnimPosition) {
        var vertex,
            duration,
            startState,
            endState,
            a,
            i,
            n,
            self = this;

        this.initialized = true;
        this.currentAnim = newAnimPosition;

        a = this.animation[this.currentAnim];

        startState = this.states[a[this.inverseAnim ? 1 : 0]];
        endState = this.states[a[this.inverseAnim ? 0 : 1]];
        duration = a[2];

        this.startParams.vertices = this.vertices[startState[1]];
        this.endParams.vertices = this.vertices[endState[1]];

        this.startParams.indices = this.indices[startState[1]];
        this.endParams.indices = this.indices[endState[1]];

        this.startParams.img = this.images[startState[0]];
        this.endParams.img = this.images[endState[0]];

        this.movingVertices = [];
        for (i = 0, n = this.startParams.vertices.length; i < n; i++) {
            vertex = [ this.startParams.vertices[i][0],  this.startParams.vertices[i][1] ];
            this.movingVertices.push(vertex);
            vi.Tween.to(vertex, duration, { 0: this.endParams.vertices[i][0], 1: this.endParams.vertices[i][1] });
        }
        this.endParams.alpha = 0;
        vi.Tween.to(this.endParams, duration, { alpha: 1, onComplete: function () {
            gotoNextAnimation.call(self);
        } });
    }

    function gotoNextAnimation() {
        if (this.stopped) return;

        var n = this.animation.length;

        this.currentAnim += this.inverseAnim ? -1 : 1;

        if (this.currentAnim == n || this.currentAnim == -1) {
            if (this.loop) {
                if (this.yoyo) {
                    this.inverseAnim = !this.inverseAnim;
                    gotoNextAnimation.call(this);
                    return;
                } else
                    this.currentAnim = 0;
            } else
                return;
        }

        switchAnimPosition.call(this, this.currentAnim);
    }

    function update() {
        var n = _masterList.length,
            m;

        while (~(--n)) {
            m = _masterList[n];

            m.width != m.canvas.width && (m.width = m.canvas.width);
            m.height != m.canvas.height && (m.height = m.canvas.height);

            if (!m.initialized)continue;

            m.ctx.save();
            m.flexible
                ? m.ctx.transform(m.width / m.w, 0, 0, m.height / m.h, 0, 0)
                : m.ctx.transform(1, 0, 0, 1, (m.width - m.w) * .5, (m.height - m.h) * .5);

            draw(m._mainGraphics, m.startParams);
            draw(m._workGraphics, m.endParams);

            m.ctx.globalAlpha = m.endParams.alpha;
            m.ctx.drawImage(m.workCanvas, 0, 0);
            m.ctx.restore();
        }

        function draw(g, p) {
            g.beginImageFill(p.img);
            g.drawTriangles( m.movingVertices, p.indices, p.vertices);
        }
    }

    function add(m) {
        _masterList.push(m);
        vi.Update.addUpdateFunc(update);
    }

    function remove(m) {
        var i = _masterList.indexOf(m);
        if (~i)
            _masterList.splice(i, 1);

        if (!_masterList.length)
            vi.Update.delUpdateFunc(update);
    }

    /**
     * Creates a new vi.Morphing.
     * @memberof vi
     * @constructor
     * @param {Element} canvas Canvas.
     * @param {Object} params Example</br>
     *   <b>"w"</b>:300,</br>
     *   <b>"h"</b>:300,</br>
     *   <b>"flexible"</b>:true,</br>
     *   <b>"loop"</b>:true,</br>
     *   <b>"yoyo"</b>:true,</br>
     *   <b>"images"</b>:["img/01.jpg", "img/02.jpg"],</br>
     *   <b>"vertices"</b>:[</br>
     *       [ [ 0, 0 ],[ 150, 0 ],[ 300, 0 ],[ 0, 150 ],[ 300, 150 ],[ 0, 300 ],[ 150, 300 ],[ 300, 300 ],[ 117, 118 ],[ 191, 117 ],[ 154, 167 ],[ 154, 231 ],[ 109, 228 ],[ 201, 230 ],[ 155, 77 ],[ 156, 274 ] ],</br>
     *       [ [ 0, 0 ],[ 150, 0 ],[ 300, 0 ],[ 0, 150 ],[ 300, 150 ],[ 0, 300 ],[ 150, 300 ],[ 300, 300 ],[ 105, 122 ],[ 201, 118 ],[ 149, 186 ],[ 154, 231 ],[ 109, 228 ],[ 197, 223 ],[ 149, 96 ],[ 150, 283 ] ]</br>
     *   ],</br>
     *   <b>"states"</b>:[</br>
     *       [ 0, 0 ],</br>
     *       [ 1, 1 ]</br>
     *   ],</br>
     *   <b>"animation"</b>:[[ 0, 0, 1 ],[ 0, 1, 5 ],[ 1, 1, 1 ]]</br>
     **/
    var Morphing = function (canvas, params) {
        var p,
            self = this;

        for (p in _reservedProps)  if (!(p in params))
            params[p] = _reservedProps[p];


        for (p in params)
            this[p] = params[p];

        this.width = this.w;
        this.height = this.h;
        this.initialized = false;
        this.paused = false;
        this.stopped = false;
        this.inverseAnim = false;
        this.currentAnim = 0;
        this.movingVertices = [];
        this.startParams = {};
        this.endParams = {};
        this.indices = [];
        for (var i = 0, n = this.vertices.length; i < n; i++)
            this.indices.push(vi.Delaunay.triangulate(this.vertices[i]));

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this._mainGraphics = new vi.Graphics(this.ctx);

        this.workCanvas = document.createElement('canvas');
        this.workCanvas.width = this.width;
        this.workCanvas.height = this.height;
        this.workCtx = this.workCanvas.getContext("2d");
        this._workGraphics = new vi.Graphics(this.workCtx);

        vi.ImgCache.load(params.images, function () {
            switchAnimPosition.call(self, 0);
        });

        add(this);
    };


    // public methods:
    var p = Morphing.prototype;

    /**
     * Sets paused to true.
     * @function pause
     * @memberOf vi.Morphing#
     **/
    p.pause = function () {
        var n = this.movingVertices.length;
        while (~(--n))
            vi.Tween.pauseTween(this.movingVertices[n]);

        vi.Tween.pauseTween(this.endParams);

        this.paused = true;
    };

    /**
     * Sets paused to false.
     * @function resume
     * @memberOf vi.Morphing#
     **/
    p.resume = function () {
        var n = this.movingVertices.length;
        while (~(--n))
            vi.Tween.resumeTween(this.movingVertices[n]);

        vi.Tween.resumeTween(this.endParams);

        this.paused = false;
    };

    /**
     * Sets stopped to false.
     * @function play
     * @memberOf vi.Morphing#
     **/
    p.play = function () {
        this.stopped = false;
        gotoNextAnimation(this);
    };

    /**
     * Sets stopped to true.
     * @function stop
     * @memberOf vi.Morphing#
     **/
    p.stop = function () {
        this.stopped = true;
    };

    /**
     * Remove.
     * @function remove
     * @memberOf vi.Morphing#
     **/
    p.remove = function () {
        var n = this.movingVertices.length;
        while (~(--n))
            vi.Tween.killTween(this.movingVertices[n]);

        vi.Tween.killTween(this.endParams);
        remove(this);
    };

    return Morphing;

})();