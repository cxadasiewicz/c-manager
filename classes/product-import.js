
"use strict";

const Project = require("./project");


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

	get importedBundleName() { return Project.finalBundleNameOfReference(this.importedBundleReference); }
	get aliasInstallPath() { return this.parentProduct.importsInstallFolder + this.importedBundleName; }
	get targetInstallPath() { return (!Project.bundleReferenceTargetsPublicInterface(this.importedBundleReference) ? this.importedBundle.installPath : this.importedBundle.publicInstallPath); }
};
