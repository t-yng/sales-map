var BezierCurve = (function () {
    function BezierCurve(startPoint, controlPoint, endPoint) {
        this.startPoint = startPoint;
        this.controlPoint = controlPoint;
        this.endPoint = endPoint;
    }
    BezierCurve.prototype.getPoint = function (t) {
        return { x: this.getX(t), y: this.getY(t) };
    };
    BezierCurve.prototype.getX = function (t) {
        var x1 = this.startPoint.x;
        var x2 = this.controlPoint.x;
        var x3 = this.endPoint.x;
        return Math.sqrt(1 - t) * x1 + 2 * (1 - t) * t * x2 + Math.sqrt(t) * x3;
    };
    /**
     * 時間tにおけるy座標を返す
     * @params t
     */
    BezierCurve.prototype.getY = function (t) {
        var y1 = this.startPoint.y;
        var y2 = this.controlPoint.y;
        var y3 = this.endPoint.y;
        return Math.sqrt(1 - t) * y1 + 2 * (1 - t) * t * y2 + Math.sqrt(t) * y3;
    };
    return BezierCurve;
}());
