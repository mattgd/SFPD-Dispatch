/**
 * Creates a data table row using the provided call and columns.
 * @param {*} call The call to extract data from.
 * @param {*} cols The table columns to fill.
 * @param {*} highlightCol The column to check for highlighting.
 */
function createTableDataRow(call, cols, highlightCol = undefined) {
    var context = '<tr>';

    if (highlightCol !== undefined) {
        // Highlights rows based on count
        var count = call[highlightCol];

        // Calculate context class for table row based on call count
        if (count > 10) {
            context = '<tr' + (count > 10 ? ' class="bg-danger">' : '>');
        } else if (count > 3) {
            context = '<tr' + (count > 2 ? ' class="bg-warning">' : '>');
        }
    }

    var html = context;

    // Create table columns
    for (var i = 0; i < cols.length; i++) {
        html += '<td>' + call[cols[i]] + '</td>';
    }

    return html + '</tr>';
}

/**
 * Sets up pagination for the provided tableSelector.
 * @param {*} tableSelector The jQuery selector object.
 * @param {*} data The data to put in the table.
 * @param {*} cols The table columns to fill.
 * @param {*} highlightCol The column to check for highlighting.
 */
function setupPagination(tableSelector, data, cols, highlightCol) {
    if (tableSelector === undefined) {
        console.log("An error occurred when trying to set up table pagination.");
        return;
    }

    tableSelector.pagination({
        dataSource: data,
        locator: 'data',
        pageSize: 20,
        prevText: 'Previous',
        nextText: 'Next',
        callback: function(data, pagination) {
            var htmlContent = '';

            // Get the table row content for each call
            for (var i = 0; i < data.length; i++) {
                call = data[i];

                // Add the call data to the table
                htmlContent += createTableDataRow(call, cols, highlightCol);
            }

            // Inject the HTML
            tableSelector.find('tbody').html(htmlContent);
        }
    });
}