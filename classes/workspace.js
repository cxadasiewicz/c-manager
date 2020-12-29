
"use strict";

const ComponentsJSONDecoder = require("./components-json-decoder");
const FileLocations = require("./file-locations");
const Logger = require("./logger");
const Project = require("./project");


module.exports = class Workspace {

	constructor(makefuncs = {}) {
		this.makefuncs = makefuncs;
		this.projects = [];
	}
	get descriptionOverrides() {
		return {
			"makefuncs": Object.keys(this.makefuncs)
		};
	}

	// Managing files

	readJSONAt(path) { }
	tryReadingJSONAt(path) {
		try {
			return this.readJSONAt(path);
		} catch(e) {
			return null;
		}
	}

	// Managing makefuncs

	tryRunningMakefunc(name, product) {
		try {
			this.makefuncs[name](this, product);
			return true;
		} catch(e) {
			return false;
		}
	}

	// Managing projects

	decodeAnyProjectAt(localBundlePath, parentProject, decoder) {
		const packageJSONLocalInstallFolder = (!localBundlePath ? "" : localBundlePath + "/");
		const packageData = this.tryReadingJSONAt((parentProject ? parentProject.installPath + "/" : "") + packageJSONLocalInstallFolder + FileLocations.packageJSON);
		if (!packageData) { return null; }
		const componentsData = decoder.componentsDataFrom(packageData);
		if (!componentsData) { return null; }
		const r = new Project();
		r.name = packageData.name;
		r.localInstallFolder = packageJSONLocalInstallFolder + "../";
		r.parentBundle = parentProject;
		decoder.addComponentsDataToProject(componentsData, r);
		this.projects.push(r);
		return r;
	}

	discoverProjectsUsingDecoder(decoder) {
		let project = this.decodeAnyProjectAt(null, null, decoder);
		if (!project) { return; }
		let projectQueue = [];
		while (project) {
			for (const libraryKey of Object.keys(project.libraries)) {
				const library = project.libraries[libraryKey];
				let libraryPath = library.pointedBundlePath;
				if (!libraryPath) {
					libraryPath = FileLocations.librariesFolder + libraryKey;
				}
				const libraryProject = this.decodeAnyProjectAt(project.installPath + "/" + libraryPath, project, decoder);
				if (libraryProject) {
					library.libraryProject = libraryProject;
					projectQueue.push(libraryProject);
				}
			}
			project = projectQueue.pop();
		}
	}

	// Getting workspace options

	workspaceOption(option) { }

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	// Install/uninstall
	get installLibrariesTaskName() { return "install-libraries"; }
	configureToInstallLibraries() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.installLibrariesTaskName);
		}
		this.addCompoundTask(this.installLibrariesTaskName, subtasks);
	}

	get installProductImportsTaskName() { return "install-imports"; }
	configureToInstallProductImports() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.installProductImportsTaskName);
		}
		this.addCompoundTask(this.installProductImportsTaskName, subtasks);
	}

	get uninstallBuildsTaskName() { return "uninstall-builds"; }
	configureToUninstallBuilds() {
		let subtasks = [];
		for (const project of this.projects) {
			for (const product of Object.values(project.products)) {
				if (product.buildingInstruction) {
					subtasks.push(project.uninstallProductTaskName(product));
				}
			}
		}
		this.addCompoundTask(this.uninstallBuildsTaskName, subtasks);
	}

	get uninstallProductImportsTaskName() { return "uninstall-imports"; }
	configureToUninstallProductImports() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.uninstallProductImportsTaskName);
		}
		this.addCompoundTask(this.uninstallProductImportsTaskName, subtasks);
	}

	get uninstallAllTaskName() { return "uninstall-all"; }
	configureToUninstallAll() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.uninstallAllTaskName);
		}
		this.addCompoundTask(this.uninstallAllTaskName, subtasks);
	}

	configureToInstallAndUninstall() {
		this.configureToInstallLibraries();
		this.configureToInstallProductImports();
		this.configureToUninstallBuilds();
		this.configureToUninstallProductImports();
		this.configureToUninstallAll();
	}

	// Managing debugging

	get debugWorkspaceOption() { return "debug-workspace"; }

	runDebugging() {
		if (this.workspaceOption(this.debugWorkspaceOption)) {
			Logger.log(this);
		}
	}

	// Running the main operation

	discoverProjectsAndConfigureTasks(decoder = new ComponentsJSONDecoder()) {
		this.discoverProjectsUsingDecoder(decoder);
		this.beginConfiguringTasks();
		for (const project of this.projects) {
			project.configureWorkspaceTasks(this);
		}
		this.configureToInstallAndUninstall();
		this.runDebugging();
	}
};
