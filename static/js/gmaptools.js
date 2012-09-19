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
}

function initLatlonTool() {
    var form = $('#latlon-tool');
    var lat_input = form.find('.lat');
    var lon_input = form.find('.lon');

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

    function onKeyUp(e) {
        if (e.keyCode == '13') {
            gotoLatLng();
        }
    }

    lat_input.keyup(onKeyUp);
    lon_input.keyup(onKeyUp);
    
    var btn_goto = form.find('.btn-goto');
    btn_goto.bind('click', gotoLatLng);

    var btn_pin = form.find('.btn-pin');
    btn_pin.bind('click', dropPin);

    var btn_home = form.find('.btn-home');
    btn_home.bind('click', gotoHome);

    var btn_here = form.find('.btn-here');
    btn_here.bind('click', function() {
        var point = map.getCenter();
        lat_input.val(point.lat());
        lon_input.val(point.lng());
    });
}

function initLocalSearchTool() {
    var form = $('#localsearch-tool');
    var keyword_input = form.find('.keyword');

    var service = new google.maps.places.PlacesService(map);

    function localSearch() {
        var request = {
            location: map.getCenter(),
            rankBy: google.maps.places.RankBy.DISTANCE,
            keyword: keyword_input.val()
        };
        var callback = function(results, status) {
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
                App.mapInfo.set({status: status});
            }
        };
        service.search(request, callback);
    }

    function onKeyUp(e) {
        if (e.keyCode == '13') {
            localSearch();
        }
    }

    keyword_input.keyup(onKeyUp);
    
    var btn_local = form.find('.btn-local');
    btn_local.bind('click', localSearch);
}

function initGeocodeTool() {
    var form = $('#geocode-tool');
    var address_input = form.find('.address');

    var geocoder = new google.maps.Geocoder();

    function geocode() {
        var request = {
            address: address_input.val(),
            partialmatch: true
        };
        var callback = function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                for (var i = 0; i < results.length; ++i) {
                    var result = results[i];
                    console.log(result);
                    //map.panToBounds(result.geometry.bounds);
                    map.fitBounds(result.geometry.viewport);
                    map.setCenter(result.geometry.location);
                    createMarker(result.geometry.location, icons.geocode);
                    break;
                }
            } else {
                App.mapInfo.set({status: status});
            }
        };
        geocoder.geocode(request, callback);
    }

    function onKeyUp(e) {
        if (e.keyCode == '13') {
            geocode();
        }
    }

    address_input.keyup(onKeyUp);
    
    var btn_geocode = form.find('.btn-geocode');
    btn_geocode.bind('click', geocode);
}

function initialize() {
    initGoogleMap();
    initLatlonTool();
    initLocalSearchTool();
    initGeocodeTool();
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
