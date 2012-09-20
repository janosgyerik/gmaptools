/*!
 * gmaptools backbone JavaScript Library v0.1
 * http://.../
 *
 * Copyright 2012, Janos Gyerik
 * http://.../license
 *
 * Date: Sun Sep 16 23:00:33 CEST 2012
 */


window.App = {};

App.MapInfo = Backbone.Model.extend({
    _NA: 'N.A.',

    initialize: function() {
        this.set({
            status: this._NA,
            latitude: this._NA,
            longitude: this._NA,
            zoom: this._NA,
            address: this._NA,
            sw_latitude: this._NA,
            sw_longitude: this._NA,
            ne_latitude: this._NA,
            ne_longitude: this._NA
        });
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

App.mapInfo = new App.MapInfo;

App.detailedstats = new App.MapInfoDetails({
    el: $('#mapinfo-details'),
    model: App.mapInfo
});

App.quickstats = new App.MapInfoQuickView({
    el: $('#mapinfo-quickview'),
    model: App.mapInfo
});

// eof
