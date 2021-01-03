
"use strict";


module.exports = class Workspace {

	constructor() {
		this.projects = [];
	}

	// Reading JSON files via the shell

	readJSONFileAt(path) {
		return null;
	}

	// Defining shell tasks

	defineTaskWithNameAndScript(name, script) { }
	defineTaskWithNameAndSubtasks(name, subtasks) { }

	// Configuring to make products

	configureToMakeProductUsingBuildingInstruction(buildingInstruction) { }
};
