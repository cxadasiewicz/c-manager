
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

	// Installing libraries
	get installLibrariesTaskName() { return "install_" + this.name + "_libraries"; }
	get uninstallLibrariesTaskName() { return "uninstall_" + this.name + "_libraries"; }

	configureWorkspaceToInstallLibraries(workspace) {
		let installScript = [];
		for (const library of Object.values(this.libraries)) {
			installScript = installScript.concat(library.shellScriptToInstallLibrary);
		}
		workspace.addShellTask(this.installLibrariesTaskName, installScript);
		workspace.addShellTask(this.uninstallLibrariesTaskName, this.shellScriptToUninstallLibraries);
	}

	// Installing product imports
	get installProductImportsTaskName() { return "install_" + this.name + "_imports"; }
	get uninstallProductImportsTaskName() { return "uninstall_" + this.name + "_imports"; }

	configureWorkspaceToInstallProductImports(workspace) {
		let installScript = [];
		let uninstallScript = [];
		for (const product of Object.values(this.products)) {
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.addShellTask(this.installProductImportsTaskName, installScript);
		workspace.addShellTask(this.uninstallProductImportsTaskName, uninstallScript);
	}

	// Building products
	get uninstallBuildTaskName() { return "uninstall_" + this.name + "_build"; }

	configureWorkspaceToBuildProductsAndUninstallBuild(workspace) {
		let uninstallTasks = [];
		for (const product of Object.values(this.products)) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				buildingInstruction.configureWorkspaceToBuildProductAndUninstallBuild(workspace);
				uninstallTasks.push(buildingInstruction.uninstallBuildTaskName);
			}
		}
		workspace.addCompoundTask(this.uninstallBuildTaskName, uninstallTasks);
	}

	// All tasks
	configureWorkspaceTasks(workspace) {
		this.configureWorkspaceToInstallLibraries(workspace);
		this.configureWorkspaceToInstallProductImports(workspace);
		this.configureWorkspaceToBuildProductsAndUninstallBuild(workspace);
	}
};
