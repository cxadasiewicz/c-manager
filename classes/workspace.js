
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

	// Getting workspace options

	workspaceOption(option) {
		return null;
	}

	// Reading files

	tryReadingJSONAt(path) {
		return null;
	}
	readJSONAt(path) {
		try {
			return this.tryReadingJSONAt(path);
		} catch(e) {
			return null;
		}
	}

	// Collecting projects

	collectAnyProjectInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder) {
		const intermediateFolder = (projectSubpath ? projectSubpath + "/" : "");
		const packageData = this.readJSONAt((parentProject ? parentProject.installPath + "/" : "") + intermediateFolder + ResourceIdentification.packageJSONPath);
		if (!packageData) { return null; }
		const componentsData = decoder.componentsDataFrom(packageData);
		if (!componentsData) { return null; }
		const r = new Project({
			name: packageData.name,
			localInstallFolder: intermediateFolder + "../",
			parentBundle: parentProject
		});
		decoder.addComponentsDataToProject(componentsData, r);
		return r;
	}

	collectProjectsInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder) {
		let r = [];
		let project = this.collectAnyProjectInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder);
		if (project) {
			r.push(project);
			let projectQueue = [];
			while (project) {
				for (const library of Object.values(project.libraries)) {
					let libraryPath = library.deviceLocalInstallPath;
					if (!libraryPath) {
						libraryPath = library.localInstallPath;
					}
					const libraryProject = this.collectAnyProjectInProjectAtSubpathUsingDecoder(project, libraryPath, decoder);
					if (libraryProject) {
						library.libraryProject = libraryProject;
						r.push(libraryProject);
						projectQueue.push(libraryProject);
					}
				}
				project = projectQueue.pop();
			}
		}
		return r;
	}
	collectProjectsUsingDecoder(decoder) {
		return this.collectProjectsInProjectAtSubpathUsingDecoder(null, null, decoder);
	}

	collectProjects() {
		this.projects = this.collectProjectsUsingDecoder(new ComponentsJSONDecoder());
	}

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	// Convenience tasks
	installTaskName(section) { return ResourceIdentification.installTaskName(null, section); }
	uninstallTaskName(section) { return ResourceIdentification.uninstallTaskName(null, section); }

	configureToInstallAndUninstallAll() {
		let libraryInstallTasks = [];
		let productImportInstallTasks = [];
		for (const project of this.projects) {
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
		for (const project of this.projects.slice().reverse()) {
			libraryUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.librariesName));
			productImportUninstallTasks.push(project.uninstallTaskName(ResourceIdentification.productImportsName))
		}
		const uninstallLibrariesTask = this.uninstallTaskName(ResourceIdentification.librariesName);
		this.addCompoundTask(uninstallLibrariesTask, libraryUninstallTasks);
		const uninstallProductImportsTask = this.uninstallTaskName(ResourceIdentification.productImportsName);
		this.addCompoundTask(uninstallProductImportsTask, productImportUninstallTasks);
		this.addCompoundTask(this.uninstallTaskName(), [uninstallProductImportsTask, uninstallLibrariesTask]);
	}

	configureConvenienceTasks() {
		this.configureToInstallAndUninstallAll();
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
		this.collectProjects();
		this.beginConfiguringTasks();
		for (const project of this.projects) {
			project.configureWorkspaceTasks(this);
		}
		this.configureConvenienceTasks();
		this.runDebugging();
	}
};
