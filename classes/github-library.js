
"use strict";

const CloudLibrary = require("./cloud-library");


module.exports = class GitHubLibrary extends CloudLibrary {

	constructor() {
		super();
		this.publisherUsername = "";
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
};
