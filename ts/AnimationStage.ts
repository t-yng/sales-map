class AnimationStage extends createjs.Stage{
  private prodocuts: Array<Product>

  public addProduct(product: Product): void {
    this.prodocuts.push(product)
  }
}