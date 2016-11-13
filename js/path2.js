/* global createjs */

createjs.MotionGuidePlugin.install()

let stage = new createjs.Stage('canvas')
stage.canvas.width = window.innerWidth
stage.canvas.height = window.innerHeight

let _event = []
_event['onAnimationEnd'] = () => console.log('アニメーション終了')

// パスのアニメーション用の先導ポイント
// この点をベジェ曲線に沿ってアニメーションさせる
// ポイントの移動経路における任意地点から任意の地点を線で繋ぐことで、線が飛んでいくアニメーションを実現する
let animationLeadPoint = {x: 10, y: 10, isAnimationEnd: false}

let line = new createjs.Shape()
line.startX = 10
line.startY = 10
line.pointStack = []
stage.addChild(line)

createjs.Tween.get(animationLeadPoint)
.to({guide: {path: [10, 10, 100, 100, 200, 10]}}, 10000)
.set({isAnimationEnd: true})

createjs.Ticker.addEventListener('tick', update)
line.addEventListener('tick', animationPath)

function update () {
  stage.update()
}

function animationPath () {
  line.graphics.clear()
  line.graphics
      .beginStroke('red')
      .setStrokeStyle(1.5)
      .beginLinearGradientStroke(['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 1)'], [0, 1], line.startX, line.startY, animationLeadPoint.x, animationLeadPoint.y)
      .moveTo(line.startX, line.startY)
      .lineTo(animationLeadPoint.x, animationLeadPoint.y)

  if (distance(line.startX, line.startY, animationLeadPoint.x, animationLeadPoint.y) >= 20 || animationLeadPoint.isAnimationEnd) {
    const point = line.pointStack.shift()
    line.startX = point.x
    line.startY = point.y
  }

  if (!animationLeadPoint.isAnimationEnd) {
    line.pointStack.push({x: animationLeadPoint.x, y: animationLeadPoint.y})
  }

  if (line.pointStack.length === 0) {
    stage.removeChild(line) // 実際は呼び出し元で呼ばれる
    _event['onAnimationEnd'](line) // アニメーションが終了したcreatejs.Shapeクラスのインスタンスを引数として渡す
  }
}

function distance (x1, y1, x2, y2) {
  const x = Math.abs(x1 - x2)
  const y = Math.abs(y1 - y2)
  return Math.sqrt(x * x + y * y)
}
