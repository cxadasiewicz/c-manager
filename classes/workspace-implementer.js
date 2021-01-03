
"use strict";

const ComponentsStandardDecoder = require("./components-standard-decoder");
const Logger = require("./logger");
const Project = require("./project");
const ResourceIdentification = require("./resource-identification");
const Workspace = require("./workspace");


module.exports = class WorkspaceImplementer extends Workspace {

	static get debugWorkspaceOption() { return "debug-workspace"; }

	constructor(plugins = {}) {
		super();
		this.plugins = plugins;
	}

	// Getting workspace options

	workspaceOption(option) {
		return null;
	}

	// Reading JSON files via the shell

	tryReadingJSONFileAt(path) {
		return null;
	}
	readJSONFileAt(path) {
		try {
			return this.tryReadingJSONFileAt(path);
		} catch(e) {
			return null;
		}
	}

	// Configuring to make products

	configureToMakeProductUsingBuildingInstruction(buildingInstruction) {
		const productMakefuncs = this.plugins.productMakefuncs;
		if (productMakefuncs) {
			for (const makefunc of productMakefuncs) {
				if (makefunc.productMakefuncName == buildingInstruction.makefuncName) {
					makefunc.configureWorkspaceToMakeProduct(this, buildingInstruction.parentProduct);
					return;
				}
			}
		}
	}

	// Discovering projects

	discoverProjectInProjectAtSubpathUsingComponentsDecoder(parentProject, projectSubpath, componentsDecoder) {
		const intermediateFolder = (projectSubpath ? projectSubpath + "/" : "");
		const packageJSON = this.readJSONFileAt((parentProject ? parentProject.installPath + "/" : "") + intermediateFolder + ResourceIdentification.packageJSONPath);
		if (!packageJSON) { return null; }
		const componentsData = componentsDecoder.decodeJSONAsComponentsData(packageJSON);
		if (!componentsData) { return null; }
		const r = new Project({
			name: packageJSON.name,
			localInstallFolder: intermediateFolder + "../",
			parentBundle: parentProject
		});
		componentsDecoder.decodeComponentsDataIntoProject(componentsData, r);
		return r;
	}
	discoverProjectsInProjectAtSubpathUsingComponentsDecoder(parentProject, projectSubpath, componentsDecoder) {
		let r = [];
		let project = this.discoverProjectInProjectAtSubpathUsingComponentsDecoder(parentProject, projectSubpath, componentsDecoder);
		if (project) {
			r.push(project);
			let projectQueue = [];
			while (project) {
				for (const library of Object.values(project.libraries)) {
					let libraryPath = library.deviceLocalInstallPath;
					if (!libraryPath) {
						libraryPath = library.localInstallPath;
					}
					const libraryProject = this.discoverProjectInProjectAtSubpathUsingComponentsDecoder(project, libraryPath, componentsDecoder);
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
	discoverProjectsUsingComponentsDecoder(componentsDecoder) {
		return this.discoverProjectsInProjectAtSubpathUsingComponentsDecoder(null, null, componentsDecoder);
	}
	discoverProjects() {
		this.projects = this.projects.concat(this.discoverProjectsUsingComponentsDecoder(new ComponentsStandardDecoder()));
	}

	// Configuring tasks

	beginConfiguringTasks() { }

	configureToManageProjects() {
		Project.configureWorkspaceToManageProjects(this);
	}

	configureTasks() {
		this.beginConfiguringTasks();
		this.configureToManageProjects();
	}

	// Debugging

	get shouldDebugWorkspace() { return this.workspaceOption(WorkspaceImplementer.debugWorkspaceOption); }

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
