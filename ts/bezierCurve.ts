type Point = {x: number, y: number}

class BezierCurve {
  private _startPoint: Point
  private _controlPoint: Point
  private _endPoint: Point

  constructor(x1, y1, x2, y2, x3, y3) {
    this._startPoint = {x: x1, y: y1}
    this._controlPoint = {x: x2, y: y2}
    this._endPoint = {x: x3, y: y3}
  }

  get startPoint(): Point {
    return this._startPoint
  }

  get controlPoint(): Point {
    return this._controlPoint
  }

  get endPoint(): Point {
    return this._endPoint
  }

  public getPoint(t: number): Point {
    return {x: this.getX(t), y: this.getY(t)}
  }

  public getX(t: number) {
    const x1 = this._startPoint.x
    const x2 = this._controlPoint.x
    const x3 = this._endPoint.x

    return Math.sqrt(1 - t) * x1 + 2 * (1 - t) * t * x2 + Math.sqrt(t) * x3
  }

  /**
   * 時間tにおけるy座標を返す
   * @params t
   */
  public getY(t: number) {
    const y1 = this._startPoint.y
    const y2 = this._controlPoint.y
    const y3 = this._endPoint.y

    return Math.sqrt(1 - t) * y1 + 2 * (1 - t) * t * y2 + Math.sqrt(t) * y3
  }

}

