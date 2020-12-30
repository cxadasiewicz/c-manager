
"use strict";

const ComponentsJSONDecoder = require("./components-json-decoder");
const Logger = require("./logger");
const Project = require("./project");
const ResourceIdentification = require("./resource-identification");
const Utilities = require("./utilities");


module.exports = class Workspace {

	static get _debugWorkspaceOption() { return "debug-workspace"; }

	constructor(configureMakeTaskPlugins = {}) {
		this.configureMakeTaskPlugins = configureMakeTaskPlugins;
		this.projects = {};
	}
	get descriptionOverrides() {
		return {
			"configureMakeTaskPlugins": Object.keys(this.configureMakeTaskPlugins)
		};
	}

	addProject(project) {
		project.sortOrder = Object.keys(this.projects).length;
		this.projects[project.name] = project;
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
		const packageData = this.tryReadingJSONAt((parentProject ? parentProject.installPath + "/" : "") + packageJSONLocalInstallFolder + ResourceIdentification.packageJSONPath);
		if (!packageData) { return null; }
		const componentsData = decoder.componentsDataFrom(packageData);
		if (!componentsData) { return null; }
		const r = new Project();
		r.name = packageData.name;
		r.localInstallFolder = packageJSONLocalInstallFolder + "../";
		r.parentBundle = parentProject;
		decoder.addComponentsDataToProject(componentsData, r);
		this.addProject(r);
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
					libraryPath = ResourceIdentification.librariesFolder + libraryKey;
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

	// Convenience tasks
	installTaskName(section) { return ResourceIdentification.installTaskName(null, section); }
	uninstallTaskName(section) { return ResourceIdentification.uninstallTaskName(null, section); }
	get buildTaskName() { return ResourceIdentification.buildTaskName() }
	get cleanTaskName() { return ResourceIdentification.cleanTaskName() }

	configureToInstallAndUninstallAll() {
		const projects = Utilities.sortValuesBySortOrder(this.projects);
		let libraryInstallTasks = [];
		let productImportInstallTasks = [];
		for (const project of projects) {
			libraryInstallTasks.push(project.installTaskName(ResourceIdentification.librariesName));
			productImportInstallTasks.push(project.installTaskName(ResourceIdentification.productImportsName))
		}
		const installLibrariesTask = this.installTaskName(ResourceIdentification.librariesName);
		this.addCompoundTask(installLibrariesTask, libraryInstallTasks);
		const installProductImportsTask = this.installTaskName(ResourceIdentification.productImportsName);
		this.addCompoundTask(installProductImportsTask, productImportInstallTasks);
		this.addCompoundTask(this.installTaskName(), [installLibrariesTask, installProductImportsTask]);
		let libraryUninstallTasks = [];
		let productImportUninstallTasks = [];
		for (const project of projects.slice().reverse()) {
			libraryUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.librariesName));
			productImportUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.productImportsName))
		}
		const uninstallLibrariesTask = this.uninstallTaskName(ResourceIdentification.librariesName);
		this.addCompoundTask(uninstallLibrariesTask, libraryUninstallTasks);
		const uninstallProductImportsTask = this.uninstallTaskName(ResourceIdentification.productImportsName);
		this.addCompoundTask(uninstallProductImportsTask, productImportUninstallTasks);
		this.addCompoundTask(this.uninstallTaskName(), [uninstallProductImportsTask, uninstallLibrariesTask]);
	}

	configureToBuildAndCleanAll() {
		let buildTasks = [];
		let cleanTasks = [];
		for (const project of Utilities.sortValuesBySortOrder(this.projects)) {
			buildTasks.push(project.buildTaskName);
			cleanTasks.push(project.cleanTaskName);
		}
		this.addCompoundTask(this.buildTaskName, buildTasks);
		this.addCompoundTask(this.cleanTaskName, cleanTasks);
	}

	configureConvenienceTasks() {
		this.configureToInstallAndUninstallAll();
		this.configureToBuildAndCleanAll();
	}

	// Managing debugging

	get shouldDebugWorkspace() { return this.workspaceOption(Workspace._debugWorkspaceOption); }

	runDebugging() {
		if (this.shouldDebugWorkspace) {
			Logger.log(this);
		}
	}

	// Running the main operation

	discoverProjectsAndConfigureTasks(decoder = new ComponentsJSONDecoder()) {
		this.discoverProjectsUsingDecoder(decoder);
		this.beginConfiguringTasks();
		for (const project of Utilities.sortValuesBySortOrder(this.projects)) {
			project.configureWorkspaceTasks(this);
		}
		this.configureConvenienceTasks();
		this.runDebugging();
	}
};
