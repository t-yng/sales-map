declare const d3: any
// type Point = {x: number, y: number}

const IMAGE_WIDTH_DEFAULT = 60
const IMAGE_HEIGHT_DEFAULT = 60

let items: d3.selection.Update<mapboxgl.LngLat>[] = []
let paths: d3.Selection<mapboxgl.LngLat[]>[] = []

mapboxgl.accessToken = 'pk.eyJ1IjoidC15bmciLCJhIjoiY2l1bDIxamNyMDAxdTJ5bnVtNWE0c2VkZSJ9.KzZHJuz-6EZL5Rf-QSlNVg';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su', //hosted style id
    center: [137.91854900230788, 38.734418429646695], // starting position
    zoom: 4.7 // starting zoom
});

const stage = new createjs.Stage('canvas')

const svg = d3.select('#svg-layer')
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight)

const origin = mapboxgl.LngLat.convert([139.155658, 35.256286])

const destinations =  [
  [141.34694, 43.06417],
  [141.1525, 39.70361],
  [139.88361, 36.56583],
  [139.02361, 37.90222],
  [136.62556, 36.59444],
  [136.881537, 35.170915],
  [135.75556, 35.02139],
  [134.23833, 35.50361],
  [134.04333, 34.34028],
  [130.29889, 33.24944]
].map(lngLat => mapboxgl.LngLat.convert(lngLat))

map.on('load', init)

/**
 * 始点と終点からベジェ曲線を描くための制御点を生成
 * @params {mapboxgl.Point} start
 * @params {mapboxgl.Point} end
 * @params {number} alpha
 * @return 
 */
function createBezierControlPoint(start: mapboxgl.Point, end: mapboxgl.Point, alpha: number = 0): mapboxgl.Point {
  const x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2
  const y = Math.min(start.y, end.y) - alpha

  return new mapboxgl.Point(x, y)
}

const line = d3.svg.line()
  .x(d => map.project(d).x)
  .y(d => map.project(d).y)
  .interpolate('basis')

function resizeImageWidth(width: number): number {
  return width * (map.getZoom() / 10)
}

function resizeImageHeight(height: number): number {
  return height * (map.getZoom() / 10)
}

function createPath(origin: mapboxgl.LngLat, destination: mapboxgl.LngLat) {
  const startPoint = map.project(origin)
  const endPoint = map.project(destination)
  const controlPoint = createBezierControlPoint(startPoint, endPoint, 50)

  const control = map.unproject(controlPoint)

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

function createPathLine (startPoint, endPoint) {
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

function getPathPoints (path) {
  const pathLength = path.node().getTotalLength()

  return _.range(0, 1, 0.01)
   .map(t => path.node().getPointAtLength(t * pathLength))
}

function animatePath (path) {
  const pathPoints = getPathPoints(path)

  const pathLines = _.zip(_.initial(pathPoints), _.rest(pathPoints))
   .map(points => {
     const line = createPathLine(points[0], points[1])
     stage.addChild(line)

     return line
   })

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
    console.log(counter)
    stage.update()

    if (_.every(pathLines, path => path.alpha < 0)) {
      pathLines.forEach(line => stage.removeChild(line))
      clearInterval(timer)
    }
  }, 1000 / FPS)
}

function addAnimation(origin: mapboxgl.LngLat, destination: mapboxgl.LngLat): void {

  const path = createPath(origin, destination)
  paths.push(path)

  const item = svg.append('image')
    .data([origin])
    .attr('xlink:href', 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png')
    .attr('width', resizeImageWidth(IMAGE_WIDTH_DEFAULT))
    .attr('height', resizeImageHeight(IMAGE_HEIGHT_DEFAULT))
    .attr('transform', d => {
      const point = map.project(d)
      return `translate(${point.x - 25}, ${point.y - 25})`
    })
  
  items.push(item)

  setTimeout(() => animatePath(path), 800)

  item.transition()
    .delay(500)
    .duration(1500)
    .ease('linear')
    .attrTween('transform', (d, i) => {
      const l = path.node().getTotalLength()
       return t => {
        const p = path.node().getPointAtLength(t * l)          
        return `translate(${p.x - 25}, ${p.y - 25})`
      }
    })
    .each('end', () => {
      item.data([destination])
      setTimeout(() => {
        item.attr('xlink:href', 'http://illustcut.com/box/life/money/osatsu02_01.png')
        item.transition()
          .delay(1000)
          .duration(1500)
          .ease('linear')
          .attrTween('transform', (d, i) => {
            const l = path.node().getTotalLength()

            return t => {
              const p = path.node().getPointAtLength((1 - t) * l)
              return `translate(${p.x - 25}, ${p.y - 25})`
            }
          })
          .each('end', () => {
            item.data([origin])
            setTimeout(() => item.remove(), 1500)            
          })
      }, 1000)
    })
}

function init() {
  destinations.forEach(destination => {
    setTimeout(() => addAnimation(origin, destination), Math.random() * 10000)    
  })

  map.on('move', update)
}

function update() {
  items.forEach(item => {
    item.attr('transform', d => {
      const point = map.project(d)
      return `translate(${point.x - 25}, ${point.y - 25})`
    })

    item.attr('width', resizeImageWidth(IMAGE_WIDTH_DEFAULT))
    item.attr('height', resizeImageHeight(IMAGE_HEIGHT_DEFAULT))
  })

  paths.forEach(path => path.attr('d', line))
}