
"use strict";


module.exports = class Utilities {

	// Sorting
	static sortBySortOrder(array) {
		return array.slice().sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : -1);
	}
	static sortValuesBySortOrder(object) {
		return this.sortBySortOrder(Object.values(object));
	}
};
