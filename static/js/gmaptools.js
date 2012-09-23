/*!
 * gmaptools JavaScript Library v0.1
 * http://.../
 *
 * Copyright 2012, Janos Gyerik
 * http://.../license
 *
 * Date: Sun Sep 16 23:00:33 CEST 2012
 */


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
