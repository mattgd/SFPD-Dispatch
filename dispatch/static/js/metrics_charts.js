/**
 * Generates the metrics charts for the dispatch data.
 */
function createCharts() {
    // Create the chart for call_type_group vs. response time
    createGroupRespTimeChart();

    // Create the average calls per hour chart
    createAvgCallsPerHourChart();

    // Create the battalion distribution chart
    createBattalionDistribChart();
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
function createBattalionDistribChart() {
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

// Call the createCharts function
createCharts();