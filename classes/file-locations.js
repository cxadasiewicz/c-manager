
"use strict";


module.exports = class FileLocations {

	static get packageJSON() { return "package.json"; }

	static get librariesFolder() { return "libraries/"; }
	static get importsFolder() { return "imports/"; }
	static get buildsFolder() { return "builds/"; }
};
