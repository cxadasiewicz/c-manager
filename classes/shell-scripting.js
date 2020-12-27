
"use strict";


module.exports = class ShellScripting {

	static download(remote, local) { return [`curl -L ${remote} --output ${local}`]; }
	static ensureFolder(source) { return [`mkdir -p ${source}`]; }
	static link(alias, target) { return [`ln -s $(pwd)/${target} $(pwd)/${alias}`]; }
	static move(source, target) { return [`mv ${source} ${target}`]; }
	static removeAll(source) { return [`rm -rf ${source}*`]; }
	static removeEmptyFolder(source) { return [`rm -fd ${source}`]; }
	static removeFile(source) { return [`rm -f ${source}`]; }
	static removeFolder(source) { return [`rm -rf ${source}`]; }
	static unzip(file, folder) { return [`(cd ${folder}; unzip ${file})`]; }
};
