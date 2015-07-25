'use strict';
var colorConvert = require('color-convert');

function wrapAnsi16(fn, offset) {
	return function () {
		var code = fn.apply(colorConvert, arguments);
		return '\u001b[' + (code + offset) + 'm';
	};
}

function wrapAnsi256(fn, offset) {
	return function () {
		var code = fn.apply(colorConvert, arguments);
		return '\u001b[' + (38 + offset) + ';5;' + code + 'm';
	};
}

function wrapAnsi16m(fn, offset) {
	return function () {
		var rgb = fn.apply(colorConvert, arguments);
		return '\u001b[' + (38 + offset) + ';2;' +
			rgb[0] + ';' + rgb[1] + ';' + rgb[2] + 'm';
	};
}

function assembleStyles () {
	var styles = {
		modifiers: {
			reset: [0, 0],
			bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		colors: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39]
		},
		bgColors: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49]
		}
	};

	// fix humans
	styles.colors.grey = styles.colors.gray;

	Object.keys(styles).forEach(function (groupName) {
		var group = styles[groupName];

		Object.keys(group).forEach(function (styleName) {
			var style = group[styleName];

			styles[styleName] = group[styleName] = {
				open: '\u001b[' + style[0] + 'm',
				close: '\u001b[' + style[1] + 'm'
			};
		});

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	});

	styles.color = {
		ansi16: {},
		ansi256: {},
		ansi16m: {}
	};

	styles.bgColor = {
		ansi16: {},
		ansi256: {},
		ansi16m: {}
	};

	for (var key in colorConvert) {
		var fn = colorConvert[key];
		var conversion = key.replace(/^([^2]+).+$/, '$1');
		if (/2ansi16$/.test(key)) {
			styles.color.ansi16[conversion] = wrapAnsi16(fn, 0);
			styles.bgColor.ansi16[conversion] = wrapAnsi16(fn, 10);
			continue;
		}
		if (/2ansi$/.test(key)) {
			styles.color.ansi256[conversion] = wrapAnsi256(fn, 0);
			styles.bgColor.ansi256[conversion] = wrapAnsi256(fn, 10);
			continue;
		}
		if (/2rgb$/.test(key)) {
			styles.color.ansi16m[conversion] = wrapAnsi16m(fn, 0);
			styles.bgColor.ansi16m[conversion] = wrapAnsi16m(fn, 10);
			continue;
		}
	}

	return styles;
}

Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
