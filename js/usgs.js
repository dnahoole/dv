function USGS() {
    this.map = null;
    this.heatmap = null;
    this.vis = "marker";
    this.dataset = {
        "summary": {},
        "point": [],
        "graph": []
    };
    var self = this;

    // The panorama that will be used as the entry point to the custom panorama set.
    this.last_point = null;

    this.initialize = function(basemap) {
        if (basemap) {
            self.map = basemap;
        }

        // Visualization style:  Marker, Circles, Heatmap.
        document.getElementById('viz').addEventListener('change', self.setVisual, false);

        // Web service:  USGS 2.5 Week, 2014, 2015.
        document.getElementById('datsrc').addEventListener('change', self.setSrc, false);
    }

    this.setSrc = function(e) {
        var now = new Date();

        var endtime = now.toISOString();
        var lastWeek = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7).toISOString();
        var lastMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate()).toISOString();
        var lastYear = new Date(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate()).toISOString();

        var query = {
            "url": "http://earthquake.usgs.gov/fdsnws/event/1/query?",
            "description": "",
            "format": "geojson",
            "minmagnitude": 6,
            "callback": "eqfeed_callback",
            "orderby": "time",
            "jsonerror": "true",
            "starttime": "",
            "endtime": ""
        }

        var webservice = query.url;
        webservice += "&format=" + query.format;
        webservice += "&minmagnitude=" + query.minmagnitude;
        webservice += "&callback=" + query.callback;
        webservice += "&orderby=" + query.orderby;
        webservice += "&jsonerror=" + query.jsonerror;

        if (document.getElementById('src0').checked) {
            webservice = '';
            self.deleteMarkers();
            document.getElementById('summary').setAttribute("style", "opacity: 0; z-index: -1");
        } else if (document.getElementById('src1').checked) {
            query.description = "Within the last Week";
            query.starttime = lastWeek;
            query.endtime = endtime;
            webservice += "&starttime=" + query.starttime;
            webservice += "&endtime=" + query.endtime;
        } else if (document.getElementById('src2').checked) {
            query.description = "Within the last Month";
            query.starttime = lastMonth;
            query.endtime = endtime;
            webservice += "&starttime=" + query.starttime;
            webservice += "&endtime=" + query.endtime;
        } else if (document.getElementById('src3').checked) {
            query.description = "Within the last Year";
            query.starttime = lastYear;
            query.endtime = endtime;
            webservice += "&starttime=" + query.starttime;
            webservice += "&endtime=" + query.endtime;
        }

        // Remove existing <script id=eqid> tag.
        var script = document.getElementById('eqid');
        if (script) document.getElementsByTagName('head')[0].removeChild(script);

        // Create a <script> tag and set the USGS URL as the source.
        script = document.createElement('script');
        script.id = 'eqid';
        script.src = webservice;
        document.getElementsByTagName('head')[0].appendChild(script);

        if (self.heatmap) self.heatmap.setMap(null);

        if (self.dataset.point) {
            self.map.data.forEach(function(feature) {
                self.map.data.remove(feature);
            });
            self.dataset.point = null;
        }

//        self.showQuery(query);
    }

    this.setVisual = function(e) {
        self.vis = e.target.id;
        if (self.heatmap) self.heatmap.setMap(null);
        eqfeed_callback(self.dataset.point);
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

    this.fitBounds = function(data) {
        var lat_extents = d3.extent(data.features, function(d) {
            return d.geometry.coordinates[1];
        });

        var lon_extents = d3.extent(data.features, function(d) {
            return d.geometry.coordinates[0];
        });

        var NE = new google.maps.LatLng(lat_extents[1], lon_extents[1]);
        var SW = new google.maps.LatLng(lat_extents[0], lon_extents[0]);

        var layerbounds = new google.maps.LatLngBounds(SW, NE);
        self.map.fitBounds(layerbounds);
    }

    this.showQuery = function(obj) {
        var infowin;
        infowin = "<strong class='infotitle'>" + obj.description + "</strong><br><br>";
        infowin += "<em>Min. Magnitude: </em> <strong>" + obj.minmagnitude + "</strong><br>";
        infowin += "<em>Start Time: </em> <strong>" + obj.starttime + "</strong><br>";
        infowin += "<em>End Time: </em> <strong>" + obj.endtime + "</strong>";

        document.getElementById('summary').innerHTML = infowin;
        document.getElementById('summary').setAttribute("style", "opacity: 0.8; z-index: 10");
    }

    // Shows any markers currently in the array.
    this.showMarkers = function() {
        self.setAllMap(self.map);
    };

    // Sets the map on all markers in the array.
    this.setAllMap = function(map) {
        for (var i = 0; i < self.dataset.point.length; i++) {
            self.dataset.point[i].setMap(map);
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    this.clearMarkers = function() {
        self.setAllMap(null);
    };

    // Deletes all markers in the array by removing references to them.
    this.deleteMarkers = function() {
        document.getElementById('summary').setAttribute("style", "opacity: 0; z-index: -1");
        document.getElementById('datapoint').setAttribute("style", "opacity: 0; z-index: -1");
        document.getElementById('datapoint').innerHTML = null;
        self.clearMarkers();
        self.dataset.summary = null;
        self.dataset.point = [];
    };

    this.dataSummary = function(data) {
        document.getElementById('summary').setAttribute("style", "opacity: 0.8; z-index: 10");
        self.dataset.summary = {
            "count": data.metadata.count,
            "title": data.metadata.title,
            "url": data.metadata.url,
            "date": data.metadata.generated
        };

        data.features.forEach(function(d,i) {
            d.time = +d.properties.time;
            
            // Location in WGS84 Lat/Lng coordinates.
            d.latitude = +d.geometry.coordinates[1];
            d.longitude = +d.geometry.coordinates[0];
            
            // Magnitude & Type
            d.magnitude = +d.properties.mag;
            d.magType = d.properties.magType;
            
            // Descriptive location of epicenter
            d.place = d.properties.place;
            
            // The root-mean-square (RMS) travel time residual, in sec, using all weights. 
            d.rms = +d.properties.rms;
            
            // Was a tsunami generated?
            d.tsunami = +d.properties.tsunami;
            self.dataset.graph.push([i, d.magnitude]);
//            self.dataset.graph.push([d.time, d.magnitude, d.rms]);
            
//            d.geometry = null;
//            d.properties = null;
        });

        data.y_extents = d3.extent(data.features, function(d) {
            return d.magnitude;
        });

        data.x_extents = d3.extent(data.features, function(d) {
            return d.time;
        });
        
        var graph = new Dygraph(document.getElementById("summary"),
            self.dataset.graph,
            {
                labels: [ "Number", "Magnitude" ],
//                labels: [ "Time", "Magnitude", "sigma" ],
                rollPeriod: 1,
                showRoller: true,
//                errorBars: true,
                valueRange: data.y_extents
            });
    };

} //End of USGS Prototype


var usgs = new USGS();

//--- Callback function from USGS JSONP data service.
function eqfeed_callback(results) {
    if (!usgs.dataset.point) usgs.dataset.point = results;

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

    usgs.fitBounds(results);
    usgs.dataSummary(results);
}