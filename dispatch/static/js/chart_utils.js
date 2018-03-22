/**
 * Returns an Array of rgba colors to chart bar background colors.
 * @param {number} amount The number of colors to return (currently a max of 11).
 * @returns {string[]} An Array of rgba colors to chart bar background colors.
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
 * @param {number} amount The number of colors to return (currently a max of 11).
 * @returns {string[]} An Array of rgba colors to chart bar border colors.
 */
function getBorderColors(amount) {
    var borderColors = getBackgroundColors(amount);

    for (var i = 0; i < borderColors.length; i++) {
        color = borderColors[i];
        borderColors[i] = color.substr(0, color.length - 4) + '1)';
    }

    return borderColors;
}