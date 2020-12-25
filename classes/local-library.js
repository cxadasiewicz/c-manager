
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class LocalLibrary extends Library {

	constructor() {
		super();
		this.publishedBundlePath = "";
	}

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		let r = [];
		r = r.concat(ShellScripting.removeFolder(this.installPath));
		r = r.concat(ShellScripting.ensureFolder(this.installFolder));
		r = r.concat(ShellScripting.link(this.installPath, this.publishedBundlePath));
		return r;
	}
};
