"use strict";

var Graph = {

    GraphSettings: { //делать как класс или как объект?
        Start_TS: 0, //начальная метка времени
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
    },

    _2DContent: null, //Ctx
    
    HTMLCanvasElement: null, // DOM Element Canvas
    
    //App.type: type, // тип графика
    
    init: function () { //
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
    },
    
    Graphics: [], //Array <Graphic>, абстракция - массив всех графических элементов 
    
    render: function () {
        //очистка графика
        //отрисовка осей
        for(var obj in this.Graphics){ //of not supported!
            obj.renderIfVisible(this._2DContent, this.GraphSettings);
        }
    },
    
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