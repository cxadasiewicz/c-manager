
"use strict";


module.exports = class ProductImport {

	constructor() {
		this.parentProduct = null;
		this.importedBundleReference = "";
		this.importLinks = [];
	}

	addImportLink(importLink) {
		importLink.parentImport = this;
		this.importLinks.push(importLink);
	}

	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null)
		};
	}

	get importedBundle() { return this.parentProduct.parentProject.bundleReferencedAs(this.importedBundleReference); }

	// Getting resource addresses

	get importedBundleName() {
		let r = this.importedBundleReference.split(".");
		return r[r.length - 1];
	}
	get aliasInstallPath() { return this.parentProduct.importsInstallFolder + this.importedBundleName; }
	get targetInstallPath() { return this.importedBundle.publicInstallPath; }
};
