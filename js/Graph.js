"use strict";

var Graph = function(){};
Graph.prototype = {


    constructor: Graph,
    GraphSettings: null,

    Ctx: null, //Ctx

    Canvas: null, // DOM Element Canvas

    Type: null,
    init: function (Canvas) { //
        this.GraphSettings = new GraphSettings();
        this.Canvas = Canvas;
        this.Ctx = this.Canvas.getContext("2d");


        //навесить обработчики событий
        /*window.addEventListener('resize', ); //ctrl+'+'/'-'
        window.addEventListener('keydown', ); //нажатие клавиши
        window.addEventListener('keydown', Graph.move); //нажатие клавиши
        window.addEventListener('mousedown', ); //нажатие кнопки мыши
        window.addEventListener('mouseup', ); //отпускание кнопки мыши
        window.addEventListener('mousemove', ); //движение мыши
        window.addEventListener('wheel', ); //колесико мыши
        window.addEventListener('dblclick', ); //даблклик мыши
        window.addEventListener('touchstart', ); //тык пальцем по экрану
        window.addEventListener('touchend', ); //отрыв пальчика от экрана
        window.addEventListener('touchmove', ); //движение пальчиком по экрану*/

        this.render();
    },



    render: function () {
        //очистка графика
        //отрисовка осей

        var t = this;

        this.getSprites(function(sprites){
            sprites.forEach(function(sprite){
                sprite.renderIfVisible(t.Ctx, t.GraphSettings);
            })
        })
    },

    // @Abstract
    getSprites: function(f){f([]);},

    setTimeFrame: function () {

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
        if(q.transform_TS){
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

var FootPrintGraph = function(){};
FootPrintGraph.prototype = new Graph();
FootPrintGraph.prototype.type = App.GraphType.FOOTPRINT;
FootPrintGraph.prototype.getSprites = function(f){

    // Data.getCandlesForInterval(ts, duration, function(candles){
    //      #candles = Array<Candle>
    //      var candleSprites = candles.map(function(candle){
    //          return new CandleSprite(candle);
    //      })
    //      f(candleSprites);
    // )

    var Sprites = [new CircleSprite(100342345234,200,35), new CircleSprite(482412342342, 842, 182)];
    f(Sprites);
}




var Sprite = function(){};
Sprite.prototype = {
    constructor: Sprite
    ,isVisible: function(GraphSettings){}
    ,render: function(Ctx, GraphSettings){}
    ,renderIfVisible: function(Ctx, GraphSettings){}
}


var CandleSprite = function(Candle){
    this.Candle = Candle;
}
CandleSprite.prototype = {
    constructor : CandleSprite
    ,isVisible: function(gs){

    }

    ,render: function(ctx, gs){

    }

    ,renderIfVisible: function(ctx, gs){
        if(this.isVisible(gs)){
            this.render(ctx, gs);
        }
    }
}


var CircleSprite = function(x, y, r){
    this.X = x; // In seconds
    this.Y = y; // In $
    this.r = r; // In PX
};
CircleSprite.prototype= {
    constructor: CircleSprite
    ,isVisible:function(gs){
        var x_visible = ((this.x+this.r*gs.TIME_PER_PX>= gs.Start_TS)&&(this.x - this.r*gs.TIME_PER_PX <= gs.getBorderTS()));
        var y_visible = ((this.y+this.r*gs.PRICE_PER_PX >= gs.Start_price)&&(this.y-this.r*gs.PRICE_PER_PX <= gs.getBorderPrice()));

        return x_visible&&y_visible;
    }

    ,render: function(ctx, gs){

        var _x = gs.getXCoordForTS(this.x);
        var _y = gs.getYCoordForPrice(this.y);

        ctx.beginPath();
        ctx.arc(_x, _y, this.r, 0, Math.PI*2);
        ctx.fill();

    }

    ,renderIfVisible: function(ctx, gs){
        if(this.isVisible(gs)){
            this.render(ctx, gs);
        }
    }
}


var GraphSettings = function(Start_TS, Start_price){
    var o = {
        : 0, //начальная метка времени
        Start_price: 1700, //начальная цена
        Scale: 0,
        Price_step: 0.05, // шаг тика
        Speed_of_moving_graph: 4, //скорость при перетаскивании графика
        WIDTH: 900, //ширина канвас в пикселях?
        HEIGHT: 400,
        TIME_PER_PX: 30,
        PRICE_PER_PX: 0.000175,
        TIMEFRAME: 300,
        PRICE_POINTS: 5, //сколько тиков входит в одно деление на оси OY
        MIN_PX_PER_DETAILED_CANDLE: 60, //когда нужно показывать детально свечи
        ifDetailedCandleViewAllowed: function () {
            //?
        }
    };

    this.START_TS: Start_TS,
        this.START_PRICE:Start_price,
        this

};

GraphSettings.prototype = {
    constructor: GraphSettings
    ,getBorderTS: function(){
        return this.Start_TS + this.WIDTH*this.TIME_PER_PX;
    }

    ,getBorderPrice: function(){
        return this.Start_price + this.HEIGHT*this.PRICE_PER_PX;
    }

    ,getXCoordForTS: function(n){
        return (n-this.Start_TS)/this.TIME_PER_PX;
    }

    ,getYCoordForPrice: function(n){
        return (n-this.Start_price)/this.PRICE_PER_PX;
    }
}
