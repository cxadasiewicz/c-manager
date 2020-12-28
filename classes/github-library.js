
"use strict";

const Library = require("./library");
const ShellScripting = require("./shell-scripting");


module.exports = class GitHubLibrary extends Library {

	constructor() {
		super();
		this.publisherUsername = "";
		this.publishedBundleName = "";
		this.version = "";
		this.publishedTagPrefix = "";
		this.oauthToken = "";
	}

	// Getting resource addresses

	get archiveRemotePath() {
		return "https://"
			+ (this.oauthToken.length > 0 ? this.oauthToken + ":x-oauth-basic@" : "")
			+ "github.com/"
			+ this.publisherUsername
			+ "/"
			+ this.publishedBundleName
			+ "/archive/"
			+ this.publishedTagPrefix
			+ this.version
			+ ".zip";
	}
	get archiveCompressedName() { return this.publishedBundleName + "-download.zip"; }
	get archiveExpandedName() { return this.publishedBundleName + "-" + this.version; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.installPath));
		r = r.concat(ShellScripting.removeFile(this.installFolder + this.archiveCompressedName));
		r = r.concat(ShellScripting.removeDirectory(this.installFolder + this.archiveExpandedName));
		r = r.concat(ShellScripting.ensureDirectory(this.installFolder));
		r = r.concat(ShellScripting.downloadPathToPath(this.archiveRemotePath, this.installFolder + this.archiveCompressedName));
		r = r.concat(ShellScripting.unzipFileToDirectory(this.archiveCompressedName, this.installFolder));
		r = r.concat(ShellScripting.removeFile(this.installFolder + this.archiveCompressedName));
		r = r.concat(ShellScripting.movePathToPath(this.installFolder + this.archiveExpandedName, this.installPath));
		return r;
	}
};
