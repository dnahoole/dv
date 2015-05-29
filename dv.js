function DV() {
  this.mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(20.8911111, -156.5047222),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
  this.map = new google.maps.Map(document.getElementById('map-canvas'),
        this.mapOptions);

  // Visualization style:  Marker, Circles, Heatmap.
  document.getElementById('viz').addEventListener('change', usgs.setVisual, false);

  // Web service:  USGS 2.5 Week, 2014, 2015.
  document.getElementById('datsrc').addEventListener('change', usgs.setSrc, false);
}
