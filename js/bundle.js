var IMAGE_WIDTH_DEFAULT = 60;
var IMAGE_HEIGHT_DEFAULT = 60;
var items = [];
var paths = [];
mapboxgl.accessToken = 'pk.eyJ1IjoidC15bmciLCJhIjoiY2l1bDIxamNyMDAxdTJ5bnVtNWE0c2VkZSJ9.KzZHJuz-6EZL5Rf-QSlNVg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su',
    center: [137.91854900230788, 38.734418429646695],
    zoom: 4.7 // starting zoom
});
var svg = d3.select('#svg-layer')
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);
var origin = mapboxgl.LngLat.convert([139.155658, 35.256286]);
var destinations = [
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
].map(function (lngLat) { return mapboxgl.LngLat.convert(lngLat); });
map.on('load', init);
/**
 * 始点と終点からベジェ曲線を描くための制御点を生成
 * @params {{x: number, y: number}} start
 * @params {{x: number, y: number}} end
 * @params {number} alpha
 * @return
 */
function createBezierControlPoint(start, end, alpha) {
    if (alpha === void 0) { alpha = 0; }
    var x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2;
    var y = Math.min(start.y, end.y) - alpha;
    return new mapboxgl.Point(x, y);
}
var line = d3.svg.line()
    .x(function (d) { return map.project(d).x; })
    .y(function (d) { return map.project(d).y; })
    .interpolate('basis');
function resizeImageWidth(width) {
    return width * (map.getZoom() / 10);
}
function resizeImageHeight(height) {
    return height * (map.getZoom() / 10);
}
function createPath(origin, destination) {
    var startPoint = map.project(origin);
    var endPoint = map.project(destination);
    var controlPoint = createBezierControlPoint(startPoint, endPoint, 50);
    var control = map.unproject(controlPoint);
    var pathPoints = [
        origin,
        control,
        destination
    ];
    var path = svg.append('path')
        .datum(pathPoints)
        .attr('d', line)
        .attr('fill', 'transparent');
    // .attr('stroke', 'red')
    // .attr('stroke-width', 2)
    return path;
}
function addAnimation(origin, destination) {
    var path = createPath(origin, destination);
    paths.push(path);
    var item = svg.append('image')
        .data([origin])
        .attr('xlink:href', 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png')
        .attr('width', resizeImageWidth(IMAGE_WIDTH_DEFAULT))
        .attr('height', resizeImageHeight(IMAGE_HEIGHT_DEFAULT))
        .attr('transform', function (d) {
        var point = map.project(d);
        return "translate(" + (point.x - 25) + ", " + (point.y - 25) + ")";
    });
    items.push(item);
    item.transition()
        .delay(500)
        .duration(1500)
        .ease('linear')
        .attrTween('transform', function (d, i) {
        var l = path.node().getTotalLength();
        return function (t) {
            var p = path.node().getPointAtLength(t * l);
            return "translate(" + (p.x - 25) + ", " + (p.y - 25) + ")";
        };
    })
        .each('end', function () {
        item.data([destination]);
        setTimeout(function () {
            item.attr('xlink:href', 'http://illustcut.com/box/life/money/osatsu02_01.png');
            item.transition()
                .delay(1000)
                .duration(1500)
                .ease('linear')
                .attrTween('transform', function (d, i) {
                var l = path.node().getTotalLength();
                return function (t) {
                    var p = path.node().getPointAtLength((1 - t) * l);
                    return "translate(" + (p.x - 25) + ", " + (p.y - 25) + ")";
                };
            })
                .each('end', function () {
                item.data([origin]);
                setTimeout(function () { return item.remove(); }, 1500);
            });
        }, 1000);
    });
}
function init() {
    destinations.forEach(function (destination) {
        addAnimation(origin, destination);
    });
    map.on('move', update);
}
function update() {
    items.forEach(function (item) {
        item.attr('transform', function (d) {
            var point = map.project(d);
            return "translate(" + (point.x - 25) + ", " + (point.y - 25) + ")";
        });
        item.attr('width', resizeImageWidth(IMAGE_WIDTH_DEFAULT));
        item.attr('height', resizeImageHeight(IMAGE_HEIGHT_DEFAULT));
    });
    paths.forEach(function (path) { return path.attr('d', line); });
}
