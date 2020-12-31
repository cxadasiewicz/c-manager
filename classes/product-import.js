
"use strict";

const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class ProductImport {

	constructor() {
		this.parentProduct = null;
		this.importedBundleReference = "";
		this.importLinks = {};
		this._importedBundleCache = undefined;
	}
	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null),
			"_importedBundleCache": (this._importedBundleCache ? this._importedBundleCache.name : this._importedBundleCache)
		};
	}

	addImportLink(importLink) {
		importLink.parentImport = this;
		this.importLinks[importLink.aliasFolderReference] = importLink;
	}

	get importedBundleName() { return ResourceIdentification.finalPartOfBundleReference(this.importedBundleReference); }
	get importedBundleReferencePointsToPublicInterface() { return ResourceIdentification.bundleReferencePointsToPublicInterface(this.importedBundleReference); }

	// Getting the imported bundle

	dereferenceImportedBundle() {
		return this.parentProduct.parentProject.bundleReferencedAs(this.importedBundleReference);
	}
	get importedBundle() {
		if (this._importedBundleCache == undefined) {
			this._importedBundleCache = this.dereferenceImportedBundle();
		}
		return this._importedBundleCache;
	}

	get importedBundleIsProductBuild() {
		const importedBundle = this.importedBundle;
		if (importedBundle) {
			return importedBundle.buildingInstruction && this.importedBundleReferencePointsToPublicInterface;
		}
		return false;
	}

	// Getting resource addresses

	get aliasFolder() { return this.parentProduct.productImportsInstallFolder; }
	get aliasInstallPath() { return this.aliasFolder + this.importedBundleName; }
	get sourceInstallPath() { return (!this.importedBundleReferencePointsToPublicInterface ? this.importedBundle.installPath : this.importedBundle.publicInstallPath); }

	// Generating installation scripts

	get shellScriptToInstallProductImport() {
		let r = [];
		if (this.importedBundleIsProductBuild) {
			r = r.concat(ShellScripting.ensureDirectory(this.importedBundle.publicInstallPath));
		}
		r = r.concat(ShellScripting.linkAliasPathInFolderToSourcePath(
			this.aliasInstallPath,
			this.aliasFolder,
			this.sourceInstallPath
		));
		for (const importLink of Object.values(this.importLinks)) {
			r = r.concat(importLink.shellScriptToInstallImportLink);
		}
		return r;
	}
	get shellScriptToUninstallProductImport() {
		let r = [];
		for (const importLink of Object.values(this.importLinks)) {
			r = r.concat(importLink.shellScriptToUninstallImportLink);
		}
		return r;
	}
};
