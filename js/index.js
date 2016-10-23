/// <reference path="bezierCurve.ts"/>
var FPS = 60;
var stage = new createjs.Stage('canvas');
var bezierCurve = new BezierCurve({ x: 100, y: 200 }, { x: 200, y: 100 }, { x: 300, y: 200 });
var endPoint = bezierCurve.getPoint(1);
var bezier = new createjs.Shape();
bezier.graphics.beginStroke('red')
    .moveTo(100, 200)
    .quadraticCurveTo(200, 100, endPoint.x, endPoint.y);
stage.addChild(bezier);
stage.update();
// createjs.Ticker.addEventListener('tick', handleTick)
// createjs.Ticker.setFPS(FPS)
function handleTick() {
    var t = 0;
    return function () {
        t = (t + 1) % FPS;
        t /= FPS;
        stage.update();
    };
}
