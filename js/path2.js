/* global createjs */

createjs.MotionGuidePlugin.install()

let stage = new createjs.Stage('canvas')
stage.canvas.width = window.innerWidth
stage.canvas.height = window.innerHeight

// パスのアニメーション用の先導ポイント
// この点をベジェ曲線に沿ってアニメーションさせる
// ポイントの移動経路における任意地点から任意の地点を線で繋ぐことで、線が飛んでいくアニメーションを実現する
let animationLeadPoint = {x: 10, y: 10, oldX: 10, oldY: 10, isAnimationEnd: false}

let line = new createjs.Shape()
line.pointStack = []
stage.addChild(line)

createjs.Tween.get(animationLeadPoint)
.to({guide: {path: [10, 10, 50, 50, 100, 10]}}, 3000)
.set({isAnimationEnd: true})

createjs.Ticker.addEventListener('tick', tick)

function tick () {
  line.graphics.clear()
  line.graphics
      .beginStroke('red')
      .setStrokeStyle(1.5)
      .beginLinearGradientStroke(['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 1)'], [0, 1], line.oldX, line.oldY, line.x, line.y)
      .moveTo(line.oldX, line.oldY)
      .lineTo(line.x, line.y)

  if (distance(line.x, line.y, line.oldX, line.oldY) >= 20 || line.isAnimationEnd) {
    const point = line.pointStack.shift()
    animationLeadPoint.oldX = point.x
    animationLeadPoint.oldY = point.y
  }

  if (!line.end) {
    line.pointStack.push({x: animationLeadPoint.x, y: animationLeadPoint.y})
  }

  stage.update()
}

function distance (x1, y1, x2, y2) {
  const x = Math.abs(x1 - x2)
  const y = Math.abs(y1 - y2)
  return Math.sqrt(x * x + y * y)
}
