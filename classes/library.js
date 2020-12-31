
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");


module.exports = class Library extends Bundle {

	constructor(config) {
		super({
			name: config.name,
			localInstallFolder: ResourceIdentification.librariesFolder
		});
		this.libraryProject = null;
	}
	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["libraryProject"] = (this.libraryProject ? this.libraryProject.name : null);
		return r;
	}

	get parentProject() { return this.parentBundle; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() {
		return [];
	}
};
