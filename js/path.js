/* global d3, _, createjs */

const svg = d3.select('#svg')
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight)

const canvas = document.getElementById('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const stage = new createjs.Stage('canvas')

function createBezierControlPoint (start, end, alpha) {
  const x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2
  const y = Math.min(start.y, end.y) - alpha

  return {x, y}
}

function createPath (origin, destination) {
  const control = createBezierControlPoint(origin, destination, 50)

  const pathPoints = [
    origin,
    control,
    destination
  ]

  const line = d3.svg.line()
    .x(d => d.x)
    .y(d => d.y)
    .interpolate('basis')

  const path = svg.append('path')
    .datum(pathPoints)
    .attr('d', line)
    .attr('fill', 'transparent')
    // .attr('stroke', 'red')
    // .attr('stroke-width', 2)

  return path
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
  const ANIMATION_PATH_LENGTH = 10
  const FPS = 40
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

const path = createPath({x: 200, y: 200}, {x: 600, y: 200})
animatePath(path)
