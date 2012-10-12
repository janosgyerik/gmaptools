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
    baseurl: 'http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons',
    initialize: function() {
        this.presets = {
            default: this.baseurl + '/green.png',
            search: this.baseurl + '/red-dot.png',
            latlon: this.baseurl + '/blue-dot.png',
            localSearch: this.baseurl + '/yellow-dot.png',
            geocode: this.baseurl + '/orange-dot.png'
        };
    },
    getPresetMarkerImage: function(name) {
        var src = this.presets[name];
        return new google.maps.MarkerImage(src);
    },
    getCustomMarkerImage: function(src, options) {
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
        this.on('geocode', this.geocode, this);
    },

    centerChanged: function() {
        var center = this.map.getCenter();
        var params = {
            lat: center.lat(),
            lon: center.lng()
        };
        var bounds = this.map.getBounds();
        if (bounds) {
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            _.extend(params, {
                sw_latitude: sw.lat(),
                sw_longitude: sw.lng(),
                ne_latitude: ne.lat(),
                ne_longitude: ne.lng()
            });
        }
        this.set(params);
    },
    zoomChanged: function() {
        this.set({zoom: this.map.getZoom()});
    },
    dragend: function() {
        this.updateAddress();
    },

    getCurrentLatLon: function(callback) {
        callback(this.get('lat'), this.get('lon'));
    },
    gotoHome: function() {
        this.gotoLatLon(this.defaults.lat, this.defaults.lon);
    },
    gotoLatLon: function(lat, lon) {
        this.set({lat: lat, lon: lon});
        this.map.setCenter(this.locationFactory.getLocation(lat, lon));
        this.map.panTo(this.locationFactory.getLocation(lat, lon));
        this.updateAddress();
    },
    dropPin: function(lat, lon) {
        var pos = this.locationFactory.getLocation(lat, lon);
        var markerImage = this.markerImageFactory.getPresetMarkerImage('latlon');
        this.markerFactory.getMarker(pos, markerImage);
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
                var markerImage = this.markerImageFactory.getCustomMarkerImage(place.icon, {size: 25});
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
    },
    geocode: function(address) {
        var request = {
            address: address,
            partialmatch: true
        };
        // note: could not make this work with a var callback = function ...
        // had to create this.geocodeCallback to have proper
        // bind of *this* using _.bindAll
        // also, I couldn't get it to work with _.bind either...
        _.bindAll(this, 'geocodeCallback');
        this.geocoder.geocode(request, this.geocodeCallback);
    },
    geocodeCallback: function(results, status) {
        this.updateStatusFromGeocodeResults(results, status);
        if (status == google.maps.GeocoderStatus.OK) {
            for (var i = 0; i < results.length; ++i) {
                var result = results[i];
                //this.map.panToBounds(result.geometry.bounds);
                this.map.fitBounds(result.geometry.viewport);
                this.map.setCenter(result.geometry.location);
                var markerImage = this.markerImageFactory.getPresetMarkerImage('geocode');
                this.markerFactory.getMarker(result.geometry.location, markerImage);
                break;
            }
        }
    },
    updateStatusFromGeocodeResults: function(results, status) {
        this.set({status: status});
        if (status == google.maps.GeocoderStatus.OK) {
            // this.errors.hide();
            for (var i = 0; i < results.length; ++i) {
                var result = results[i];
                this.set({address: result.formatted_address});
                break;
            }
        } else {
            // this.errors.clear();
            // this.errors.append('Local search failed');
            // this.errors.show();
        }
    },
    updateAddress: function() {
        var request = {
            latLng: this.map.getCenter(),
        };
        // note: could not make this work with a var callback = function ...
        // had to create this.geocodeCallback to have proper
        // bind of *this* using _.bindAll
        // also, I couldn't get it to work with _.bind either...
        _.bindAll(this, 'updateStatusFromGeocodeResults');
        this.geocoder.geocode(request, this.updateStatusFromGeocodeResults);
    },
});

App.Tool = Backbone.View.extend({
    activate: function() {
        var id = this.$el.attr('id');
        var anchor = $('a[href=#' + id + ']');
        anchor.tab('show');
        if (this.fieldToFocus) {
            this.fieldToFocus.focus();
        }
    }
});

App.LatlonTool = App.Tool.extend({
    el: $('#latlon-tool'),
    initialize: function(options) {
        this.lat = this.$('.lat');
        this.lon = this.$('.lon');
        this.map = options.map;
        this.$('.features').popover({
            content: $('#features-latlon').html(),
            placement: 'bottom',
            trigger: 'hover'
        });
    },
    fieldToFocus: this.$('.lat'),
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
        if (e.keyCode == '13') {
            e.preventDefault();
            this.gotoLatLon();
        }
    }
});

App.LocalSearchTool = App.Tool.extend({
    el: $('#localsearch-tool'),
    initialize: function(options) {
        this.keyword = this.$('.keyword');
        this.map = options.map;
        this.$('.features').popover({
            content: $('#features-localsearch').html(),
            placement: 'bottom',
            trigger: 'hover'
        });
    },
    fieldToFocus: this.$('.keyword'),
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
        if (e.keyCode == '13') {
            e.preventDefault();
            this.localSearch();
        }
    }
});

App.GeocodeTool = App.Tool.extend({
    el: $('#geocode-tool'),
    initialize: function(options) {
        this.address = this.$('.address');
        this.map = options.map;
        this.$('.features').popover({
            content: $('#features-geocode').html(),
            placement: 'bottom',
            trigger: 'hover'
        });
    },
    fieldToFocus: this.$('.address'),
    events: {
        'click .btn-geocode': 'geocode',
        'keypress .address': 'onEnter'
    },
    geocode: function() {
        var address = this.address.val();
        if (address) {
            this.map.trigger('geocode', address);
        }
    },
    onEnter: function(e) {
        if (e.keyCode == '13') {
            e.preventDefault();
            this.geocode();
        }
    }
});

App.Toolbar = Backbone.View.extend({
    el: $('#toolbar'),
    events: {
        'click a[href="#latlon-tool"]': 'openLatlonTool',
        'click a[href="#localsearch-tool"]': 'openLocalSearchTool',
        'click a[href="#geocode-tool"]': 'openGeocodeTool'
    },
    openLatlonTool: function() {
        App.router.openLatlonTool();
    },
    openLocalSearchTool: function() {
        App.router.openLocalSearchTool();
    },
    openGeocodeTool: function() {
        App.router.openGeocodeTool();
    }
});

App.Router = Backbone.Router.extend({
    routes: {
        'tools/latlon': 'activateLatlon',
        'tools/localSearch': 'activateLocalSearch',
        'tools/geocode': 'activateGeocode',
        '*placeholder': 'activateLatlon'
    },
    activateTool: function(tool) {
        tool.activate();
    },
    activateLatlon: function() {
        this.activateTool(App.latlonTool);
    },
    activateLocalSearch: function() {
        this.activateTool(App.localSearchTool);
    },
    activateGeocode: function() {
        this.activateTool(App.geocodeTool);
    },
    openLatlonTool: function() {
        this.navigate('tools/latlon', {trigger: true});
    },
    openLocalSearchTool: function() {
        this.navigate('tools/localSearch', {trigger: true});
    },
    openGeocodeTool: function() {
        this.navigate('tools/geocode', {trigger: true});
    }
});

App.OfflineView = Backbone.View.extend({
    el: $('#main-content'),

    template: _.template($('#offline-template').html()),

    render: function() {
        this.$el.html(this.template());
        return this;
    }
});

function onGoogleMapsReady() {
    // instances
    // TODO: put in setup.js
    App.mapController = new App.MapController;
    App.latlonTool = new App.LatlonTool({map: App.mapController});
    App.localSearchTool = new App.LocalSearchTool({map: App.mapController});
    App.geocodeTool = new App.GeocodeTool({map: App.mapController});
    App.toolbar = new App.Toolbar;

    App.detailedstats = new App.MapInfoDetails({
        el: $('#mapinfo-details'),
        model: App.mapController
    });

    App.quickstats = new App.MapInfoQuickView({
        el: $('#mapinfo-quickview'),
        model: App.mapController
    });

    App.router = new App.Router;

    // initialize the Backbone router
    Backbone.history.start();

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

    //App.geocodeTool.activate();
    //App.geocodeTool.address.val('6 Rue Mizon, 75015 Paris, France');
    //App.geocodeTool.geocode();

    // this is to force all views to render
    App.mapController.trigger('change');
}

function offlineMode() {
    var offlineView = new App.OfflineView;
    offlineView.render();
}

$(function() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.event !== 'undefined') {
        google.maps.event.addDomListener(window, 'load', onGoogleMapsReady);
    }
    else {
        offlineMode();
    }
});

// eof
