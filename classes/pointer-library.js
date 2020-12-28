
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class PointerLibrary extends Library {

	constructor() {
		super();
		this.pointedBundlePath = "";
	}

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.installPath));
		r = r.concat(ShellScripting.ensureDirectory(this.installFolder));
		r = r.concat(ShellScripting.linkPathToPath(this.installPath, this.parentBundle.installPath + "/" + this.pointedBundlePath));
		return r;
	}
};
