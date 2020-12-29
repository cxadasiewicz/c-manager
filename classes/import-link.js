
"use strict";

const FileLocations = require("./file-locations");


module.exports = class ImportLink {

	constructor() {
		this.parentImport = null;
		this.aliasFolder = "";
		this.targetSubpath = "";
	}

	get descriptionOverrides() {
		return {
			"parentImport": (this.parentImport ? this.parentImport.importedBundleReference : null)
		};
	}

	// Getting resource addresses

	get aliasInstallFolder() { return this.parentImport.parentProduct.installPath + "/" + this.aliasFolder + FileLocations.importsFolder; }
	get aliasInstallPath() { return this.aliasInstallFolder + this.parentImport.importedBundleName; }
	get targetInstallPath() { return this.parentImport.aliasInstallPath + "/" + this.targetSubpath; }
};
