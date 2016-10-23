/// <reference path="bezierCurve.ts"/>

createjs.MotionGuidePlugin.install()

const FPS = 60

const x1 = 200,
      y1 = 200,
      x2 = x1 + 100,
      y2 = y1 - 100,
      x3 = x2 + 100,
      y3 = y1

const bezierCurve = new BezierCurve(x1, y1, x2, y2, x3, y3)

const stage = new createjs.Stage('canvas')
const circle = new createjs.Shape()
circle.graphics.beginFill('white')
  .beginStroke('blue')
  .setStrokeStyle(2)
  .drawCircle(0, 0, 4)
circle.x = x1
circle.y = y1

const bezier = new createjs.Shape()
bezier.graphics.beginStroke('red')
  .moveTo(x1, y1)
  .quadraticCurveTo(x2, y2, x3, y3)

stage.addChild(bezier)
stage.addChild(circle)

console.log(circle.graphics.c[0])

createjs.Tween.get(circle)
  .to({guide: {path: [x1,y1, x2, y2, x3, y3]}}, 3000)
  .wait(500)
  .to({guide: {path: [x3, y3, x2, y2, x1, y1]}}, 3000)


stage.update()

createjs.Ticker.addEventListener('tick', handleTick)
createjs.Ticker.setFPS(FPS)

function handleTick() {
  stage.update()
}
