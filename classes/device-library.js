
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class DeviceLibrary extends Library {

	constructor() {
		super();
		this.publishedBundlePath = "";
	}

	get deviceBundlePath() { return this.publishedBundlePath; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		return ShellScripting.linkAliasPathInFolderToSourcePath(
			this.installPath,
			this.installFolder,
			this.parentBundle.installPath + "/" + this.publishedBundlePath
		);
	}
};
