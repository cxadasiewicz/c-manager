
"use strict";

const ResourceIdentification = require("./resource-identification");


module.exports = class ProductImport {

	constructor() {
		this.parentProduct = null;
		this.importedBundleReference = "";
		this.importLinks = [];
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
		this.importLinks.push(importLink);
	}

	get importedBundleName() { return ResourceIdentification.finalPartOfBundleReference(this.importedBundleReference); }
	get importedBundleTargetsPublicInterface() { return ResourceIdentification.bundleReferenceTargetsPublicInterface(this.importedBundleReference); }

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

	// Getting resource addresses

	get aliasInstallPath() { return this.parentProduct.productImportsInstallFolder + this.importedBundleName; }
	get targetInstallPath() { return (!this.importedBundleTargetsPublicInterface ? this.importedBundle.installPath : this.importedBundle.publicInstallPath); }
};
