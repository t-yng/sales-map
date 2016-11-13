class AnimationStage extends createjs.Stage{

  private PRODUCT_IMG_URL = 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png'
  private MONEY_IMG_URL = 'http://illustcut.com/box/life/money/osatsu02_01.png'

  private products: Array<Product>

  public constructor(canvas: string) {
    super(canvas)
    this.products = []
  }

  public addProduct(product: Product): void {
    let line = new AnimationLocus()

    this.addChild(product)
    this.addChild(line)

    line.addEventListener('onAnimationEnd', () => {
      // 逆向きのアニメーションを行うために線を初期化
      this.removeChild(line)
      this.removeChild(product)

      line = new AnimationLocus()
      this.addChild(line)
      this.addChild(product)

      // 配送されてお金になって戻ってきたら、商品と線をステージ上から削除
      line.addEventListener('onAnimationEnd', () => {
        this.removeChild(line)
        this.removeChild(product)
      })

      // 目的地点から逆順にアニメーションさせる
      this.loadImage(this.MONEY_IMG_URL, image => {
        product.image = image
        const path = new MotionGuidePath(product.destination, product.origin)
        // setTimeout(() => , 10)
        product.startAnimationOnPath(path, 2000)
        line.startAnimationOnPath(path, 2000)
      })
    })

    const animationPath = new MotionGuidePath(product.origin, product.destination)
    product.startAnimationOnPath(animationPath, 7000)
    line.startAnimationOnPath(animationPath, 7000)
  }

  private loadImage(url, onload) {
    let bitmap = new createjs.Bitmap(url)
    bitmap.image.onload = onload(bitmap.image)
  }
}
