
"use strict";

const FileLocations = require("./file-locations");
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
	get shellScriptToUninstallBuilds() {
		let r = [];
		r = r.concat(ShellScripting.removeFolder(this.parentProduct.publicInstallPath + "/"));
		r = r.concat(ShellScripting.removeEmptyFolder(this.parentProduct.installPath + "/" + FileLocations.buildsFolder));
		return r;
	}
};
