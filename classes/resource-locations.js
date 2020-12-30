
"use strict";


module.exports = class ResourceLocations {

	static get packageJSON() { return "package.json"; }

	static get librariesFolder() { return "libraries/"; }
	static get importsFolder() { return "imports/"; }
	static get buildFolder() { return "build/"; }

	static get publicInterface() { return "public"; }
};
