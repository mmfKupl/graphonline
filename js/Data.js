"use strict";

var Data = {




};

var Candle = function (start_price, last_price, from, timeFrame, finished, volume) {
    this.start_price = start_price;
    this.last_price = last_price;
    this.from = from;
    this.timeFrame = timeFrame;
    this.finished = finished;
    this.volume = volume;
    this.ticks = [];
}

Candle.prototype.addTick = function (bid, ask, price) {

    this.ticks.push(new Tick(ask, bid, price));
};

Candle.prototype.getVolume = function () {
    return this.volume;
};

Candle.prototype.getTicks = function () {
    var t = this;
    var max = "";// max tick volume
  return this.ticks.map(function(e){
      e.length = e.getVolume()/max;
      return e;
  });
};


var Tick = function(ask, bid, price){
    this.ask = ask;
    this.bid = bid;
    this.price = price;
    this.isMain = false;
    this.dir = (this.ask > this.bid) ? Tick.Dir.DIR_RED : Tick.Dir.DIR_GREEN;
}
Tick.Dir = {
    DIR_RED : 1
    ,DIR_GREEN: 2
}
Tick.prototype = {
    constructor: Tick
    ,getVolume: function(){
        return this.ask + this.bid;
    }
}