
"use strict";


module.exports = class ComponentsDecoder {

	static get _variableHead() { return "[["; }
	static get _variableTail() { return "]]"; }
	static get _variableDefault() { return "default"; }

	static get _specSeparator() { return "|"; }

	constructor() {
		this.variables = {};
	}

	// Managing variables

	resolveVariables(string) {
		let r = string;
		for (const key of Object.keys(this.variables)) {
			r = r.split(ComponentsDecoder._variableHead + key + ComponentsDecoder._variableTail).join(this.variables[key]);
		}
		return r;
	}

	defineVariable(key, value) {
		const _key = this.resolveVariables(key);
		const _value = this.resolveVariables(value);
		if (!_value.startsWith(ComponentsDecoder._variableDefault + ComponentsDecoder._specSeparator)) {
			this.variables[_key] = _value;
		} else if (!(_key in this.variables)) {
			this.variables[_key] = _value.replace(ComponentsDecoder._variableDefault + ComponentsDecoder._specSeparator, "");
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
