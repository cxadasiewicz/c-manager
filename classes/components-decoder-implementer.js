
"use strict";

const ComponentsDecoder = require("./components-decoder");


module.exports = class ComponentsDecoderImplementer extends ComponentsDecoder {

	static get componentsKey() { return "components"; }

	static get variableHeadToken() { return "[["; }
	static get variableTailToken() { return "]]"; }
	static get variableDefaultOption() { return "default"; }

	static get specSeparator() { return "|"; }

	constructor() {
		super();
		this.variables = {};
	}

	// Managing variables

	resolveVariables(string) {
		let r = string;
		for (const key of Object.keys(this.variables)) {
			r = r.split(ComponentsDecoderImplementer.variableHeadToken + key + ComponentsDecoderImplementer.variableTailToken).join(this.variables[key]);
		}
		return r;
	}

	defineVariable(key, value) {
		const _key = this.resolveVariables(key);
		const _value = this.resolveVariables(value);
		if (!_value.startsWith(ComponentsDecoderImplementer.variableDefaultOption + ComponentsDecoderImplementer.specSeparator)) {
			this.variables[_key] = _value;
		} else if (!(_key in this.variables)) {
			this.variables[_key] = _value.replace(ComponentsDecoderImplementer.variableDefaultOption + ComponentsDecoderImplementer.specSeparator, "");
		}
	}

	// Decoding components data

	decodeVariablesData(data) {
		if (data) {
			for (const [key, value] of Object.entries(data)) {
				this.defineVariable(key, value);
			}
		}
	}

	decodeJSONAsComponentsData(json) {
		return (json ? json[ComponentsDecoderImplementer.componentsKey] : null);
	}
};
