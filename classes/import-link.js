
"use strict";

const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class ImportLink {

	constructor() {
		this.parentImport = null;
		this.aliasFolderReference = "";
		this.targetSubpath = "";
		this._aliasFolderCache = undefined;
	}
	get descriptionOverrides() {
		return {
			"parentImport": (this.parentImport ? this.parentImport.importedBundleReference : null)
		};
	}

	// Getting the alias folder

	calculateAliasFolder() {
		let r = this.aliasFolderReference;
		if (r == ResourceIdentification.publicInterfaceName || r.startsWith(ResourceIdentification.publicInterfaceName + "/")) {
			const publicName = this.parentImport.parentProduct.publicName;
			if (publicName) {
				r = r.replace(ResourceIdentification.publicInterfaceName, publicName);
				if (r == publicName) {
					r += "/";
				}
			}
		}
		return r;
	}
	get aliasFolder() {
		if (this._aliasFolderCache == undefined) {
			this._aliasFolderCache = this.calculateAliasFolder();
		}
		return this._aliasFolderCache;
	}

	// Getting resource addresses

	get aliasInstallFolder() { return this.parentImport.parentProduct.installPath + "/" + this.aliasFolder + ResourceIdentification.productImportsFolder; }
	get aliasInstallPath() { return this.aliasInstallFolder + this.parentImport.importedBundleName; }
	get targetInstallPath() { return this.parentImport.aliasInstallPath + "/" + this.targetSubpath; }

	// Generating installation scripts

	get shellScriptToInstallImportLink() {
		return ShellScripting.linkAtPathInFolderToPath(
			this.aliasInstallPath,
			this.aliasInstallFolder,
			this.targetInstallPath
		);
	}
	get shellScriptToUninstallImportLink() {
		return ShellScripting.removeDirectory(this.aliasInstallFolder);
	}
};
