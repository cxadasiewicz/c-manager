
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

	static bundleReferencePointsToPublicInterface(reference) {
		return reference.endsWith(this.bundleReferencePublicInterfaceSuffix);
	}
	static pathOfBundleReference(reference) {
		if (!this.bundleReferencePointsToPublicInterface(reference)) { return reference; }
		return reference.substring(0, reference.length - this.bundleReferencePublicInterfaceSuffix.length);
	}
	static partsOfBundleReferencePath(referencePath, limit = undefined) {
		return referencePath.split(this.bundleReferencePathPartSeparator, limit);
	}
	static finalPartOfBundleReference(reference) {
		const r = this.partsOfBundleReferencePath(this.pathOfBundleReference(reference));
		return r[r.length - 1];
	}

	// Workspace tasks
	static get taskNameSeparator() { return "_"; }
	static get globalTaskSuffix() { return "-all"; }
	static taskName(action, component, section) {
		return action + (component ? this.taskNameSeparator + component.name : this.globalTaskSuffix) + (section ? this.taskNameSeparator + section : "");
	}

	static installTaskName(component, section) { return this.taskName("install", component, section); }
	static uninstallTaskName(component, section) { return this.taskName("uninstall", component, section); }
	static buildTaskName(component) { return this.taskName("build", component); }
	static makeTaskName(component) { return this.taskName("make", component); }
	static cleanTaskName(component) { return this.taskName("clean", component); }
};
