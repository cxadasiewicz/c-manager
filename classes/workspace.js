
"use strict";

const FileLocations = require("./file-locations");
const Logger = require("./logger");
const ProjectJSONDecoder = require("./project-json-decoder");
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

	addAnyProjectAt(localInstallFolder, parentProject, decoder) {
		const r = new Project();
		r.localInstallFolder = localInstallFolder;
		r.parentBundle = parentProject;
		const packageData = this.tryReadingJSONAt(r.installFolder + FileLocations.packageJSON);
		if (!packageData) { return null; }
		const componentsData = decoder.componentsDataFrom(packageData);
		if (!componentsData) { return null; }
		r.name = packageData.name;
		decoder.addComponentsDataToProject(componentsData, r);
		this.projects.push(r);
		return r;
	}

	// Getting workspace options

	workspaceOption(option) { }

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	// Install/uninstall all
	get installAllLibrariesTaskName() { return "install-all-libraries"; }
	configureToInstallAllLibraries() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.installLibrariesTaskName);
		}
		this.addCompoundTask(this.installAllLibrariesTaskName, subtasks);
	}

	get installAllProductImportsTaskName() { return "install-all-imports"; }
	configureToInstallAllProductImports() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.installProductImportsTaskName);
		}
		this.addCompoundTask(this.installAllProductImportsTaskName, subtasks);
	}

	get uninstallAllTaskName() { return "uninstall-all"; }
	configureToUninstallAll() {
		let subtasks = [];
		for (const project of this.projects) {
			subtasks.push(project.uninstallAllTaskName);
		}
		this.addCompoundTask(this.uninstallAllTaskName, subtasks);
	}

	configureToInstallAndUninstallAll() {
		this.configureToInstallAllLibraries();
		this.configureToInstallAllProductImports();
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

	configureTasksByDiscoveringLocalComponents(decoder = new ProjectJSONDecoder()) {
		this.beginConfiguringTasks();
		let projectQueue = [];
		const rootProject = this.addAnyProjectAt("", null, decoder);
		if (!rootProject) { return; }
		projectQueue.push(rootProject);
		let project = projectQueue.pop();
		while (project) {
			project.configureWorkspaceTasks(this);
			for (const libraryKey of Object.keys(project.libraries)) {
				const library = project.libraries[libraryKey];
				const localLibraryPath = library.localLibraryPublishedBundlePath;
				if (localLibraryPath) {
					projectQueue.push(this.addAnyProjectAt(localLibraryPath + "/", project, decoder));
				}
			}
			project = projectQueue.pop();
		}
		this.configureToInstallAndUninstallAll();
		this.runDebugging();
	}
};
