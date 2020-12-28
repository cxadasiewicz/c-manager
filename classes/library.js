
"use strict";

const Bundle = require("./bundle");
const FileLocations = require("./file-locations");


module.exports = class Library extends Bundle {

	constructor() {
		super();
		this.localInstallFolder = FileLocations.librariesFolder;
		this.libraryProject = null;
	}

	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["libraryProject"] = (this.libraryProject ? this.libraryProject.name : null);
		return r;
	}

	// Generating installation scripts

	get shellScriptToInstallLibrary() { }
};
