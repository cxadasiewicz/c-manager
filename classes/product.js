
"use strict";

const Bundle = require("./bundle");
const ResourceLocations = require("./resource-locations");
const ShellScripting = require("./shell-scripting");


module.exports = class Product extends Bundle {

	constructor() {
		super();
		this.publicName = "";
		this.productImports = {};
		this.buildingInstruction = null;
	}

	addProductImport(productImport) {
		productImport.parentProduct = this;
		this.productImports[productImport.importedBundleReference] = productImport;
	}
	setBuildingInstruction(buildingInstruction) {
		if (this.buildingInstruction) {
			this.buildingInstruction.parentProduct = null;
		}
		buildingInstruction.parentProduct = this;
		this.buildingInstruction = buildingInstruction;
	}

	get parentProject() { return this.parentBundle; }

	// Getting resource addresses

	get publicInstallPath() { return this.installPath + "/" + (this.buildingInstruction ? ResourceLocations.buildFolder : "") + this.publicName; }
	get importsInstallFolder() { return this.installPath + "/" + ResourceLocations.importsFolder; }

	// Generating installation scripts

	get shellScriptToInstallProductImports() {
		let r = [];
		const productImports = Object.values(this.productImports);
		if (productImports.length) {
			r = r.concat(ShellScripting.ensureDirectory(this.importsInstallFolder));
			for (const productImport of productImports) {
				if (productImport.importedBundleTargetsPublicInterface) {
					r = r.concat(ShellScripting.ensureDirectory(productImport.importedBundle.publicInstallPath));
				}
				r = r.concat(ShellScripting.removeFile(productImport.aliasInstallPath));
				r = r.concat(ShellScripting.linkPathToPath(productImport.aliasInstallPath, productImport.targetInstallPath));
				for (const importLink of productImport.importLinks) {
					r = r.concat(ShellScripting.removeFile(importLink.aliasInstallPath));
					r = r.concat(ShellScripting.ensureDirectory(importLink.aliasInstallFolder));
					r = r.concat(ShellScripting.linkPathToPath(importLink.aliasInstallPath, importLink.targetInstallPath));
				}
			}
		}
		return r;
	}
	get shellScriptToUninstallProductImports() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.importsInstallFolder));
		for (const productImport of Object.values(this.productImports)) {
			for (const importLink of productImport.importLinks) {
				r = r.concat(ShellScripting.removeDirectory(importLink.aliasInstallFolder));
			}
		}
		return r;
	}
};
