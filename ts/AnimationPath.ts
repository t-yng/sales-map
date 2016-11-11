declare const d3: any

class AnimationPath {
  private lines: createjs.Shape[]
  private path
  private origin
  private destination

  public constructor(origin, destination) {

    this.origin = origin
    this.destination = destination

    const controlPoint = this.createBezierControlPoint(origin, destination)

    const svg = d3.select('#svg-layer')
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
    
    const line = d3.svg.line()
      .x(d => d.x)
      .y(d => d.y)
      .interpolate('basis')

    this.path = svg.append('path')
      .datum([origin, controlPoint, destination])
      .attr('d', line)
      .attr('fill', 'transparent')

    // pathを分割
    this.lines = this.createPathLines(this.path)
  }

  public getOrigin() {
    return this.origin
  }

  public getDestination() {
    return this.destination
  }

  public getPointAtLength(t: number) {
    const pathLength = this.path.node().getTotalLength()
    return this.path.node().getPointAtLength(t * pathLength)    
  }

  private createBezierControlPoint(start: mapboxgl.Point, end: mapboxgl.Point, alpha: number = 0): mapboxgl.Point {
    const x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2
    const y = Math.min(start.y, end.y) - alpha

    return new mapboxgl.Point(x, y)
  }

  private createPathLines(path) {
    const points = this.getPathPoints(path)

    return  _.zip(_.initial(points), _.rest(points))
      .map(points => this.createPathLine(points[0], points[1]))
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

  public startAnimation(stage, animation_path_length = 20, fps = 60) {

    this.lines.forEach(line => stage.addChild(line))
    stage.update()

    let counter = 0
    let timer = setInterval(() => {
      _.chain(this.lines).rest(counter).first(animation_path_length).forEach(line => { line.alpha = 1 })
      _.chain(this.lines).rest(0).first(counter)
      .forEach(line => {
        if (line.alpha > 0) line.alpha -= 0.1
      })

      counter += 1
      stage.update()

      if (_.every(this.lines, line => line.alpha < 0)) {
        this.lines.forEach(line => stage.removeChild(line))
        clearInterval(timer)
      }
    }, 1000 / fps)
  }  

}