type Point = {x: number, y: number}

class Product extends createjs.Bitmap{
  private IMG_URL = 'http://illustcut.com/box/life/money/osatsu02_01.png'
  private WIDTH = 491 * 0.025
  private HEIGHT = 935 * 0.025

  private animationPath: AnimationPath

  // TODO: 画像の読み込みが非同期なので、クライアントでも非同期で待機できるようにする？ Promise
  public constructor(img_url: string = 'http://illustcut.com/box/life/money/osatsu02_01.png' ) {
    super(img_url)
    this.scaleX = 0.025
    this.scaleY = 0.025
  }

  public setImage(img: HTMLImageElement) {
    this.image = img
  }

  /**
   * 移動アニメーションパスを設定する
   * @param origin 出発地点
   * @param destination 目的地点
   */
  public setAnimationPath(origin, destination) {
    this.animationPath = new AnimationPath(origin, destination)

    this.x = origin.x - this.WIDTH / 2
    this.y = origin.y - this.HEIGHT / 2
  }

  // TODO: 呼び出しをstageを引数で渡さずイベントドリブンでステージに変更を通知する？
  // TODO: animation終了時のイベントを通知を実現
  public startAnimation(stage: createjs.Stage, fps = 60) {

    stage.addChild(this)
    stage.update()

    // パスのアニメーションを設定
    setTimeout(() => this.animationPath.startAnimation(stage, 10, fps), 200)

    let t = 0
    const timer = setInterval(() => {
      t += 0.01

      // 目的地点まで到達したらアニメーションを終了
      if (t > 1) {
        clearInterval(timer)
        this.startReverseAnimation(stage, fps)
      }
      const point = this.animationPath.getPointAtLength(t)
      this.x = point.x - this.WIDTH / 2
      this.y = point.y - this.HEIGHT / 2
      stage.update()
    }, 1000 / fps)
  }

  public startReverseAnimation(stage: createjs.Stage, fps = 60) {
    const img = new Image()
    img.onload = () => {
      stage.removeChild(this)

      this.image = img
      this.WIDTH = img.width * 0.075
      this.HEIGHT = img.height * 0.075
      this.scaleX = 0.075
      this.scaleY = 0.075
      this.setAnimationPath(this.animationPath.getDestination(), this.animationPath.getOrigin())
      this.startAnimation(stage, fps)
    }
    img.src = 'http://illustcut.com/box/life/money/osatsu02_01.png'
  }
}

