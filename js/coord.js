function GeoCoord() {
    this.map = null;
    this.mapclick = null;
    var infowindow = null;

    var self = this;

this.initialize = function(basemap) {
    if (basemap) {
        self.map = basemap;
    }
    
    // Listen for change to Coordinates checkbox.
    document.getElementById('gc0').addEventListener('change', self.handleMapClick, false);
}

this.handleMapClick = function(e) {

    if ( e.target.checked ) {
            // Create a new marker at new location.  Show info with latitude & longitude for location clicked.

        document.getElementById('coord').setAttribute('style', 'background-color: navy; color: white');
        self.mapclick = google.maps.event.addListener(self.map, 'click', function(evt) {

            var contentString = '<div id="info-content">'+
                    '<table border=1><thead>'+
                    '<tr><th colspan=2>Geographic Coordinates</th></tr>'+
                    '<tr><th>Attribute</th><th>Value</th></tr>'+
                    '</thead>'+
                    '<tbody>'+
                    '<tr><td>Latitude</td><td>'+evt.latLng.A+'</td></tr>'+
                    '<tr><td>Longitude</td><td>'+evt.latLng.F+'</td></tr>'+
                    '</tbody></table></div>';

            var info_options = {
                        map: self.map,
                        position: evt.latLng,
                        content: contentString,
                        title: 'Geographic Coordinates'
                };
                
            if (! self.infowindow) {
                self.infowindow = new google.maps.InfoWindow(info_options);
            }

            self.infowindow.setOptions(info_options);
            self.infowindow.open(self.map);
        });
    } else {
        document.getElementById('coord').setAttribute('style', 'font-style: normal; background-color: gold; color: black');
        if (self.mapclick) {
            self.infowindow.close();
            google.maps.event.removeListener(self.mapclick);
            self.mapclick = null;
            self.infowindow = null;
        }
    }
}

}
