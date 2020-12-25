
"use strict";

const Bundle = require("./bundle");
const FileLocations = require("./file-locations");


module.exports = class Library extends Bundle {

	constructor() {
		super();
		this.localInstallFolder = FileLocations.librariesFolder;
	}

	// Generating installation scripts

	get shellScriptToInstallLibrary() { }
};
