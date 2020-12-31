
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class Project extends Bundle {

	constructor() {
		super();
		this.products = {};
		this.libraries = {};
	}
	get descriptionTypeSuffix() { return "project"; }

	addProduct(product) {
		product.parentBundle = this;
		this.products[product.name] = product;
	}
	addLibrary(library) {
		library.parentBundle = this;
		this.libraries[library.name] = library;
	}

	// Dereferencing bundles

	bundleReferencedAs(reference) {
		const referencePath = ResourceIdentification.pathOfBundleReference(reference);
		let r;
		r = this.products[referencePath];
		if (r) { return r; }
		const referencePathParts = ResourceIdentification.partsOfBundleReferencePath(referencePath, 2);
		const library = this.libraries[referencePathParts[0]];
		if (library) {
			if (referencePathParts.length == 1) {
				return library
			} else {
				const libraryProject = library.libraryProject;
				if (libraryProject) {
					return libraryProject.bundleReferencedAs(referencePathParts[1]);
				}
			}
		}
		return null;
	}

	// Getting resource addresses

	get librariesInstallFolder() { return this.installPath + "/" + ResourceIdentification.librariesFolder; }

	// Generating installation scripts

	get shellScriptToUninstallLibraries() {
		return ShellScripting.removeDirectory(this.librariesInstallFolder);
	}

	// Configuring workspace tasks

	installTaskName(section) { return ResourceIdentification.installTaskName(this, section); }
	uninstallTaskName(section) { return ResourceIdentification.uninstallTaskName(this, section); }

	// Installing and uninstalling libraries
	configureWorkspaceToInstallAndUninstallLibraries(workspace) {
		let installScript = [];
		for (const library of Object.values(this.libraries)) {
			installScript = installScript.concat(library.shellScriptToInstallLibrary);
		}
		workspace.addShellTask(this.installTaskName(ResourceIdentification.librariesName), installScript);
		workspace.addShellTask(this.uninstallTaskName(ResourceIdentification.librariesName), this.shellScriptToUninstallLibraries);
	}

	// Installing and uninstalling product imports
	configureWorkspaceToInstallAndUninstallProductImports(workspace) {
		let installScript = [];
		let uninstallScript = [];
		for (const product of Object.values(this.products)) {
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.addShellTask(this.installTaskName(ResourceIdentification.productImportsName), installScript);
		workspace.addShellTask(this.uninstallTaskName(ResourceIdentification.productImportsName), uninstallScript);
	}

	// Building and cleaning products
	configureWorkspaceToBuildAndCleanProducts(workspace) {
		for (const product of Object.values(this.products)) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				buildingInstruction.configureWorkspaceToBuildAndCleanProduct(workspace);
			}
		}
	}

	// Convenience tasks
	configureWorkspaceToInstallAndUninstallAll(workspace) {
		workspace.addCompoundTask(this.installTaskName(), [
			this.installTaskName(ResourceIdentification.librariesName),
			this.installTaskName(ResourceIdentification.productImportsName)
		]);
		workspace.addCompoundTask(this.uninstallTaskName(), [
			this.uninstallTaskName(ResourceIdentification.productImportsName),
			this.uninstallTaskName(ResourceIdentification.librariesName)
		]);
	}

	configureWorkspaceConvenienceTasks(workspace) {
		this.configureWorkspaceToInstallAndUninstallAll(workspace);
	}

	// All tasks
	configureWorkspaceTasks(workspace) {
		this.configureWorkspaceToInstallAndUninstallLibraries(workspace);
		this.configureWorkspaceToInstallAndUninstallProductImports(workspace);
		this.configureWorkspaceToBuildAndCleanProducts(workspace);
		this.configureWorkspaceConvenienceTasks(workspace);
	}
};
