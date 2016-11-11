class AnimationStage extends createjs.Stage{
  private products: Array<Product>

  public constructor(canvas: string) {
    super(canvas)
    this.products = []
  }

  public addProduct(product: Product): void {
    this.products.push(product)
    product.startAnimation(this)
  }
}