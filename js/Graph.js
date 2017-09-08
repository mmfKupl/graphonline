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
        this.GraphSettings = new GraphSettings(0, 0, 0, 0.05, 0, 0, 0, 30, 0.5, 0, 5, 60, 60, 40, 130, 80);
        this.Canvas = canvas;
        this.Ctx = this.Canvas.getContext("2d");
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCtx = this.tmpCanvas.getContext('2d');
        this.getDimensions();
        this.render();
        window.addEventListener('resize', this.onResize.bind(this));
    },

    getDimensions: function () {
        console.log(this);
        console.log('getDim');
        var div = document.getElementsByClassName('graph')[0];
        var styles = getComputedStyle(div);
        this.Canvas.height = parseInt(styles.height);
        this.Canvas.width = parseInt(styles.width);
        this.tmpCanvas.height = parseInt(styles.height);
        this.tmpCanvas.width = parseInt(styles.width);
        this.GraphSettings.HEIGHT = this.Canvas.height;
        this.GraphSettings.WIDTH = this.Canvas.width;
    },

    onResize: function () {
        this.getDimensions();
        this.render();
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
        this.drawMarks(this.tmpCtx, this.GraphSettings);//подписи меток на координатных осях
        this.transferImgData(); //отрисовка временного холста на основной
    },

    buildSprites: function () {
        //отрисовка графических эл-тов - т.е. вызов у каждого графического элемента своей функции отрисовки

        // var t = this;
        //
        // t.getSprites(function (sprites) {
        //     sprites.forEach(function (sprite) {
        //         sprite.renderIfVisible(t.tmpCtx, t.GraphSettings);
        //     })
        // });

        var t = this;
        App.CurrentGraph.getSprites(function (sprites) {
            sprites.forEach(function (sprite) {
                sprite.renderIfVisible(t.tmpCtx, t.GraphSettings);
            })
        });


        this.drawGrid(t.tmpCtx, t.GraphSettings);//отрисовка сетки
        this.drawAxes(t.tmpCtx, t.GraphSettings);//отрисовка осей
        this.drawGridMarks(t.tmpCtx, t.GraphSettings);//отрисовка меток на координатных осях
    },

    drawAxes: function (ctx, gs) {
        var realY0 = gs.realY(0) + 0.5,
            width = gs.WIDTH,
            bottom_ident = gs.BOTTOM_IDENT,
            right_ident = gs.RIGHT_IDENT;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0.5, realY0);
        ctx.lineTo(width - right_ident + 0.5, realY0);
        ctx.lineTo(width - right_ident + 0.5, 0.5);
        ctx.stroke();
    },

    drawGrid: function (ctx, gs) {
        var realY0 = gs.realY(0) + 0.5,
            lengthX = gs.WIDTH - gs.RIGHT_IDENT,
            lengthY = gs.HEIGHT - gs.BOTTOM_IDENT,
            stepX = gs.STEP_X, stepY = gs.STEP_Y,
            xp8 = lengthX + 8.5,
            cur_pos = 0.5;//gs.calculateSectionsOnX();
        ctx.strokeStyle = '#c8c8c8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        while (cur_pos < lengthX) {
            ctx.moveTo(cur_pos, realY0);
            ctx.lineTo(cur_pos, 0.5);
            cur_pos += stepX;
        }
        cur_pos = 0.5;
        while (cur_pos < lengthY) {
            ctx.moveTo(0.5, gs.realY(cur_pos));
            ctx.lineTo(xp8, gs.realY(cur_pos));
            cur_pos += stepY;
        }
        ctx.stroke();
    },

    drawGridMarks: function (ctx, gs) {
        var realY0 = gs.realY(0) + 0.5,
            realYm8 = gs.realY(-8) + 0.5,
            lengthX = gs.WIDTH - gs.RIGHT_IDENT,
            lengthY = gs.HEIGHT - gs.BOTTOM_IDENT,
            stepX = gs.STEP_X, stepY = gs.STEP_Y,
            xp8 = lengthX + 8.5,
            cur_pos = stepX / 2 + 0.5;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        while (cur_pos < lengthX) {
            ctx.moveTo(cur_pos, realY0);
            ctx.lineTo(cur_pos, realYm8);
            cur_pos += stepX;
        }
        cur_pos = 0.5;
        while (cur_pos < lengthY) {
            ctx.moveTo(lengthX, gs.realY(cur_pos));
            ctx.lineTo(xp8, gs.realY(cur_pos));
            cur_pos += stepY;
        }
        ctx.stroke();

    },

    drawMarks: function (ctx, gs) { //подписи на меток координатных осях
        var realY0 = gs.realY(0) + 0.5,
            realYm12 = gs.realY(-18) + 0.5,
            lengthX = gs.WIDTH - gs.RIGHT_IDENT,
            lengthY = gs.HEIGHT - gs.BOTTOM_IDENT,
            stepX = gs.STEP_X, stepY = gs.STEP_Y,
            xp12 = lengthX + 12.5,
            cur_pos = stepX / 2 + 0.5;
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        while (cur_pos < lengthX){
            ctx.fillText(cur_pos, cur_pos, realYm12);
            cur_pos += stepX;
        }
        cur_pos = 0.5;
        ctx.textAlign = 'left';
        //if (Graph.START_UNITS > 0)
        //    cur_pos += (Graph.UNITS_PER_PIXEL * Graph.PX_PER_POINT);
        //console.log(cur_pos_Y+"="+Graph.START_UNITS+"+"+cur_pos+"*"+Graph.UNITS_PER_PIXEL, Graph.START_UNITS);
        while (cur_pos < lengthY) {
            ctx.fillText(cur_pos, xp12, gs.realY(cur_pos));
            cur_pos += stepY;
        }




    },

    transferImgData: function () {
        this.imgData = this.tmpCtx.getImageData(0, 0, this.GraphSettings.WIDTH, this.GraphSettings.HEIGHT);
        this.Ctx.putImageData(this.imgData, 0, 0);
        //this.Ctx.strokeRect(135, 5, 50, 50);
    },

    // @Abstract
    getSprites: function (f) {
        var sprites = [];

        f(sprites);
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
            this.GraphSettings.START_TS = q.transform_TS; // должно быть в зависимости от клавиши = +/-
        }
        // и так по каждому параметру
        this.render();
    },

    setStartTS: function (ts) {
        this.GraphSettings.START_TS = ts;
    },

    setScale: function (scale) {
        this.GraphSettings.SCALE = scale;
    },

    setStartPrice: function (price) {
        this.GraphSettings.START_PRICE = price;
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

    var Sprites = [new CircleSprite(300, 10, 32), new CircleSprite(600, 20, 98), new RectangleSprite(300, 50, 60, 40), new RectangleSprite(4050, 70, 50, 50)];//new RectangleSprite(150, 150, 50, 50)
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
        var x_visible = ((this.X + this.r * gs.TIME_PER_PX >= gs.START_TS) && (this.X - this.r * gs.TIME_PER_PX <= gs.getBorderTS()));
        var y_visible = ((this.Y + this.r * gs.PRICE_PER_PX >= gs.START_PRICE) && (this.Y - this.r * gs.PRICE_PER_PX <= gs.getBorderPrice()));
        console.log('x_visible: ' + x_visible);
        console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    }

    , render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.X) + 0.5;
        var _y = gs.getYCoordForPrice(this.Y) + 0.5;

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(_x, _y, this.r + 0.5, 0, Math.PI * 2);
        ctx.stroke();


    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            console.log('nonVisible');
        }
    }
};

var RectangleSprite = function (x, y, width, height) {
    this.X = x; //in seconds
    this.Y = y; //in $
    this.width = width; //in px
    this.height = height; //in px
};

RectangleSprite.prototype = {
    constructor: RectangleSprite,

    isVisible: function (gs) {
        var x_visible = ((this.X + (this.width * gs.TIME_PER_PX) >= gs.START_TS) && (this.X <= gs.getBorderTS()));
        var y_visible = ((this.Y + (this.height * gs.PRICE_PER_PX) >= gs.START_PRICE) && (this.Y <= gs.getBorderPrice()));
        console.log('x_visible: ' + x_visible);
        console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    },

    render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.X) + 0.5;
        var _y = gs.getYCoordForPrice(this.Y) + 0.5;

        ctx.strokeStyle = "green";
        ctx.strokeRect(_x, _y, this.width, this.height);

    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            console.log('nonVisible');
        }
    }
};


var GraphSettings = function (start_ts, start_price, scale, price_step, speed_of_moving_graph, width, height, time_per_px, price_per_px, timeframe, price_points, min_px_per_detailed_candle, right_ident, bottom_ident, step_x, step_y) {

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
    this.RIGHT_IDENT = right_ident;
    this.BOTTOM_IDENT = bottom_ident;
    this.STEP_X = step_x;
    this.STEP_Y = step_y;

};

GraphSettings.prototype = {
    constructor: GraphSettings
    , getBorderTS: function () {
        return this.START_TS + (this.WIDTH - this.RIGHT_IDENT) * this.TIME_PER_PX;
    }

    , getBorderPrice: function () {
        return this.START_PRICE + (this.HEIGHT - this.BOTTOM_IDENT) * this.PRICE_PER_PX;
    }

    , getXCoordForTS: function (n) {
        return (n - this.START_TS) / this.TIME_PER_PX;
    }

    , getYCoordForPrice: function (n) {
        return (n - this.START_PRICE) / this.PRICE_PER_PX;
    }

    , realY: function (y) {
        return this.HEIGHT - this.BOTTOM_IDENT - y;
    }

    //вычисление первого отступа метки по ОX
    , calculateSectionsOnX: function () {
        return this.STEP_X - (this.START_TS % (this.TIME_PER_PX * this.STEP_X)) / this.TIME_PER_PX;
    }

    //вычисление первого отступа метки по OY
    , calculateSectionsOnY: function () {
        var s = Math.abs((this.START_PRICE % (this.PRICE_PER_PX * this.STEP_Y)) / this.PRICE_PER_PX);
        if (this.START_PRICE > 0) {
            s = this.STEP_Y - s;
        }
        return s;
    }
};
