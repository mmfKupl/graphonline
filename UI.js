"use strict";

var UI = {

    menu: null,

    init: function () {
        UI.menu = document.getElementById('menu');
        UI.menu.addEventListener('click', UI.onMenu);
    },

    onMenu: function (e) {
        var item = e.target.id;
        switch (item) {
            case APP.instruments.currencies :
                console.log(item);
                UI.chooseCurrencies();
                break;
            case APP.instruments.timeFrame :
                console.log(item);
                UI.chooseTimeFrame();
                break;
            case APP.instruments.typeOfGraph :
                console.log(item);
                UI.chooseTypeOfGraph();
                break;
            case APP.instruments.visualSettings :
                console.log(item);
                UI.chooseVisualSettings();
                break;
            case APP.instruments.graphicalElements :
                console.log(item);
                UI.chooseGraphicalElements();
                break;
            case APP.instruments.zoom :
                console.log(item);
                UI.chooseZoom();
                break;
        }
    },

    chooseCurrencies: function () {

    },

    chooseTimeFrame: function () {
        
    },

    chooseTypeOfGraph: function () {
        
    },

    chooseVisualSettings: function () {
        
    },

    chooseGraphicalElements: function () {
        
    },

    chooseZoom: function () {
        
    }
};
