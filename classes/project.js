
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

	// Generating installation scripts

	get shellScriptToUninstallLibraries() {
		return ShellScripting.removeFolder(this.installFolder + FileLocations.librariesFolder);
	}

	// Configuring workspace tasks

	// Installing libraries
	get installLibrariesTaskName() {
		return "install_" + this.name + "_libraries";
	}
	get uninstallLibrariesTaskName() {
		return "uninstall_" + this.name + "_libraries";
	}

	configureWorkspaceToInstallLibraries(workspace) {
		let installScript = [];
		for (const libraryKey of Object.keys(this.libraries)) {
			installScript = installScript.concat(this.libraries[libraryKey].shellScriptToInstallLibrary);
		}
		workspace.addShellTask(this.installLibrariesTaskName, installScript);
		workspace.addShellTask(this.uninstallLibrariesTaskName, this.shellScriptToUninstallLibraries);
	}

	// Installing product imports
	get installProductImportsTaskName() {
		return "install_" + this.name + "_imports";
	}
	get uninstallProductImportsTaskName() {
		return "uninstall_" + this.name + "_imports";
	}

	configureWorkspaceToInstallProductImports(workspace) {
		let installScript = [];
		let uninstallScript = [];
		for (const productKey of Object.keys(this.products)) {
			const product = this.products[productKey];
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.addShellTask(this.installProductImportsTaskName, installScript);
		workspace.addShellTask(this.uninstallProductImportsTaskName, uninstallScript);
	}

	// Building products
	makeProductTaskName(product) {
		return "make_" + product.name;
	}
	cleanProductTaskName(product) {
		return "clean_" + product.name;
	}
	buildProductTaskName(product) {
		return "build_" + product.name;
	}
	uninstallProductBuildsTaskName(product) {
		return "uninstall_" + product.name + "_builds";
	}

	configureWorkspaceToBuildProducts(workspace) {
		for (const productKey of Object.keys(this.products)) {
			const product = this.products[productKey];
			const buildInfo = product.buildInfo;
			if (buildInfo) {
				const cleanTaskName = this.cleanProductTaskName(product);
				workspace.addShellTask(cleanTaskName, buildInfo.shellScriptToCleanBuild);
				if (workspace.tryRunningMakefunc(buildInfo.makefuncName, product)) {
					workspace.addCompoundTask(this.buildProductTaskName(product), [cleanTaskName, this.makeProductTaskName(product)]);
				}
				workspace.addShellTask(this.uninstallProductBuildsTaskName(product), buildInfo.shellScriptToUninstallBuilds);
			}
		}
	}

	// Uninstall convenience task
	get uninstallAllTaskName() {
		return "uninstall_" + this.name + "_all";
	}
	configureWorkspaceToUninstallAll(workspace) {
		let subtasks = [];
		for (const productKey of Object.keys(this.products)) {
			const product = this.products[productKey];
			const buildInfo = product.buildInfo;
			if (buildInfo) {
				subtasks.push(this.uninstallProductBuildsTaskName(product));
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
}
