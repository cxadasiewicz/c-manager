
"use strict";

const Utilities = require("util");


module.exports = class Logger {

	static description(object) {
		let r = "<null>";
		if (object == "") {
			r = "";
		} else if (object) {
			if (typeof object == "string") {
				r = object.split("&&");
				if (r.length == 1) {
					return r[0];
				} else {
					return r;
				}
			} else if (Array.isArray(object)) {
				r = [];
				for (const member of object) {
					r.push(this.description(member));
				}
			} else {
				r = {};
				const descriptionOverrides = object.descriptionOverrides;
				for (const key of Object.keys(object)) {
					if (descriptionOverrides && key in descriptionOverrides) {
						r[key] = this.description(descriptionOverrides[key]);
					} else {
						r[key] = this.description(object[key]);
					}
				}
			}
		}
		return r;
	}

	static log(object) {
		console.log(Utilities.inspect(this.description(object), false, null));
	}
};
