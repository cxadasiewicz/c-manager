
"use strict";


module.exports = class ResourceIdentification {

	// Global names
	static get librariesName() { return "libraries"; }
	static get productImportsName() { return "imports"; }
	static get buildName() { return "build"; }

	static get publicInterfaceName() { return "public"; }

	// Global folders and paths
	static get librariesFolder() { return this.librariesName + "/"; }
	static get productImportsFolder() { return this.productImportsName + "/"; }
	static get buildFolder() { return this.buildName + "/"; }

	static get packageJSONPath() { return "package.json"; }

	// Bundle references
	static get bundleReferencePathPartSeparator() { return "."; }
	static get bundleReferencePublicInterfaceSuffix() { return this.bundleReferencePathPartSeparator + this.publicInterfaceName; }

	static bundleReferenceTargetsPublicInterface(reference) {
		return reference.endsWith(this.bundleReferencePublicInterfaceSuffix);
	}
	static pathOfBundleReference(reference) {
		if (!this.bundleReferenceTargetsPublicInterface(reference)) { return reference; }
		return reference.substring(0, reference.length - this.bundleReferencePublicInterfaceSuffix.length);
	}
	static partsOfBundleReferencePath(referencePath, limit = undefined) {
		return referencePath.split(this.bundleReferencePathPartSeparator, limit);
	}
	static finalPartOfBundleReference(reference) {
		const r = this.partsOfBundleReferencePath(this.pathOfBundleReference(reference));
		return r[r.length - 1];
	}
};
