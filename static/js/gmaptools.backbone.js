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

App.MapController = Backbone.Model.extend({
    defaults: {
        lat: 35.68112175616982,
        lon: 139.76703710980564,
        zoom: 14
    },
    initialize: function() {
        this.on('getCurrentLatLon', this.getCurrentLatLon, this);
        this.on('gotoHome', this.gotoHome, this);
        this.on('gotoLatLon', this.gotoLatLon, this);
        this.on('dropPin', this.dropPin, this);
    },
    getCurrentLatLon: function(callback) {
        callback(this.get('lat'), this.get('lon'));
    },
    gotoHome: function() {
        this.gotoLatLon(this.defaults.lat, this.defaults.lon);
    },
    gotoLatLon: function(lat, lon) {
        this.set({lat: lat, lon: lon});
        if (this.map) {
            this.map.panTo(this.locationFactory.getLocation(lat, lon));
        }
    },
    dropPin: function(lat, lon) {
        if (this.map) {
            this.markerFactory.addMarker(this.locationFactory.getLocation(lat, lon), {type: 'latlon'});
        }
    }
});

App.MapTool = Backbone.View.extend({
    activate: function() {
        var id = this.$el.attr('id');
        var anchor = $('a[href=#' + id + ']');
        anchor.tab('show');
    }
});

App.LatlonTool = App.MapTool.extend({
    el: $('#latlon-tool'),
    initialize: function(options) {
        this.lat = this.$('.lat');
        this.lon = this.$('.lon');
        this.map = options.map;
    },
    events: {
        'click .btn-goto': 'gotoLatLon',
        'click .btn-pin':  'dropPin',
        'click .btn-here': 'getCurrentLatLon',
        'click .btn-home': 'gotoHome',
        'keypress .lat': 'onEnter',
        'keypress .lon': 'onEnter'
    },
    gotoLatLon: function() {
        var lat = this.lat.val();
        var lon = this.lon.val();
        if (lat && lon) {
            this.map.trigger('gotoLatLon', lat, lon);
        }
    },
    dropPin: function() {
        var lat = this.lat.val();
        var lon = this.lon.val();
        if (lat && lon) {
            this.map.trigger('gotoLatLon', lat, lon);
            this.map.trigger('dropPin', lat, lon);
        }
    },
    getCurrentLatLon: function() {
        var lat = this.lat;
        var lon = this.lon;
        var callback = function(lat_, lon_) {
            lat.val(lat_);
            lon.val(lon_);
        };
        this.map.trigger('getCurrentLatLon', callback);
    },
    gotoHome: function() {
        this.map.trigger('gotoHome');
    },
    onEnter: function(e) {
        if (e.keyCode == '13') this.gotoLatLon();
    }
});

App.LocalSearchTool = App.MapTool.extend({
    el: $('#localsearch-tool'),
    initialize: function(options) {
        this.keyword = this.$('.keyword');
        this.map = options.map;
    },
    events: {
        'click .btn-local': 'localSearch',
        'keypress .keyword': 'onEnter'
    },
    localSearch: function() {
        var keyword = this.keyword.val();
        if (keyword) {
            this.map.trigger('localSearch', keyword);
        }
    },
    onEnter: function(e) {
        if (e.keyCode == '13') this.localSearch();
    }
});
/*
function initLocalSearchTool() {
    var service = new google.maps.places.PlacesService(map);

    function localSearch() {
        var request = {
            location: map.getCenter(),
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: keyword_input.val()
        };
        var callback = function(results, status) {
            App.mapInfo.set({status: status});
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; ++i) {
                    var place = results[i];
                    createMarker(place.geometry.location, createMarkerImage(place.icon, null, null, null, new google.maps.Size(25, 25)));
                    //Extra info:
                    //place.vicinity // Budapest, Vas Street 2
                    //place.name
                    //place.types // ['cafe', 'restaurant', 'food', 'establishment']
                }
            }
            else {
            }
        };
        service.search(request, callback);
    }
}

 * */

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

App.mapController = new App.MapController;
App.latlonTool = new App.LatlonTool({map: App.mapController});
App.localSearchTool = new App.LocalSearchTool({map: App.mapController});
App.localSearchTool.activate();

//App.router = new App.Router;

// initialize the Backbone router
//Backbone.history.start();

// eof
