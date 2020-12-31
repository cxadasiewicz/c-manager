
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class Product extends Bundle {

	constructor() {
		super();
		this.publicName = "";
		this.productImports = {};
		this.buildingInstruction = null;
	}
	get descriptionTypeSuffix() { return "product"; }

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

	get publicInstallPath() { return this.installPath + "/" + (this.buildingInstruction ? ResourceIdentification.buildFolder : "") + this.publicName; }
	get productImportsInstallFolder() { return this.installPath + "/" + ResourceIdentification.productImportsFolder; }

	// Generating installation scripts

	get shellScriptToInstallProductImports() {
		let r = [];
		for (const productImport of Object.values(this.productImports)) {
			r = r.concat(productImport.shellScriptToInstallProductImport);
		}
		return r;
	}
	get shellScriptToUninstallProductImports() {
		let r = [];
		r = r.concat(ShellScripting.remove(this.productImportsInstallFolder));
		for (const productImport of Object.values(this.productImports)) {
			r = r.concat(productImport.shellScriptToUninstallProductImport);
		}
		return r;
	}
};
