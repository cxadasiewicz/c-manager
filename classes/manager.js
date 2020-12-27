
"use strict";

const GruntWorkspace = require("./grunt-workspace");


module.exports = class Manager {

	static configureGruntForComponents(grunt, makefuncs) {
		const workspace = new GruntWorkspace(grunt, makefuncs);
		workspace.configureTasksByDiscoveringLocalComponents();
	}
};
