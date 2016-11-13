class Controller {
  private REQUEST_ORDER_INTERVAL = 1000 * 60 * 5 // 受注データを取得する間隔
  private view: View

  public constructor(view: View) {
    this.view = view
    // 定期実行(5分おき)にて受注データを取得
    setInterval(() => {
      const orders = RequestHandler.requestOrders()
      view.onResponseOrders(orders)
    }, 1000 * 60 * 5)
  }

  public sample(): void {
  
    const orders = [
      {
        "delivery_location": {
          "lng": 141.34694, 
          "lat": 43.06417
        },
        "products": [
          {
            "price": 100
          }
        ]
      },
      {
        "delivery_location": {
          "lng": 130.29889, 
          "lat": 33.24944
        },
        "products": [
          {
            "price": 100
          }
        ]
      }
    ]
    this.view.onResponseOrders(orders)
  }
}