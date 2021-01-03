
"use strict";

const GruntWorkspace = require("./classes/grunt-workspace");


module.exports = class CManager {

	static configureForGrunt(grunt, plugins) {
		new GruntWorkspace(grunt, plugins).discoverProjectsAndConfigureTasks();
	}
};
