class View {
  private map
  private animationStage: AnimationStage

  public constructor() {
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su', //hosted style id
      center: [137.91854900230788, 38.734418429646695], // starting position
      zoom: 4.7 // starting zoom
    })

    this.animationStage = new AnimationStage('canvas')
  }

  public addProduct(product: Product): void {
    this.animationStage.addProduct(product)
  }
}