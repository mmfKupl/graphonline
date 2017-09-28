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

    buttonZoomPlus: null,

    buttonZoomMinus: null,

    cordX: 0,
    cordY: 0,

    init: function (canvas) {
        //console.log('init');
        this.GraphSettings = new GraphSettings(
            /*start_ts*/                  1505724367500,//1505723122670,//1505476421352, //1505394063539,
            /*start_price*/                5,
            /*zoom*/                       //20,
            /*speed_of_moving_graph*/      5,
            /*width*/                      0,
            /*height*/                     0,
            /*time_per_px*/                2500,
            /*time_step*/                  120,
            /*price_per_px*/               0.025,
            /*price_step*/                 40,
            /*timeframe*/                  300000,
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
            //this.drawDashedLine(this.tmpCtx, this.GraphSettings, e);
            this.onMove(e, this.GraphSettings);
        }.bind(this));
        this.Canvas.addEventListener('wheel', function (e) {
            this.onZoom(e, this.GraphSettings);
        }.bind(this));
        this.buttonZoomPlus.addEventListener('click', function (e) {
            this.zoomIn(e, this.GraphSettings);
        }.bind(this));
        this.buttonZoomMinus.addEventListener('click', function (e) {
            this.zoomOut(e, this.GraphSettings);
        }.bind(this))
    },

    getDimensions: function () {
        //console.log('getDim');
        var zoomPlus = document.getElementsByClassName('bottom-item-first')[0];
        var zoomMinus = document.getElementsByClassName('bottom-item-second')[0];
        this.buttonZoomPlus = zoomPlus;
        this.buttonZoomMinus = zoomMinus;
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
        //console.log('render');
        this.GraphSettings.setTimePerPX();
        this.GraphSettings.setTimeStep();
        this.GraphSettings.getStartTsOnNull();
        this.resetCanvas(); //очистка графика
        this.buildData(); //отрисовка графика
    },

    resetCanvas: function () { //заливка холста
        //console.log('resetCanvas');
        this.tmpCtx.fillStyle = '#ffffff';
        this.tmpCtx.fillRect(0, 0, this.GraphSettings.WIDTH, this.GraphSettings.HEIGHT);
    },

    fillRect: function (ctx, gs) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, gs.HEIGHT - gs.BOTTOM_INDENT, gs.WIDTH, gs.BOTTOM_INDENT);//заливка нижнего пространства
        ctx.fillRect(gs.WIDTH - gs.RIGHT_INDENT, 0, gs.RIGHT_INDENT, gs.HEIGHT);//заливка правого пространства
    },

    buildData: function () {
        this.buildSprites();//отрисовка графических объектов
        this.transferImgData(); //отрисовка временного холста на основной
    },

    buildSprites: function () {

        var t = this;

        this.drawGrid(t.tmpCtx, t.GraphSettings);//отрисовка сетки


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

        //Data.Request.getDataFor(t.GraphSettings.START_TS, t.GraphSettings.OX_MS, t.GraphSettings.TIMEFRAME, null);
        this.fillRect(t.tmpCtx, t.GraphSettings);//заливка пустых пространст под и слева от графика
        this.drawAxes(t.tmpCtx, t.GraphSettings);//отрисовка осей
        this.drawGridMarks(t.tmpCtx, t.GraphSettings);//отрисовка меток на координатных осях
        this.drawDashedLine(t.tmpCtx, t.GraphSettings);
        // this.Canvas.onmousemove = function (e) {
        //     t.drawDashedLine(t.tmpCtx, t.GraphSettings, e);
        // }

    },

    drawAxes: function (ctx, gs) {
        var centerX = gs.WIDTH - gs.RIGHT_INDENT;//gs.realX(0);
        var centerY = gs.realY(0);
        var px = gs.PERFECT_PX;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, gs.HEIGHT - gs.BOTTOM_INDENT + px, gs.WIDTH - gs.RIGHT_INDENT, gs.BOTTOM_INDENT);   // Рисует закрашенный прямоугольник

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, gs.HEIGHT - gs.BOTTOM_INDENT + px); //левый нижний угол
        ctx.lineTo(centerX + px, centerY + px); //центр
        ctx.lineTo(gs.WIDTH - gs.RIGHT_INDENT + px, px); //правый верхний угол
        ctx.stroke();
    },

    //отрисовка сетки на графике
    drawGrid: function (ctx, gs) {
        ctx.lineWidth = 0.2;
        ctx.fillStyle = '#000000';
        this.drawXGrid(ctx, gs);
        this.drawYGrid(ctx, gs);
    },

    //отрисовка вертикальных линий
    drawXGrid: function (ctx, gs) {
        var px = gs.PERFECT_PX,
            pixelsPerGridMark = gs.TIME_STEP,
            smallIntervalPixelsWidth = gs.calculateIndentOnX(),
            currentW = smallIntervalPixelsWidth - pixelsPerGridMark / 2,
            centerY = gs.realY(0);
        ctx.beginPath();
        while (currentW < gs.WIDTH) {
            var xCoord = Math.floor(currentW) + px;
            ctx.moveTo(xCoord, centerY + px);
            ctx.lineTo(xCoord, px);
            currentW += pixelsPerGridMark;
        }
        ctx.stroke();
    },

    //отрисовка горизонтальных линий
    drawYGrid: function (ctx, gs) {
        var px = gs.PERFECT_PX,
            pixelsPerGridMark = gs.PRICE_STEP, // Pixels in one vertical mark on Y grid
            smallIntervalPixelsHeight = gs.calculateIndentOnY(),
            currentH = gs.BOTTOM_INDENT + smallIntervalPixelsHeight,
            centerX = gs.WIDTH - gs.RIGHT_INDENT + px;//gs.realX(0);
        ctx.beginPath();
        while (currentH < gs.HEIGHT) {
            var yCoord = gs.HEIGHT - Math.floor(currentH) + px;
            ctx.moveTo(centerX, yCoord);
            ctx.lineTo(px, yCoord);
            currentH += pixelsPerGridMark;
        }
        ctx.stroke();
    },

    // отрисовка меток на осях
    drawGridMarks: function (ctx, gs) { //метки на кооржинатных осях
        this.drawYGridMarks(ctx, gs);
        this.drawXGridMarks(ctx, gs);
    },

    //отрисовка меток на оси ОХ
    drawXGridMarks: function (ctx, gs) {
        var px = gs.PERFECT_PX;
        var timePerPixel = gs.TIME_PER_PX;
        var pixelsPerGridMark = gs.TIME_STEP;
        var startTime = gs.START_TS_ON_NULL;//START_TS

        var timeUnitsInGridMark = pixelsPerGridMark * timePerPixel;

        var firstGridMarkTime = (startTime % timeUnitsInGridMark) ?
            (startTime + timeUnitsInGridMark - startTime % timeUnitsInGridMark)
            : startTime + timeUnitsInGridMark;

        if (startTime < 0) {
            firstGridMarkTime -= timeUnitsInGridMark;
        }
        var smallIntervalPixelsWidth = gs.calculateIndentOnX();
        //console.warn(startTime);
        if (smallIntervalPixelsWidth)

            ctx.lineWidth = 1;
        ctx.fill = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var currentW = smallIntervalPixelsWidth;
        var currentGridMarkTime = firstGridMarkTime;
        var centerY = gs.realY(0) + px;
        var coord_of_mark_Y = gs.realY(-8.5);
        ctx.beginPath();

        while (currentW < gs.WIDTH - gs.RIGHT_INDENT) {
            var xCoord = Math.floor(currentW) + px;
            // xCoord = ((currentW ^ 0) === currentW) ? currentW + px : currentW;
            var yCoord = gs.HEIGHT - gs.BOTTOM_INDENT + 18;
            ctx.moveTo(xCoord, centerY);
            ctx.lineTo(xCoord, coord_of_mark_Y);
            ctx.fillText(gs.tsToData(currentGridMarkTime), xCoord, yCoord);
            ctx.fillText(gs.tsToTime(currentGridMarkTime), xCoord, yCoord + 16);
            currentW += pixelsPerGridMark;
            currentGridMarkTime += timeUnitsInGridMark;
        }
        ctx.stroke();
    },

    //отрисовка меток на оси ОУ
    drawYGridMarks: function (ctx, gs) {
        var px = gs.PERFECT_PX,
            pricePerPixel = gs.PRICE_PER_PX, // How many PRICE units in 1 PIXEL currently
            pixelsPerGridMark = gs.PRICE_STEP, // Pixels in one vertical mark on Y grid
            startPrice = gs.START_PRICE; // Price units on zero point in corner of graph

        var priceUnitsInGridMark = pixelsPerGridMark * pricePerPixel;

        var firstGridMarkPrice = (startPrice % priceUnitsInGridMark ) ?
            (startPrice + priceUnitsInGridMark - startPrice % priceUnitsInGridMark)
            : startPrice + priceUnitsInGridMark; // Price on first grid mark visible on axe

        if (startPrice < 0) {
            firstGridMarkPrice -= priceUnitsInGridMark;
        }
        var smallIntervalPixelsHeight = gs.calculateIndentOnY();

        ctx.lineWidth = 1;
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var currentH = gs.BOTTOM_INDENT + smallIntervalPixelsHeight,
            currentGridMarkPrice = firstGridMarkPrice,
            centerX = gs.WIDTH - gs.RIGHT_INDENT + px,//gs.realX(0);
            coord_of_mark_X = gs.WIDTH - gs.RIGHT_INDENT + 8.5;//gs.realX(-8.5);
        ctx.beginPath();
        while (currentH < gs.HEIGHT) {
            var xCoord = gs.WIDTH - gs.RIGHT_INDENT + 40.5;
            var yCoord = gs.HEIGHT - Math.floor(currentH) + px;
            ctx.moveTo(centerX, yCoord);
            ctx.lineTo(coord_of_mark_X, yCoord);
            ctx.fillText(currentGridMarkPrice.toFixed(4), xCoord, yCoord);
            ////console.log(currentGridMarkPrice, xCoord, yCoord);
            currentH += pixelsPerGridMark;
            currentGridMarkPrice += priceUnitsInGridMark;
        }
        ctx.stroke();
    },

    drawDashedLine: function (ctx, gs) {
        this.drawXDashedLine(ctx, gs);
        this.drawYDashedLine(ctx, gs);
    },

    drawXDashedLine: function (ctx, gs) {
        //console.log('line');
        // ctx.lineWidth = 2;
        // ctx.beginPath();
        // ctx.moveTo(0, this.cordY);
        // ctx.lineTo(this.WIDTH, this.cordY);
        // ctx.stroke();
    },

    drawYDashedLine: function (ctx, gs, e) {

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
                val = gs.pxToPrice(speed);
                this.onDragged(val, 'up');
                break;
            case right:
                val = gs.pxToTime(speed);
                this.onDragged(val, 'right');
                break;
            case down:
                val = -gs.pxToPrice(speed);
                this.onDragged(val, 'down');
                break;
        }
    },

    //нажатие левой кнопки мыши
    onDown: function (e, gs) {
        if ((e.clientX <= gs.WIDTH - gs.RIGHT_INDENT + 50) && (e.clientY <= gs.HEIGHT - gs.BOTTOM_INDENT)) {
            this.mouseFlag = true;
            this.cursorPositionX = e.clientX - 50;//gs.realX(e.clientX - 50);
            this.cursorPositionY = gs.realY(e.clientY);
        }
    },

    //функция для обработчика событий при движении мыши
    onMove: function (e, gs) {
        this.cordX = e.clientX - 50;
        this.cordY = gs.realY(e.clientY);
        //console.log(this.cordX, this.cordY)
        // this.drawDashedLine(this.tmpCtx, gs, e);//отрисовка штриховой линии по курсору
        var x = 0, y = 0, deltaX = 0, deltaY = 0;
        if (this.mouseFlag) {
            x = e.clientX - 50;//gs.realX(e.clientX - 50);
            y = gs.realY(e.clientY);
            deltaX += (this.cursorPositionX - x) * gs.TIME_PER_PX;
            deltaY += (this.cursorPositionY - y) * gs.PRICE_PER_PX;
            //console.log(x, deltaX);
            this.onDragged(deltaX, deltaY);
            this.cursorPositionX = x;
            this.cursorPositionY = y;
        }
    },

    //функция для обработчика событий при отпускании ЛКМ
    onUp: function (e, gs) {
        this.mouseFlag = false;
        this.cursorPositionX = e.clientX - 50;//gs.realX(e.clientX - 50);
        this.cursorPositionY = gs.realY(e.clientY);
        // if (e.type === 'mouseup') {
        //     this.mouseFlag = false;
        //     this.cursorPositionX = gs.realX(e.clientX);
        //     this.cursorPositionY = gs.realY(e.clientY);
        // }
        // else if (e.type === 'touchend') {
        //     Graph.mouseFlag = false;
        // }
    },

    transferImgData: function () {
        this.imgData = this.tmpCtx.getImageData(0, 0, this.GraphSettings.WIDTH, this.GraphSettings.HEIGHT);
        this.Ctx.putImageData(this.imgData, 0, 0);
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
                //console.log('x = ' + x, 'y = ' + y);
                TransformQuery.transform_TS = x;
                TransformQuery.transform_Price = y;
                TransformQuery.zoom = false;
            }
        }
        this.transform(TransformQuery);
    },

    onZoom: function (e, gs) {
        var plus = 107, //клавиша + на нумпаде
            plusS = 187, //клавиша =
            minus = 109, //клавиша - на нумпаде
            minusS = 189, //клавиша -
            key = (e.deltaY) ? e.type : e.keyCode;
        key = (!key) ? e.type : key;

        switch (key) {
            // case plus :
            // case plusS :
            //     //console.log(e)
            //
            //     this.zoomIn(e, gs, power, PPP, stepPPP);
            //     break;
            // case minus :
            // case minusS :
            //     //console.log(e)
            //
            //     this.zoomOut(e, gs, power, PPP, stepPPP);
            //     break;
            case 'wheel' :
                if (e.deltaY < 0) {
                    ////console.log(e);
                    this.zoomOnWheel(e, gs, 'in');
                }
                else if (e.deltaY > 0) {
                    ////console.log(e);
                    this.zoomOnWheel(e, gs, 'out');
                }
                break;
        }
    },

    zoomOnWheel: function (e, gs, flag) {
        //console.error(gs.ZOOM);
        if (flag === 'in') {
            this.zoomIn(e, gs);
        }
        else if (flag === 'out') {
            this.zoomOut(e, gs);
        }
    },

    zoomIn: function (e, gs) {
        var max = 20, //максимальный зум
            TransformQuery = {};
        if (gs.ZOOM !== max) {
            TransformQuery.zoom = (gs.ZOOM < max) ? (gs.ZOOM + 1) : gs.ZOOM;
            this.transform(TransformQuery);
        }
    },

    zoomOut: function (e, gs) {
        var min = -20,
            TransformQuery = {};
        if (gs.ZOOM !== min) {
            TransformQuery.zoom = (gs.ZOOM > min) ? (gs.ZOOM - 1) : gs.ZOOM;
            this.transform(TransformQuery);
        }
    },

    transform: function (q) {
        var gs = this.GraphSettings;
        //console.log(q);
        if (q.transform_TS) {
            gs.START_TS += Math.floor(q.transform_TS);
            gs.getStartTsOnNull();
        }
        if (q.transform_Price) {
            gs.START_PRICE += q.transform_Price;
        }
        if (typeof q.zoom === "number") {
            gs.ZOOM = q.zoom;
            gs.TIME_PER_PX = Math.pow(gs.POWER_OF_GRAPH, -q.zoom) * gs.FIXED_TIME_PER_PX;
            gs.getStartTsOnNull();
        }
        if (q.speed) {
            gs.SPEED_OF_MOVING_GRAPH = q.speed;
        }
        if (q.transform_TIME_PER_PX) {
            gs.TIME_PER_PX = q.transform_TIME_PER_PX;
        }
        if (q.transform_PRICE_PER_PX) {
            gs.PRICE_PER_PX = q.transform_PRICE_PER_PX;
        }
        if (q.time_step) {
            gs.TIME_STEP = q.time_step;
        }
        this.render();
    },

    setStartTS: function (ts) {
        this.GraphSettings.START_TS = ts;
        this.GraphSettings.getStartTsOnNull();
    },

    setZoom: function (zoom) {
        this.GraphSettings.ZOOM = zoom;
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

    var Sprites = [new CircleSprite(1505723122670, 10, 32), new CircleSprite(1505723122670, 20, 98), new RectangleSprite(1505723122670, 20, 60, 40), new RectangleSprite(1505723122670, 20, 50, 50)];//new RectangleSprite(150, 150, 50, 50)
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
        var x_visible = ((this.X + this.r * gs.TIME_PER_PX >= gs.START_TS_ON_NULL/*START_TS*/) && (this.X - this.r * gs.TIME_PER_PX <= gs.getBorderTS()));
        var y_visible = ((this.Y + this.r * gs.PRICE_PER_PX >= gs.START_PRICE) && (this.Y - this.r * gs.PRICE_PER_PX <= gs.getBorderPrice()));
        // //console.log('x_visible: ' + x_visible);
        // //console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    }

    , render: function (ctx, gs) {

        var _x = gs.getXCoordForTS(this.X);
        var _y = gs.getYCoordForPrice(this.Y);
        var _r = this.r * Math.pow(gs.POWER_OF_GRAPH, gs.ZOOM);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(_x, _y, _r, 0, Math.PI * 2);
        ctx.stroke();


    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            // //console.log('nonVisible');
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
        var x_visible = ((this.X + (this.width * gs.TIME_PER_PX) >= gs.START_TS_ON_NULL/*START_TS*/) && (this.X <= gs.getBorderTS()));
        var y_visible = ((this.Y + (this.height * gs.PRICE_PER_PX) >= gs.START_PRICE) && (this.height * gs.PRICE_PER_PX <= gs.getBorderPrice()));
        // //console.log('x_visible: ' + x_visible);
        // //console.log('y_visible: ' + y_visible);

        return x_visible && y_visible;
    },

    render: function (ctx, gs) {
        var px = gs.PERFECT_PX;
        var _x = gs.getXCoordForTS(this.X) + px;
        var _y = gs.getYCoordForPrice(this.Y) + px;

        var _width = Math.floor(this.width * Math.pow(gs.POWER_OF_GRAPH, gs.ZOOM));

        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.strokeRect(_x, _y, _width, this.height);

    }

    , renderIfVisible: function (ctx, gs) {
        if (this.isVisible(gs)) {
            this.render(ctx, gs);
        }
        else {
            // //console.log('nonVisible');
        }
    }
};


var GraphSettings = function (start_ts, start_price, /* zoom, /*price_step,*/ speed_of_moving_graph, width, height, time_per_px, time_step, price_per_px, price_step, timeframe, price_points, min_px_per_detailed_candle) {

    this.START_TS = Math.floor(start_ts);
    this.START_TS_ON_NULL = 0;
    this.START_PRICE = start_price;
    this.ZOOM = 20;//zoom;
    //this.PRICE_STEP = price_step; //для отрисовки свечи детально
    this.SPEED_OF_MOVING_GRAPH = speed_of_moving_graph;
    this.WIDTH = width;
    this.HEIGHT = height;
    this.TIME_PER_PX = time_per_px;
    this.FIXED_TIME_PER_PX = 2500;
    this.TIME_STEP = time_step;
    this.PRICE_PER_PX = price_per_px;
    this.FIXED_PRICE_PER_PX = 0.025;
    this.PRICE_STEP = price_step;
    this.TIMEFRAME = timeframe;
    this.PRICE_POINTS = price_points;
    this.MIN_PX_PER_DETEILED_CANDLE = min_px_per_detailed_candle;
    this.RIGHT_INDENT = 80;
    this.BOTTOM_INDENT = 50;
    this.PERFECT_PX = 0.5; //для резкозти
    this.OX_MS = (this.WIDTH - this.RIGHT_INDENT) * this.TIME_PER_PX;
    this.POWER_OF_GRAPH = 1.04;
};

GraphSettings.prototype = {
    constructor: GraphSettings
    , getBorderTS: function () {
        return this.START_TS_ON_NULL/*START_TS*/ + this.WIDTH * this.TIME_PER_PX;
    }

    , getBorderPrice: function () {
        return this.START_PRICE + this.HEIGHT * this.PRICE_PER_PX;
    }

    , getXCoordForTS: function (n) {
        return (n - this.START_TS_ON_NULL/*START_TS*/) / this.TIME_PER_PX;
    }

    , getYCoordForPrice: function (n) {
        return this.HEIGHT - ((n - this.START_PRICE) / this.PRICE_PER_PX);
    }

    , realY: function (y) {
        return this.HEIGHT - this.BOTTOM_INDENT - y;
    }

    // , realX: function (x) {
    //     return x;//this.WIDTH - x - this.RIGHT_INDENT;
    // }

    , calculateIndentOnX: function () {

        var timeUnitsInOneGridMark = this.TIME_PER_PX * this.TIME_STEP;
        var startTime = this.START_TS_ON_NULL/*START_TS*/;

        var timeUnitsInSmallInterval = (startTime >= 0) ? startTime % timeUnitsInOneGridMark : ( timeUnitsInOneGridMark + startTime % timeUnitsInOneGridMark);
        //console.log(timeUnitsInSmallInterval);

        var smallIntervalTimeUnits = (timeUnitsInOneGridMark - (timeUnitsInSmallInterval));
        var smallIntervalPixels = smallIntervalTimeUnits / this.TIME_PER_PX;
        smallIntervalPixels = (smallIntervalPixels >= 0) ? smallIntervalPixels : (smallIntervalPixels + this.TIME_STEP);
        //console.log(smallIntervalPixels);

        return smallIntervalPixels;
    }

    // Returns size of small interval behind the first grid line in PIXELS
    , calculateIndentOnY: function () {

        var priceUnitsInOneGridMark = this.PRICE_PER_PX * this.PRICE_STEP;
        var startPrice = this.START_PRICE;

        var priceUnitsInSmallInterval = (startPrice >= 0 ) ? startPrice % priceUnitsInOneGridMark : ( priceUnitsInOneGridMark + startPrice % priceUnitsInOneGridMark);


        var smallIntervalPriceUnits = (priceUnitsInOneGridMark - (priceUnitsInSmallInterval) );
        var smallIntervalPixels = smallIntervalPriceUnits / this.PRICE_PER_PX;
        smallIntervalPixels = (smallIntervalPixels >= 0) ? smallIntervalPixels : (smallIntervalPixels + this.PRICE_STEP);
        //console.log(smallIntervalPixels);

        return smallIntervalPixels;
    }

    , pxToTime: function (x) {
        return x * this.TIME_PER_PX;
    }

    , pxToPrice: function (y) {
        return y * this.PRICE_PER_PX;
    }

    //перевод метки времени в формат ГГГГ-ММ-ДД
    , tsToData: function (ts) {
        var fullData = new Date(ts),
            year = fullData.getFullYear(),
            month = fullData.getMonth() + 1,
            day = fullData.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    }

    //перевод метки времени в формат ЧЧ:ММ:СС
    , tsToTime: function (ts) {
        var fullData = new Date(ts),
            hours = fullData.getHours(),
            minutes = fullData.getMinutes(),
            seconds = fullData.getSeconds();

        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    }

    , getStartTsOnNull: function () {
        this.START_TS_ON_NULL = this.START_TS - (this.WIDTH - this.RIGHT_INDENT) * this.TIME_PER_PX;
    }

    , setTimePerPX: function(){
        this.TIME_PER_PX = Math.pow(this.POWER_OF_GRAPH, -this.ZOOM) * this.FIXED_TIME_PER_PX;

    }

    , setTimeStep: function () {
        this.TIME_STEP = this.TIMEFRAME / this.TIME_PER_PX;
    }
};