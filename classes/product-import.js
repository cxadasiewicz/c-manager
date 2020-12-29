
"use strict";

const Project = require("./project");


module.exports = class ProductImport {

	constructor() {
		this.parentProduct = null;
		this.importedBundleReference = "";
		this.importLinks = [];
	}
	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null)
		};
	}

	addImportLink(importLink) {
		importLink.parentImport = this;
		this.importLinks.push(importLink);
	}

	get importedBundleName() { return Project.finalPartOfBundleReference(this.importedBundleReference); }
	get importedBundleTargetsPublicInterface() { return Project.bundleReferenceTargetsPublicInterface(this.importedBundleReference); }

	// Dereferencing the imported bundle

	get importedBundle() { return this.parentProduct.parentProject.bundleReferencedAs(this.importedBundleReference); }

	// Getting resource addresses

	get aliasInstallPath() { return this.parentProduct.importsInstallFolder + this.importedBundleName; }
	get targetInstallPath() { return (!this.importedBundleTargetsPublicInterface ? this.importedBundle.installPath : this.importedBundle.publicInstallPath); }
};
