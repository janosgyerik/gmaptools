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

var map;

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

function createMarkerImage(src) {
    return new google.maps.MarkerImage(src);
}

function centerChanged() {
    App.mapStats.update(map);
    //map.panTo(latlng);
    //map.panToBounds(bounds);
    //map.fitBounds(bounds);
}

function initGoogleMap() {
    icons.default = createMarkerImage(defaultIcon_src);
    icons.latlon = createMarkerImage(latlonIcon_src);

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

function initialize() {
    initGoogleMap();
    initLatlonTool();
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

  function geocode() {
    var address = document.getElementById("address").value;
    geocoder.geocode({
      'address': address,
      'partialmatch': true}, geocodeResult);
  }

  function geocodeResult(results, status) {
    if (status == 'OK' && results.length > 0) {
      map.fitBounds(results[0].geometry.viewport);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  }

    if(currentReverseGeocodeResponse) {
      var addr = '';
      if(currentReverseGeocodeResponse.size == 0) {
        addr = 'None';
      } else {
        addr = currentReverseGeocodeResponse[0].formatted_address;
      }
      text = text + '<br>' + 'address: <br>' + addr;
    }

    geocoder = new google.maps.Geocoder();
function codeAddress() {
        var address = document.getElementById('address').value;
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
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

// Onload handler to fire off the app.
google.maps.event.addDomListener(window, 'load', initialize);


 * 
*/


$(document).ready(function() {
    google.load("maps", "3.x", {other_params: "sensor=false", callback:initialize});
});

// eof
