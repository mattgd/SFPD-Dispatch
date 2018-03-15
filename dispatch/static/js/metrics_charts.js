var endpoint = '/api/metrics/';

$.ajax({
    method: "GET",
    url: endpoint,
    success: function(data) {
        // Create the chart for call_type_group vs. response time
        createTypeRespTimeChart(data);

        // Create the average calls per hour chart
        createAvgCallsPerHourChart(data);

        // Create the unit type distribution chart
        createUnitTypeDistribChart(data);
    },
    error: function(resp) {
        console.log("There was an error retrieving the metrics data.");
        //console.log(resp);
    }
});

/**
 * Creates the Chart.js chart for call type group vs. response time.
 * @param {*} data The chart metrics data JSON.
 */
function createTypeRespTimeChart(data) {
    var ctx = $("#typeResponseTime");

    // Create the Chart object
    var typeRespTimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data["avg_response_time"]["groups"],
            datasets: [{
                label: 'Average Response Time',
                data: data["avg_response_time"]["data"],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Average Response Time Per Call Type Group'
            },
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
                    }
                }]
            }
        }
    });
}

/**
 * Creates the Chart.js chart for average calls per hour chart.
 * @param {*} data The chart metrics data JSON.
 */
function createAvgCallsPerHourChart(data) {
    var ctx = $("#avgCallsPerHour");

    // Create the Chart object
    var avgCallsPerHourChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data["avg_calls_per_hour"]["labels"],
            datasets: [{
                label: 'Average Calls',
                data: data["avg_calls_per_hour"]["data"],
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: 'rgba(255, 0, 0, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Average Calls Per Hour of Day'
            },
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
                        format: "HH:mm",
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
                    }
                }],
            }
        }
    });
}

/**
 * Creates the Chart.js chart for call unit type distribution chart.
 * @param {*} data The chart metrics data JSON.
 */
function createUnitTypeDistribChart(data) {
    var ctx = $("#unitTypeDistrib");

    // Create the Chart.js chart object.
    var unitTypeDistribChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data["unit_type_distrib"]["labels"],
            datasets: [{
                label: 'Percentage of Calls by Unit Type',
                data: data["unit_type_distrib"]["data"],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(23, 456, 78, 0.2)',
                    'rgba(134, 17, 156, 0.2)',
                    'rgba(203, 178, 43, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(23, 456, 78, 1)',
                    'rgba(134, 17, 156, 1)',
                    'rgba(203, 12, 43, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Percentage of Calls by Unit Type'
            }
        }
    });
}