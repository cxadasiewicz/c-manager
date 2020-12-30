
"use strict";

const ComponentsJSONDecoder = require("./components-json-decoder");
const Logger = require("./logger");
const Project = require("./project");
const ResourceIdentifiers = require("./resource-identifiers");


module.exports = class Workspace {

	static get includeLibrariesOption() { return "libraries"; }
	static get includeProductImportsOption() { return "imports"; }
	static get includeBuildOption() { return "build"; }

	static get installAllTaskName() { return "install"; }
	static get uninstallAllTaskName() { return "uninstall"; }

	static get debugWorkspaceOption() { return "debug-workspace"; }

	constructor(configureMakeTaskPlugins = {}) {
		this.configureMakeTaskPlugins = configureMakeTaskPlugins;
		this.projects = [];
	}
	get descriptionOverrides() {
		return {
			"configureMakeTaskPlugins": Object.keys(this.configureMakeTaskPlugins)
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

	// Managing projects

	decodeAnyProjectAt(localBundlePath, parentProject, decoder) {
		const packageJSONLocalInstallFolder = (!localBundlePath ? "" : localBundlePath + "/");
		const packageData = this.tryReadingJSONAt((parentProject ? parentProject.installPath + "/" : "") + packageJSONLocalInstallFolder + ResourceIdentifiers.packageJSON);
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
					libraryPath = ResourceIdentifiers.librariesFolder + libraryKey;
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

	get shouldOptionallyIncludeLibraries() { return this.workspaceOption(Workspace.includeLibrariesOption); }
	get shouldOptionallyIncludeProductImports() { return this.workspaceOption(Workspace.includeProductImportsOption); }
	get shouldOptionallyIncludeBuild() { return this.workspaceOption(Workspace.includeBuildOption); }

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	// Installation conveniences
	configureToInstallAndUninstallAllComponents() {
		let installTasks = [];
		for (const project of this.projects) {
			installTasks.push(project.installComponentsTaskName);
		}
		this.addCompoundTask(Workspace.installAllTaskName, installTasks);
		let uninstallTasks = [];
		for (const project of this.projects.slice().reverse()) {
			uninstallTasks.push(project.uninstallComponentsTaskName);
		}
		this.addCompoundTask(Workspace.uninstallAllTaskName, uninstallTasks);
	}

	// Managing debugging

	runDebugging() {
		if (this.workspaceOption(Workspace.debugWorkspaceOption)) {
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
		this.configureToInstallAndUninstallAllComponents();
		this.runDebugging();
	}
};
