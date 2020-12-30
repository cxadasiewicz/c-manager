
"use strict";

const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class BuildingInstruction {

	constructor() {
		this.parentProduct = null;
		this.makeTaskPluginName = "";
	}
	get descriptionOverrides() {
		return {
			"parentProduct": (this.parentProduct ? this.parentProduct.name : null)
		};
	}

	// Generating build scripts

	get shellScriptToCleanBuild() {
		return ShellScripting.removeAllInFolder(this.parentProduct.publicInstallPath + "/");
	}

	// Configuring workspace tasks
	get buildProductTaskName() { return ResourceIdentification.buildTaskName(this.parentProduct); }
	get makeProductTaskName() { return ResourceIdentification.makeTaskName(this.parentProduct); }
	get cleanProductTaskName() { return ResourceIdentification.cleanTaskName(this.parentProduct); }

	configureWorkspaceToBuildAndCleanProduct(workspace) {
		workspace.addShellTask(this.cleanProductTaskName, this.shellScriptToCleanBuild);
		workspace.configureMakeTaskPlugins[this.makeTaskPluginName](workspace, this.parentProduct);
		workspace.addCompoundTask(this.buildProductTaskName, [this.cleanProductTaskName, this.makeProductTaskName]);
	}
};
