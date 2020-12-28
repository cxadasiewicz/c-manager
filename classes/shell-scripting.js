
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
};
