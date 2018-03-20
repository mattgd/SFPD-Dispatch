/**
 * Initializes the heatmap Google Maps objects.
 * This function is called via the Google Maps API load callback.
 */
function initHeatmaps() {
    // Settings for the Google Map object
    var mapSettings = {
        zoom: 13,
        center: {lat: 37.775, lng: -122.434},
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true
    };

    // Heatmap DOM elements
    dispatchTimeMap = new google.maps.Map(document.getElementById('dispatchTimeMap'), mapSettings);
    addressFreqMap = new google.maps.Map(document.getElementById('addressFreqMap'), mapSettings);
    
    // Retrieves the longest average dispatch time data,
    // and initializes the longest-dispatch heatmap.
    endpoint = '/api/calls/longest-dispatch';
    $.ajax({
        method: 'GET',
        url: endpoint,
        success: function(data) {
            // Set the custom map type
            setDarkMap(dispatchTimeMap);

            // Add the heatmap layer to the map
            addHeatmapLayer(dispatchTimeMap, addressFreqHeatmap, data);

            // Setup pagination for the average dispatch time table
            // The columns in the table
            var cols = ['address', 'avg_dispatch_time', 'count', 'incident_count'];
            setupPagination($('#dispatchTimeTable'), data, cols, 'incident_count');
        },
        error: function(resp) {
            console.error("An error occured when retrieving longest dispatch data.");
        }
    });

    // Retrieves the address frequency data the for dispatch frequency heatmap
    endpoint = '/api/calls/address-frequency';
    $.ajax({
        method: 'GET',
        url: endpoint,
        success: function(data) {
            // Set the custom map type
            setDarkMap(addressFreqMap);

            // Add the heatmap layer to the map
            addHeatmapLayer(addressFreqMap, addressFreqHeatmap, data);

            // Setup pagination for the dispatch call address frequency table
            // The columns in the table
            var cols = ['address', 'count'];
            setupPagination($('#addressFreqTable'), data, cols);
        },
        error: function(resp) {
            console.error("An error occured when retrieving longest dispatch data.");
        }
    });
}

/**
 * Created WeightedLocation objects from the API data for the heatmap layer
 * and adds the heatmap layer to the map.
 * @param {*} map The map to add the heatmap layer to.
 * @param {*} heatmap The heatmap layer instance.
 * @param {*} data The data to use as points.
 */
function addHeatmapLayer(map, heatmap, data) {
    var points = Array();

    // Creates HeatmapLayer WeightedLocation objects for each call in data
    for (var i = 0; i < data.data.length; i++) {
        point = data.data[i];

        if (point.count !== undefined) {
            points.push(
                {
                    location: new google.maps.LatLng(point.lat, point.lng),
                    weight: point.count
                }
            )
        } else {
            points.push(new google.maps.LatLng(point.lat, point.lng))
        }
    }

    // Define the heatmap
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map
    });
}

/**
 * Sets the custom dark map type.
 * @param {*} map The map to set the type for.
 */
function setDarkMap(map) {
    map.mapTypes.set('dark_map', getDarkMap());
    map.setMapTypeId('dark_map');
}

/**
 * Returns a new StyledMapType object which represents the
 * custom dark map type for the heatmaps.
 * @returns StyledMapType object.
 */
function getDarkMap() {
    return new google.maps.StyledMapType(
        [
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    },
                    {
                        "lightness": 17
                    }
                ]
            }
        ],
        { name: "Dark Map" }
    );   
}