
"use strict";


module.exports = class ShellScripting {

	static downloadPathToPath(remote, local) { return [`curl -L ${remote} --output ${local}`]; }
	static ensureDirectory(source) { return [`mkdir -p ${source}`]; }
	static linkPathToPath(alias, target) { return [`ln -s $(pwd)/${target} $(pwd)/${alias}`]; }
	static movePathToPath(source, target) { return [`mv ${source} ${target}`]; }
	static removeAllInFolder(source) { return [`rm -rf ${source}*`]; }
	static removeEmptyDirectory(source) { return [`rm -fd ${source}`]; }
	static removeFile(source) { return [`rm -f ${source}`]; }
	static removeDirectory(source) { return [`rm -rf ${source}`]; }
	static unzipFileToDirectory(file, parent) { return [`(cd ${parent}; unzip ${file})`]; }

	static downloadAtPathInFolderFromPathAndUnzipFromPathToPath(installPath, installFolder, remotePath, compressedName, expandedName) {
		let r = [];
		const compressedPath = installFolder + compressedName;
		const expandedPath = installFolder + expandedName;
		r = r.concat(this.removeDirectory(installPath));
		r = r.concat(this.removeFile(compressedPath));
		r = r.concat(this.removeDirectory(expandedPath));
		r = r.concat(this.ensureDirectory(installFolder));
		r = r.concat(this.downloadPathToPath(remotePath, compressedPath));
		r = r.concat(this.unzipFileToDirectory(compressedName, installFolder));
		r = r.concat(this.removeFile(installFolder + compressedName));
		r = r.concat(this.movePathToPath(expandedPath, installPath));
		return r;
	}

	static linkAtPathInFolderToPath(installPath, installFolder, targetPath) {
		let r = [];
		r = r.concat(this.removeFile(installPath));
		r = r.concat(this.ensureDirectory(installFolder));
		r = r.concat(this.linkPathToPath(installPath, targetPath));
		return r;
	}
};
