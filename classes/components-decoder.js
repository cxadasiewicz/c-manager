
"use strict";


module.exports = class ComponentsDecoder {

	static get variableHeadToken() { return "[["; }
	static get variableTailToken() { return "]]"; }
	static get variableDefaultOption() { return "default"; }

	static get specSeparator() { return "|"; }

	constructor() {
		this.variables = {};
	}

	// Managing variables

	resolveVariables(string) {
		let r = string;
		for (const key of Object.keys(this.variables)) {
			r = r.split(ComponentsDecoder.variableHeadToken + key + ComponentsDecoder.variableTailToken).join(this.variables[key]);
		}
		return r;
	}

	defineVariable(key, value) {
		const _key = this.resolveVariables(key);
		const _value = this.resolveVariables(value);
		if (!_value.startsWith(ComponentsDecoder.variableDefaultOption + ComponentsDecoder.specSeparator)) {
			this.variables[_key] = _value;
		} else if (!(_key in this.variables)) {
			this.variables[_key] = _value.replace(ComponentsDecoder.variableDefaultOption + ComponentsDecoder.specSeparator, "");
		}
	}

	addVariablesData(data) {
		if (!data) { return }
		for (const [key, value] of Object.entries(data)) {
			this.defineVariable(key, value);
		}
	}

	// Decoding components

	componentsDataFrom(data) {
		return null;
	}
	addComponentsDataToProject(data, project) { }
};
