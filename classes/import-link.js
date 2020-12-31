
"use strict";

const ResourceIdentification = require("./resource-identification");
const ShellScripting = require("./shell-scripting");


module.exports = class ImportLink {

	constructor() {
		this.parentImport = null;
		this.aliasFolderReference = "";
		this.sourceSubpath = "";
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
	get sourceInstallPath() { return this.parentImport.aliasInstallPath + "/" + this.sourceSubpath; }

	// Generating installation scripts

	get shellScriptToInstallImportLink() {
		return ShellScripting.linkAliasPathInFolderToSourcePath(
			this.aliasInstallPath,
			this.aliasInstallFolder,
			this.sourceInstallPath
		);
	}
	get shellScriptToUninstallImportLink() {
		return ShellScripting.remove(this.aliasInstallFolder);
	}
};
