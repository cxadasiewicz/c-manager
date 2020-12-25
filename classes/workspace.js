
"use strict";

const FileLocations = require("./file-locations");
const ProjectJSONDecoder = require("./project-json-decoder");
const Project = require("./project");


module.exports = class Workspace {

	constructor() {
		this.makefuncs = {};
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

	addAnyProjectsAt(localInstallFolder = "", parentProject = null, decoder = new ProjectJSONDecoder(), ignoreRecursive = false) {
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
		if (!ignoreRecursive) {
			for (const libraryName of Object.keys(r.libraries)) {
				this.addAnyProjectsAt(FileLocations.librariesFolder + libraryName + "/", r, decoder);
			}
		}
		return r;
	}

	// Configuring tasks

	beginConfiguringTasks() { }

	addShellTask(name, script) { }
	addCompoundTask(name, subnames) { }

	// Running main operations

	discoverComponents() {
		this.addAnyProjectsAt();
	}

	configureTasks() {
		this.beginConfiguringTasks();
		for (const project of this.projects) {
			project.configureWorkspaceTasks(this);
		}
	}

	// Debugging options
	runDebuggingOptions() { }
};
