
"use strict";

const FileLocations = require("./file-locations");
const ShellScripting = require("./shell-scripting");


module.exports = class BuildingInstruction {

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
		return ShellScripting.removeAllInFolder(this.parentProduct.publicInstallPath + "/");
	}
	get shellScriptToUninstallBuild() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.parentProduct.publicInstallPath));
		r = r.concat(ShellScripting.removeEmptyDirectory(this.parentProduct.installPath + "/" + FileLocations.buildFolder));
		return r;
	}
};
