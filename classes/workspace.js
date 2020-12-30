
"use strict";

const ComponentsJSONDecoder = require("./components-json-decoder");
const Logger = require("./logger");
const Project = require("./project");
const ResourceIdentification = require("./resource-identification");


module.exports = class Workspace {

	static get _debugWorkspaceOption() { return "debug-workspace"; }

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
		const packageData = this.tryReadingJSONAt((parentProject ? parentProject.installPath + "/" : "") + packageJSONLocalInstallFolder + ResourceIdentification.packageJSONPath);
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

	// Installation conveniences
	installAllComponentsTaskName(section) {
		return "install-all" + (section ? "-" + section : "");
	}
	configureToInstallAllComponents() {
		let libraryTasks = [];
		let productImportTasks = [];
		for (const project of this.projects) {
			libraryTasks.push(project.installComponentsTaskName(ResourceIdentification.librariesName));
			productImportTasks.push(project.installComponentsTaskName(ResourceIdentification.productImportsName));
		}
		let allTasks = [];
		let task;
		task = this.installAllComponentsTaskName(ResourceIdentification.librariesName);
		this.addCompoundTask(task, libraryTasks);
		allTasks.push(task);
		task = this.installAllComponentsTaskName(ResourceIdentification.productImportsName);
		this.addCompoundTask(task, productImportTasks);
		allTasks.push(task);
		this.addCompoundTask(this.installAllComponentsTaskName(), allTasks);
	}

	uninstallAllComponentsTaskName(section) {
		return "uninstall-all" + (section ? "-" + section : "");
	}
	configureToUninstallAllComponents() {
		let buildTasks = [];
		let productImportTasks = [];
		let libraryTasks = [];
		for (const project of this.projects) {
			buildTasks.push(project.uninstallComponentsTaskName(ResourceIdentification.buildName));
			productImportTasks.push(project.uninstallComponentsTaskName(ResourceIdentification.productImportsName));
			libraryTasks.push(project.uninstallComponentsTaskName(ResourceIdentification.librariesName));
		}
		let allTasks = [];
		let task;
		task = this.uninstallAllComponentsTaskName(ResourceIdentification.buildName);
		this.addCompoundTask(task, buildTasks);
		allTasks.push(task);
		task = this.uninstallAllComponentsTaskName(ResourceIdentification.productImportsName);
		this.addCompoundTask(task, productImportTasks);
		allTasks.push(task);
		task = this.uninstallAllComponentsTaskName(ResourceIdentification.librariesName);
		this.addCompoundTask(task, libraryTasks);
		allTasks.push(task);
		this.addCompoundTask(this.uninstallAllComponentsTaskName(), allTasks);
	}

	configureToInstallAndUninstallAllComponents() {
		this.configureToInstallAllComponents()
		this.configureToUninstallAllComponents();
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
		for (const project of this.projects) {
			project.configureWorkspaceTasks(this);
		}
		this.configureToInstallAndUninstallAllComponents();
		this.runDebugging();
	}
};
