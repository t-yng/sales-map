class Controller {
  private REQUEST_ORDER_INTERVAL = 1000 * 60 * 5 // 受注データを取得する間隔
  private view: View

  public constructor(view: View) {

    // 定期実行(5分おき)にて受注データを取得
    setInterval(() => {
      const orders = RequestHandler.requestOrders()
      const products = _.flatten(orders.map(order => ProductFactory.createProducts(order)))
      products.forEach(product => view.addProduct(product))
    }, 1000 * 60 * 5)
  }

}