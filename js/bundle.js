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
        ];
        this.view.onResponseOrders(orders);
    };
    return Controller;
}());
var AnimationPath = (function () {
    function AnimationPath(origin, destination) {
        this._origin = origin;
        this._destination = destination;
        this._controlPoint = this.createBezierControlPoint(origin, destination);
        this._points = [
            this._origin,
            this._controlPoint,
            this._destination
        ];
    }
    Object.defineProperty(AnimationPath.prototype, "origin", {
        get: function () {
            return this._origin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationPath.prototype, "deestination", {
        get: function () {
            return this._destination;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationPath.prototype, "points", {
        get: function () {
            return _.chain(this._points)
                .map(function (point) { return [point.x, point.y]; })
                .flatten(true)
                .value();
        },
        enumerable: true,
        configurable: true
    });
    AnimationPath.prototype.createBezierControlPoint = function (start, end, alpha) {
        if (alpha === void 0) { alpha = 0; }
        var x = Math.min(start.x, end.x) + Math.abs(start.x - end.x) / 2;
        var y = Math.min(start.y, end.y) - alpha;
        return new mapboxgl.Point(x, y);
    };
    return AnimationPath;
}());
var AnimationLine = (function (_super) {
    __extends(AnimationLine, _super);
    function AnimationLine() {
        _super.call(this);
        this._pointStack = [];
        this._points = [];
    }
    Object.defineProperty(AnimationLine.prototype, "LINE_LENGTH", {
        get: function () {
            return 20;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationLine.prototype, "onAnimationEndFunc", {
        set: function (onAnimationEndFunc) {
            this._onAnimationEndFunc = onAnimationEndFunc;
        },
        enumerable: true,
        configurable: true
    });
    AnimationLine.prototype.startAnimationOnPath = function (path, dulation) {
        if (dulation === void 0) { dulation = 3000; }
        // アニメーション用の先導ポイント
        // この点をベジェ曲線に沿ってアニメーションさせる
        // ポイントの移動経路における任意地点から任意の地点を線で繋ぐことで、線が飛んでいくアニメーションを実現する
        var origin = path.origin;
        var animationLeadPoint = { x: origin.x, y: origin.y, isAnimationEnd: false };
        this._points.push({ x: origin.x, y: origin.y });
        this._startX = origin.x;
        this._startY = origin.y;
        // アニメーションを開始
        createjs.Tween.get(animationLeadPoint)
            .to({ guide: { path: path.points } }, dulation)
            .set({ isAnimationEnd: true });
        this.addEventListener('tick', this.movePath(animationLeadPoint));
    };
    AnimationLine.prototype.movePath = function (animationLeadPoint) {
        var _this = this;
        // TODO: 経路の位置を保存しておき、lineToで細かく繋げれば長さに応じた曲線は表現できる
        return function () {
            if (!animationLeadPoint.isAnimationEnd) {
                var newPoint = { x: animationLeadPoint.x, y: animationLeadPoint.y };
                _this._points.push(newPoint);
            }
            // 配列の先頭要素を削除して、左詰め
            if (_this._points.length > _this.LINE_LENGTH || animationLeadPoint.isAnimationEnd) {
                _this._points = _.rest(_this._points);
            }
            if (_this._points.length === 0) {
                _this.dispatchEvent('onAnimationEnd');
                return;
            }
            var startPoint = _this.startPoint;
            var lastPoint = _this.lastPoint;
            _this.graphics.clear();
            _this.graphics
                .beginStroke('red')
                .setStrokeStyle(1.5)
                .beginLinearGradientStroke(['rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 1)'], [0, 1], startPoint.x, startPoint.y, lastPoint.x, lastPoint.y);
            // .lineTo(animationLeadPoint.x, animationLeadPoint.y)
            /* 点の配列から線を描画 */
            // 最初の点に移動
            _this.graphics.moveTo(startPoint.x, startPoint.y);
            // 残りの点を辿る      
            _.chain(_this._points)
                .rest()
                .forEach(function (point) { return _this.graphics.lineTo(point.x, point.y); });
        };
    };
    Object.defineProperty(AnimationLine.prototype, "startPoint", {
        get: function () {
            return _.first(this._points);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationLine.prototype, "lastPoint", {
        get: function () {
            return _.last(this._points);
        },
        enumerable: true,
        configurable: true
    });
    AnimationLine.prototype.distance = function (x1, y1, x2, y2) {
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        return Math.sqrt(x * x + y * y);
    };
    return AnimationLine;
}(createjs.Shape));
var Product = (function (_super) {
    __extends(Product, _super);
    // TODO: 画像の読み込みが非同期なので、クライアントでも非同期で待機できるようにする？ Promise
    function Product(img_url) {
        if (img_url === void 0) { img_url = 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png'; }
        _super.call(this, img_url);
        this.WIDTH = 491 * 0.025;
        this.HEIGHT = 935 * 0.025;
        this.scaleX = 0.025;
        this.scaleY = 0.025;
    }
    Object.defineProperty(Product.prototype, "origin", {
        get: function () {
            return this._origin;
        },
        set: function (origin) {
            this._origin = origin;
            this.x = origin.x - this.WIDTH / 2;
            this.y = origin.y - this.HEIGHT / 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Product.prototype, "destination", {
        get: function () {
            return this._destination;
        },
        set: function (destination) {
            this._destination = destination;
        },
        enumerable: true,
        configurable: true
    });
    Product.prototype.startAnimationOnPath = function (path, dulation) {
        var _this = this;
        if (dulation === void 0) { dulation = 3000; }
        // 画像の基準点を左上から中心に変更
        var points = path.points.map(function (point, i) {
            if (i % 2 === 0) {
                point -= _this.WIDTH / 2;
            }
            else {
                point -= _this.HEIGHT / 2;
            }
            return point;
        });
        createjs.Tween.get(this)
            .to({ guide: { path: points } }, dulation)
            .call(function () { return _this.dispatchEvent('onAnimationEnd'); });
    };
    return Product;
}(createjs.Bitmap));
var AnimationStage = (function (_super) {
    __extends(AnimationStage, _super);
    function AnimationStage(canvas) {
        _super.call(this, canvas);
        this.PRODUCT_IMG_URL = 'http://www.rakuten.ne.jp/gold/sumahoke-su/iface/images/innovation03.png';
        this.MONEY_IMG_URL = 'http://illustcut.com/box/life/money/osatsu02_01.png';
        this.products = [];
    }
    AnimationStage.prototype.addProduct = function (product) {
        var _this = this;
        var line = new AnimationLine();
        this.addChild(product);
        this.addChild(line);
        line.addEventListener('onAnimationEnd', function () {
            // 逆向きのアニメーションを行うために線を初期化
            _this.removeChild(line);
            _this.removeChild(product);
            line = new AnimationLine();
            _this.addChild(line);
            _this.addChild(product);
            // 配送されてお金になって戻ってきたら、商品と線をステージ上から削除
            line.addEventListener('onAnimationEnd', function () {
                _this.removeChild(line);
                _this.removeChild(product);
            });
            // 目的地点から逆順にアニメーションさせる
            _this.loadImage(_this.MONEY_IMG_URL, function (image) {
                product.image = image;
                var path = new AnimationPath(product.destination, product.origin);
                // setTimeout(() => , 10)
                product.startAnimationOnPath(path, 2000);
                line.startAnimationOnPath(path, 2000);
            });
        });
        var animationPath = new AnimationPath(product.origin, product.destination);
        product.startAnimationOnPath(animationPath, 7000);
        line.startAnimationOnPath(animationPath, 7000);
    };
    AnimationStage.prototype.loadImage = function (url, onload) {
        var bitmap = new createjs.Bitmap(url);
        bitmap.image.onload = onload(bitmap.image);
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
        createjs.MotionGuidePlugin.install();
        createjs.Ticker.addEventListener('tick', function () { return _this.animationStage.update(); });
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
            product.origin = origin;
            product.destination = destination;
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
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var view = new View();
