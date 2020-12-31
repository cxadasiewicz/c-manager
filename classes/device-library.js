
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class DeviceLibrary extends Library {

	constructor(config) {
		super(config);
		this.publishedBundleLocalInstallPath = config.publishedBundleLocalInstallPath;
	}

	get deviceLocalInstallPath() { return this.publishedBundleLocalInstallPath; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		return ShellScripting.linkAliasPathInFolderToSourcePath(
			this.installPath,
			this.installFolder,
			this.parentBundle.installPath + "/" + this.publishedBundleLocalInstallPath
		);
	}
};
