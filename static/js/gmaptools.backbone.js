/*!
 * gmaptools backbone JavaScript Library v0.1
 * http://.../
 *
 * Copyright 2012, Janos Gyerik
 * http://.../license
 *
 * Date: Sun Sep 16 23:00:33 CEST 2012
 */


// the basic namespace
// TODO: put in app.js
window.App = {};

_.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };

// classes
// TODO: put in app/*.js
App.MapInfo = Backbone.Model.extend({
    defaults: {
        status: 'N.A.',
        latitude: 'N.A.',
        longitude: 'N.A.',
        zoom: 'N.A.',
        address: 'N.A.',
        sw_latitude: 'N.A.',
        sw_longitude: 'N.A.',
        ne_latitude: 'N.A.',
        ne_longitude: 'N.A.'
    },

    update: function(map) {
        var param = {};
        var center = map.getCenter();
        if (center != null) {
            param.latitude = center.lat();
            param.longitude = center.lng();
        }
        param.zoom = map.getZoom();
        var bounds = map.getBounds();
        if (bounds != null) {
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            param.sw_latitude = sw.lat();
            param.sw_longitude = sw.lng();
            param.ne_latitude = ne.lat();
            param.ne_longitude = ne.lng();
        }
        this.set(param);
    },

    clearAddress: function() {
        this.set({address: this.defaults.address});
    }
});

App.MapInfoDetails = Backbone.View.extend({
    initialize: function() {
        this.model.on('change', this.render, this);
    },

    template: _.template($('#mapinfo-details-template').html()),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

App.MapInfoQuickView = Backbone.View.extend({
    initialize: function() {
        this.model.on('change', this.render, this);
    },

    template: _.template($('#mapinfo-quickview-template').html()),

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

// instances
// TODO: put in setup.js
App.mapInfo = new App.MapInfo;

App.detailedstats = new App.MapInfoDetails({
    el: $('#mapinfo-details'),
    model: App.mapInfo
});

App.quickstats = new App.MapInfoQuickView({
    el: $('#mapinfo-quickview'),
    model: App.mapInfo
});

//App.router = new App.Router;

// initialize the Backbone router
//Backbone.history.start();

// eof
