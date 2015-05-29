function USGS() {
    this.map = null;
    this.heatmap = null;
    this.saved_results = null;
    this.vis = "marker";
    var self = this;

this.initialize = function(basemap) {
    if (basemap) {
        self.map = basemap;
    }
}

this.setSrc = function(e) {
    var webservice = "";

    if (document.getElementById('src1').checked) {
        webservice = 'http://earthquake.usgs.gov/earthquakes/feed/geojsonp/2.5/week';
    } else if (document.getElementById('src2').checked) {
        webservice = 'http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02&minmagnitude=6&callback=eqfeed_callback&endtime=2015-05-14%2023:59:59&orderby=time&jsonerror=true';
    } else if (document.getElementById('src3').checked) {
        webservice = 'http://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2015-05-07%2000:00:00&minmagnitude=6&callback=eqfeed_callback&endtime=2015-05-14%2023:59:59&orderby=time';
    }

    // Create a <script> tag and set the USGS URL as the source.
    var script = document.createElement('script');
    script.src = webservice;

    self.map.data.forEach(function(feature) {
        self.map.data.remove(feature);
    });

    if (self.heatmap) self.heatmap.setMap(null);

    if (self.saved_results) self.saved_results = null;

    document.getElementsByTagName('head')[0].appendChild(script);
}

this.setVisual = function(e) {
    self.vis = e.target.id;
    if (self.heatmap) self.heatmap.setMap(null);
    eqfeed_callback(self.saved_results);
}

this.getCircle = function(feature) {
    var magnitude = feature.getProperty('mag');
    var circle = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: .2,
        scale: Math.pow(2, magnitude) / 2,
        strokeColor: 'white',
        strokeWeight: .5
    };
    return circle;
}

this.showHeatMap = function(results) {
    var heatmapData = [];
    for (var i = 0; i < results.features.length; i++) {
        var coords = results.features[i].geometry.coordinates;
        var latLng = new google.maps.LatLng(coords[1], coords[0]);
        var magnitude = results.features[i].properties.mag;
        var weightedLoc = {
            location: latLng,
            weight: Math.pow(2, magnitude)
        };
        heatmapData.push(weightedLoc);
    }

    self.heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        dissipating: false,
        map: self.map
    });
}
} //End of USGS Prototype


var usgs = new USGS();

//--- Callback function from USGS JSONP data service.
function eqfeed_callback(results) {
    if (!usgs.saved_results) usgs.saved_results = results;

    switch (usgs.vis) {
        case "marker":
            usgs.map.data.setStyle({
                icon: ""
            });
            usgs.map.data.addGeoJson(results);
            break;
        case "circle":
            usgs.map.data.setStyle(function(feature) {
                return {
                    icon: usgs.getCircle(feature)
                };
            });
            usgs.map.data.addGeoJson(results);
            break;
        case "heatmap":
            usgs.map.data.setStyle({
                visible: false
            });
            usgs.showHeatMap(results);
            break;
    }
}
