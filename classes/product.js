
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");
const Utilities = require("./utilities");


module.exports = class Product extends Bundle {

	constructor() {
		super();
		this.sortOrder = 0;
		this.publicName = "";
		this.productImports = {};
		this.buildingInstruction = null;
	}
	get descriptionTypeSuffix() { return "product"; }

	addProductImport(productImport) {
		productImport.parentProduct = this;
		productImport.sortOrder = Object.keys(this.productImports).length;
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

	get publicInstallPath() { return this.installPath + "/" + (this.buildingInstruction ? ResourceIdentification.buildFolder : "") + this.publicName; }
	get productImportsInstallFolder() { return this.installPath + "/" + ResourceIdentification.productImportsFolder; }

	// Generating installation scripts

	get shellScriptToInstallProductImports() {
		let r = [];
		const productImports = Utilities.sortValuesBySortOrder(this.productImports);
		if (productImports.length) {
			r = r.concat(ShellScripting.ensureDirectory(this.productImportsInstallFolder));
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
		r = r.concat(ShellScripting.removeDirectory(this.productImportsInstallFolder));
		for (const productImport of Utilities.sortValuesBySortOrder(this.productImports).reverse()) {
			for (const importLink of productImport.importLinks) {
				r = r.concat(ShellScripting.removeDirectory(importLink.aliasInstallFolder));
			}
		}
		return r;
	}
};
