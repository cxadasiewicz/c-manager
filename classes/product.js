
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
		const productImportKeys = Object.keys(this.productImports);
		if (productImportKeys.length) {
			r = r.concat(ShellScripting.ensureFolder(this.importsInstallFolder));
			for (const importKey of productImportKeys) {
				const productImport = this.productImports[importKey];
				r = r.concat(ShellScripting.removeFile(productImport.aliasInstallPath));
				r = r.concat(ShellScripting.link(productImport.aliasInstallPath, productImport.targetInstallPath));
				for (const importLink of productImport.importLinks) {
					r = r.concat(ShellScripting.removeFile(importLink.aliasInstallPath));
					const importedBundle = productImport.importedBundle;
					if (importedBundle.buildInfo) {
						r = r.concat(ShellScripting.ensureFolder(importedBundle.publicInstallPath));
					}
					r = r.concat(ShellScripting.ensureFolder(importLink.aliasInstallFolder));
					r = r.concat(ShellScripting.link(importLink.aliasInstallPath, importLink.targetInstallPath));
				}
			}
		}
		return r;
	}
	get shellScriptToUninstallProductImports() {
		let r = [];
		r = r.concat(ShellScripting.removeFolder(this.importsInstallFolder));
		for (const importKey of Object.keys(this.productImports)) {
			for (const importLink of this.productImports[importKey].importLinks) {
				r = r.concat(ShellScripting.removeFolder(importLink.aliasInstallFolder));
			}
		}
		return r;
	}
};
