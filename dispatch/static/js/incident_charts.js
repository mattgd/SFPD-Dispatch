/**
 * Generates the metrics charts for the dispatch data.
 */
function createCharts() {
    // Create the chart for incidents per day per neighborhood
    createIncidentsPerDayChart();
}

/**
 * Creates the Chart.js chart for average calls per hour chart.
 */
function createIncidentsPerDayChart() {
    var endpoint = '/api/metrics/neighborhood-trends';

    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            var ctx = $("#incidentsPerDay");

            // Remove top status layer of data
            data = data.data;
        
            // Create the Chart object
            var incidentsPerDayChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data["labels"],
                    datasets: data["datasets"]
                },
                options: {
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Number of Incidents'
                            }
                        }],
                        xAxes:[{
                            scaleLabel: {
                                display: true,
                                labelString: 'Date'
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
                                return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + ' calls';
                            }
                        }
                    },
                    responsive: true
                }
            });
        },
        error: function(resp) {
            console.error("An error occurred when retrieving incidents per day data.");
        }
    });  
}

/**
 * Creates the Chart.js chart for average calls per hour chart.
 */
function createNeighborhoodTrendChart(data) {
    var ctx = $("#neighborhoodTrendsChart");

    // Remove top status layer of data
    data = data.data;

    // Create the Chart object
    neighborhoodTrendsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data["labels"],
            datasets: data["datasets"]
        },
        options: {
            scales: {
                yAxes: [{
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        min: 0,
                        max: data["limits"]["max"] + 2
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Total Number of Incidents'
                    }
                  }, {
                    id: "bar-y-axis",
                    stacked: true,
                    display: false, //optional
                    ticks: {
                      beginAtZero: true,
                      min: 0,
                      max: data["limits"]["max"] + 2
                    },
                    type: 'linear'
                }],
                xAxes:[{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                    ticks: {
                        autoSkip: false
                    }
                }],
            },
            responsive: true,
            title: {
                display: true,
                text: 'Incident Trends for ' + data['neighborhood_district'],
                fontSize: 16
            }
        }
    });

    var results = $("#trendResults");
    results.fadeIn();
}

// Call the createCharts function
createCharts();