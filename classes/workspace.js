
"use strict";

const ComponentsJSONDecoder = require("./components-json-decoder");
const Logger = require("./logger");
const Project = require("./project");
const ResourceIdentification = require("./resource-identification");


module.exports = class Workspace {

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

	// Discovering projects

	discoverProjectInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder) {
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

	discoverProjectsInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder) {
		let r = [];
		let project = this.discoverProjectInProjectAtSubpathUsingDecoder(parentProject, projectSubpath, decoder);
		if (project) {
			r.push(project);
			let projectQueue = [];
			while (project) {
				for (const library of Object.values(project.libraries)) {
					let libraryPath = library.deviceLocalInstallPath;
					if (!libraryPath) {
						libraryPath = library.localInstallPath;
					}
					const libraryProject = this.discoverProjectInProjectAtSubpathUsingDecoder(project, libraryPath, decoder);
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
	discoverProjectsUsingDecoder(decoder) {
		return this.discoverProjectsInProjectAtSubpathUsingDecoder(null, null, decoder);
	}

	discoverProjects() {
		this.projects = this.discoverProjectsUsingDecoder(new ComponentsJSONDecoder());
	}

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	configureToManageProjects() {
		Project.configureWorkspaceToManageProjects(this);
	}
	configureTasks() {
		this.beginConfiguringTasks();
		this.configureToManageProjects();
	}

	// Managing debugging

	get shouldDebugWorkspace() { return this.workspaceOption(Workspace.debugWorkspaceOption); }

	runDebugging() {
		if (this.shouldDebugWorkspace) {
			Logger.log(this);
		}
	}

	// Running the main operation

	discoverProjectsAndConfigureTasks() {
		this.discoverProjects();
		this.configureTasks();
		this.runDebugging();
	}
};
