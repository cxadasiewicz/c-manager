
"use strict";

const CloudLibrary = require("./cloud-library");


module.exports = class GitHubLibrary extends CloudLibrary {

	constructor(config) {
		super(config);
		this.publisherUsername = config.publisherUsername;
		this.publishedTagPrefix = config.publishedTagPrefix;
		this.oauthToken = config.oauthToken;
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
