
"use strict";

const FileLocations = require("./file-locations");
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
	get shellScriptToUninstallBuild() {
		let r = [];
		r = r.concat(ShellScripting.removeDirectory(this.parentProduct.publicInstallPath));
		r = r.concat(ShellScripting.removeEmptyDirectory(this.parentProduct.installPath + "/" + FileLocations.buildFolder));
		return r;
	}

	// Configuring workspace tasks

	get makeProductTaskName() { return "make_" + this.parentProduct.name; }
	get buildProductTaskName() { return "build_" + this.parentProduct.name; }
	get cleanProductTaskName() { return "clean_" + this.parentProduct.name; }
	get uninstallProductTaskName() { return "uninstall_" + this.parentProduct.name; }

	configureWorkspaceToBuildProduct(workspace) {
		workspace.addShellTask(this.cleanProductTaskName, this.shellScriptToCleanBuild);
		workspace.configureMakeTaskPlugins[this.makeTaskPluginName](workspace, this.parentProduct);
		workspace.addCompoundTask(this.buildProductTaskName, [this.cleanProductTaskName, this.makeProductTaskName]);
		workspace.addShellTask(this.uninstallProductTaskName, this.shellScriptToUninstallBuild);
	}
};
