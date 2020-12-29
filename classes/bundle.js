
"use strict";


module.exports = class Bundle {

	constructor() {
		this.name = "";
		this.localInstallFolder = "";
		this.parentBundle = null;
	}
	get descriptionOverrides() {
		return {
			"parentBundle": (this.parentBundle ? this.parentBundle.name : null)
		};
	}

	// Getting resource addresses

	get installFolder() { return (this.parentBundle ? this.parentBundle.installPath + "/" : "") + this.localInstallFolder; }
	get installPath() { return this.installFolder + this.name; }
	get publicInstallPath() { return this.installPath; }
};
