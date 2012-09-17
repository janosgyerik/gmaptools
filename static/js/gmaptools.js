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

function initialize_map() {
    var latlng;
    if (google.loader.ClientLocation) {
        var lat = google.loader.ClientLocation.latitude;
        var lng = google.loader.ClientLocation.longitude;
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
    google.maps.event.addListener(map, 'zoom_changed', centerChanged);
    centerChanged();
}

function new_point(lat, lon) {
    return new google.maps.LatLng(lat, lon);
}

function pan_to(point) {
    map.panTo(point);
}

function drop_pin(point) {
    pan_to(point);
    // TODO: use factory to keep reference to markers
    var marker = new google.maps.Marker({
        position: point,
        map: map
    });
}

function home() {
    if (google.loader.ClientLocation) {
        var lat = google.loader.ClientLocation.latitude;
        var lon = google.loader.ClientLocation.longitude;
        pan_to(new_point(lat, lon));
    }
}

function initialize_latlon_tool() {
    var form = $('#latlon-tool');
    var lat_input = form.find('.lat');
    var lon_input = form.find('.lon');

    function get_point() {
        var lat = lat_input.val();
        var lon = lon_input.val();
        return lat && lon ? new_point(lat, lon) : map.getCenter();
    }

    var btn_goto = form.find('.btn-goto');
    btn_goto.bind('click', function() {
        pan_to(get_point());
    });

    var btn_pin = form.find('.btn-pin');
    btn_pin.bind('click', function() {
        drop_pin(get_point());
    });

    var btn_home = form.find('.btn-home');
    btn_home.bind('click', home);

    var btn_here = form.find('.btn-here');
    btn_here.bind('click', function() {
        var point = map.getCenter();
        lat_input.val(point.lat());
        lon_input.val(point.lng());
    });
}

function initialize() {
    initialize_map();
    initialize_latlon_tool();
}

function centerChanged() {
    App.mapStats.update(map);
    //map.panTo(latlng);
    //map.panToBounds(bounds);
    //map.fitBounds(bounds);
}


$(document).ready(function() {
    google.load("maps", "3.x", {other_params: "sensor=false", callback:initialize});
});

// eof
