
"use strict";


module.exports = class Bundle {

	constructor(config) {
		this.name = config.name;
		this.localInstallFolder = config.localInstallFolder;
		this.parentBundle = config.parentBundle;
	}
	get descriptionOverrides() {
		return {
			"parentBundle": (this.parentBundle ? this.parentBundle.name : null)
		};
	}

	// Getting resource addresses

	get localInstallPath() { return this.localInstallFolder + this.name; }

	get installFolder() { return (this.parentBundle ? this.parentBundle.installPath + "/" : "") + this.localInstallFolder; }
	get installPath() { return this.installFolder + this.name; }

	get publicInstallPath() { return this.installPath; }
};
