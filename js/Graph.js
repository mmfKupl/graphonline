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
            /*start_ts*/                   1505721990000,//1505723122670,//1505476421352, //1505394063539,
            /*start_price*/                5,
            /*zoom*/                       1,
            /*speed_of_moving_graph*/      5,
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
            //this.drawDashedLine(this.tmpCtx, this.GraphSettings, e);
            this.onMove(e, this.GraphSettings);
        }.bind(this));
        this.Canvas.addEventListener('wheel', function (e) {
            this.onZoom(e, this.GraphSettings);
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

        this.drawAxes(t.tmpCtx, t.GraphSettings);//отрисовка осей
        this.drawGridMarks(t.tmpCtx, t.GraphSettings);//отрисовка меток на координатных осях
        // this.Canvas.onmousemove = function (e) {
        //     t.drawDashedLine(t.tmpCtx, t.GraphSettings, e);
        // }

    },

    drawAxes: function (ctx, gs) {
        var centerX = gs.realX(0);
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

    drawGrid: function (ctx, gs) {
        var px = gs.PERFECT_PX,
            cur_pos = gs.realX(gs.calculateIndentOnX()) + px, //откуда начинать отрисовку на оси OX
            centerY = gs.realY(0),
            centerX = gs.realX(0),
            stepX = gs.TIME_STEP,
            stepY = gs.PRICE_STEP;

        ctx.lineWidth = 0.2;

        //отрисовка по ОХ
        ctx.beginPath();
        while (cur_pos > 0) {
            //console.log(gs.calculateIndentOnX());
            ctx.moveTo(cur_pos, centerY);
            ctx.lineTo(cur_pos, 0);
            cur_pos -= stepX;
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gs.WIDTH - gs.RIGHT_INDENT + 1, 0.5, gs.RIGHT_INDENT, gs.HEIGHT);   // Рисует закрашенный прямоугольник ЗАЧЕМ???

        //отрисовка по OY
        cur_pos = gs.realY(gs.calculateIndentOnY()) + px; //
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(centerX + px, cur_pos);
            ctx.lineTo(px, cur_pos);
            cur_pos -= stepY;
        }
        ctx.stroke();

    },

    drawGridMarks: function (ctx, gs) { //метки на кооржинатных осях
        this.drawYGridMarks(ctx, gs);
        this.drawXGridMarks(ctx, gs);
    },

    drawXGridMarks: function (ctx, gs) {
        //НУЖНО ПЕРЕДЕЛАТЬ
        var px = gs.PERFECT_PX;
        var indentX = gs.TIME_STEP / 2 + px;
        var stepX = gs.TIME_STEP;
        var coord_of_mark_Y = Math.round(gs.realY(-8.5)); // координата конца метки по оси OY
        var centerY = gs.realY(0);
        var cur_pos = gs.realX(gs.calculateIndentOnX()) - indentX;

        ctx.lineWidth = 1;
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';


        if (Math.abs(gs.calculateIndentOnX() % stepX) > indentX) {
            cur_pos = gs.realX(gs.calculateIndentOnX()) + indentX - 2 * px;
        }
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(cur_pos, centerY);
            ctx.lineTo(cur_pos, coord_of_mark_Y);
            cur_pos -= stepX;
        }
        ctx.stroke();
        var ts = gs.TIME_STEP * gs.TIME_PER_PX; //в одном промежутке сколько милисекунд
        cur_pos = gs.realX(gs.calculateIndentOnX()) - indentX; //координата для отрисовки метки
        var time = (Math.abs(gs.calculateIndentOnX()) + Math.floor(indentX)) * gs.TIME_PER_PX; //время под первой меткой
        if (Math.abs(gs.calculateIndentOnX() % stepX) > indentX) {
            cur_pos = gs.realX(gs.calculateIndentOnX()) + indentX - 2 * px;
            time = (gs.calculateIndentOnX() - Math.floor(indentX)) * gs.TIME_PER_PX;
        }
        coord_of_mark_Y = gs.realY(-18.5);
        var start_ts = gs.START_TS;
        var date;
        ctx.beginPath();
        var str = "";
        while (cur_pos > 0) {
            date = new Date(start_ts - time);
            str = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            ctx.fillText(str, cur_pos, coord_of_mark_Y);
            cur_pos -= stepX;
            time += ts;
        }
        ctx.stroke();

        /*var px = gs.PERFECT_PX;
        var timePerPixel = gs.TIME_PER_PX;
        var pixelsPerGridMark = gs.TIME_STEP;
        var startTime = gs.START_TS;

        var timeUnitsInGridMark = pixelsPerGridMark * timePerPixel;

        var firstGridMarkTime = (startTime % timeUnitsInGridMark) ?
            (startTime + timeUnitsInGridMark - startTime % timeUnitsInGridMark)
            : startTime + timeUnitsInGridMark;

        if(startTime < 0) {
            firstGridMarkTime -= timeUnitsInGridMark;
        }
        var smallIntervalPixelsWidth = gs.calculateIndentOnX();

        ctx.lineWidth = 1;
        ctx.fill = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var currentW = gs.RIGHT_INDENT + smallIntervalPixelsWidth;
        var currentGridMarkTime = firstGridMarkTime;
        var centerY = gs.realY(0);
        var coord_of_mark_Y = gs.realY(-18.5);
        ctx.beginPath();
        while (currentW < gs.WIDTH) {
            var xCoord = gs.WIDTH - currentW;
            var yCoord = gs.HEIGHT - gs.BOTTOM_INDENT + 10;
            ctx.moveTo(xCoord + px, centerY + px);
            ctx.lineTo(xCoord + px, coord_of_mark_Y);
            currentW += pixelsPerGridMark;
            currentGridMarkTime += timeUnitsInGridMark;
        }
        ctx.stroke();*/
    },

    drawYGridMarks: function (ctx, gs) {
        var px = gs.PERFECT_PX;
        var pricePerPixel = gs.PRICE_PER_PX; // How many PRICE units in 1 PIXEL currently
        var pixelsPerGridMark = gs.PRICE_STEP; // Pixels in one vertical mark on Y grid
        var startPrice = gs.START_PRICE; // Price units on zero point in corner of graph

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

        var currentH = gs.BOTTOM_INDENT + smallIntervalPixelsHeight;
        var currentGridMarkPrice = firstGridMarkPrice;
        var centerX = gs.realX(0);
        var coord_of_mark_X = gs.realX(-8.5);
        ctx.beginPath();
        while (currentH < gs.HEIGHT) {
            var xCoord = gs.WIDTH - gs.RIGHT_INDENT + 40;
            var yCoord = gs.HEIGHT - currentH;
            ctx.moveTo(centerX + px, yCoord + px);
            ctx.lineTo(coord_of_mark_X, yCoord + px);
            ctx.fillText(currentGridMarkPrice.toFixed(4), xCoord, yCoord);
            //console.log(currentGridMarkPrice, xCoord, yCoord);
            currentH += pixelsPerGridMark;
            currentGridMarkPrice += priceUnitsInGridMark;
        }
        ctx.stroke();

        // cur_pos = gs.realY(gs.calculateIndentOnY()) + px/* - indentY*/;
        //
        // ctx.beginPath();
        // while (cur_pos >= 0) {
        //     ctx.moveTo(centerX + px, cur_pos);
        //     ctx.lineTo(coord_of_mark_X, cur_pos);
        //     cur_pos -= stepY;
        // }
        // ctx.stroke();
        //
        // cur_pos = gs.realY(gs.calculateIndentOnY()) + px/* - indentY + 2 * px*/;
        // coord_of_mark_X = gs.realX(-35.5);
        // var price_per_step = gs.PRICE_STEP * gs.PRICE_PER_PX;
        // var price = -gs.START_PRICE + (gs.calculateIndentOnY() + indentY) * gs.PRICE_PER_PX - 1;
        //
        // if (gs.calculateIndentOnY() % stepY > indentY) {
        //     cur_pos = gs.realY(gs.calculateIndentOnY()) + indentY;
        //     price = -gs.START_PRICE + (gs.calculateIndentOnY() - indentY) * gs.PRICE_PER_PX - 1;
        // }
        // var str = '';
        // ctx.beginPath();
        // while (cur_pos > 0) {
        //     str = price.toFixed(1) + '00';
        //     ctx.fillText(str, coord_of_mark_X, cur_pos);
        //     cur_pos -= stepY;
        //     price += price_per_step;
        // }
        // ctx.stroke();
    },

    drawDashedLine: function (ctx, gs, e) {
        this.drawXDashedLine(ctx, gs, e);
        this.drawYDashedLine(ctx, gs, e);
    },

    drawXDashedLine: function (ctx, gs, e) {
        // console.log('line');
        // ctx.lineWidth = 2;
        // ctx.beginPath();
        // // ctx.moveTo(0, e.clientY);
        // // ctx.lineTo(this.WIDTH, e.clientY);
        // ctx.
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

            console.log('down');
            this.mouseFlag = true;
            this.cursorPositionX = gs.realX(e.clientX - 50);
            this.cursorPositionY = gs.realY(e.clientY);

        }
        // if (e.type === 'mousedown') {
        //     if ((e.clientX <= gs.WIDTH - gs.RIGHT_INDENT) && (e.clientY <= gs.HEIGHT - gs.BOTTOM_INDENT)) {
        //         console.log('here');
        //         this.mouseFlag = true;
        //         this.cursorPositionX = gs.realX(e.clientX);
        //         this.cursorPositionY = gs.realY(e.clientY);
        //     }
        // }
        // else if (e.type === 'touchstart') {
        //     if ((e.touches[0].clientX <= gs.WIDTH - gs.RIGHT_INDENT) && (e.touches[0].clientY <= gs.HEIGHT - gs.BOTTOM_INDENT)) {
        //         Graph.mouseFlag = true;
        //         Graph.cursorPositionX = gs.realX(e.touches[0].clientX);
        //         Graph.cursorPositionY = gs.realY(e.touches[0].clientY);
        //     }
        // }
    },

    //функция для обработчика событий при движении мыши
    onMove: function (e, gs) {
        // this.drawDashedLine(this.tmpCtx, gs, e);//отрисовка штриховой линии по курсору
        var x = 0, y = 0, deltaX = 0, deltaY = 0;
        if (this.mouseFlag) {
            console.log('move', '(' + gs.realX(e.clientX - 50) + ', ' + gs.realY(e.clientY) + ');');

            x = gs.realX(e.clientX - 50);
            y = gs.realY(e.clientY);
            deltaX += (this.cursorPositionX - x) * gs.TIME_PER_PX;
            deltaY += (this.cursorPositionY - y) * gs.PRICE_PER_PX;
            this.onDragged(deltaX, deltaY);
            this.cursorPositionX = x;
            this.cursorPositionY = y

        }
        // var x = 0,
        //     y = 0;
        // if (e.type === 'mousemove') {
        //     if (this.mouseFlag) {
        //         x = gs.realX(e.clientX);
        //         y = gs.realY(e.clientY);
        //
        //         //преобразование разницы в координатах в нужную величину
        //         var deltaXPrice = (this.cursorPositionX - x) * gs.PRICE_PER_PX;
        //         var deltaYTime = (this.cursorPositionY - y) * gs.TIME_PER_PX;
        //
        //         this.onDragged(deltaXPrice, deltaYTime);
        //     }
        // }
        // else if (e.type === 'touchmove') {
        //     if (Graph.mouseFlag) {
        //         x = gs.realX(e.touches[0].clientX);
        //         y = gs.realY(e.touches[0].clientY);
        //         this.onDragged(x, y);
        //     }
        // }
    },

    //функция для обработчика событий при отпускании ЛКМ
    onUp: function (e, gs) {
        console.log('up');
        this.mouseFlag = false;
        this.cursorPositionX = gs.realX(e.clientX - 50);
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
            power = 1.1, //степень зума
            key = (e.deltaY) ? e.type : e.keyCode;
        key = (!key) ? e.type : key;

        switch (key) {
            // case plus :
            // case plusS :
            //     console.log(e)
            //
            //     this.zoomIn(e, gs, power, PPP, stepPPP);
            //     break;
            // case minus :
            // case minusS :
            //     console.log(e)
            //
            //     this.zoomOut(e, gs, power, PPP, stepPPP);
            //     break;
            case 'wheel' :
                if (e.deltaY < 0) {
                    console.log(e);
                    this.zoomOnWheel(e, gs, power, 'in');
                }
                else if (e.deltaY > 0) {
                    console.log(e);
                    this.zoomOnWheel(e, gs, power, 'out');
                }
                break;
        }
    },

    zoomOnWheel: function (e, gs, power, flag) {
        var max = 3; //максимальный зум
        if (flag === 'in') {
            this.zoomIn(e, gs, power);
        }
        else if (flag === 'out') {
            this.zoomOut(e, gs, power);
        }
    },

    zoomOnButton: function (e, gs) {
        var max = 20; //максимальный зум
    },

    zoomIn: function (e, gs, power) {
        var max = 20; //максимальный зум
        var TransformQuery = {};
        TransformQuery.zoom = (gs.ZOOM < max) ? gs.ZOOM + 1 : gs.ZOOM;
        console.log(power, -TransformQuery.zoom, gs.FIXED_TIME_PER_PX);
        TransformQuery.transform_TIME_PER_PX = Math.pow(power, -TransformQuery.zoom) * gs.FIXED_TIME_PER_PX;
        // TransformQuery.transform_PRICE_PER_PX = Math.round(Math.pow(power, -TransformQuery.zoom) * gs.FIXED_PRICE_PER_PX);
        // TransformQuery.transform_TS = ;
        // TransformQuery.transform_Price = ;
        TransformQuery.speed = gs.SPEED_OF_MOVING_GRAPH + 0.1;
        this.transform(TransformQuery);
    },

    zoomOut: function (e, gs, power) {//КАКАЯ ТО ХУЕТА
        //  var min = -40;
        //  var TransformQuery = {};
        //  console.log(gs.ZOOM, min);
        //  if(gs.ZOOM > min){
        //      console.log(gs.ZOOM, TransformQuery.zoom);
        //      TransformQuery.zoom = gs.ZOOM - 1.1;
        //      console.log(TransformQuery.zoom);
        //      if(TransformQuery.zoom){console.log('true')}
        //  }
        //  else {
        //      TransformQuery.zoom = gs.ZOOM;
        //  }
        // // TransformQuery.zoom = (gs.ZOOM > min) ? (gs.ZOOM - 1) : gs.ZOOM;
        //  console.log(power, TransformQuery.zoom, gs.FIXED_TIME_PER_PX);
        //  TransformQuery.transform_TIME_PER_PX = Math.pow(power, TransformQuery.zoom) * gs.FIXED_TIME_PER_PX;
        // // TransformQuery.transform_PRICE_PER_PX = Math.round(Math.pow(power, TransformQuery.zoom) * gs.FIXED_PRICE_PER_PX);
        //  // TransformQuery.transform_TS = ;
        //  // TransformQuery.transform_Price = ;
        //  TransformQuery.speed = gs.SPEED_OF_MOVING_GRAPH - 0.1;
        //  this.transform(TransformQuery);
    },


    transform: function (q) {
        console.log(q);
        if (q.transform_TS) {
            this.GraphSettings.START_TS -= q.transform_TS;
        }
        if (q.transform_Price) {
            this.GraphSettings.START_PRICE += q.transform_Price;
        }
        if (q.zoom) {
            this.GraphSettings.ZOOM = q.zoom;
        }
        if (q.speed) {
            this.GraphSettings.SPEED_OF_MOVING_GRAPH = q.speed;
        }
        if (q.transform_TIME_PER_PX) {
            this.GraphSettings.TIME_PER_PX = q.transform_TIME_PER_PX;
        }
        if (q.transform_PRICE_PER_PX) {
            this.GraphSettings.PRICE_PER_PX = q.transform_PRICE_PER_PX;
        }
        this.render();
    },

    setStartTS: function (ts) {
        this.GraphSettings.START_TS = ts;
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
        var x_visible = ((this.X + this.r * gs.TIME_PER_PX >= gs.START_TS) && (this.X - this.r * gs.TIME_PER_PX <= gs.getBorderTS()));
        var y_visible = ((this.Y + this.r * gs.PRICE_PER_PX >= gs.START_PRICE) && (this.Y - this.r * gs.PRICE_PER_PX <= gs.getBorderPrice()));
        // console.log('x_visible: ' + x_visible);
        // console.log('y_visible: ' + y_visible);

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

        var _width = this.width * Math.pow(gs.POWER_OF_GRAPH, gs.ZOOM);

        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.strokeRect(_x + 0.5, _y + 0.5, _width, this.height);

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


var GraphSettings = function (start_ts, start_price, zoom, /*price_step,*/ speed_of_moving_graph, width, height, time_per_px, time_step, price_per_px, price_step, timeframe, price_points, min_px_per_detailed_candle) {

    this.START_TS = start_ts;
    this.START_PRICE = start_price;
    this.ZOOM = zoom;
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
    this.BOTTOM_INDENT = 40;
    this.PERFECT_PX = 0.5; //для резкозти
    this.OX_MS = (this.WIDTH - this.RIGHT_INDENT) * this.TIME_PER_PX;
    this.POWER_OF_GRAPH = 1.1;
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
        return this.HEIGHT - ((n - this.START_PRICE) / this.PRICE_PER_PX);
    }

    , realY: function (y) {
        return this.HEIGHT - this.BOTTOM_INDENT - y;
    }

    , realX: function (x) {
        return this.WIDTH - x - this.RIGHT_INDENT;
    }

    , calculateIndentOnX: function () {
/*
        var timeUnitsInOneGridMark = this.TIME_PER_PX * this.TIME_STEP;
        var startTime = this.START_TS;

        var timeUnitsInSmallInterval = (startTime >= 0) ? startTime % timeUnitsInOneGridMark : ( timeUnitsInOneGridMark + startTime % timeUnitsInOneGridMark);


        var smallIntervalTimeUnits = (timeUnitsInOneGridMark - (timeUnitsInSmallInterval));
        var smallInervalPixels = timeUnitsInOneGridMark / this.TIME_PER_PX;
        smallInervalPixels = (smallInervalPixels >= 0) ? smallInervalPixels : (smallInervalPixels + this.TIME_STEP);

        return smallInervalPixels;

*/
        var indent = this.TIME_STEP - (this.START_TS % (this.TIME_PER_PX * this.TIME_STEP)) / this.TIME_PER_PX;
        if (this.START_TS < 0) {
            indent = this.TIME_STEP - indent;
        }
        else {
            indent = Math.abs(this.TIME_STEP - indent);
        }
        return indent;
    }

    // Returns size of small interval behind the first grid line in PIXELS
    , calculateIndentOnY: function () {

        var priceUnitsInOneGridMark = this.PRICE_PER_PX * this.PRICE_STEP;
        var startPrice = this.START_PRICE;

        var priceUnitsInSmallInterval = (startPrice >= 0 ) ? startPrice % priceUnitsInOneGridMark : ( priceUnitsInOneGridMark + startPrice % priceUnitsInOneGridMark);


        var smallIntervalPriceUnits = (priceUnitsInOneGridMark - (priceUnitsInSmallInterval) );
        var smallIntervalPixels = smallIntervalPriceUnits / this.PRICE_PER_PX;
        smallIntervalPixels = (smallIntervalPixels >= 0) ? smallIntervalPixels : (smallIntervalPixels + this.PRICE_STEP);


        return smallIntervalPixels;

        // var indent = Math.abs((this.START_PRICE % (this.PRICE_PER_PX * this.PRICE_STEP)) / this.PRICE_PER_PX);
        // if (this.START_PRICE < 0) {
        //     indent = this.PRICE_STEP - indent;
        // }
        // return indent;
    }

    , pxToTime: function (x) {
        return x * this.TIME_PER_PX;
    }

    , pxToPrice: function (y) {
        return y * this.PRICE_PER_PX;
    }
};