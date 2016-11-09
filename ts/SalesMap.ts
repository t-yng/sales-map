class SalesMap {
  private products = []  // アニメーションさせる商品一覧（SVG要素）
  private paths = []  // 商品をアニメーションさせる際の移動経路(SVG要素)
  private map  // 画面に表示する地図
  private stage // createjsのStage
  private svg  // SVGを描画するレイヤー
  private pathLine

  public constructor() {
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su', //hosted style id
      center: [137.91854900230788, 38.734418429646695], // starting position
      zoom: 4.7 // starting zoom
    })
    this.map.on('load', this.onMoveMap)

    this.stage = new createjs.Stage('canvas')

    this.svg = d3.select('#svg-layer')
      .append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight)
    
    this.pathLine = d3.svg.line()
      .x(d => this.map.project(d).x)
      .y(d => this.map.project(d).y)
      .interpolate('basis')
  }
  
  public addProductAnimation(origin: mapboxgl.LngLat, destination: mapboxgl.LngLat) {

  }

  private createPath(origin: mapboxgl.LngLat, destination: mapboxgl.LngLat) {
    const startPoint = this.map.project(origin)
    const endPoint = this.map.project(destination)
    const controlPoint = this.createBezierControlPoint(startPoint, endPoint, 50)

    const control = this.map.unproject(controlPoint)

    const pathPoints: Array<mapboxgl.LngLat> = [
      origin,
      control,
      destination
    ]

    const path = svg.append('path')
      .datum(pathPoints)
      .attr('d', line)
      .attr('fill', 'transparent')

    return path
  }

  private createPathLine (startPoint, endPoint) {
    const lineColor = createjs.Graphics.getRGB(255, 0, 0)
    const line = new createjs.Shape()
    line.graphics.setStrokeStyle(1.5)
    line.graphics.beginStroke(lineColor)
    line.graphics.moveTo(startPoint.x, startPoint.y)
    line.graphics.lineTo(endPoint.x, endPoint.y)
    line.graphics.endStroke()
    line.alpha = 0
    line.compositeOperation = 'lighter'

    return line
  }

  private getPathPoints (path) {
    const pathLength = path.node().getTotalLength()

    return _.range(0, 1, 0.01)
    .map(t => path.node().getPointAtLength(t * pathLength))
  }

  private startPathAnimation(path) {
    const pathPoints = getPathPoints(path)

    const pathLines = _.zip(_.initial(pathPoints), _.rest(pathPoints))
                       .map(points => this.createPathLine(points[0], points[1]))

    pathLines.forEach(line => this.stage.addChild(line))

    let counter = 0
    const ANIMATION_PATH_LENGTH = 20
    const FPS = 60
    let timer = setInterval(() => {
      _.chain(pathLines).rest(counter).first(ANIMATION_PATH_LENGTH).forEach(line => { line.alpha = 1 })
      _.chain(pathLines).rest(0).first(counter)
      .forEach(line => {
        if (line.alpha > 0) line.alpha -= 0.1
      })

      counter += 1
      this.stage.update()

      if (_.every(pathLines, path => path.alpha < 0)) {
        pathLines.forEach(line => this.stage.removeChild(line))
        clearInterval(timer)
      }
    }, 1000 / FPS)
  }

  private startProductAnimation(product) {

  }

  private resizeImageWidth(width: number): number {
    return width * (map.getZoom() / 10)
  }

  private resizeImageHeight(height: number): number {
    return height * (map.getZoom() / 10)
  }

  private createBezierControlPoint(start: mapboxgl.Point, end: mapboxgl.Point, alpha: number = 0): mapboxgl.Point {
    const x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2
    const y = Math.min(start.y, end.y) - alpha

    return new mapboxgl.Point(x, y)
  }

  /**
   * 地図をスクロール移動した際の処理
   */
  private onMoveMap() {
    this.products.forEach(product => {
      product.attr('transform', d => {
        const point = map.project(d)
        return `translate(${point.x - 25}, ${point.y - 25})`
      })

      product.attr('width', resizeImageWidth(IMAGE_WIDTH_DEFAULT))
      product.attr('height', resizeImageHeight(IMAGE_HEIGHT_DEFAULT))
    })

    this.paths.forEach(path => path.attr('d', this.pathLine))
  }
}