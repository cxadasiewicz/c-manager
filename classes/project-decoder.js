
"use strict";


module.exports = class ProjectDecoder {

	get _variableHead() { return "[["; }
	get _variableTail() { return "]]"; }

	constructor() {
		this.variables = {};
	}

	// Managing variables

	resolveVariables(string) {
		let r = string;
		for (const key of Object.keys(this.variables)) {
			r = r.split(this._variableHead + key + this._variableTail).join(this.variables[key]);
		}
		return r;
	}

	// Decoding components

	componentsDataFrom(data) { }
	addComponentsDataToProject(data, project) { }
}
