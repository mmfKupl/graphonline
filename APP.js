"use strict";

var app = {

    // instruments: {
    //     currencies: 'currencies',
    //     timeFrame: 'timeFrame',
    //     typeOfGraph: 'typeOfGraph',
    //     visualSettings: 'visualSettings',
    //     graphicalElements: 'graphicalElements',
    //     zoom: 'zoom'
    // },

    menu: null,

    CURRENCIES: {
        OIL: 'OIL',
        GOLD: 'GOLD',
        USD: 'USD',
        EUR: 'EUR',
        GBR: 'GBR',
        CAD: 'CAD',
        AUD: 'AUD',
        BTC: 'BTC'
    },

    TIMEFRAME: {
        M1: 'M1',
        M5: 'M5',
        M10: 'M10',
        M15: 'M15',
        M30: 'M30',
        M60: 'M60',
        H4: 'H4',
        D1: 'D1'
    },

    TYPEOFGRAPH: {
        FOOTPRINT: 'FOOTPRINT',
        DELTA: 'DELTA'
    },

    init: function () {
        app.menu = document.getElementById('menu');
        app.menu.addEventListener('click', app.onMenu);
        document.body.addEventListener('click', app.hideSubMenu);
    },

    onMenu: function (e) {
        var id = e.target.id;
        e.stopPropagation();

        switch (id) {
            case 'currencies':
                console.log(id);
                app.showSubMenu(id);
                break;
            case 'timeFrame':
                console.log(id);
                app.showSubMenu(id);
                break;
            case 'typeOfGraph':
                console.log(id);
                app.showSubMenu(id);
                break;
        }

    },

    showSubMenu: function (id) {
        app.hideSubMenu();
        id += 'Menu';
        var menu = document.getElementById(id);
        menu.classList.toggle('visible');
    },

    hideSubMenu: function () {
        var items = document.getElementsByClassName('visible');
        [].forEach.call(items, function(elem) {
            elem.classList.remove('visible');
        });
    }
};
