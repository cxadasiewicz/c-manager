
"use strict";

const GruntWorkspace = require("./grunt-workspace");


module.exports = class Manager {

	static configureGruntForComponents(grunt, makefuncs) {
		const workspace = new GruntWorkspace();
		workspace.grunt = grunt;
		workspace.makefuncs = makefuncs;
		workspace.discoverComponents();
		workspace.configureTasks();
		workspace.runDebuggingOptions();
	}
};
