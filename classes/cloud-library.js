
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class CloudLibrary extends Library {

	constructor(config) {
		super(config);
		this.publishedBundleName = config.publishedBundleName;
		this.version = config.version;
	}

	// Getting resource addresses

	get archiveRemotePath() { return ""; }
	get archiveCompressedName() { return this.publishedBundleName + "-download.zip"; }
	get archiveExpandedName() { return this.publishedBundleName + "-" + this.version; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		return ShellScripting.downloadToPathInFolderFromPathAndUnzipFromNameToName(
			this.installPath,
			this.installFolder,
			this.archiveRemotePath,
			this.archiveCompressedName,
			this.archiveExpandedName
		);
	}
};
