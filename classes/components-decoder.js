
"use strict";


module.exports = class ComponentsDecoder {

	get _variableHead() { return "[["; }
	get _variableTail() { return "]]"; }
	get _variableDefault() { return "default"; }

	get _specSeparator() { return "|"; }

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

	defineVariable(key, value) {
		const _key = this.resolveVariables(key);
		const _value = this.resolveVariables(value);
		if (!_value.startsWith(this._variableDefault + this._specSeparator)) {
			this.variables[_key] = _value;
		} else if (!(_key in this.variables)) {
			this.variables[_key] = _value.replace(this._variableDefault + this._specSeparator, "");
		}
	}

	addVariablesData(data) {
		if (!data) { return }
		for (const [key, value] of Object.entries(data)) {
			this.defineVariable(key, value);
		}
	}

	// Decoding components

	componentsDataFrom(data) { }
	addComponentsDataToProject(data, project) { }
};
