var BezierCurve = (function () {
    function BezierCurve(x1, y1, x2, y2, x3, y3) {
        this._startPoint = { x: x1, y: y1 };
        this._controlPoint = { x: x2, y: y2 };
        this._endPoint = { x: x3, y: y3 };
    }
    Object.defineProperty(BezierCurve.prototype, "startPoint", {
        get: function () {
            return this._startPoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierCurve.prototype, "controlPoint", {
        get: function () {
            return this._controlPoint;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierCurve.prototype, "endPoint", {
        get: function () {
            return this._endPoint;
        },
        enumerable: true,
        configurable: true
    });
    BezierCurve.prototype.getPoint = function (t) {
        return { x: this.getX(t), y: this.getY(t) };
    };
    BezierCurve.prototype.getX = function (t) {
        var x1 = this._startPoint.x;
        var x2 = this._controlPoint.x;
        var x3 = this._endPoint.x;
        return Math.sqrt(1 - t) * x1 + 2 * (1 - t) * t * x2 + Math.sqrt(t) * x3;
    };
    /**
     * 時間tにおけるy座標を返す
     * @params t
     */
    BezierCurve.prototype.getY = function (t) {
        var y1 = this._startPoint.y;
        var y2 = this._controlPoint.y;
        var y3 = this._endPoint.y;
        return Math.sqrt(1 - t) * y1 + 2 * (1 - t) * t * y2 + Math.sqrt(t) * y3;
    };
    return BezierCurve;
}());
/// <reference path="bezierCurve.ts"/>
createjs.MotionGuidePlugin.install();
var FPS = 60;
var x1 = 200, y1 = 200, x2 = x1 + 100, y2 = y1 - 100, x3 = x2 + 100, y3 = y1;
var bezierCurve = new BezierCurve(x1, y1, x2, y2, x3, y3);
var stage = new createjs.Stage('canvas');
var circle = new createjs.Shape();
circle.graphics.beginFill('white')
    .beginStroke('blue')
    .setStrokeStyle(2)
    .drawCircle(0, 0, 4);
circle.x = x1;
circle.y = y1;
var bezier = new createjs.Shape();
bezier.graphics.beginStroke('red')
    .moveTo(x1, y1)
    .quadraticCurveTo(x2, y2, x3, y3);
stage.addChild(bezier);
stage.addChild(circle);
console.log(circle.graphics.c[0]);
createjs.Tween.get(circle.graphics.c[0])
    .to({ radius: 20 }, 10000)
    .call(function () {
    createjs.Tween.get(circle)
        .to({ guide: { path: [x1, y1, x2, y2, x3, y3] } }, 3000)
        .wait(500)
        .to({ guide: { path: [x3, y3, x2, y2, x1, y1] } }, 3000);
});
stage.update();
createjs.Ticker.addEventListener('tick', handleTick);
createjs.Ticker.setFPS(FPS);
function handleTick() {
    stage.update();
}
