function StreetView() {
    this.map = null;
    this.panorama;
    this.ehaStreet = new google.maps.LatLng(20.898621, -156.493613);
    this.locAndroid = new google.maps.LatLng(20.891435, -156.478957);
    var self = this;

// The panorama that will be used as the entry point to the custom
// panorama set.
    this.last_marker = null;

this.initialize = function(basemap) {
    if (basemap) {
        self.map = basemap;
    }
    var ehaMarker = new google.maps.Marker({
      position: self.ehaStreet,
      map: self.map,
      title: 'Eha Street'
    });

    google.maps.event.addListener(ehaMarker, 'click', function() {
      self.map.setCenter(ehaMarker.getPosition());
      self.setPanorama(ehaMarker);
    });

    var androidMarker = new google.maps.Marker({
      position: self.locAndroid,
      map: self.map,
      title: 'Android'
    });

    google.maps.event.addListener(androidMarker, 'click', function() {
      self.map.setCenter(androidMarker.getPosition());
      self.setPanorama(androidMarker);
    });
}

this.setPanorama = function(marker) {
    var panoramaOptions = {};
    
    if (self.last_marker == marker) {
      document.getElementById('pano-show').setAttribute("style", "opacity: 0; z-index: -1");
      self.toggleBounce(marker);
      return;
    } else {
      document.getElementById('pano-show').setAttribute("style", "opacity: 1; z-index: 10");
    }
    
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

this.getCustomPanoramaTileUrl = function(pano, zoom, tileX, tileY) {
    var n = tileY * Math.pow(2, zoom) + tileX;

    return 'tiles/tile_' + zoom + '_' + n + '.jpg';
    //    return 'tiles/panorama.jpg';
}

this.getCustomPanorama = function(pano) {
    switch (pano) {
        case 'ehaStreet':
            return {
                location: {
                    pano: 'ehaStreet',
                    description: 'My Backyard - Reception',
                    latLng: self.ehaStreet
                },
                links: [],
                // The text for the copyright control.
                copyright: 'Imagery (c) 2015 D.Nahoolewa',
                // The definition of the tiles for this panorama.
                tiles: {
                    //          tileSize: new google.maps.Size(2586, 1293),
                    tileSize: new google.maps.Size(11536, 1293),
                    worldSize: new google.maps.Size(11536, 1293),
                    // The heading at the origin of the panorama tile set.
                    centerHeading: 105,
                    getTileUrl: self.getCustomPanoramaTileUrl
                }
            };
            break;
        default:
            return null;
    }
}
}
