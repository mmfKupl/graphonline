"use strict";

var App = {

    Instrument: {
        OIL: 'OIL',
        GOLD: 'GOLD',
        USD: 'USD',
        EUR: 'EUR',
        GBR: 'GBR',
        CAD: 'CAD',
        AUD: 'AUD',
        BTC: 'BTC'
    },

    Timeframe: {
        M1: 'M1',
        M5: 'M5',
        M10: 'M10',
        M15: 'M15',
        M30: 'M30',
        M60: 'M60',
        H4: 'H4',
        D1: 'D1'
    },

    GraphType: {
        FOOTPRINT: 'FOOTPRINT',
        DELTA: 'DELTA'
    },

    CurrentGraph: null,

    setGraphType: function () {

    },

    setTimeFrame: function () {

    },


    init: function(){

        App.CurrentGraph = new FootPrintGraph();
        App.CurrentGraph.setTimeframe(App.Timeframe.M5);
        App.CurrentGraph.setInstrument(App.Instrument.GOLD);
        var Canvas = document.getElementsByTagName("canvas")[0];
        App.CurrentGraph.init(Canvas);

    }
};


window.onload = App.init;