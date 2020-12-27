
"use strict";


module.exports = class ProductImport {

	constructor() {
		this.parentProduct = null;
		this.importedBundle = null;
		this.importLinks = [];
	}

	addImportLink(importLink) {
		importLink.parentImport = this;
		this.importLinks.push(importLink);
	}

	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null),
			"importedBundle": (this.importedBundle ? this.importedBundle.name : null)
		};
	}

	// Getting resource addresses

	get name() { return this.importedBundle.name; }
	get aliasInstallPath() { return this.parentProduct.importsInstallFolder + this.name; }
	get targetInstallPath() { return this.importedBundle.publicInstallPath; }
};
