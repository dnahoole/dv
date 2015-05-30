function HiGeoThermal() {
    this.map = null;
    this.markers = [];
    this.meta = [];
    var self = this;

// The panorama that will be used as the entry point to the custom
// panorama set.
    this.last_marker = null;

this.initialize = function(basemap) {
    if (basemap) {
        self.map = basemap;
    }
    
    // Web service:  EDB EPA.
    document.getElementById('epasrc').addEventListener('change', self.setSrc, false);
}

this.setPanorama = function(marker) {
    var panoramaOptions = {};
    
    switch (marker.title) {
      case 'Android':
        panoramaOptions = {
          pano: 'QKZJDF5QWO0AAAAAAAABOw',
          pov: {
              heading: 45,
              pitch: -2
          },
          zoom: 1
        };
        break;
      case 'Eha Street':
        // Set up Street View and initially set it visible. Register the
        // custom panorama provider function.
        panoramaOptions = {
          pano: 'ehaStreet',
          pov: {
              heading: 45,
              pitch: -2
          },
          zoom: 1,
          panoProvider: self.getCustomPanorama
        };
        break;
      default:
        return;
    }

    var myPano = new google.maps.StreetViewPanorama(
        document.getElementById('pano-canvas'),
        panoramaOptions);
    myPano.setVisible(true);
    self.toggleBounce(marker);
}

this.toggleBounce = function(marker) {
        if (self.last_marker) self.last_marker.setAnimation(null);
        if (self.last_marker != marker) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          self.last_marker = marker;
        } else {
          self.last_marker = null;
        }
}

this.setSrc = function(e) {
    var webservice = "";

    if (document.getElementById('epa0').checked) {
        self.deleteMarkers();
    } else if (document.getElementById('epa1').checked) {
        webservice = 'http://gis.hawaii.gov/arcgis/rest/services/Geoscientific/MapServer/1/query?where=objectid+%3E+0&geometryType=esriGeometryPoint&outSR=4326&f=pjson';
    } else if (document.getElementById('epa2').checked) {
        webservice = '';
    } else if (document.getElementById('epa3').checked) {
        webservice = '';
    }

    if (webservice === "") return;

        var minLat = 90.0;
        var minLon = 180.0;
        var maxLat = 0.0;
        var maxLon = -180.0;

        d3.json(webservice, function(data) {
            data.features.forEach(function(s,i) {
                var marker = {"objectid": i,
                "description": s.attributes.type,
                "latitude": +s.geometry.y,
                "longitude": +s.geometry.x};
                
                self.addMarker(marker);
            });
            
            self.showMarkers();
    
            //var NE = new google.maps.LatLng(lat_extents[1],lon_extents[1]);
            //var SW = new google.maps.LatLng(lat_extents[0],lon_extents[0]);
            //var layerbounds = new google.maps.LatLngBounds(SW, NE);
            //self.map.fitBounds(layerbounds);
        });
}

    // Add a marker to the map and push to the array.
this.addMarker = function(obj) {
        var location = new google.maps.LatLng(obj.latitude, obj.longitude);

        var marker = new google.maps.Marker({
            position: location,
            map: self.map,
            title: obj.description,
//            icon: "small_green"
        });
        
        google.maps.event.addListener(marker, 'click', self.fusionInfo);
        marker.set("meta", obj);

        self.markers.push(marker);
        self.meta.push(obj);
};

// Shows any markers currently in the array.
this.showMarkers = function() {
    self.setAllMap(self.map);
};

// Sets the map on all markers in the array.
this.setAllMap = function(map) {
    for (var i = 0; i < self.markers.length; i++) {
        self.markers[i].setMap(map);
    }
};

// Removes the markers from the map, but keeps them in the array.
this.clearMarkers = function() {
    self.setAllMap(null);
};

// Deletes all markers in the array by removing references to them.
this.deleteMarkers = function() {
        self.clearMarkers();
        self.markers = [];
        self.meta = [];
};
} //--- end of custom GIS object
