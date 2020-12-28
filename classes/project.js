
"use strict";

const Bundle = require("./bundle");
const FileLocations = require("./file-locations");
const ShellScripting = require("./shell-scripting");


module.exports = class Project extends Bundle {

	constructor() {
		super();
		this.products = {};
		this.libraries = {};
		this.bundles = {};
	}

	addProduct(product) {
		product.parentBundle = this;
		this.products[product.name] = product;
		this.bundles[product.name] = product;
	}
	addLibrary(library) {
		library.parentBundle = this;
		this.libraries[library.name] = library;
		this.bundles[library.name] = library;
	}

	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["bundles"] = Object.keys(this.bundles);
		return r;
	}

	// Getting resource addresses

	get librariesInstallFolder() { return this.installPath + "/" + FileLocations.librariesFolder; }

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
	makeProductTaskName(product) { return "make_" + product.name; }
	cleanProductTaskName(product) { return "clean_" + product.name; }
	buildProductTaskName(product) { return "build_" + product.name; }
	uninstallProductTaskName(product) { return "uninstall_" + product.name; }

	configureWorkspaceToBuildProducts(workspace) {
		for (const product of Object.values(this.products)) {
			const buildingInstruction = product.buildingInstruction;
			if (buildingInstruction) {
				const cleanTaskName = this.cleanProductTaskName(product);
				workspace.addShellTask(cleanTaskName, buildingInstruction.shellScriptToCleanBuild);
				if (workspace.tryRunningMakefunc(buildingInstruction.makefuncName, product)) {
					workspace.addCompoundTask(this.buildProductTaskName(product), [cleanTaskName, this.makeProductTaskName(product)]);
				}
				workspace.addShellTask(this.uninstallProductTaskName(product), buildingInstruction.shellScriptToUninstallBuild);
			}
		}
	}

	// Uninstall convenience task
	get uninstallAllTaskName() {  return "uninstall_" + this.name + "_all"; }
	configureWorkspaceToUninstallAll(workspace) {
		let subtasks = [];
		for (const product of Object.values(this.products)) {
			if (product.buildingInstruction) {
				subtasks.push(this.uninstallProductTaskName(product));
			}
		}
		subtasks.push(this.uninstallProductImportsTaskName);
		subtasks.push(this.uninstallLibrariesTaskName);
		workspace.addCompoundTask(this.uninstallAllTaskName, subtasks);
	}

	// All tasks
	configureWorkspaceTasks(workspace) {
		this.configureWorkspaceToInstallLibraries(workspace);
		this.configureWorkspaceToInstallProductImports(workspace);
		this.configureWorkspaceToBuildProducts(workspace);
		this.configureWorkspaceToUninstallAll(workspace);
	}
};
