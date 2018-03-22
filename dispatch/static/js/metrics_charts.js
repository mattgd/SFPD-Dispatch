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
 * Creates the Chart.js chart for average calls per hour chart.
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
 * Creates the Chart.js chart for call type group vs. response time.
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
 * Creates the Chart.js chart for the battalion distribution chart.
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
 * Creates the Chart.js chart for average calls per hour chart.
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
        
        chart.update();
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

                            

                            // Get the dataset
                            var dataset = data.datasets[tooltipItems.datasetIndex];

                            // Calculate the total of this data set
                            var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                                return previousValue + currentValue;
                            });

                            // Get the current item's value
                            var currentValue = dataset.data[tooltipItems.index];

                            // Calculate the percentage
                            var percentage = (currentValue / total) * 100 + 0.5;

                            // Return the formatted tooltip
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

// Cache for the data to reduce POST request count
var battalionData = {};

/**
 * Event listener for the specific battalion distribution form to get the data
 * and generate the chart.
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
 * Event listener to show/hide example trend analysis for Sunset/Parkside.
 */
$('#battalion').change(function() {
    // Submit the form to get new chart data
    $("#battalionDistForm").submit();
});

// Call the createCharts function
createCharts();