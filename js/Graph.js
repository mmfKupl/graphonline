"use strict";

var Graph = function () {
};

Graph.prototype = {

    constructor: Graph,

    GraphSettings: null,

    Canvas: null, // DOM Element Canvas

    tmpCanvas: null,

    Ctx: null, //Ctx

    tmpCtx: null,

    imgData: null,

    Type: null,

    init: function (canvas) {
        console.log('init');
        this.GraphSettings = new GraphSettings(1504786582926, 0, 0, 0.05, 0, 0, 0, 30, 0.5, 0, 5, 60);
        this.Canvas = canvas;
        this.Ctx = this.Canvas.getContext("2d");
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCtx = this.tmpCanvas.getContext('2d');
        this.getDimensions();
        this.render();
        window.addEventListener('resize', this.onResize);
    },

    getDimensions: function () {
        console.log('getDim');
        var div = document.getElementsByClassName('graph')[0];
        var styles = getComputedStyle(div);
        this.Canvas.height = parseInt(styles.height);
        this.Canvas.width = parseInt(styles.width);
        this.GraphSettings.HEIGHT = this.Canvas.height;
        this.GraphSettings.WIDTH = this.Canvas.width;
    },

    onResize: function () {

    },

    render: function () {
        console.log('render');
        this.resetCanvas(); //очистка графика
        this.buildData(); //отрисовка графика
    },

    resetCanvas: function () { //заливка холста
        console.log('resetCanvas');
        this.tmpCtx.fillStyle = '#ffffff';
        this.tmpCtx.fillRect(0, 0, this.GraphSettings.WIDTH, this.GraphSettings.HEIGHT);
    },

    buildData: function () {
        this.buildSprites();//отрисовка графических объектов
        this.drawMarks();//подписи меток на координатных осях
        this.transferImgData(); //отрисовка временного холста на основной
    },

    buildSprites: function () {
        //отрисовка графических эл-тов - т.е. вызов у каждого графического элемента своей функции отрисовки

        var t = this;

        t.getSprites(function (sprites) {
            sprites.forEach(function (sprite) {
                sprite.renderIfVisible(t.Ctx, t.GraphSettings);
            })
        });

        this.drawAxes();//отрисовка осей
        this.drawGrid();//отрисовка сетки
        this.drawGridMarks();//отрисовка меток на координатных осях
    },

    drawAxes: function () {

    },

    drawGrid: function () {

    },

    drawGridMarks: function () {

    },

    drawMarks: function () { //подписи на меток координатных осях

    },

    transferImgData: function () {
        this.imgData = this.tmpCtx.getImageData(0, 0, this.GraphSettings.WIDTH, this.GraphSettings.HEIGHT);
        this.Ctx.putImageData(this.imgData, 0, 0);
    },

    // @Abstract
    getSprites: function (f) {
        f([]);
    },

    //методы для обработки движения графика
    onDragged: function (x, y) {
        //преобразование пикселей в нужные величины                                          //{transform_TS
        //и создание объекта, хранящего параметры трансформации графика                      //Transform_Price
        //Scale}
        var TransformQuery = {
            transform_TS: 700,
            transform_Price: 0.45,
            scale: false
        };

        Graph.transform(TransformQuery);
    },


    transform: function (q) {
        if (q.transform_TS) {
            Graph.GraphSettings.Start_TS = q.transform_TS; // должно быть в зависимости от клавиши = +/-
        }
        // и так по каждому параметру
        Graph.render();
    },

    setStartTS: function (ts) {
        Graph.GraphSettings.Start_TS = ts;
    },

    setScale: function (scale) {
        Graph.GraphSettings.scale = scale;
    },

    setStartPrice: function (price) {
        Graph.GraphSettings.Start_price;
    }
};

var FootPrintGraph = function () {
    this.timeFrame = null;
    this.instrument = null;
};

FootPrintGraph.prototype = new Graph();
FootPrintGraph.prototype.type = App.GraphType.FOOTPRINT;
FootPrintGraph.prototype.setTimeframe = function (timeframe) {
    this.timeFrame = timeframe;
};

FootPrintGraph.prototype.setInstrument = function (instrument) {
    this.instrument = instrument;
};

FootPrintGraph.prototype.getSprites = function (f) {

    // Data.getCandlesForInterval(ts, duration, function(candles){
    //      #candles = Array<Candle>
    //      var candleSprites = candles.map(function(candle){
    //          return new CandleSprite(candle);
    //      })
    //      f(candleSprites);
    // )

    var Sprites = [new CircleSprite(100342345234, 200, 35), new CircleSprite(482412342342, 842, 182)];
    f(Sprites);
};


var Sprite = function () {
};

Sprite.prototype = {
    constructor: Sprite
    , isVisible: function (GraphSettings) {
    }
    , render: function (Ctx, GraphSettings) {
    }
    , renderIfVisible: function (Ctx, GraphSettings) {
    }
};


var CandleSprite = function (Candle) {
    this.Candle = Candle;
};

CandleSprite.prototype = {
    constructor: CandleSprite
    , isVisible: function (gs) {

    }

    , render: function (ctx, gs) {

    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
    }
};


var CircleSprite = function (x, y, r) {
    this.X = x; // In seconds
    this.Y = y; // In $
    this.r = r; // In PX
};

CircleSprite.prototype = {
    constructor: CircleSprite
    , isVisible: function (gs) {
        var x_visible = ((this.x + this.r * gs.TIME_PER_PX >= gs.Start_TS) && (this.x - this.r * gs.TIME_PER_PX <= gs.getBorderTS()));
        var y_visible = ((this.y + this.r * gs.PRICE_PER_PX >= gs.Start_price) && (this.y - this.r * gs.PRICE_PER_PX <= gs.getBorderPrice()));

        return x_visible && y_visible;
    }

    , render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.x);
        var _y = gs.getYCoordForPrice(this.y);

        ctx.beginPath();
        ctx.arc(_x, _y, this.r, 0, Math.PI * 2);
        ctx.fill();

    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
    }
};


var GraphSettings = function (start_ts, start_price, scale, price_step, speed_of_moving_graph, width, height, time_per_px, price_per_px, timeframe, price_points, min_px_per_detailed_candle) {

    this.START_TS = start_ts;
    this.START_PRICE = start_price;
    this.SCALE = scale;
    this.PRICE_STEP = price_step;
    this.SPEED_OF_MOVING_GRAPH = speed_of_moving_graph;
    this.WIDTH = width;
    this.HEIGHT = height;
    this.TIME_PER_PX = time_per_px;
    this.PRICE_PER_PX = price_per_px;
    this.TIMEFRAME = timeframe;
    this.PRICE_POINTS = price_points;
    this.MIN_PX_PER_DETEILED_CANDLE = min_px_per_detailed_candle;

};

GraphSettings.prototype = {
    constructor: GraphSettings
    , getBorderTS: function () {
        return this.Start_TS + this.WIDTH * this.TIME_PER_PX;
    }

    , getBorderPrice: function () {
        return this.Start_price + this.HEIGHT * this.PRICE_PER_PX;
    }

    , getXCoordForTS: function (n) {
        return (n - this.Start_TS) / this.TIME_PER_PX;
    }

    , getYCoordForPrice: function (n) {
        return (n - this.Start_price) / this.PRICE_PER_PX;
    }
};
