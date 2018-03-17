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
            console.log("An error occurred when retrieving average response time data.");
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
            console.log("An error occurred while retrieving the battalion distribution data.");
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
            console.log("An error occurred while retrieving the battalion distribution data.");
        }
    });
}

/**
 * Returns an Array of rgba colors to chart bar background colors.
 * @param {*} amount The number of colors to return (currently a max of 11).
 * @returns an Array of rgba colors to chart bar background colors.
 */
function getBackgroundColors(amount) {
    var bgColors = [
        'rgba(227, 26, 28, 0.3)',
        'rgba(31, 120, 180, 0.3)',
        'rgba(178, 223, 138, 0.5)',
        'rgba(106, 61, 154, 0.3)',
        'rgba(255, 127, 0, 0.3)',
        'rgba(251, 154, 153, 0.3)',
        'rgba(253, 191, 111, 0.3)',
        'rgba(51, 160, 44, 0.3)',
        'rgba(141, 211, 199, 0.5)',
        'rgba(202, 178, 214, 0.3)',
        'rgba(243, 128, 255, 0.3)'
    ];

    return bgColors.slice(0, amount < bgColors.length ? amount : bgColors.length);
}

/**
 * Returns an Array of rgba colors to chart bar border colors.
 * @param {*} amount The number of colors to return (currently a max of 11).
 * @returns an Array of rgba colors to chart bar border colors.
 */
function getBorderColors(amount) {
    var borderColors = getBackgroundColors(amount);

    for (var i = 0; i < borderColors.length; i++) {
        color = borderColors[i];
        borderColors[i] = color.substr(0, color.length - 4) + '1)';
    }

    return borderColors;
}

// Call the createCharts function
createCharts();