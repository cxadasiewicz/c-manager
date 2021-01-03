
"use strict";

const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class BuildingInstruction {

	constructor(config) {
		this.parentProduct = null;
		this.makefuncName = config.makefuncName;
	}
	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null)
		};
	}

	// Generating build scripts

	get shellScriptToCleanBuild() {
		return ShellScripting.remove(this.parentProduct.publicInstallPath + "/*");
	}

	// Configuring workspace tasks
	get buildTaskName() { return ResourceIdentification.buildTaskName(this.parentProduct); }
	get makeTaskName() { return ResourceIdentification.makeTaskName(this.parentProduct); }
	get cleanTaskName() { return ResourceIdentification.cleanTaskName(this.parentProduct); }

	configureWorkspaceToBuildAndCleanProduct(workspace) {
		workspace.defineTaskWithNameAndScript(this.cleanTaskName, this.shellScriptToCleanBuild);
		workspace.configureToMakeProductUsingBuildingInstruction(this);
		workspace.defineTaskWithNameAndSubtasks(this.buildTaskName, [this.cleanTaskName, this.makeTaskName]);
	}
};
