/**
 * createjsのTweenクラスのプラグインMotionGuideのパスを構成するためのクラス
 */

class MotionGuidePath {
  private _origin: createjs.Point  // パスの出発地点
  private _controlPoint: createjs.Point // 2次ベジェ曲線を描くための制御点
  private _destination: createjs.Point // パスの終着地点
  private _points: Array<createjs.Point> // ベジェ曲線を描くための点の集合

  public constructor(origin, destination) {
    this._origin = origin
    this._destination = destination
    this._controlPoint = this.createBezierControlPoint(origin, destination)

    this._points = [
      this._origin,
      this._controlPoint,
      this._destination
    ]
  }

  get origin() {
    return this._origin
  }

  get deestination() {
    return this._destination
  }

  get points () {
    return _.chain(this._points)
            .map(point => [point.x, point.y])
            .flatten(true)
            .value()
  }

  private createBezierControlPoint(start: createjs.Point, end: createjs.Point, alpha: number = 0): createjs.Point {
    const x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2
    const y = Math.min(start.y, end.y) - alpha

    return new createjs.Point(x, y)
  }
}