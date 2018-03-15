
function initHeatmaps() {
    var mapSettings = {
        zoom: 13,
        center: {lat: 37.775, lng: -122.434},
        gestureHandling: 'greedy',
        mapTypeId: 'roadmap'
    };

    dispatchTimeMap = new google.maps.Map(document.getElementById('dispatchTimeMap'), mapSettings);
    addressFreqMap = new google.maps.Map(document.getElementById('addressFreqMap'), mapSettings);
    
    // Initialize the longest-dispatch heatmap
    endpoint = '/api/calls/longest-dispatch';
    $.ajax({
        method: 'GET',
        url: endpoint,
        success: function(data) {
            // Add the heatmap layer to the map
            addHeatmapLayer(dispatchTimeMap, addressFreqHeatmap, data);

            // Add the call data the dispatch time table
            var max = Math.min(data.data.length, 20);
            for (var i = 0; i < max; i++) {
                call = data.data[i];

                // Add the call data to the dispatch time table
                addToDataTable("dispatchTimeTable", call);
            } 
        },
        error: function(resp) {
            console.log("An error occured when retrieving longest dispatch data.");
            //console.log(resp);
        }
    });

    endpoint = '/api/calls/address-frequency';
    $.ajax({
        method: 'GET',
        url: endpoint,
        success: function(data) {
            console.log(data);
            // Add the heatmap layer to the map
            addHeatmapLayer(addressFreqMap, addressFreqHeatmap, data);
        },
        error: function(resp) {
            console.log("An error occured when retrieving longest dispatch data.");
            //console.log(resp);
        }
    });
}

function addHeatmapLayer(map, heatmap, data) {
    var points = Array();

    for (var i = 0; i < data.data.length; i++) {
        point = data.data[i];
        if (point.count !== undefined) {
            for (var j = 0; j < point.count; j++) {
                points.push(new google.maps.LatLng(point.lat, point.lng))
            }
        } else {
            points.push(new google.maps.LatLng(point.lat, point.lng))
        }
    }

    // Define the heatmap
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map
    });
    
    // Change the gradient colors
    changeGradient(heatmap);

    // Set the custom map type
    map.mapTypes.set('dark_map', getDarkMap());
    map.setMapTypeId('dark_map');
}

function changeGradient(heatmap) {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

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

function addToDataTable(tableName, call) {
    $('#' + tableName + ' > tbody:last-child').append(
        '<tr>' +
        '<td>' + call.call_number + '</td>' +
        '<td>' + call.address + '</td>' +
        '<td>' + call.dispatch_time + '</td>' +
        '<td>' + call.call_type + '</td>' +
        '</tr>'
    );
}