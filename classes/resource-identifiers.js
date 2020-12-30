
"use strict";


module.exports = class ResourceIdentifiers {

	static get packageJSON() { return "package.json"; }

	static get librariesFolder() { return "libraries/"; }
	static get productImportsFolder() { return "imports/"; }
	static get buildFolder() { return "build/"; }

	static get publicInterface() { return "public"; }
};
