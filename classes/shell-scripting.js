
"use strict";


module.exports = class ShellScripting {

	static downloadFromTo(cloud, device) { return [`curl -L ${cloud} --output ${device}`]; }
	static ensureDirectory(source) { return [`mkdir -p ${source}`]; }
	static linkSourceToAlias(source, alias) { return [`ln -s $(pwd)/${source} $(pwd)/${alias}`]; }
	static moveFromTo(source, destination) { return [`mv ${source} ${destination}`]; }
	static remove(source) { return [`rm -rf ${source}`]; }
	static unzipInFolder(source, parent) { return [`(cd ${parent}; unzip ${source})`]; }

	static downloadToPathInFolderFromPathAndUnzipFromNameToName(installPath, installFolder, remotePath, compressedName, expandedName) {
		let r = [];
		const compressedInstallPath = installFolder + compressedName;
		const expandedInstallPath = installFolder + expandedName;
		r = r.concat(this.remove(installPath));
		r = r.concat(this.remove(compressedInstallPath));
		r = r.concat(this.remove(expandedInstallPath));
		r = r.concat(this.ensureDirectory(installFolder));
		r = r.concat(this.downloadFromTo(remotePath, compressedInstallPath));
		r = r.concat(this.unzipInFolder(compressedName, installFolder));
		r = r.concat(this.remove(compressedInstallPath));
		r = r.concat(this.moveFromTo(expandedInstallPath, installPath));
		return r;
	}

	static linkAliasPathInFolderToSourcePath(aliasInstallPath, aliasInstallFolder, sourceInstallPath) {
		let r = [];
		r = r.concat(this.remove(aliasInstallPath));
		r = r.concat(this.ensureDirectory(aliasInstallFolder));
		r = r.concat(this.linkSourceToAlias(sourceInstallPath, aliasInstallPath));
		return r;
	}
};
