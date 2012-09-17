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
    if (google.loader.ClientLocation) {
        lat = google.loader.ClientLocation.latitude;
        lng = google.loader.ClientLocation.longitude;
        latlng = new google.maps.LatLng(lat, lng);
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

    //map.panTo(latlng);
    //map.panToBounds(bounds);
    //map.fitBounds(bounds);
}

function centerChanged() {
    App.mapStats.update(map);
}


$(document).ready(function() {
    google.load("maps", "3.x", {other_params: "sensor=false", callback:initialize});
});

// eof
