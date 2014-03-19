//namespace
/**
 * @namespace
 * @type {{}}
 */
this.vi = this.vi || {};

vi.Graphics = (function(){
    /**
     * Creates a new vi.Graphics.
     * @memberof vi
     * @constructor
     * @param {CanvasRenderingContext2D} ctx.
     **/
    var Graphics = function(ctx){
        this.ctx = ctx;
    };

    // public methods:
    var p = Graphics.prototype;

    /**
     * @function beginImageFill
     * @memberof vi.Graphics#
     * @param {string} src image url
     * @param {boolean} repeatX
     * @param {boolean} repeatY
     */
    p.beginImageFill = function(src, repeatX, repeatY){
        this.ctx.fillStyle = vi.ImgCache.getPattern(src, repeatX, repeatY);
    };


    /**
     * @function drawTriangles
     * @memberof vi.Graphics#
     * @param {[][]} vertices A Array of Numbers where each pair of numbers is treated as a coordinate location [x, y].
     * @param {[][]} indices A Array of integers or indexes, where every three indexes define a triangle [i1, i2, i3].
     * @param {[][]} uvtData A Array of coordinates(not normalized) used to apply texture mapping [x, y].
     */
    p.drawTriangles = function (vertices, indices, uvtData){
        var i1, i2, i3,
            i = 0,
            n = indices.length;

        for (; i < n; i += 3) {
            i1 = indices[i];
            i2 = indices[i + 1];
            i3 = indices[i + 2];
            this.drawTexturedTriangle(
                vertices[i1][0], vertices[i1][1], vertices[i2][0], vertices[i2][1], vertices[i3][0], vertices[i3][1],
                uvtData[i1][0], uvtData[i1][1], uvtData[i2][0], uvtData[i2][1], uvtData[i3][0], uvtData[i3][1]
            );
        }
    };


    /**
     * uses affine texture mapping to draw a textured triangle
     * at screen coordinates [x0, y0], [x1, y1], [x2, y2] from
     * img *pixel* coordinates [u0, v0], [u1, v1], [u2, v2]
     * @function drawTexturedTriangle
     * @memberof vi.Graphics#
     * @see http://extremelysatisfactorytotalitarianism.com/blog/?p=2120
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Number} u0
     * @param {Number} v0
     * @param {Number} u1
     * @param {Number} v1
     * @param {Number} u2
     * @param {Number} v2
     * @param {Image|null} img
     */
    p.drawTexturedTriangle = function ( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, img) {
        var arr, a, b, c, d, e, f, det, idet, x, y;

        arr = expand(x0, y0, x1, y1);
        x0 = arr[0]; y0 = arr[1]; x1 = arr[2]; y1 = arr[3];
        arr = expand(x1, y1, x2, y2);
        x1 = arr[0]; y1 = arr[1]; x2 = arr[2]; y2 = arr[3];
        arr = expand(x2, y2, x0, y0);
        x2 = arr[0]; y2 = arr[1]; x0 = arr[2]; y0 = arr[3];

        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.closePath();

        x1 -= x0; y1 -= y0;
        x2 -= x0; y2 -= y0;

        u1 -= u0; v1 -= v0;
        u2 -= u0; v2 -= v0;

        det = u1 * v2 - u2 * v1;

        if ( det === 0 ) return;

        idet = 1 / det;

        a = ( v2 * x1 - v1 * x2 ) * idet;
        b = ( v2 * y1 - v1 * y2 ) * idet;
        c = ( u1 * x2 - u2 * x1 ) * idet;
        d = ( u1 * y2 - u2 * y1 ) * idet;

        e = x0 - a * u0 - c * v0;
        f = y0 - b * u0 - d * v0;

        this.ctx.save();
        this.ctx.transform( a, b, c, d, e, f );
        if(img){
            this.ctx.clip();
            this.ctx.drawImage(img, 0, 0);
        }else{
            this.ctx.fill();
        }
        this.ctx.restore();

        /**
         * Hide anti-alias gaps
         * three.js / src / renderers / CanvasRenderer.js expand()
         */
        function expand(x0, y0, x1, y1) {
            x = x1 - x0;
            y = y1 - y0;
            det = x * x + y * y;

            if (det === 0) return;

            idet = .4 / Math.sqrt(det);

            x *= idet;
            y *= idet;

            return [x0-x, y0-y, x1+x, y1+y];
        }
    };


    return Graphics;
})();