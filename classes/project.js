
"use strict";

const Bundle = require("./bundle");
const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class Project extends Bundle {

	constructor(config) {
		super(config);
		this.products = {};
		this.libraries = {};
	}

	addProduct(product) {
		product.parentBundle = this;
		this.products[product.name] = product;
		return product;
	}
	addLibrary(library) {
		library.parentBundle = this;
		this.libraries[library.name] = library;
		return library;
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
		return ShellScripting.remove(this.librariesInstallFolder);
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
		workspace.defineTaskWithNameAndScript(this.installTaskName(ResourceIdentification.librariesName), installScript);
		workspace.defineTaskWithNameAndScript(this.uninstallTaskName(ResourceIdentification.librariesName), this.shellScriptToUninstallLibraries);
	}

	// Installing and uninstalling product imports
	configureWorkspaceToInstallAndUninstallProductImports(workspace) {
		let installScript = [];
		let uninstallScript = [];
		for (const product of Object.values(this.products)) {
			installScript = installScript.concat(product.shellScriptToInstallProductImports);
			uninstallScript = uninstallScript.concat(product.shellScriptToUninstallProductImports);
		}
		workspace.defineTaskWithNameAndScript(this.installTaskName(ResourceIdentification.productImportsName), installScript);
		workspace.defineTaskWithNameAndScript(this.uninstallTaskName(ResourceIdentification.productImportsName), uninstallScript);
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

	// Installing and uninstalling the project
	configureWorkspaceToInstallAndUninstallProject(workspace) {
		workspace.defineTaskWithNameAndSubtasks(this.installTaskName(), [
			this.installTaskName(ResourceIdentification.librariesName),
			this.installTaskName(ResourceIdentification.productImportsName)
		]);
		workspace.defineTaskWithNameAndSubtasks(this.uninstallTaskName(), [
			this.uninstallTaskName(ResourceIdentification.productImportsName),
			this.uninstallTaskName(ResourceIdentification.librariesName)
		]);
	}

	// All project tasks
	configureWorkspaceToManageProject(workspace) {
		this.configureWorkspaceToInstallAndUninstallLibraries(workspace);
		this.configureWorkspaceToInstallAndUninstallProductImports(workspace);
		this.configureWorkspaceToBuildAndCleanProducts(workspace);
		this.configureWorkspaceToInstallAndUninstallProject(workspace);
	}

	// Installing and uninstalling all projects
	static projectsInstallTaskName(section) { return ResourceIdentification.installTaskName(null, section); }
	static projectsUninstallTaskName(section) { return ResourceIdentification.uninstallTaskName(null, section); }

	static configureWorkspaceToInstallAndUninstallAllProjects(workspace) {
		let libraryInstallTasks = [];
		let productImportInstallTasks = [];
		for (const project of workspace.projects) {
			libraryInstallTasks.push(project.installTaskName(ResourceIdentification.librariesName));
			productImportInstallTasks.push(project.installTaskName(ResourceIdentification.productImportsName))
		}
		const installLibrariesTask = this.projectsInstallTaskName(ResourceIdentification.librariesName);
		workspace.defineTaskWithNameAndSubtasks(installLibrariesTask, libraryInstallTasks);
		const installProductImportsTask = this.projectsInstallTaskName(ResourceIdentification.productImportsName);
		workspace.defineTaskWithNameAndSubtasks(installProductImportsTask, productImportInstallTasks);
		workspace.defineTaskWithNameAndSubtasks(this.projectsInstallTaskName(), [installLibrariesTask, installProductImportsTask]);
		let libraryUninstallTasks = [];
		let productImportUninstallTasks = [];
		for (const project of workspace.projects.slice().reverse()) {
			libraryUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.librariesName));
			productImportUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.productImportsName))
		}
		const uninstallLibrariesTask = this.projectsUninstallTaskName(ResourceIdentification.librariesName);
		workspace.defineTaskWithNameAndSubtasks(uninstallLibrariesTask, libraryUninstallTasks);
		const uninstallProductImportsTask = this.projectsUninstallTaskName(ResourceIdentification.productImportsName);
		workspace.defineTaskWithNameAndSubtasks(uninstallProductImportsTask, productImportUninstallTasks);
		workspace.defineTaskWithNameAndSubtasks(this.projectsUninstallTaskName(), [uninstallProductImportsTask, uninstallLibrariesTask]);
	}

	// All workspace tasks
	static configureWorkspaceToManageProjects(workspace) {
		for (const project of workspace.projects) {
			project.configureWorkspaceToManageProject(workspace);
		}
		this.configureWorkspaceToInstallAndUninstallAllProjects(workspace);
	}
};
