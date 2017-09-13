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

    numberOfCandle: 5,

    mouseFlag: false,

    cursorPositionX: 0,

    cursorPositionY: 0,

    // tmpX: 0,
    //
    // shiftX: 0,
    // shiftY: 0,

    init: function (canvas) {
        console.log('init');
        this.GraphSettings = new GraphSettings(0, 1800, 0, 0.05, 0, 0, 0, 30, 0.025, 0, 5, 10, 100, 40, 130, 40);
        this.Canvas = canvas;
        this.Ctx = this.Canvas.getContext("2d");
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCtx = this.tmpCanvas.getContext('2d');
        this.getDimensions();
        this.render();
        window.addEventListener('resize', this.onResize.bind(this));
        //window.addEventListener('keydown', this.dragByButtons.bind(this));
        var t = this;
        this.Canvas.addEventListener('mouseup', function (e) {
            t.onUp(e, t.GraphSettings);
        });
        this.Canvas.addEventListener('mousedown', function (e) {
            t.onDown(e, t.GraphSettings);
        });
        this.Canvas.addEventListener('mousemove', function (e) {
            t.onMove(e, t.GraphSettings);
        });
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


        this.drawGrid(t.tmpCtx, t.GraphSettings);//отрисовка сетки
        this.drawAxes(t.tmpCtx, t.GraphSettings);//отрисовка осей
        this.drawGridMarks(t.tmpCtx, t.GraphSettings);//отрисовка меток на координатных осях

        App.CurrentGraph.getSprites(function (sprites) {
            sprites.forEach(function (sprite) {
                sprite.renderIfVisible(t.tmpCtx, t.GraphSettings);
            })
        });

    },

    drawAxes: function (ctx, gs) {
        var nullPosition = gs.realY(0.5), //нулевая позиция по игреку
            width = gs.WIDTH, //ширина окна
            right = gs.RIGHT_INDENT - 0.5; //правый отступ
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0.5, nullPosition);
        ctx.lineTo(width - right, nullPosition);
        ctx.lineTo(width - right, 0.5);
        ctx.stroke();
    },

    drawGrid: function (ctx, gs) {
        var nullPosition = gs.realY(0.5), //нулевая позиция по игреку
            lengthX = gs.WIDTH - gs.RIGHT_INDENT, //длинна оси ОХ
            lengthY = gs.HEIGHT - gs.BOTTOM_INDENT, //длинна оси ОУ
            stepX = gs.STEP_X, stepY = gs.STEP_Y, //шаг по иксу и игреку
            cordForMarkY = lengthX + 8.5, //координата для отрисовки меток по иксу
            cur_pos = gs.calcStepX();//gs.calculateSectionsOnX() + 0.5;//gs.calculateSectionsOnX();
        //console.log(cur_pos, lengthX);
        ctx.strokeStyle = '#e6e6e6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(cur_pos, nullPosition);
            ctx.lineTo(cur_pos, 0.5);
            cur_pos -= stepX;
        }
        cur_pos = gs.calcStepY();
        while (cur_pos > 0) {
            ctx.moveTo(0.5, cur_pos);
            ctx.lineTo(cordForMarkY, cur_pos);
            cur_pos -= stepY;
        }
        ctx.stroke();
    },

    drawGridMarks: function (ctx, gs) {
        var nullPosition = gs.realY(0.5), //нулевая позиция по игреку
            cordForMarkX = gs.realY(-8.5), //координата для отрисовки меток по игреку
            lengthX = gs.WIDTH - gs.RIGHT_INDENT, //длинна оси ОХ
            lengthY = gs.HEIGHT - gs.BOTTOM_INDENT, //длинна оси ОУ
            stepX = gs.STEP_X, stepY = gs.STEP_Y, //шаг по иксу и игреку
            cordForMarkY = lengthX + 8.5, //координата для отрисовки меток по иксу
            cur_pos = gs.calcStepX() - stepX / 2;//gs.calculateSectionsOnX() / 2 + 0.5;
        console.log(cur_pos, lengthX);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        while (cur_pos > 0) {
            ctx.moveTo(cur_pos, nullPosition);
            ctx.lineTo(cur_pos, cordForMarkX);
            cur_pos -= stepX;
        }
        cur_pos = gs.calcStepY();
        while (cur_pos > 0) {
            ctx.moveTo(lengthX, cur_pos);
            ctx.lineTo(cordForMarkY, cur_pos);
            cur_pos -= stepY;
        }
        ctx.stroke();

    },

    drawMarks: function (ctx, gs) { //подписи на меток координатных осях
        var cordForMarkX = gs.realY(-18.5), //координата для отрисовки значений по игреку
            lengthX = gs.WIDTH - gs.RIGHT_INDENT, //длинна оси ОХ
            lengthY = gs.HEIGHT - gs.BOTTOM_INDENT, //длинна оси ОУ
            stepX = gs.STEP_X, stepY = gs.STEP_Y, //шаг по иксу и игреку
            cordForMarkY = lengthX + 12.5, //координата для отрисовки значений по иксу
            cur_pos = gs.calcStepX() - stepX / 2,//gs.calculateSectionsOnX() / 2 + 0.5;
            price_per_px = gs.PRICE_PER_PX, //цена за пиксель
            time_per_px = gs.TIME_PER_PX, //время за пиксель
            start_price = gs.START_PRICE, //начальная цена
            start_ts = gs.START_TS; //начальное время
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        while (cur_pos > 0) {
            ctx.fillText(start_ts + cur_pos * time_per_px, cur_pos, cordForMarkX);
            cur_pos -= stepX;
        }
        cur_pos = gs.calcStepY();
        ctx.textAlign = 'left';
        //if (Graph.START_UNITS > 0)
        //    cur_pos += (Graph.UNITS_PER_PIXEL * Graph.PX_PER_POINT);
        //console.log(cur_pos_Y+"="+Graph.START_UNITS+"+"+cur_pos+"*"+Graph.UNITS_PER_PIXEL, Graph.START_UNITS);
        while (cur_pos > 0) {
            ctx.fillText(Math.round(start_price + cur_pos * price_per_px).toFixed(2), cordForMarkY, cur_pos);
            cur_pos -= stepY;
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

    // drag: function (e) {
    //     var left = 37,
    //         up = 38,
    //         right = 39,
    //         down = 40,
    //         speed = this.SPEED_OF_MOVING_GRAPH;
    //     switch (e.keyCode) {
    //         case left :
    //             //Graph.tmpX = (Graph.LAST_MS - Graph.START_MS);
    //             console.log(e.keyCode);
    //             this.START_TS -= speed * this.TIME_PER_PX;
    //             this.render();
    //             break;
    //         case right :
    //             //Graph.tmpX = (Graph.LAST_MS - Graph.START_MS);
    //             // if (Graph.tmpX < Graph.controlLenght) {
    //             //     Graph.render();
    //             //     break;
    //             // }
    //             console.log(e.keyCode);
    //
    //             this.START_TS += speed * this.TIME_PER_PX;
    //             this.render();
    //             break;
    //         case up :
    //             console.log(e.keyCode);
    //
    //             this.START_PRICE += speed * this.PRICE_PER_PX;
    //             this.render();
    //             break;
    //         case down :
    //             console.log(e.keyCode);
    //             this.START_PRICE -= speed * this.PRICE_PER_PX;
    //             this.render();
    //             break;
    //     }
    // },
    //
    // dragGraph: function (x, y, gs) {
    //     ///console.log(Graph.cursorPositionX - x, Graph.cursorPositionY - y, x, y);
    //     //this.tmpX = (this.LAST_MS - Graph.START_MS);
    //     // if (Graph.tmpX < Graph.controlLenght && Graph.cursorPositionX - x > 0) {
    //     //     if (Graph.controlLenght - Graph.tmpX > 0) {
    //     //         Graph.START_MS = Date.now() - Graph.OX_MS + Graph.threshold * Graph.OX_MS;
    //     //         Graph.mouseFlag = false;
    //     //         Graph.render();
    //     //     }
    //     //     Graph.mouseFlag = false;
    //     // }
    //     // else {
    //     this.shiftX += Math.abs(this.cursorPositionX - x);
    //     this.shiftY += Math.abs(this.cursorPositionY - y);
    //     //console.log(Graph.shiftX,Graph.shiftY);
    //     if (this.shiftX > 10 && this.shiftY > 10) {
    //         gs.START_TS += (this.cursorPositionX - x) * gs.TIME_PER_PX;
    //         gs.START_PRICE += (this.cursorPositionY - y) * gs.PRICE_PER_PX;
    //         this.cursorPositionX = x;
    //         this.cursorPositionY = y;
    //         this.render();
    //         this.shiftX = 0;
    //         this.shiftY = 0;
    //     }
    //
    // },
    //
    onUp: function (e, gs) {
        if (e.type === 'mouseup') {
            this.mouseFlag = false;
            this.cursorPositionX = e.clientX - this.RIGHT_INDENT;
            this.cursorPositionY = gs.realY(e.clientY);
        }
        // else if (e.type === 'touchend') {
        //     this.mouseFlag = false;
        // }
    },

    onDown: function (e, gs) {
        if (e.type === 'mousedown') {
            if ((e.clientX - gs.RIGHT_INDENT) < gs.WIDTH - gs.RIGHT_INDENT && gs.realY(e.clientY) > 0) {
                this.mouseFlag = true;
                console.log('туда');
                this.cursorPositionX = e.clientX - gs.RIGHT_INDENT;
                this.cursorPositionY = gs.realY(e.clientY);
            }
        }
        // else if (e.type === 'touchstart') {
        //     if ((e.touches[0].clientX - this.MARGIN) > 0 && (e.touches[0].clientX - this.MARGIN) < this.WIDTH - 2 * this.MARGIN && this.realY(e.touches[0].clientY) > 0 && this.realY(e.touches[0].clientY) < this.HEIGHT - 2 * this.MARGIN) {
        //         this.mouseFlag = true;
        //         //console.log('туда');
        //         this.cursorPositionX = e.touches[0].clientX - this.MARGIN;
        //         this.cursorPositionY = this.realY(e.touches[0].clientY);
        //     }
        // }
    },

    onMove: function (e, gs) {
        var x = 0,
            y = 0,
            shiftX = 0,//Math.abs(this.cursorPositionX - x),
            shiftY = 0;//Math.abs(this.cursorPositionY - y);

        if (e.type === 'mousemove') {
            if (this.mouseFlag) {
                //console.log('x: ' + e.clientX - 50 + 'y: ' + gs.realY(e.clientY));
                x = e.clientX;
                y = gs.realY(e.clientY);
                console.log(x, y);
                shiftX = /*gs.pxToTime*/Math.abs(this.cursorPositionX - x);
                shiftY = /*gs.pxToPrice*/Math.abs(this.cursorPositionY - y);
                console.log(shiftX, shiftY)
                if( shiftX > 10 && shiftY > 10) {
                    console.log('if')
                    shiftX = gs.pxToTime(Math.abs(this.cursorPositionX - x));
                    shiftY = gs.pxToPrice(Math.abs(this.cursorPositionY - y));
                    this.onDragged(shiftX, shiftY);
                }
            }
        }
        // else if (e.type === 'touchmove') {
        //     if (this.mouseFlag) {
        //         //console.log('x: ' + (e.clientX - Graph.MARGIN) + 'y: ' + Graph.realY(e.clientY));
        //         xMS = (e.touches[0].clientX - 50);
        //         yUN = gs.realY(e.touches[0].clientY);
        //         console.log(xMS, yUN);
        //         this.dragGraph(xMS, yUN, gs);
        //     }
        // }
    },

    //методы для обработки движения графика
    onDragged: function (x, y, gs) {
        //преобразование пикселей в нужные величины                                          //{transform_TS
        //и создание объекта, хранящего параметры трансформации графика                      //Transform_Price
        //Scale}
        var TransformQuery = {};
//     this.shiftX += Math.abs(this.cursorPositionX - x);
        //     this.shiftY += Math.abs(this.cursorPositionY - y);
        //     //console.log(Graph.shiftX,Graph.shiftY);
        //     if (this.shiftX > 10 && this.shiftY > 10) {
        //         gs.START_TS += (this.cursorPositionX - x) * gs.TIME_PER_PX;
        //         gs.START_PRICE += (this.cursorPositionY - y) * gs.PRICE_PER_PX;
        //         this.cursorPositionX = x;
        //         this.cursorPositionY = y;
        //         this.render();
        //         this.shiftX = 0;
        //         this.shiftY = 0;
        if (arguments.length === 1) {

        }
        else if (arguments.length === 2) {
            TransformQuery.transform_TS = x;
            TransformQuery.transform_Price = y;
            TransformQuery.scale = false;
        }

        //  TransformQuery = {
        //     transform_TS: false,
        //     transform_Price: 0.45,
        //     scale: false
        // };

        this.transform(TransformQuery);
    },


    transform: function (q) {
        if (q.transform_TS) {
            this.GraphSettings.START_TS += q.transform_TS;
        }
        if (q.transform_Price) {
            this.GraphSettings.START_PRICE += q.transform_Price;
        }
        if (q.transform_scale) {
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
    this.WIDTH = width; //ширина канваса
    this.HEIGHT = height; //высота канваса
    this.TIME_PER_PX = time_per_px;
    this.PRICE_PER_PX = price_per_px;
    this.TIMEFRAME = timeframe;
    this.PRICE_POINTS = price_points;
    this.MIN_PX_PER_DETEILED_CANDLE = min_px_per_detailed_candle;
    this.RIGHT_INDENT = right_ident;
    this.BOTTOM_INDENT = bottom_ident;
    this.STEP_X = step_x;
    this.STEP_Y = step_y;

};

GraphSettings.prototype = {
    constructor: GraphSettings
    , getBorderTS: function () {
        return this.START_TS + (this.WIDTH - this.RIGHT_INDENT) * this.TIME_PER_PX;
    }

    , getBorderPrice: function () {
        return this.START_PRICE + (this.HEIGHT - this.BOTTOM_INDENT) * this.PRICE_PER_PX;
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

    , calcStepX: function () {
        var indent = (this.WIDTH - this.RIGHT_INDENT) % this.STEP_X;
        return this.WIDTH - this.RIGHT_INDENT - indent - 0.5;
    }

    , calcStepY: function () {
        var indent = (this.HEIGHT - this.BOTTOM_INDENT) % this.STEP_Y - 0.5;
        return this.realY(indent);
    }

    , pxToTime: function (x) {
        return x * this.TIME_PER_PX;
    }

    , pxToPrice: function (y) {
        return y * this.PRICE_PER_PX;
    }

    // //вычисление первого отступа метки по ОX
    // , calculateSectionsOnX: function () {
    //     return ;
    //     //return this.WIDTH - this.BOTTOM_IDENT -(this.STEP_X - (this.START_TS % (this.TIME_PER_PX * this.STEP_X)) / this.TIME_PER_PX);
    // }
    //
    // //вычисление первого отступа метки по OY
    // , calculateSectionsOnY: function () {
    //     var s = Math.abs((this.START_PRICE % (this.PRICE_PER_PX * this.STEP_Y)) / this.PRICE_PER_PX);
    //     if (this.START_PRICE > 0) {
    //         s = this.STEP_Y - s;
    //     }
    //     return s;
    // }
};
