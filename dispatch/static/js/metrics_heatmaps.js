
function initHeatmaps() {
    var mapSettings = {
        zoom: 13,
        center: {lat: 37.775, lng: -122.434},
        gestureHandling: 'greedy',
        mapTypeId: 'roadmap',
        disableDefaultUI: true
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
            var max = Math.min(data.data.length, 30);
            for (var i = 0; i < max; i++) {
                call = data.data[i];

                // Add the call data to the dispatch time table
                addToDataTable("dispatchTimeTable", call);
            }

            $('#dispatchTimeMapShowControls').change(function() {
                console.log("here");
                if($(this).is(":checked")) {
                    dispatchTimeMap.disableDefaultUI = false;
                } else {
                    dispatchTimeMap.disableDefaultUI = true;
                }    
            });
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
            //console.log(data);
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
            points.push(
                {
                    location: new google.maps.LatLng(point.lat, point.lng),
                    weight: 5 * point.count
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

    // Set the custom map type
    map.mapTypes.set('dark_map', getDarkMap());
    map.setMapTypeId('dark_map');
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
    var context = '<tr' + (call.count > 2 ? ' class="bg-warning">' : '>');
    $('#' + tableName + ' > tbody:last-child').append(
        context +
        '<td>' + call.address + '</td>' +
        '<td>' + call.avg_dispatch_time + '</td>' +
        '<td>' + call.count + '</td>' +
        '<td>' + call.call_type + '</td>' +
        '</tr>'
    );
}