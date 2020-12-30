
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

	installComponentsTaskName(section) {
		return "install_" + this.name + (section ? "_" + section : "");
	}
	uninstallComponentsTaskName(section) {
		return "uninstall_" + this.name + (section ? "_" + section : "");
	}

	// Installing libraries
	configureWorkspaceToInstallLibraries(workspace) {
		let installScript = [];
		for (const library of Object.values(this.libraries)) {
			installScript = installScript.concat(library.shellScriptToInstallLibrary);
		}
		workspace.addShellTask(this.installComponentsTaskName(ResourceIdentification.librariesName), installScript);
		workspace.addShellTask(this.uninstallComponentsTaskName(ResourceIdentification.librariesName), this.shellScriptToUninstallLibraries);
	}

	// Installing product imports
	configureWorkspaceToInstallProductImports(workspace) {
		let installScript = [];
		let uninstallScript = [];
		for (const product of Object.values(this.products)) {
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.addShellTask(this.installComponentsTaskName(ResourceIdentification.productImportsName), installScript);
		workspace.addShellTask(this.uninstallComponentsTaskName(ResourceIdentification.productImportsName), uninstallScript);
	}

	// Building products
	configureWorkspaceToBuildProductsAndUninstallBuild(workspace) {
		let uninstallTasks = [];
		for (const product of Object.values(this.products)) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				buildingInstruction.configureWorkspaceToBuildProductAndUninstallBuild(workspace);
				uninstallTasks.push(buildingInstruction.uninstallBuildTaskName);
			}
		}
		workspace.addCompoundTask(this.uninstallComponentsTaskName(ResourceIdentification.buildName), uninstallTasks);
	}

	// Installation conveniences
	configureWorkspaceToInstallAndUninstallAll(workspace) {
		workspace.addCompoundTask(this.installComponentsTaskName(), [
			this.installComponentsTaskName(ResourceIdentification.librariesName),
			this.installComponentsTaskName(ResourceIdentification.productImportsName)
		]);
		workspace.addCompoundTask(this.uninstallComponentsTaskName(), [
			this.uninstallComponentsTaskName(ResourceIdentification.buildName),
			this.uninstallComponentsTaskName(ResourceIdentification.productImportsName),
			this.uninstallComponentsTaskName(ResourceIdentification.librariesName)
		])
	}

	// All tasks
	configureWorkspaceTasks(workspace) {
		this.configureWorkspaceToInstallLibraries(workspace);
		this.configureWorkspaceToInstallProductImports(workspace);
		this.configureWorkspaceToBuildProductsAndUninstallBuild(workspace);
		this.configureWorkspaceToInstallAndUninstallAll(workspace);
	}
};
