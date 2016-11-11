class View {
  private HAMEE_LOCATION = mapboxgl.LngLat.convert([139.155658, 35.256286])  // Hamee本社の緯度経度

  private map: mapboxgl.Map
  private animationStage: AnimationStage
  private controller: Controller

  public constructor() {

    // mapboxglのアクセストークンを設定
    mapboxgl.accessToken = 'pk.eyJ1IjoidC15bmciLCJhIjoiY2l1bDIxamNyMDAxdTJ5bnVtNWE0c2VkZSJ9.KzZHJuz-6EZL5Rf-QSlNVg'

    // 地図を初期化
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su', //hosted style id
      center: [137.91854900230788, 38.734418429646695], // starting position
      zoom: 4.7 // starting zoom
    })
    this.animationStage = new AnimationStage('canvas')

    this.map.on('load', () => {
      this.controller = new Controller(this)
      this.controller.sample()
    })
  }

  public onResponseOrders(orders: Array<any>): void {
    const products: Array<Product> = _.flatten(orders.map(order => this.createProducts(order)))
    products.forEach(product => this.animationStage.addProduct(product))
  }

  /**
   * 受注データからアニメーションさせる商品オブジェクトを生成
   */
  private createProducts(order: any): Array<Product> {

    let products = order.products.map(product => new Product())

    const lng = order.delivery_location.lng
    const lat = order.delivery_location.lat

    const origin = this.map.project(this.HAMEE_LOCATION)
    const destination = this.map.project(mapboxgl.LngLat.convert([lng, lat]))

    products.forEach(product => {
      product.setAnimationPath(origin, destination)
    })

    return products
  }

  public addProduct(product: Product): void {
    this.animationStage.addProduct(product)
  }
}