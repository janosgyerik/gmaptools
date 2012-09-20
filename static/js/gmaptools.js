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

function initGoogleMap() {
    icons.default = createMarkerImage(defaultIcon_src);
    icons.latlon = createMarkerImage(latlonIcon_src);
    icons.localSearch = createMarkerImage(localSearchIcon_src);
    icons.geocode = createMarkerImage(geocodeIcon_src);

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
    map = new google.maps.Map(document.getElementById('map_canvas'), options);

    google.maps.event.addListener(map, 'center_changed', centerChanged);
    google.maps.event.addListener(map, 'zoom_changed', centerChanged);
    centerChanged();

    geocoder = new google.maps.Geocoder();
    google.maps.event.addListener(map, 'dragend', addressChanged);
}

function initLatlonTool() {
    var container = $('#latlon-tool');
    var lat_input = container.find('.lat');
    var lon_input = container.find('.lon');

    function getLatLng() {
        var lat = lat_input.val();
        var lon = lon_input.val();
        return lat && lon ? createLatLng(lat, lon) : map.getCenter();
    }

    function gotoLatLng() {
        map.panTo(getLatLng());
    }

    function dropPin() {
        var latlng = getLatLng();
        map.panTo(latlng);
        createMarker(latlng, icons.latlon);
    }

    function gotoHome() {
        if (google.loader.ClientLocation) {
            var lat = google.loader.ClientLocation.latitude;
            var lon = google.loader.ClientLocation.longitude;
            map.panTo(createLatLng(lat, lon));
        }
    }

    lat_input.keyup(onEnter(gotoLatLng));
    lon_input.keyup(onEnter(gotoLatLng));
    
    var btn_goto = container.find('.btn-goto');
    btn_goto.bind('click', gotoLatLng);

    var btn_pin = container.find('.btn-pin');
    btn_pin.bind('click', dropPin);

    var btn_home = container.find('.btn-home');
    btn_home.bind('click', gotoHome);

    var btn_here = container.find('.btn-here');
    btn_here.bind('click', function() {
        var point = map.getCenter();
        lat_input.val(point.lat());
        lon_input.val(point.lng());
    });
}

function initLocalSearchTool() {
    var container = $('#localsearch-tool');
    var keyword_input = container.find('.keyword');

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

    keyword_input.keyup(onEnter(localSearch));
    
    var btn_local = container.find('.btn-local');
    btn_local.bind('click', localSearch);
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

function initialize() {
    initGoogleMap();
    initLatlonTool();
    initLocalSearchTool();
    initGeocodeTool();
    initOptionsTool();
}

// get address from coordinates
// geocoder.geocode({latLng:map.getCenter()},reverseGeocodeResult);
/*
function reverseGeocodeResult(results, status) {
    currentReverseGeocodeResponse = results;
    if(status == 'OK') {
      if(results.length == 0) {
        document.getElementById('formatedAddress').innerHTML = 'None';
      } else {
        document.getElementById('formatedAddress').innerHTML = results[0].formatted_address;
      }
    } else {
      document.getElementById('formatedAddress').innerHTML = 'Error';
    }
  }

  // Add dragging event listeners.
  google.maps.event.addListener(marker, 'dragstart', function() {
    updateMarkerAddress('Dragging...');
  });
  
  google.maps.event.addListener(marker, 'drag', function() {
    updateMarkerStatus('Dragging...');
    updateMarkerPosition(marker.getPosition());
  });
  
  google.maps.event.addListener(marker, 'dragend', function() {
    updateMarkerStatus('Drag ended');
    geocodePosition(marker.getPosition());
  });
}

 * 
*/


$(document).ready(function() {
    google.maps.event.addDomListener(window, 'load', initialize);
});

// eof
