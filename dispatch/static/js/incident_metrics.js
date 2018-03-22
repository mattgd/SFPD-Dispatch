/**
 * Generates the metrics charts for the dispatch data.
 */
function createCharts() {
    // Create the chart for incidents per day per neighborhood
    createIncidentsPerDayChart();
}

/**
 * Retrieves data for a creates the Chart.js
 * chart for incidents per day chart.
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
 * Creates the Chart.js chart for the neighborhood trends chart.
 * @param {Object} data The JSON data for the chart.
 */
function createNeighborhoodTrendChart(data) {
    var ctx = $("#neighborhoodTrendsChart");

    // Remove top status layer of data
    data = data.data;

    // The chart instance
    var chart = window.neighTrendsChart;
    
    if (chart && chart != null) {
        // Update the existing Chart object
        chart.data = {
            labels: data["labels"],
            datasets: data["datasets"]
        };
        
        // Update limits
        chart.options.scales.yAxes[0].ticks.max = data["limits"]["max"] + 2;
        chart.options.scales.yAxes[1].ticks.max  = data["limits"]["max"] + 2;

        chart.update();
    } else {
        // Create the Chart object
        window.neighTrendsChart = new Chart(ctx, {
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
    }

    var results = $("#trendResults");
    results.fadeIn();
}

createCharts(); // Call the createCharts function to load the charts

/** BEGIN CODE FOR NEIGHBORHOOD TREND FORM **/
// Cache for the data to reduce POST request count
var neighborhoodData = {};

/**
 * Event listener for the neighborhood trend form to get the data
 * and generate the chart.
 */
$("#neighborhoodTrendForm").submit(function(e) {
    var endpoint = '/api/metrics/neighborhood-trends';
    var form = $(this);

    // Check the cache for the data
    var neighborhood = form.find('#neighborhood').val();
    if (neighborhoodData[neighborhood] !== undefined) {
        // Generate neighborhood trend chart
        createNeighborhoodTrendChart(neighborhoodData[neighborhood]);
    } else {
        $.ajax({
            method: "POST",
            url: endpoint,
            data: form.serialize(),
            success: function(data) {
                // Cache the data
                neighborhoodData[neighborhood] = data;

                // Generate neighborhood trend chart
                createNeighborhoodTrendChart(data);
            },
            error: function(resp) {
                console.error('An error occurred when retrieving neighborhood trend data.');
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
$('#neighborhood').change(function() {
    // Display the example trend text if Sunset/Parkside is selected.
    if ($(this).val() == 'Sunset/Parkside') {
        $('#trendExample').fadeIn();
    } else if ($('#trendExample').is(':visible')) {
        $('#trendExample').fadeOut();
    }

    // Submit the form to show example data
    $("#neighborhoodTrendForm").submit();
});

/**
 * Populates the list of neighborhoods in the
 * neighborhoodTrendForm for user selection.
 */
 function populateNeighborhoodList() {
    var endpoint = '/api/calls/neighborhoods';
    
    $.ajax({
        method: "GET",
        url: endpoint,
        success: function(data) {
            // Remove top status layer of data
            data = data.data;

            var neigh; // Holds the name of the neighborhood
            var optionHtml; // The option HTML element
            for (var i = 0; i < data.length; i++) {
                neigh = data[i];
                
                // Pre-select Sunset/Parkside for example
                if (neigh != 'Sunset/Parkside') {
                    optionHtml = '<option value="' + neigh + '">' + neigh + '</option>';
                } else {
                    optionHtml = '<option value="' + neigh + '" selected>' + neigh + '</option>';
                }
                
                // Add to the select element
                $('#neighborhood').append(optionHtml);
            }
            
            // Submit the form to show example data
            $("#neighborhoodTrendForm").submit();
        },
        error: function(resp) {
            console.error('An error occurred when retrieving the neighborhood list.');
        }
    });
}

// Populates the neighborhood list in the neighborhoodTrendForm
populateNeighborhoodList();

/**
 * Initializes the safest neighborhoods table.
 */
function initIncidentTables() {
    // Retrieves the longest average dispatch time data,
    // and initializes the longest-dispatch heatmap.
    var endpoint = '/api/calls/safest-neighborhoods';
    $.ajax({
        method: 'GET',
        url: endpoint,
        success: function(data) {
            // Setup pagination for the average safest neighborhoods table
            // The columns in the table
            var cols = ['neighborhood_district', 'incidents', 'calls'];
            loadTableData($('#incidentTable'), data, cols);

            // Setup table sorting
            $('#incidentTable').tablesorter(
                getSorterOptions([[1,0]])
            ).tablesorterPager(getPagerOptions($('#incidentTablePager')));
        },
        error: function(resp) {
            console.error("An error occured when retrieving safest neighborhoods data.");
        }
    });
}

// Initializes the incident tables
initIncidentTables();