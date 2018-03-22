/**
 * Generates the metrics charts for the dispatch data.
 */
function createCharts() {
    // Create the chart for call_type_group vs. response time
    createGroupRespTimeChart();

    // Create the average calls per hour chart
    createAvgCallsPerHourChart();

    // Create the overall battalion distribution chart
    createBattalionDistribBarChart();
}

/**
 * Retrieves data for and creates the Chart.js
 * chart for average calls per hour.
 */
function createAvgCallsPerHourChart() {
    var endpoint = '/api/metrics/calls-per-hour';

    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            var ctx = $("#avgCallsPerHour");

            // Remove top status layer of data
            data = data.data;
        
            // Create the Chart object
            var avgCallsPerHourChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data["labels"],
                    datasets: [{
                        label: 'Average Calls',
                        data: data["data"],
                        backgroundColor: getBackgroundColors(1),
                        borderColor: getBorderColors(1),
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Average Number of Calls'
                            }
                        }],
                        xAxes:[{
                            type: 'time',
                            time: {
                                parser: "HH:mm",
                                unit: 'hour',
                                unitStepSize: 1,
                                displayFormats: {
                                    'minute': 'HH:mm', 
                                    'hour': 'HH:mm', 
                                    min: '00:00',
                                    max: '23:59'
                                },
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Hour of Day'
                            },
                            ticks: {
                                autoSkip: false
                            }
                        }],
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function(tooltipItems, data) { 
                                return tooltipItems.yLabel + ' calls';
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            });
        },
        error: function(resp) {
            console.error("An error occurred when retrieving average response time data.");
        }
    });  
}

/**
 * Retrieves data for and creates the Chart.js
 * chart for call type group vs. response time.
 */
function createGroupRespTimeChart() {
    var endpoint = '/api/metrics/group-response-time';

    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            var ctx = $("#typeResponseTime");
            
            // Remove top status layer of data
            data = data.data;

            // Create the Chart object
            var typeRespTimeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data["labels"],
                    datasets: [{
                        label: 'Average Response Time',
                        data: data["data"],
                        backgroundColor: getBackgroundColors(data["data"].length),
                        borderColor: getBorderColors(data["data"].length),
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Average Response Time (minutes)'
                            }
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Call Type Group'
                            },
                            ticks: {
                                autoSkip: false
                            }
                        }]
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function(tooltipItems, data) { 
                                return tooltipItems.yLabel + ' mins';
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                }
            });
        },
        error: function(resp) {
            console.error("An error occurred while retrieving the battalion distribution data.");
        }
    });
}

/**
 * Retrieves data for and creates the Chart.js
 * chart for the total battalion distribution.
 */
function createBattalionDistribBarChart() {
    var endpoint = '/api/metrics/battalion-dist';

    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            // Create the battalion distribution chart objects
            var ctx = $("#battalionDistrib");

            // Remove top status layer of data
            data = data.data;

            // Create the Chart.js chart object.
            var battalionDistribChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data["labels"],
                    datasets: [{
                        label: 'Number of Calls by Battalion',
                        data: data["data"],
                        backgroundColor: getBackgroundColors(data["data"].length),
                        borderColor: getBorderColors(data["data"].length),
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Number of Calls'
                            }
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Battalion'
                            },
                            ticks: {
                                autoSkip: false
                            }
                        }]
                    },
                    tooltips: {
                        enabled: true,
                        mode: 'single',
                        callbacks: {
                            label: function(tooltipItems, data) { 
                                return tooltipItems.yLabel + ' calls';
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                }
            });
        },
        error: function(resp) {
            console.error("An error occurred while retrieving the battalion distribution data.");
        }
    });
}

/**
 * Retrieves data for and creates the Chart.js
 * chart for a specific battalion's call types.
 */
function createBattalionDistChart(data) {
    var ctx = $("#battalionDistChart");

    // Remove top status layer of data
    data = data.data;

    // The chart instance
    var chart = window.batDistChart;
    
    if (chart && chart != null) {
        // Update the existing Chart object
        chart.data = {
            labels: data["labels"],
            datasets: [data["dataset"]]
        };

        // Update title
        chart.options.title.text = 'Call Type Distribution for Battalion ' + data['battalion']
        
        chart.update(); // Update the chart visuals
    } else {
        // Create the Chart object
        window.batDistChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data["labels"],
                datasets: [data["dataset"]]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Call Type Distribution for Battalion ' + data['battalion'],
                    fontSize: 16
                },
                tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function(tooltipItems, data) {
                            var label = data.labels[tooltipItems.index];

                            // Get the dataset for this item
                            var dataset = data.datasets[tooltipItems.datasetIndex];

                            // Calculate the total of this data set
                            var total = dataset.data.reduce(
                                function(previousValue, currentValue, currentIndex, array) {
                                    return previousValue + currentValue;
                                }
                            );

                            // Get the item's value (integer)
                            var currentValue = dataset.data[tooltipItems.index];

                            // Calculate the percentage
                            var percentage = (currentValue / total) * 100 + 0.5;

                            // Return the formatted tooltip (rounded to 1 decimal place)
                            return label + ': ' +  currentValue + (
                                ' (' + percentage.toFixed(1) + '%)'
                            );
                        }
                    }
                },
            }
        });
    }

    var results = $("#trendResults");
    results.fadeIn();
}

/** BEGIN MOST-LIKELY DISPATCH TYPE JAVASCRIPT **/

/**
 * Event listener for the dispatchTypeForm to
 * get the most-likely dispatch type required.
 */
$("#dispatchTypeForm").submit(function(e) {
    var endpoint = '/api/calls/nearby';

    $.ajax({
        method: "POST",
        url: endpoint,
        data: $("#dispatchTypeForm").serialize(),
        success: function(data) {
            displayNearbyCalls(data); // Get nearby calls
        },
        error: function(resp) {
            console.error('An error occurred when retrieving nearby call data.');
            var error = '<div class="alert alert-danger mt-3" role="alert"><p class="mb-0">' + 
                resp.responseJSON.message + ' Please try again.</p></div>';
            
            var results = $("#nearbyResults");
            results.html(error);
            results.fadeIn();
        }
    });

    // Prevent form submit causing page change
    e.preventDefault();
});

/**
 * Removes results on form change, since a change in the
 * form elements makes the results no longer valid.
 */
$('#dispatchTypeForm').change(function() {
    $('#nearbyResults').fadeOut();
});

/**
 * Displays the nearby call data for the most-likely dispatch to be required.
 * @param {Object} data The JSON data for the most-likely dispatch.
 */
function displayNearbyCalls(data) {
    data = data.data; // Enter the data layer of the JSON

    var results = $("#nearbyResults");
    var nearbyData = '<div class="alert alert-info mt-3" role="alert"><p class="mb-0">Most likely dispatch required: <b>' + 
        data.unit_type_match + '</b> with <i>' + data.unit_type_match_count + 
        '</i> matching incidents.</p></div>';
    
    // Display the data
    results.html(nearbyData);
    results.fadeIn();
}

/** BEGIN BATTALION CALL TYPE DISTRIBUTION JAVASCRIPT **/
// Cache for the battalion data to reduce POST request count
var battalionData = {};

/**
 * Event listener for the specific battalion distribution
 * form to get the data and generate the chart.
 */
$("#battalionDistForm").submit(function(e) {
    var endpoint = '/api/metrics/battalion-dist';
    var form = $(this);

    // Check the cache for the data
    var battalion = form.find('#battalion').val();
    if (battalionData[battalion] !== undefined) {
        // Generate battalion distribution chart
        createBattalionDistChart(battalionData[battalion]);
    } else {
        $.ajax({
            method: "POST",
            url: endpoint,
            data: form.serialize(),
            success: function(data) {
                // Cache the data
                battalionData[battalion] = data;

                // Generate neighborhood trend chart
                createBattalionDistChart(data);
            },
            error: function(resp) {
                console.error('An error occurred when retrieving battalion distribution data.');
                var error = '<div class="alert alert-danger mt-3" role="alert"><p class="mb-0">' + 
                    resp.responseJSON.message + ' Please try again.</p></div>';
                
                var results = $("#trendResults");
                results.html(error);
                results.fadeIn();
            }
        });
    }

    // Prevent form submit causing page change
    e.preventDefault();
});

/**
 * Event listener to submit the battalion distribution form
 * when the select element is changed (button-less form).
 */
$('#battalion').change(function() {
    $("#battalionDistForm").submit(); // Triggers submit to get new chart data
});

/**
 * Populates the list of battalions in the
 * battalionDistForm for user selection.
 */
function populateBattalionList() {
    var endpoint = '/api/calls/battalions';
    
    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            // Remove top status layer of data
            data = data.data;

            var battalion; // Holds the name of the neighborhood
            var optionHtml; // The option HTML element
            for (var i = 0; i < data.length; i++) {
                battalion = data[i];
                optionHtml = '<option value="' + battalion + '">' + battalion + '</option>';
                
                // Add to the select element
                $('#battalion').append(optionHtml);
            }
            
            // Submit the form to show example data
            $("#battalionDistForm").submit();
        },
        error: function(resp) {
            console.error('An error occurred when retrieving the battalion list.');
        }
    });
}

// Populates the battalions list in the battalionDistForm
populateBattalionList();

createCharts(); // Call the createCharts function on load
