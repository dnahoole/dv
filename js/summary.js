function Summary() {
    this.map = null;
    var self = this;

this.initialize = function(basemap) {
    if (basemap) {
        self.map = basemap;
    }
}

this.setSummary = function(marker) {
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
        break;
      case 'Eha Street':
       break;
      default:
        return;
    }
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

this.getCustomPanorama = function(pano) {
    switch (pano) {
        case 'ehaStreet':
            return {
                location: {
                },
                links: [],
                // The text for the copyright control.
                copyright: 'Imagery (c) 2015 D.Nahoolewa',
                // The definition of the tiles for this panorama.
                tiles: {
                }
            };
            break;
        default:
            return null;
    }
}

}
