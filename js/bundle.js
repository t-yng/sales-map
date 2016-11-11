var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Controller = (function () {
    function Controller(view) {
        this.REQUEST_ORDER_INTERVAL = 1000 * 60 * 5; // 受注データを取得する間隔
        this.view = view;
        // 定期実行(5分おき)にて受注データを取得
        setInterval(function () {
            var orders = RequestHandler.requestOrders();
            view.onResponseOrders(orders);
        }, 1000 * 60 * 5);
    }
    Controller.prototype.sample = function () {
        var orders = [
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
            }
        ];
        this.view.onResponseOrders(orders);
    };
    return Controller;
}());
var AnimationPath = (function () {
    function AnimationPath(origin, destination) {
        this.origin = origin;
        this.destination = destination;
        var controlPoint = this.createBezierControlPoint(origin, destination);
        var svg = d3.select('#svg-layer')
            .append('svg')
            .attr('width', window.innerWidth)
            .attr('height', window.innerHeight);
        var line = d3.svg.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .interpolate('basis');
        this.path = svg.append('path')
            .datum([origin, controlPoint, destination])
            .attr('d', line)
            .attr('fill', 'transparent');
        // pathを分割
        this.lines = this.createPathLines(this.path);
    }
    AnimationPath.prototype.getOrigin = function () {
        return this.origin;
    };
    AnimationPath.prototype.getDestination = function () {
        return this.destination;
    };
    AnimationPath.prototype.getPointAtLength = function (t) {
        var pathLength = this.path.node().getTotalLength();
        return this.path.node().getPointAtLength(t * pathLength);
    };
    AnimationPath.prototype.createBezierControlPoint = function (start, end, alpha) {
        if (alpha === void 0) { alpha = 0; }
        var x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2;
        var y = Math.min(start.y, end.y) - alpha;
        return new mapboxgl.Point(x, y);
    };
    AnimationPath.prototype.createPathLines = function (path) {
        var _this = this;
        var points = this.getPathPoints(path);
        return _.zip(_.initial(points), _.rest(points))
            .map(function (points) { return _this.createPathLine(points[0], points[1]); });
    };
    AnimationPath.prototype.createPathLine = function (startPoint, endPoint) {
        var lineColor = createjs.Graphics.getRGB(255, 0, 0);
        var line = new createjs.Shape();
        line.graphics.setStrokeStyle(1.5);
        line.graphics.beginStroke(lineColor);
        line.graphics.moveTo(startPoint.x, startPoint.y);
        line.graphics.lineTo(endPoint.x, endPoint.y);
        line.graphics.endStroke();
        line.alpha = 0;
        line.compositeOperation = 'lighter';
        return line;
    };
    AnimationPath.prototype.getPathPoints = function (path) {
        var pathLength = path.node().getTotalLength();
        return _.range(0, 1, 0.01)
            .map(function (t) { return path.node().getPointAtLength(t * pathLength); });
    };
    AnimationPath.prototype.startAnimation = function (stage, animation_path_length, fps) {
        var _this = this;
        if (animation_path_length === void 0) { animation_path_length = 20; }
        if (fps === void 0) { fps = 60; }
        this.lines.forEach(function (line) { return stage.addChild(line); });
        stage.update();
        var counter = 0;
        var timer = setInterval(function () {
            _.chain(_this.lines).rest(counter).first(animation_path_length).forEach(function (line) { line.alpha = 1; });
            _.chain(_this.lines).rest(0).first(counter)
                .forEach(function (line) {
                if (line.alpha > 0)
                    line.alpha -= 0.1;
            });
            counter += 1;
            stage.update();
            if (_.every(_this.lines, function (line) { return line.alpha < 0; })) {
                _this.lines.forEach(function (line) { return stage.removeChild(line); });
                clearInterval(timer);
            }
        }, 1000 / fps);
    };
    return AnimationPath;
}());
var Product = (function (_super) {
    __extends(Product, _super);
    function Product(img_url) {
        if (img_url === void 0) { img_url = 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png'; }
        _super.call(this, img_url);
        this.IMG_URL = 'http://illustcut.com/box/life/money/osatsu02_01.png';
        this.WIDTH = 491 * 0.025;
        this.HEIGHT = 935 * 0.025;
        this.scaleX = 0.025;
        this.scaleY = 0.025;
    }
    /**
     * 移動アニメーションパスを設定する
     * @param origin 出発地点
     * @param destination 目的地点
     */
    Product.prototype.setAnimationPath = function (origin, destination) {
        this.animationPath = new AnimationPath(origin, destination);
        this.x = origin.x - this.WIDTH / 2;
        this.y = origin.y - this.HEIGHT / 2;
    };
    Product.prototype.startAnimation = function (stage, fps) {
        var _this = this;
        if (fps === void 0) { fps = 60; }
        stage.addChild(this);
        stage.update();
        // パスのアニメーションを設定
        setTimeout(function () { return _this.animationPath.startAnimation(stage, 10, fps); }, 200);
        var t = 0;
        var timer = setInterval(function () {
            t += 0.01;
            // 目的地点まで到達したらアニメーションを終了
            if (t > 1) {
                clearInterval(timer);
                _this.startReverseAnimation(stage, fps);
            }
            var point = _this.animationPath.getPointAtLength(t);
            _this.x = point.x - _this.WIDTH / 2;
            _this.y = point.y - _this.HEIGHT / 2;
            stage.update();
        }, 1000 / fps);
    };
    Product.prototype.startReverseAnimation = function (stage, fps) {
        var _this = this;
        if (fps === void 0) { fps = 60; }
        var img = new Image();
        img.onload = function () {
            stage.removeChild(_this);
            _this.image = img;
            _this.WIDTH = img.width * 0.075;
            _this.HEIGHT = img.height * 0.075;
            _this.scaleX = 0.075;
            _this.scaleY = 0.075;
            _this.setAnimationPath(_this.animationPath.getDestination(), _this.animationPath.getOrigin());
            _this.startAnimation(stage, fps);
        };
        img.src = 'http://illustcut.com/box/life/money/osatsu02_01.png';
    };
    return Product;
}(createjs.Bitmap));
var AnimationStage = (function (_super) {
    __extends(AnimationStage, _super);
    function AnimationStage(canvas) {
        _super.call(this, canvas);
        this.products = [];
    }
    AnimationStage.prototype.addProduct = function (product) {
        this.products.push(product);
        product.startAnimation(this);
    };
    return AnimationStage;
}(createjs.Stage));
var View = (function () {
    function View() {
        var _this = this;
        this.HAMEE_LOCATION = mapboxgl.LngLat.convert([139.155658, 35.256286]); // Hamee本社の緯度経度
        // mapboxglのアクセストークンを設定
        mapboxgl.accessToken = 'pk.eyJ1IjoidC15bmciLCJhIjoiY2l1bDIxamNyMDAxdTJ5bnVtNWE0c2VkZSJ9.KzZHJuz-6EZL5Rf-QSlNVg';
        // 地図を初期化
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/t-yng/ciul24cf5006q2iqo8stou4su',
            center: [137.91854900230788, 38.734418429646695],
            zoom: 4.7 // starting zoom
        });
        this.animationStage = new AnimationStage('canvas');
        this.map.on('load', function () {
            _this.controller = new Controller(_this);
            _this.controller.sample();
        });
    }
    View.prototype.onResponseOrders = function (orders) {
        var _this = this;
        var products = _.flatten(orders.map(function (order) { return _this.createProducts(order); }));
        products.forEach(function (product) { return _this.animationStage.addProduct(product); });
    };
    /**
     * 受注データからアニメーションさせる商品オブジェクトを生成
     */
    View.prototype.createProducts = function (order) {
        var products = order.products.map(function (product) { return new Product(); });
        var lng = order.delivery_location.lng;
        var lat = order.delivery_location.lat;
        var origin = this.map.project(this.HAMEE_LOCATION);
        var destination = this.map.project(mapboxgl.LngLat.convert([lng, lat]));
        products.forEach(function (product) {
            product.setAnimationPath(origin, destination);
        });
        return products;
    };
    View.prototype.addProduct = function (product) {
        this.animationStage.addProduct(product);
    };
    return View;
}());
var ProductFactory = (function () {
    function ProductFactory() {
    }
    ProductFactory.create = function (order) {
        var products = [];
        return products;
    };
    return ProductFactory;
}());
var RequestHandler = (function () {
    function RequestHandler() {
    }
    RequestHandler.requestOrders = function () {
        var orders = [];
        return orders;
    };
    return RequestHandler;
}());
var view = new View();
