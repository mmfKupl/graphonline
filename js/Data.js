"use strict";

var Data = {

    Candle: function (start_price, last_price, from, timeFrame, finished, volume) {
        this.start_price = start_price;
        this.last_price = last_price;
        this.from = from;
        this.timeFrame = timeFrame;
        this.finished = finished;
        this.volume = volume;
        this.ticks = [];
    },



};

Candle.prototype.addTick = function (bid, ask, price) {
    var tick = {
        ask: ask,
        bid: bid,
        isMain: false,
        length: 0.0735, // в долях от самой большой (isMain == true) Нужна функция, которая это выясняет, где её писать
        dir: Candle.RED //где определять эту переменную
    }
    this.ticks.push(tick);
};

Candle.prototype.getVolume = function () { //в json есть volume, я дописала в конструктор или нужно вычислять?
    return this.volume;
};

Candle.prototype.getTics = function () {
  return this.ticks;
};