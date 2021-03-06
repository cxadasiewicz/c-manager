
"use strict";

const BuildInfo = require("./classes/build-info");
const Bundle = require("./classes/bundle");
const Debugger = require("./classes/debugger");
const FileLocations = require("./classes/file-locations");
const GitHubLibrary = require("./classes/github-library");
const GruntWorkspace = require("./classes/grunt-workspace");
const ImportLink = require("./classes/import-link");
const Library = require("./classes/library");
const LocalLibrary = require("./classes/local-library");
const Manager = require("./classes/manager");
const ProductImport = require("./classes/product-import");
const Product = require("./classes/product");
const ProjectDecoder = require("./classes/project-decoder");
const ProjectJSONDecoder = require("./classes/project-json-decoder");
const Project = require("./classes/project");
const ShellScripting = require("./classes/shell-scripting");
const Workspace = require("./classes/workspace");


module.exports = class CManager {

	static get name() { return "c-manager"; }

	static get BuildInfo() { return BuildInfo; }
	static get Bundle() { return Bundle; }
	static get Debugger() { return Debugger; }
	static get FileLocations() { return FileLocations; }
	static get GitHubLibrary() { return GitHubLibrary; }
	static get GruntWorkspace() { return GruntWorkspace; }
	static get ImportLink() { return ImportLink; }
	static get Library() { return Library; }
	static get LocalLibrary() { return LocalLibrary; }
	static get Manager() { return Manager; }
	static get ProductImport() { return ProductImport; }
	static get Product() { return Product; }
	static get ProjectDecoder() { return ProjectDecoder; }
	static get ProjectJSONDecoder() { return ProjectJSONDecoder; }
	static get Project() { return Project; }
	static get ShellScripting() { return ShellScripting; }
	static get Workspace() { return Workspace; }

	static configureGruntForComponents(grunt, makefuncs) {
		Manager.configureGruntForComponents(grunt, makefuncs);
	}
};
