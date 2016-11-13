type Point = {x: number, y: number}

class Product extends createjs.Bitmap{
  private WIDTH = 491 * 0.025
  private HEIGHT = 935 * 0.025

  private _origin
  private _destination

  // TODO: 画像の読み込みが非同期なので、クライアントでも非同期で待機できるようにする？ Promise
  public constructor(img_url: string = 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png') {
    super(img_url)
    this.scaleX = 0.025
    this.scaleY = 0.025
  }

  get origin() {
    return this._origin
  }

  set origin(origin) {
    this._origin = origin
    this.x = origin.x - this.WIDTH / 2
    this.y = origin.y - this.HEIGHT / 2
  }

  get destination() {
    return this._destination
  }

  set destination(destination) {
    this._destination = destination
  }

  public startAnimationOnPath(path: MotionGuidePath, dulation: number = 3000) {
    // 画像の基準点を左上から中心に変更
    let points = path.points.map( (point, i) => {
      if (i % 2 === 0) {
        point -= this.WIDTH / 2
      }
      else {
        point -= this.HEIGHT / 2
      }
      return point
    })
    createjs.Tween.get(this)
      .to({guide: {path: points}}, dulation)
      .call(() => this.dispatchEvent('onAnimationEnd'))
  }
}