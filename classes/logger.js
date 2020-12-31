
"use strict";

const NodeUtilities = require("util");


module.exports = class Logger {

	static description(object) {
		let r = "<null>";
		if (typeof object == "number" || typeof object == "boolean") {
			r = object;
		} else if (object == "") {
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
					let rr;
					if (descriptionOverrides && key in descriptionOverrides) {
						rr = descriptionOverrides[key];
					} else {
						rr = object[key];
					}
					r[key] = this.description(rr);
				}
			}
		}
		return r;
	}

	static log(object) {
		console.log(NodeUtilities.inspect(this.description(object), false, null, true));
	}
};
