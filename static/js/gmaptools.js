/*!
 * gmaptools JavaScript Library v0.1
 * http://.../
 *
 * Copyright 2012, Janos Gyerik
 * http://.../license
 *
 * Date: Sun Sep 16 23:00:33 CEST 2012
 */


var map;

function initialize() {
    var latlng;
    var loc = {};
    if (google.loader.ClientLocation) {
        loc.lat = google.loader.ClientLocation.latitude;
        loc.lng = google.loader.ClientLocation.longitude;

        latlng = new google.maps.LatLng(loc.lat, loc.lng);
    }
    else {
        latlng = new google.maps.LatLng(32.5468, -23.2031);
    }
    var options = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), options);

    google.maps.event.addListener(map, 'center_changed', centerChanged);
    centerChanged();

    //var bounds = new google.maps.LatLngBounds(latlng, latlng);
    //map.panTo(latlng);
    //map.panToBounds(bounds);
    //map.fitBounds(bounds);
}

function centerChanged() {
    var latlng = map.getCenter();
    $('.tab-content .latitude').text(latlng.lat());
    $('.tab-content .longitude').text(latlng.lng());
    $('.tab-content .zoom').text(map.getZoom());
}


$(document).ready(function() {
    google.load("maps", "3.x", {other_params: "sensor=false", callback:initialize});
});

// eof
