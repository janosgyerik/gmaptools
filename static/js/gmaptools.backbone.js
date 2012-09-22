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

App.LocationFactory = Backbone.Collection.extend({
    getLocation: function(lat, lon) {
        return new google.maps.LatLng(lat, lon);
    }
});

App.MarkerFactory = Backbone.Collection.extend({
    initialize: function(map) {
        this.map = map;
    },
    getMarker: function(pos, icon) {
        var marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            title: pos.toString(),
            icon: icon
        });
        //markers.push(marker);
        return marker;
    }
});

App.MarkerImageFactory = Backbone.Collection.extend({
    getMarkerImage: function(src, options) {
        if (options.size) {
            return new google.maps.MarkerImage(src, null, null, null, new google.maps.Size(options.size, options.size));
        }
        else {
            return new google.maps.MarkerImage(src);
        }
    }
});

App.MapController = Backbone.Model.extend({
    defaults: {
        status: 'N.A.',
        lat: 35.68112175616982,
        lon: 139.76703710980564,
        zoom: 14,
        address: 'N.A.',
        sw_latitude: 'N.A.',
        sw_longitude: 'N.A.',
        ne_latitude: 'N.A.',
        ne_longitude: 'N.A.'
    },
    initialize: function() {
        // initialize helper factory objects
        this.locationFactory = new App.LocationFactory;
        this.markerImageFactory = new App.MarkerImageFactory;

        // initialize google map objects
        if (google.loader.ClientLocation) {
            var lat = google.loader.ClientLocation.latitude;
            var lon = google.loader.ClientLocation.longitude;
            this.defaults.lat = lat;
            this.defaults.lon = lon;
            this.set({lat: lat, lon: lon});
        }
        var center = this.locationFactory.getLocation(this.get('lat'), this.get('lon'));
        var options = {
            zoom: this.get('zoom'),
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(document.getElementById('map_canvas'), options);
        this.placesService = new google.maps.places.PlacesService(this.map);
        this.geocoder = new google.maps.Geocoder();
        this.markerFactory = new App.MarkerFactory(this.map);

        // make sure *this* is bound to *this* in the map event handlers
        _.bindAll(this, 'centerChanged', 'zoomChanged', 'dragend');

        // google maps event handlers
        google.maps.event.addListener(this.map, 'center_changed', this.centerChanged);
        google.maps.event.addListener(this.map, 'zoom_changed', this.zoomChanged);
        google.maps.event.addListener(this.map, 'dragend', this.dragend);


        // event handlers for latlon tool
        this.on('getCurrentLatLon', this.getCurrentLatLon, this);
        this.on('gotoHome', this.gotoHome, this);
        this.on('gotoLatLon', this.gotoLatLon, this);
        this.on('dropPin', this.dropPin, this);

        // event handlers for local search tool
        this.on('localSearch', this.localSearch, this);
    },

    centerChanged: function() {
        var center = this.map.getCenter();
        this.set({lat: center.lat(), lon: center.lng()});
    },
    zoomChanged: function() {
        this.set({zoom: this.map.getZoom()});
    },
    dragend: function() {
    },

    getCurrentLatLon: function(callback) {
        callback(this.get('lat'), this.get('lon'));
    },
    gotoHome: function() {
        this.gotoLatLon(this.defaults.lat, this.defaults.lon);
    },
    gotoLatLon: function(lat, lon) {
        this.set({lat: lat, lon: lon});
        this.map.panTo(this.locationFactory.getLocation(lat, lon));
    },
    dropPin: function(lat, lon) {
         this.markerFactory.addMarker(this.locationFactory.getLocation(lat, lon), {type: 'latlon'});
    },
    localSearch: function(keyword) {
        var request = {
            location: this.map.getCenter(),
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: keyword
        };
        // note: could not make this work with a var callback = function ...
        // had to create this.localSearchCallback to have proper
        // bind of *this* using _.bindAll
        // also, I couldn't get it to work with _.bind either...
        _.bindAll(this, 'localSearchCallback');
        this.placesService.search(request, this.localSearchCallback);
    },
    localSearchCallback: function(results, status) {
        this.set({status: status});
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // this.errors.hide();
            for (var i = 0; i < results.length; ++i) {
                var place = results[i];
                var markerImage = this.markerImageFactory.getMarkerImage(place.icon, {size: 25});
                this.markerFactory.getMarker(place.geometry.location, markerImage);
                //Extra info:
                //place.vicinity // Budapest, Vas Street 2
                //place.name
                //place.types // ['cafe', 'restaurant', 'food', 'establishment']
            }
        }
        else {
            // this.errors.clear();
            // this.errors.append('Local search failed');
            // this.errors.show();
        }
    }
});

App.Tool = Backbone.View.extend({
    activate: function() {
        var id = this.$el.attr('id');
        var anchor = $('a[href=#' + id + ']');
        anchor.tab('show');
    }
});

App.LatlonTool = App.Tool.extend({
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

App.LocalSearchTool = App.Tool.extend({
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

// instances
// TODO: put in setup.js
App.mapController = new App.MapController;
App.latlonTool = new App.LatlonTool({map: App.mapController});
App.localSearchTool = new App.LocalSearchTool({map: App.mapController});

App.detailedstats = new App.MapInfoDetails({
    el: $('#mapinfo-details'),
    model: App.mapController
});

App.quickstats = new App.MapInfoQuickView({
    el: $('#mapinfo-quickview'),
    model: App.mapController
});

//App.router = new App.Router;

// initialize the Backbone router
//Backbone.history.start();

function onGoogleMapsReady() {
    // debugging
    //App.latlonTool.activate();
    //App.latlonTool.getCurrentLatLon();
    //App.latlonTool.lat.val(2);
    //App.latlonTool.lon.val(3);
    //App.latlonTool.gotoLatLon();
    //App.latlonTool.dropPin();
    //App.latlonTool.gotoHome();

    //App.localSearchTool.activate();
    //App.localSearchTool.keyword.val('pizza');
    //App.localSearchTool.localSearch();
}

$(function() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.event !== 'undefined') {
        google.maps.event.addDomListener(window, 'load', onGoogleMapsReady);
    }
});

// eof
