var map;
var heatmap = null;
var saved_results = null;
var vis = "marker";
var panorama;
var ehaStreet = new google.maps.LatLng(20.898621, -156.493613);

// The panorama that will be used as the entry point to the custom
// panorama set.
var entryPanoId = null;


function initialize() {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(20.8911111, -156.5047222),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    // Visualization style:  Marker, Circles, Heatmap.
    document.getElementById('viz').addEventListener('change', setVisual, false);

    // Web service:  USGS 2.5 Week, 2014, 2015.
    document.getElementById('datsrc').addEventListener('change', setSrc, false);

    // Panoramas
    document.getElementById('panosrc').addEventListener('change', setPanorama, false);
}

function setSrc(e) {
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

    map.data.forEach(function(feature) {
        map.data.remove(feature);
    });

    if (heatmap) heatmap.setMap(null);

    if (saved_results) saved_results = null;

    document.getElementsByTagName('head')[0].appendChild(script);
}

function setVisual(e) {
    vis = e.target.id;
    if (heatmap) heatmap.setMap(null);
    eqfeed_callback(saved_results);
}

function getCircle(feature) {
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

function showHeatMap(results) {
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

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        dissipating: false,
        map: map
    });
}

function eqfeed_callback(results) {
    if (!saved_results) saved_results = results;

    switch (vis) {
        case "marker":
            map.data.setStyle({
                icon: ""
            });
            map.data.addGeoJson(results);
            break;
        case "circle":
            map.data.setStyle(function(feature) {
                return {
                    icon: getCircle(feature)
                };
            });
            map.data.addGeoJson(results);
            break;
        case "heatmap":
            map.data.setStyle({
                visible: false
            });
            showHeatMap(results);
            break;
    }
}

function setPanorama(e) {
    var myPanoid = "";
    var panoramaOptions = {};
    
    document.getElementById('pano-show').setAttribute("style", "opacity: 1; z-index: 10");

    if (document.getElementById('pano1').checked) {
        panoramaOptions = {
          pano: 'QKZJDF5QWO0AAAAAAAABOw',
          pov: {
              heading: 45,
              pitch: -2
          },
          zoom: 1
        };
    } else if (document.getElementById('pano2').checked) {
        // Set up Street View and initially set it visible. Register the
        // custom panorama provider function.
        panoramaOptions = {
          pano: 'ehaStreet',
          pov: {
              heading: 45,
              pitch: -2
          },
          zoom: 1,
          panoProvider: getCustomPanorama
        };
    } else if (document.getElementById('pano3').checked) {
        panoramaOptions = {
          pano: 'QKZJDF5QWO0AAAAAAAABOw',
          pov: {
              heading: 45,
              pitch: -2
          },
          zoom: 1
        };
    } else {
        document.getElementById('pano-show').setAttribute("style", "opacity: 0; z-index: -1");
        map.setStreetView(null);
        return;
    }

    var myPano = new google.maps.StreetViewPanorama(
        document.getElementById('pano-canvas'),
        panoramaOptions);
    myPano.setVisible(true);
}


function getCustomPanoramaTileUrl(pano, zoom, tileX, tileY) {
    var n = tileY * Math.pow(2, zoom) + tileX;

    return 'tiles/tile_' + zoom + '_' + n + '.jpg';
    //    return 'tiles/panorama.jpg';
}

function getCustomPanorama(pano) {
    switch (pano) {
        case 'ehaStreet':
            return {
                location: {
                    pano: 'ehaStreet',
                    description: 'My Backyard - Reception',
                    latLng: ehaStreet
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
                    getTileUrl: getCustomPanoramaTileUrl
                }
            };
            break;
        default:
            return null;
    }
}

// Call the initialize function after the page has finished loading
google.maps.event.addDomListener(window, 'load', initialize);