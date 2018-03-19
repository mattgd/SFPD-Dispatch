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
                    }
                }
            });
        },
        error: function(resp) {
            console.log("An error occurred when retrieving average response time data.");
        }
    });  
}

// Call the createCharts function
createCharts();