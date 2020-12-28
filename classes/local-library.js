
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class LocalLibrary extends Library {

	constructor() {
		super();
		this.publishedBundlePath = "";
	}

	// Getting resource addresses

	get localLibraryPublishedBundlePath() { return this.publishedBundlePath; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.installPath));
		r = r.concat(ShellScripting.ensureDirectory(this.installFolder));
		r = r.concat(ShellScripting.linkPathToPath(this.installPath, this.publishedBundlePath));
		return r;
	}
};
