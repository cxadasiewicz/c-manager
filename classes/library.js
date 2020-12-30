
"use strict";

const Bundle = require("./bundle");
const ResourceLocations = require("./resource-locations");


module.exports = class Library extends Bundle {

	constructor() {
		super();
		this.localInstallFolder = ResourceLocations.librariesFolder;
		this.libraryProject = null;
	}
	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["libraryProject"] = (this.libraryProject ? this.libraryProject.name : null);
		return r;
	}

	get parentProject() { return this.parentBundle; }

	// Generating installation scripts

	get shellScriptToInstallLibrary() { }
};
