/**
 * 移動の軌跡を描画するクラス
 */

class AnimationLocus extends createjs.Shape {
  private _points: Array<createjs.Point>

  public constructor() {
    super()
    this._points = []
  }

  get LINE_LENGTH(): number {
    return 20
  }

  private get startPoint(): createjs.Point {
    return _.first(this._points)
  }

  private get lastPoint(): createjs.Point {
    return _.last(this._points)
  }

  public startAnimationOnPath(path: MotionGuidePath, dulation: number = 3000): void {
      // アニメーション用の先導ポイント
      // この点をベジェ曲線に沿ってアニメーションさせる
      // ポイントの移動経路における任意地点から任意の地点を線で繋ぐことで、線が飛んでいくアニメーションを実現する
      const origin = path.origin
      let animationLeadPoint = {x: origin.x, y: origin.y, isAnimationEnd: false}
      this._points.push(new createjs.Point(origin.x, origin.y))

      // アニメーションを開始
      createjs.Tween.get(animationLeadPoint)
        .to({guide: {path: path.points}}, dulation)
        .set({isAnimationEnd: true})

      this.addEventListener('tick', this.movePath(animationLeadPoint))
  }

  private movePath(animationLeadPoint): () => void {
    return () => {

      // 新しいパス上の点を配列に保存
      if (!animationLeadPoint.isAnimationEnd) {
        const newPoint = new createjs.Point(animationLeadPoint.x, animationLeadPoint.y)
        this._points.push(newPoint)
      }

      // 配列の先頭要素を削除して、左詰め
      if (this._points.length > this.LINE_LENGTH || animationLeadPoint.isAnimationEnd) {
        this._points = _.rest(this._points)
      }

      // 線を構成する点が空になったら、アニメーションを終了
      if (this._points.length === 0) {
        this.dispatchEvent('onAnimationEnd')
        return
      }

      this.drawPath()
    }
  }

  private drawPath(): void {
    const startPoint = this.startPoint
    const lastPoint = this.lastPoint

    this.graphics.clear()
    this.graphics
        .beginStroke('red')
        .setStrokeStyle(1.5)
        .beginLinearGradientStroke(['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 1)'], [0, 1], startPoint.x, startPoint.y, lastPoint.x, lastPoint.y)

    // 点の配列から線を描画
    this.graphics.moveTo(startPoint.x, startPoint.y)
    _.chain(this._points)
      .rest()
      .forEach(point => this.graphics.lineTo(point.x, point.y))
  }

}