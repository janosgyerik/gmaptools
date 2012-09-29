gmaptools
=========
Google Map Tools - coordinate finder, geocoding and other goodies

The purpose of this project is twofold:

1. Implement some mapping tools that are sorely missing from the 
   official Google Maps user interface.

2. Implement the tools using Backbone.js the *right way*, to be
   suitable as model examples of using Backbone.

If you would like to add more tools to the collection, or you spot
flaws in the use of Backbone (or anything else for that matter),
please fork the project and share your knowledge. Thanks!

https://github.com/janosgyerik/gmaptools


Live demos
----------
- http://janosgyerik.github.com/gmaptools/


Features
--------
- Map info:
    - Shows map center coordinates and zoom level
    - Shows bounding box coordinates
    - Shows the detected address at the map center
    - Dynamically updates all info when the map is dragged
- LatLon tool:
    - Go to specified latitude-longitude
    - Drop pin at map center
    - Get latitude-longitude of crosshair at map center
    - Go to latitude-longitude determined by client IP address
- Local search tool:
    - Find places matching keywords at around the map center
- Geocode tool:
    - Find an address using Geocode lookup


Powered by ...
--------------
- html5
- bootstrap - http://twitter.github.com/bootstrap/
- backbone.js - http://documentcloud.github.com/backbone/
- Google Maps v3 - https://developers.google.com/maps/documentation/javascript/reference


Coming soon (feature ideas)
---------------------------
- place markers for coordinates from google spreadsheet
    - probably based on this example:
      http://gmaps-samples-v3.googlecode.com/svn/trunk/spreadsheets/mapwithsidebar.html
- place markers for addresses from google spreadsheet
    - probably based on this example:
      http://gmaps-samples-v3.googlecode.com/svn/trunk/spreadsheets/mapwithsidebar.html
- marker tool
    - place marker on click
    - edit marker icon

