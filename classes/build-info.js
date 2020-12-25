
"use strict";

const ShellScripting = require("./shell-scripting");


module.exports = class BuildInfo {

	constructor() {
		this.parentProduct = null;
		this.makefuncName = "";
	}

	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null)
		};
	}

	// Generating build scripts

	get shellScriptToCleanBuild() {
		return ShellScripting.removeAll(this.parentProduct.publicInstallPath + "/");
	}
};
