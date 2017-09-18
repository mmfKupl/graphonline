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

    mouseFlag: false,

    cursorPositionX: 0,

    cursorPositionY: 0,

    init: function (canvas) {
        console.log('init');
        this.GraphSettings = new GraphSettings(
            /*start_ts*/                   0, //1505476421352, //1505394063539,
            /*start_price*/                0,
            /*scale*/                      0,
            /*speed_of_moving_graph*/      1,
            /*width*/                      0,
            /*height*/                     0,
            /*time_per_px*/                2500,
            /*time_step*/                  120,
            /*price_per_px*/               0.025,
            /*price_step*/                 40,
            /*timeframe*/                  0,
            /*price_points*/               5,
            /*min_px_per_detailed_candle*/ 60
        );
        this.Canvas = canvas;
        this.Ctx = this.Canvas.getContext("2d");
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCtx = this.tmpCanvas.getContext('2d');
        this.getDimensions();
        this.render();
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('keydown', function (e) {
            this.dragByButtons(e, this.GraphSettings);
        }.bind(this));
        this.Canvas.addEventListener('mouseup', function (e) {
            this.onUp(e, this.GraphSettings);
        }.bind(this));
        this.Canvas.addEventListener('mousedown', function (e) {
            this.onDown(e, this.GraphSettings);
        }.bind(this));
        this.Canvas.addEventListener('mousemove', function (e) {
            this.onMove(e, this.GraphSettings);
        }.bind(this));
    },

    getDimensions: function () {
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
        this.transferImgData(); //отрисовка временного холста на основной
    },

    buildSprites: function () {

        var t = this;

        this.drawAxes(t.tmpCtx, t.GraphSettings);//отрисовка осей
        this.drawGrid(t.tmpCtx, t.GraphSettings);//отрисовка сетки
        this.drawGridMarks(t.tmpCtx, t.GraphSettings);//отрисовка меток на координатных осях


        //отрисовка графических эл-тов - т.е. вызов у каждого графического элемента своей функции отрисовки

        // var t = this;
        //
        // t.getSprites(function (sprites) {
        //     sprites.forEach(function (sprite) {
        //         sprite.renderIfVisible(t.tmpCtx, t.GraphSettings);
        //     })
        // });


        App.CurrentGraph.getSprites(function (sprites) {
            sprites.forEach(function (sprite) {
                sprite.renderIfVisible(t.tmpCtx, t.GraphSettings);
            })
        });


    },

    drawAxes: function (ctx, gs) {
        var centerX = gs.realX(0);
        var centerY = gs.realY(0);
        var px = gs.PERFECT_PX;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, gs.HEIGHT - gs.BOTTOM_INDENT + px); //левый нижний угол
        ctx.lineTo(centerX + px, centerY + px); //центр
        ctx.lineTo(gs.WIDTH - gs.RIGHT_INDENT + px, px); //правый верхний угол
        ctx.stroke();
    },

    drawGrid: function (ctx, gs) {
        var cur_pos = gs.realX(gs.calculateIndentOnX()), //откуда начинать отрисовку на оси OX
            centerY = gs.realY(0),
            centerX = gs.realX(0),
            stepX = gs.TIME_STEP,
            stepY = gs.PRICE_STEP,
            px = gs.PERFECT_PX;

        ctx.lineWidth = 0.2;

        //отрисовка по ОХ
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(cur_pos, centerY);
            ctx.lineTo(cur_pos + px, px);
            cur_pos -= stepX;
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gs.WIDTH - gs.RIGHT_INDENT + 1, 0.5, gs.RIGHT_INDENT, gs.HEIGHT);   // Рисует закрашенный прямоугольник

        //отрисовка по OY
        cur_pos = gs.realY(gs.calculateIndentOnY());
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(centerX + px, cur_pos + px);
            ctx.lineTo(px, cur_pos + px);
            cur_pos -= stepY;
        }
        ctx.stroke();

    },


    drawGridMarks: function (ctx, gs) { //метки на кооржинатных осях
        var px = gs.PERFECT_PX;
        var indentX = gs.TIME_STEP / 2 + px; //!
        var indentY = gs.PRICE_STEP / 2 + px;
        var stepX = gs.TIME_STEP;
        var stepY = gs.PRICE_STEP;
        var coord_of_mark_Y = gs.realY(-8.5); // координата конца метки по оси OY
        var coord_of_mark_X = gs.realX(-8.5);
        var centerX = gs.realX(0);
        var centerY = gs.realY(0);
        var cur_pos; //откуда начинать отрисовку

        // отрисовка оси OY
        ctx.lineWidth = 1;
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        cur_pos = gs.realY(gs.calculateIndentOnY()) + indentY;
        ctx.beginPath();
        while (cur_pos >= 0) {
            ctx.moveTo(centerX, cur_pos);
            ctx.lineTo(coord_of_mark_X, cur_pos);
            cur_pos -= stepY;
        }
        ctx.stroke();
        cur_pos = gs.realY(gs.calculateIndentOnY()) + indentY;
        coord_of_mark_X = gs.realX(-35.5);
        var price_per_step = gs.PRICE_STEP * gs.PRICE_PER_PX;
        var price = -gs.START_PRICE + (gs.calculateIndentOnY() + indentY) * gs.PRICE_PER_PX - price_per_step;
        console.log('indent: ' + gs.calculateIndentOnY());
        console.log('start_price' + gs.START_PRICE);
        var str = '';
        ctx.beginPath();
        while (cur_pos > 0) {
            str = price.toFixed(1) + '00';
            ctx.fillText(str, coord_of_mark_X, cur_pos);
            cur_pos -= stepY;
            price += price_per_step;
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0.5, gs.HEIGHT - gs.BOTTOM_INDENT + 1, gs.WIDTH, gs.BOTTOM_INDENT + 0.5);   // Рисует закрашенный прямоугольник

        //отрисовка оси OX
        ctx.fillStyle = '#000000';
        cur_pos = gs.realX(gs.calculateIndentOnX()) + indentX;
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(cur_pos, centerY);
            ctx.lineTo(cur_pos, coord_of_mark_Y);
            cur_pos -= stepX;
        }
        ctx.stroke();
        cur_pos = gs.realX(gs.calculateIndentOnX()) + indentX; //координата для отрисовки метки
        coord_of_mark_Y = gs.realY(-18.5);
        var start_ts = gs.START_TS;
        var ts = gs.TIME_STEP * gs.TIME_PER_PX; //в одном промежутке сколько милисекунд
        var time = (gs.calculateIndentOnX() + indentX) * gs.TIME_PER_PX - ts; //время под первой меткой
        var date;
        ctx.beginPath();
        while (cur_pos > 0) {
            date = new Date(start_ts - time);
            str = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            ctx.fillText(str, cur_pos, coord_of_mark_Y);
            cur_pos -= stepX;
            time += ts;
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX + 1, centerY, gs.RIGHT_INDENT, gs.BOTTOM_INDENT);   // Рисует закрашенный прямоугольник

    },

    dragByButtons: function (e, gs) {
        var left = 37,
            up = 38,
            right = 39,
            down = 40,
            speed = gs.SPEED_OF_MOVING_GRAPH,
            val = 0; //value of dragging

        switch (e.keyCode) {
            case left:
                val = -gs.pxToTime(speed);
                this.onDragged(val, 'left');
                break;
            case up:
                val = -gs.pxToPrice(speed);
                this.onDragged(val, 'up');
                break;
            case right:
                val = gs.pxToTime(speed);
                this.onDragged(val, 'right');
                break;
            case down:
                val = gs.pxToPrice(speed);
                this.onDragged(val, 'down');
                break;
        }
    },

    //нажатие левой кнопки мыши
    onDown: function (e, gs) {
        if (e.type === 'mousedown') {
            if ((e.clientX <= gs.WIDTH - gs.RIGHT_INDENT) && (e.clientY <= gs.HEIGHT - gs.BOTTOM_INDENT)) {
                console.log('here');
                this.mouseFlag = true;
                this.cursorPositionX = gs.realX(e.clientX);
                this.cursorPositionY = gs.realY(e.clientY);
            }
        }
    },

    //функция для обработчика событий при отпускании ЛКМ
    onUp: function (e, gs) {
        if (e.type === 'mouseup') {
            this.mouseFlag = false;
            this.cursorPositionX = gs.realX(e.clientX);
            this.cursorPositionY = gs.realY(e.clientY);
        }
    },

    //функция для обработчика событий при движении мыши
    onMove: function (e, gs) {
        var xPrice = 0,
            yTime = 0;
        if (e.type === 'mousemove') {
            if (this.mouseFlag) {
                xPrice = gs.pxToPrice(gs.realX(e.clientX));
                yTime =gs.pxToTime(gs.realY(e.clientY));
                this.onDragged(xPrice, yTime);
            }
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
        //создание объекта, хранящего параметры трансформации графика

        var TransformQuery = {};
        if (arguments.length === 2) {
            if (arguments[1] === 'left' || arguments[1] === 'right') {
                TransformQuery.transform_TS = x;
            }
            else if (arguments[1] === 'up' || arguments[1] === 'down') {
                TransformQuery.transform_Price = x;
            }
            else {
                console.log('x = ' + x, 'y = ' + y);
                TransformQuery.transform_TS = x;
                TransformQuery.transform_Price = y;
                TransformQuery.scale = false;
            }
        }
        this.transform(TransformQuery);
    },


    transform: function (q) {
        if (q.transform_TS) {
            this.GraphSettings.START_TS += q.transform_TS;
        }
        if (q.transform_Price) {
            this.GraphSettings.START_PRICE += q.transform_Price;
        }
        if (q.scale) {
            this.GraphSettings.SCALE = q.scale;
        }
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
        // console.log('x_visible: ' + x_visible);
        // console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    }

    , render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.X);
        var _y = gs.getYCoordForPrice(this.Y);

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(_x, _y, this.r, 0, Math.PI * 2);
        ctx.stroke();


    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            // console.log('nonVisible');
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
        // console.log('x_visible: ' + x_visible);
        // console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    },

    render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.X);
        var _y = gs.getYCoordForPrice(this.Y);

        ctx.strokeStyle = "green";
        ctx.strokeRect(_x, _y, this.width, this.height);

    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            // console.log('nonVisible');
        }
    }
};


var GraphSettings = function (start_ts, start_price, scale, /*price_step,*/ speed_of_moving_graph, width, height, time_per_px, time_step, price_per_px, price_step, timeframe, price_points, min_px_per_detailed_candle) {

    this.START_TS = start_ts;
    this.START_PRICE = start_price;
    this.SCALE = scale;
    //this.PRICE_STEP = price_step; //для отрисовки свечи детально
    this.SPEED_OF_MOVING_GRAPH = speed_of_moving_graph;
    this.WIDTH = width;
    this.HEIGHT = height;
    this.TIME_PER_PX = time_per_px;
    this.TIME_STEP = time_step;
    this.PRICE_PER_PX = price_per_px;
    this.PRICE_STEP = price_step;
    this.TIMEFRAME = timeframe;
    this.PRICE_POINTS = price_points;
    this.MIN_PX_PER_DETEILED_CANDLE = min_px_per_detailed_candle;
    this.RIGHT_INDENT = 80;
    this.BOTTOM_INDENT = 40;
    this.PERFECT_PX = 0.5; //для резкозти
};

GraphSettings.prototype = {
    constructor: GraphSettings
    , getBorderTS: function () {
        return this.START_TS + this.WIDTH * this.TIME_PER_PX;
    }

    , getBorderPrice: function () {
        return this.START_PRICE + this.HEIGHT * this.PRICE_PER_PX;
    }

    , getXCoordForTS: function (n) {
        return (n - this.START_TS) / this.TIME_PER_PX;
    }

    , getYCoordForPrice: function (n) {
        return (n - this.START_PRICE) / this.PRICE_PER_PX;
    }

    , realY: function (y) {
        return this.HEIGHT - this.BOTTOM_INDENT - y;
    }

    , realX: function (x) {
        return this.WIDTH - x - this.RIGHT_INDENT;
    }

    , calculateIndentOnX: function () {
        var indent = this.TIME_STEP - (this.START_TS % (this.TIME_PER_PX * this.TIME_STEP)) / this.TIME_PER_PX;
        if (this.START_TS < 0) {
            indent = this.TIME_STEP - indent;
        }
        else {
            indent = Math.abs(this.TIME_STEP - indent);
        }
        return indent;
    }

    , calculateIndentOnY: function () {
        var indent = Math.abs((this.START_PRICE % (this.PRICE_PER_PX * this.PRICE_STEP)) / this.PRICE_PER_PX);
        if (this.START_PRICE < 0) {
            indent = this.PRICE_STEP - indent;
        }
        return indent;
    }

    , pxToTime: function (x) {
        return x * this.TIME_PER_PX;
    }

    , pxToPrice: function (y) {
        return y * this.PRICE_PER_PX;
    }
};
