/*!
 * gmaptools JavaScript Library v0.1
 * http://.../
 *
 * Copyright 2012, Janos Gyerik
 * http://.../license
 *
 * Date: Sun Sep 16 23:00:33 CEST 2012
 */


var palette_baseurl = "http://maps.gstatic.com/intl/en_us/mapfiles/ms/micons";
var defaultIcon_src = palette_baseurl + '/green.png';
var latlonIcon_src = palette_baseurl + '/blue-dot.png';
var searchIcon_src = palette_baseurl + '/red-dot.png';
var localSearchIcon_src = palette_baseurl + '/yellow-dot.png';
var geocodeIcon_src = palette_baseurl + '/orange-dot.png';

var map;
var geocoder;

// preloaded MarkerIcon objects
var icons = {};

function createLatLng(lat, lon) {
    return new google.maps.LatLng(lat, lon);
}

var markers = [];

function createMarker(latlng, icon) {
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: latlng.toString(),
        icon: icon
    });
    markers.push(marker);
    return marker;
}

function createMarkerImage(src, size, origin, anchor, scaledSize) {
    return new google.maps.MarkerImage(src, size, origin, anchor, scaledSize);
}

function centerChanged() {
    App.mapInfo.update(map);
}

function addressChanged() {
    var request = {
        latLng: map.getCenter()
    };
    var callback = function(results, status) {
        App.mapInfo.set({status: status});
        if (status == google.maps.GeocoderStatus.OK) {
            for (var i = 0; i < results.length; ++i) {
                var result = results[i];
                App.mapInfo.set({address: result.formatted_address});
                break;
            }
        } else {
            App.mapInfo.clearAddress();
        }
    };
    geocoder.geocode(request, callback);
}

function onEnter(func) {
    return function(e) {
        if (e.keyCode == '13') {
            func();
        }
    }
}

var cookie_expires = 7;
var cookie_path = null;

function getCookie(name, _default) {
    var value = $.cookie(name);
    return value ? value : _default;
}

function setCookie(name, value) {
    $.cookie(name, value, { expires: cookie_expires, path: cookie_path });
}

function clearCookie(name) {
    setCookie(name, '');
}

function initGeocodeTool() {
    var container = $('#geocode-tool');
    var address_input = container.find('.address');

    function geocode() {
        var request = {
            address: address_input.val(),
            partialmatch: true
        };
        var callback = function(results, status) {
            App.mapInfo.set({status: status});
            if (status == google.maps.GeocoderStatus.OK) {
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    App.mapInfo.set({address: result.formatted_address});
                    //map.panToBounds(result.geometry.bounds);
                    map.fitBounds(result.geometry.viewport);
                    map.setCenter(result.geometry.location);
                    createMarker(result.geometry.location, icons.geocode);
                    break;
                }
            } else {
            }
        };
        geocoder.geocode(request, callback);
    }

    address_input.keyup(onEnter(geocode));
    
    var btn_geocode = container.find('.btn-geocode');
    btn_geocode.bind('click', geocode);
}

var option_show_crosshair = getCookie('option_show_crosshair', 'true') == 'true';
var option_draggable_markers = getCookie('option_draggable_markers', 'true') == 'true';
var option_show_cursor_coordinates = getCookie('option_show_cursor_coordinates', 'true') == 'true';

function initOptionsTool() {
    var container = $('#options-tool');

    var input_show_crosshair = container.find('.show-crosshair');
    var input_draggable_markers = container.find('.draggable-markers');
    var input_show_cursor_coordinates = container.find('.show-cursor-coordinates');

    input_show_crosshair.prop('checked', option_show_crosshair);
    input_draggable_markers.prop('checked', option_draggable_markers);
    input_show_cursor_coordinates.prop('checked', option_show_cursor_coordinates);

    function setShowCrosshair(enable) {
        option_show_crosshair = enable;
        if (enable) {
            $('#crosshair').show();
        }
        else {
            $('#crosshair').hide();
        }
        setCookie('option_show_crosshair', enable);
    }
    input_show_crosshair.click(function() {
        setShowCrosshair(this.checked);
    });
    setShowCrosshair(option_show_crosshair);

    function setDraggableMarkers(enable) {
        option_draggable_markers = enable;
        if (option_draggable_markers) {
            // TODO make all existing markers draggable
        }
        else {
            // TODO make all existing markers not draggable
        }
        setCookie('option_draggable_markers', enable);
    }
    input_draggable_markers.click(function() {
        setDraggableMarkers(this.checked);
    });
    setDraggableMarkers(option_draggable_markers);

    function setShowCursorCoordinates(enable) {
        option_show_cursor_coordinates = enable;
        if (option_show_cursor_coordinates) {
            // TODO enable showing cursor coordinates
        }
        else {
            // TODO disable showing cursor coordinates
        }
        setCookie('option_show_cursor_coordinates', enable);
    }
    input_show_cursor_coordinates.click(function() {
        setShowCursorCoordinates(this.checked);
    });
    setShowCursorCoordinates(option_show_cursor_coordinates);
}

// eof
