"use strict";

var Data = {

    // пространство имен для работы с запросами к серверу
    Request: {

        // подгрузка данных
        getDataFor: function (start, duration, timeframe, callback) {
            this.Request.getData('api/candles/' + '?start=' + Math.floor(start / 1000) + '&end=' + Math.floor((start + duration) / 1000) + '&timeframe=' + timeframe);
        },

        // получение данных с сервера
        get: function (url) {
            // api/candles/ 'start', 'end', 'timeframe'

            return new Promise(function (resolve, reject) {

                var req = new XMLHttpRequest();

                req.open('GET', url);

                req.onload = function () {

                    if (req.status === 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function () {
                    reject(Error("Network Error"));
                };

                req.send();
            });
        },

        // делает запрос данных и вызывает функцию
        getData: function (url) {
            return Data.Request.get(url).then(Data.Request.parseData);
        },

        parseData: function (data) {
            console.log(data);
        }


    }
};

var Candle = function (start_price, last_price, from, timeFrame, finished, volume) {
    this.start_price = start_price;
    this.last_price = last_price;
    this.from = from;
    this.timeFrame = timeFrame;
    this.finished = finished;
    this.volume = volume;
    this.ticks = [];
};

Candle.prototype.addTick = function (bid, ask, price) {

    this.ticks.push(new Tick(ask, bid, price));
};

Candle.prototype.getVolume = function () {
    return this.volume;
};

Candle.prototype.getTicks = function () {
    var t = this;
    var max;
    t.ticks.forEach(function (e) {
        var tmp = e.getVolume();
        max = (tmp > max) ? tmp : max;
    });
    return t.ticks.map(function (e) {
        e.length = e.getVolume() / max;
        if (e.length === 1) {
            e.isMain = true;
        }
        return e;
    });
};


var Tick = function (ask, bid, price) {
    this.ask = ask;
    this.bid = bid;
    this.price = price;
    this.isMain = false;
    this.dir = (this.ask > this.bid) ? Tick.Dir.DIR_RED : Tick.Dir.DIR_GREEN;
};

Tick.Dir = {
    DIR_RED: 1
    , DIR_GREEN: 2
};

Tick.prototype = {
    constructor: Tick
    , getVolume: function () {
        return this.ask + this.bid;
    }
};