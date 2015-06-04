function HigherEd() {
    this.map = null;
    this.dataset = {"summary":{},
                    "point":[]
    };
    var self = this;

    // The panorama that will be used as the entry point to the custom panorama set.
    this.last_point = null;

    this.initialize = function(basemap) {
        if (basemap) {
            self.map = basemap;
        }
        // Web service:  EDB EPA.
        document.getElementById('epasrc').addEventListener('change', self.setSrc, false);
    }

    this.toggleBounce = function() {
        if (self.last_point) {
            self.last_point.setAnimation(null);
        }
        
        if (self.last_point != this) {
            document.getElementById('datapoint').innerHTML = this.meta.infowin;
            document.getElementById('datapoint').setAttribute("style", "opacity: 0.8; z-index: 10");
            this.setAnimation(google.maps.Animation.BOUNCE);
            self.last_point = this;
        } else {
            document.getElementById('datapoint').setAttribute("style", "opacity: 0; z-index: -1");
            self.last_point = null;
        }
    }

    this.setSrc = function(e) {
        var webservice = "";

        if (document.getElementById('epa0').checked) {
            self.deleteMarkers();
        } else if (document.getElementById('epa1').checked) {
            // ArcGIS Query parameters:
            // Where: objectid > 0
            // Geometry Type: esriGeometryPoint
            // Output Spatial Reference:  4326
            // Results Format:  JSON
            webservice = 'http://gis.hawaii.gov/arcgis/rest/services/Geoscientific/MapServer/1/query?where=objectid+%3E+0&geometryType=esriGeometryPoint&outSR=4326&f=pjson';
            d3.json(webservice, function(data) {
                data.features.forEach(function(s, i) {
                    s.latitude = +s.geometry.y;
                    s.longitude = +s.geometry.x;

                    var marker = {
                        "objectid": i,
                        "description": s.attributes.type,
                        "latitude": s.latitude,
                        "longitude": s.longitude,
                        "icon": "icons/pin_blue.png"
                    };

                    self.addMarker(marker);
                });
                self.showMarkers();
                self.fitBounds(data.features);
            });
            document.getElementById('summary').setAttribute("style", "opacity: 0.8; z-index: 10");
        } else if (document.getElementById('epa2').checked) {
            // Source:  Hawaii OpenData:  https://data.hawaii.gov/Formal-Education/Enrollement-Heatmap/v5aj-iqwr
            // Description:  Enrollment at UH Colleges by Zip Code 2010 - 2014
            // Fields:  SEMESTER, ZIPCODE,CAMPUS, HAWAIIAN_LEGACY, ENROLLEMENT
            // Filter:  CAMPUS is MAUI COLLEGE
            // Format:  JSON
            webservice = 'https://data.hawaii.gov/api/views/9m5p-8kzq/rows.json?accessType=DOWNLOAD';
            d3.json(webservice, function(features) {
                features.data.forEach(function(s, i) {
                    s.latitude = +s[9][1];
                    s.longitude = +s[9][2];

                    var marker = {
                        "objectid": i,
                        "description": s[10],
                        "latitude": s.latitude,
                        "longitude": s.longitude,
                        "icon": "icons/pin_yellow.png"
                    };

                    self.addMarker(marker);
                });
                self.showMarkers();
                self.fitBounds(features.data);
            });
            document.getElementById('summary').setAttribute("style", "opacity: 0.8; z-index: 10");
        } else {
            document.getElementById('summary').setAttribute("style", "opacity: 0; z-index: -1");
        }
    }

    this.fitBounds = function(data) {
        var lat_extents = d3.extent(data, function(d) {
            return d.latitude;
        });

        var lon_extents = d3.extent(data, function(d) {
            return d.longitude;
        });

        var NE = new google.maps.LatLng(lat_extents[1], lon_extents[1]);
        var SW = new google.maps.LatLng(lat_extents[0], lon_extents[0]);
        var layerbounds = new google.maps.LatLngBounds(SW, NE);
        self.map.fitBounds(layerbounds);
    }

    // Add a marker to the map and push to the array.
    this.addMarker = function(obj) {
        var location = new google.maps.LatLng(obj.latitude, obj.longitude);

        var marker = new google.maps.Marker({
            position: location,
            map: self.map,
            title: obj.description,
            icon: obj.icon,
        });

        google.maps.event.addListener(marker, 'click', self.toggleBounce);

        var infowin;
        infowin = "<strong class='infotitle'>#" + obj.objectid + ": " + obj.description + "</strong><br><br>";
        infowin += "<em>latitude:</em> <strong>" + obj.latitude + "</strong><br>";
        infowin += "<em>longitude:</em> <strong>" + obj.longitude + "</strong>";

        document.getElementById('datapoint').innerHTML = infowin;
        obj.infowin = infowin;

        marker.set("meta", obj);
        self.dataset.point.push(marker);
    };

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
    
    this.dataSummary = function(map) {
        for (var i = 0; i < self.dataset.point.length; i++) {
            self.dataset.point[i].setMap(map);
        }
        var infowin;
        infowin = "<strong class='infotitle'>#" + obj.objectid + ": " + obj.description + "</strong><br><br>";
        infowin += "<em>latitude:</em> <strong>" + obj.latitude + "</strong><br>";
        infowin += "<em>longitude:</em> <strong>" + obj.longitude + "</strong>";

        document.getElementById('datapoint').innerHTML = infowin;

        var chartwidth = 800,
            chartheight = 500;
        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = chartwidth - margin.left - margin.right,
            height = chartheight - margin.top - margin.bottom;

        var stock, species;
        
        // Date format for astraptes.json:  9/11/2005 12:30
        var parse = d3.time.format("%m/%d/%Y %H:%M").parse;

        var x = d3.time.scale()
            .range([margin.left, width]);

        var y = d3.scale.linear()
            .range([height, margin.top]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(-height)
            .tickSubdivide(true)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) {
                return x(d.time);
            })
            .y(function(d) {
                return y(d.temp);
            });

        d3.json("dat/sensors.json", function(data) {

            // Nest stock values by symbol.
            species = d3.nest()
                .key(function(d) {
                    return d.location;
                })
                .entries(stocks = data);

            // Parse dates and numbers. We assume values are sorted by date.
            // Also compute the maximum price per symbol, needed for the y-domain.
            species.forEach(function(s) {

                s.values.forEach(function(d) {
                    d.time = parse(d.date+" "+d.time);
                    d.temp = +d.temp;
                    d.lat = +d.lat;
                    d.long = +d.long;
                });

                s.y_extents = d3.extent(s.values, function(d) {
                    return d.temp;
                });

                s.x_extents = d3.extent(s.values, function(d) {
                    return d.time;
                });

                // Sort each species by eclosion data, ascending
//                s.values.sort(function(a, b) {
//                    return a.time - b.time;
//                });
                
                var svg = d3.select("body").append("svg").data([s])
                    .attr("class", function(d) {
                        return d.key;
                    })
                    .attr("width", chartwidth)
                    .attr("height", chartheight)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                x.domain(s.x_extents)
                y.domain(s.y_extents)

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+margin.left+",0)")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("x", -height/2)
                    .attr("y", -margin.left)
                    .attr("dy", ".75em")
                    .style("text-anchor", "end")
                    .text("Temperature (C)");

                svg.append("path")
                    .datum(function(d) {
                        return d.values;
                    })
                    .attr("class", "line")
                    .attr("d", line);

                // Add a small label for the symbol name.
                svg.append("text")
                    .attr("x", width/2)
                    .attr("y", height + margin.bottom)
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return d.key
                    });
            });
        });
    };

} //--- end of custom GIS object