// declare const d3: any

// const svg = d3.select('#svg-layer')
//   .append('svg')
//   .attr('width', 1080)
//   .attr('height', 720)

// const x1 = 100,
//       y1 = 100

// const points = [
//   [x1, y1],
//   [x1 + 100, y1 + 100],
//   [x1 + 200, y1]
// ]

// const line = d3.svg.line()
//   .x(d => d[0])
//   .y(d => d[1])
//   .interpolate('basis')

// const path = svg.append('path')
//   .datum(points)
//   .attr('d', line)
//   .attr('fill', 'transparent')
//   .attr('stroke', 'red')
//   .attr('stroke-width', 2)

// const circle = svg.append('circle')
//   .attr('transform', `translate(${x1}, ${y1})`)
//   .attr('r', 1)
//   .attr('fill', 'transparent')
//   .attr('stroke', 'blue')
//   .attr('stroke-width', 2)

// circle.transition()
//   .duration(300)
//   .ease('linear')
//   .attr('r', d => 20)
//   .transition()
//   .duration(3000)
//   .ease('linear')
//   .attrTween('transform', (d, i) => {
//     const l = path.node().getTotalLength()
//     return t => {
//       const p = path.node().getPointAtLength(t * l)
//       return `translate(${p.x}, ${p.y})`
//     }
//   })