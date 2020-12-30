
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");
const Utilities = require("./utilities");


module.exports = class Project extends Bundle {

	constructor() {
		super();
		this.sortOrder = 0;
		this.products = {};
		this.libraries = {};
	}
	get descriptionTypeSuffix() { return "project"; }

	addProduct(product) {
		product.parentBundle = this;
		product.sortOrder = Object.keys(this.products).length;
		this.products[product.name] = product;
	}
	addLibrary(library) {
		library.parentBundle = this;
		library.sortOrder = Object.keys(this.libraries).length;
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
		for (const library of Utilities.sortValuesBySortOrder(this.libraries)) {
			installScript = installScript.concat(library.shellScriptToInstallLibrary);
		}
		workspace.addShellTask(this.installTaskName(ResourceIdentification.librariesName), installScript);
		workspace.addShellTask(this.uninstallTaskName(ResourceIdentification.librariesName), this.shellScriptToUninstallLibraries);
	}

	// Installing and uninstalling product imports
	configureWorkspaceToInstallAndUninstallProductImports(workspace) {
		const products = Utilities.sortValuesBySortOrder(this.products);
		let installScript = [];
		for (const product of products) {
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
		}
		workspace.addShellTask(this.installTaskName(ResourceIdentification.productImportsName), installScript);
		let uninstallScript = [];
		for (const product of products.slice().reverse()) {
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.addShellTask(this.uninstallTaskName(ResourceIdentification.productImportsName), uninstallScript);
	}

	// Building and cleaning products
	configureWorkspaceToBuildAndCleanProducts(workspace) {
		const products = Utilities.sortValuesBySortOrder(this.products);
		let buildTasks = [];
		for (const product of products) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				buildingInstruction.configureWorkspaceToBuildAndCleanProduct(workspace);
				buildTasks.push(buildingInstruction.buildProductTaskName);
			}
		}
		workspace.addCompoundTask(ResourceIdentification.buildTaskName(this), buildTasks);
		let cleanTasks = [];
		for (const product of products.slice().reverse()) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				cleanTasks.push(buildingInstruction.cleanProductTaskName);
			}
		}
		workspace.addCompoundTask(ResourceIdentification.cleanTaskName(this), cleanTasks);
	}

	// Installation conveniences
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

	// All tasks
	configureWorkspaceTasks(workspace) {
		this.configureWorkspaceToInstallAndUninstallLibraries(workspace);
		this.configureWorkspaceToInstallAndUninstallProductImports(workspace);
		this.configureWorkspaceToBuildAndCleanProducts(workspace);
		this.configureWorkspaceToInstallAndUninstallAll(workspace);
	}
};
