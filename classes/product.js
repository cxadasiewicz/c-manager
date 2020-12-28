
"use strict";

const Bundle = require("./bundle");
const FileLocations = require("./file-locations");
const ShellScripting = require("./shell-scripting");


module.exports = class Product extends Bundle {

	constructor() {
		super();
		this.publicName = "";
		this.productImports = {};
		this.buildInfo = null;
	}

	addProductImport(productImport) {
		productImport.parentProduct = this;
		this.productImports[productImport.name] = productImport;
	}
	setBuildInfo(buildInfo) {
		if (this.buildInfo) {
			this.buildInfo.parentProduct = null;
		}
		buildInfo.parentProduct = this;
		this.buildInfo = buildInfo;
	}

	// Getting resource addresses

	get publicInstallPath() { return this.installPath + "/" + (this.buildInfo ? FileLocations.buildFolder : "") + this.publicName; }
	get importsInstallFolder() { return this.installPath + "/" + FileLocations.importsFolder; }

	// Generating installation scripts

	get shellScriptToInstallProductImports() {
		let r = [];
		const productImports = Object.values(this.productImports);
		if (productImports.length) {
			r = r.concat(ShellScripting.ensureDirectory(this.importsInstallFolder));
			for (const productImport of productImports) {
				r = r.concat(ShellScripting.removeFile(productImport.aliasInstallPath));
				r = r.concat(ShellScripting.linkPathToPath(productImport.aliasInstallPath, productImport.targetInstallPath));
				for (const importLink of productImport.importLinks) {
					r = r.concat(ShellScripting.removeFile(importLink.aliasInstallPath));
					const importedBundle = productImport.importedBundle;
					if (importedBundle.buildInfo) {
						r = r.concat(ShellScripting.ensureDirectory(importedBundle.publicInstallPath));
					}
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
