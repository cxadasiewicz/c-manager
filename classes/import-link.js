
"use strict";

const FileLocations = require("./file-locations");


module.exports = class ImportLink {

	constructor() {
		this.parentImport = null;
		this.aliasFolderReference = "";
		this.targetSubpath = "";
	}
	get descriptionOverrides() {
		return {
			"parentImport": (this.parentImport ? this.parentImport.importedBundleReference : null)
		};
	}

	// Getting resource addresses

	get aliasFolder() {
		let r = this.aliasFolderReference;
		if (r == FileLocations.publicInterface || r.startsWith(FileLocations.publicInterface + "/")) {
			const publicName = this.parentImport.parentProduct.publicName;
			if (publicName) {
				r = r.replace(FileLocations.publicInterface, publicName);
				if (r == publicName) {
					r += "/";
				}
			}
		}
		return r;
	}

	get aliasInstallFolder() { return this.parentImport.parentProduct.installPath + "/" + this.aliasFolder + FileLocations.importsFolder; }
	get aliasInstallPath() { return this.aliasInstallFolder + this.parentImport.importedBundleName; }
	get targetInstallPath() { return this.parentImport.aliasInstallPath + "/" + this.targetSubpath; }
};
