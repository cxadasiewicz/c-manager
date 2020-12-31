
"use strict";

const BuildingInstruction = require("./classes/building-instruction");
const Bundle = require("./classes/bundle");
const CloudLibrary = require("./classes/cloud-library");
const ComponentsDecoder = require("./classes/components-decoder");
const ComponentsJSONDecoder = require("./classes/components-json-decoder");
const DeviceLibrary = require("./classes/device-library");
const ResourceIdentification = require("./classes/resource-identification");
const GitHubLibrary = require("./classes/github-library");
const GruntWorkspace = require("./classes/grunt-workspace");
const ImportLink = require("./classes/import-link");
const Library = require("./classes/library");
const Logger = require("./classes/logger");
const Manager = require("./classes/manager");
const ProductImport = require("./classes/product-import");
const Product = require("./classes/product");
const Project = require("./classes/project");
const ShellScripting = require("./classes/shell-scripting");
const Workspace = require("./classes/workspace");


module.exports = class CManager {

	static get name() { return "c-manager"; }

	static get BuildingInstruction() { return BuildingInstruction; }
	static get Bundle() { return Bundle; }
	static get CloudLibrary() { return CloudLibrary; }
	static get ComponentsDecoder() { return ComponentsDecoder; }
	static get ComponentsJSONDecoder() { return ComponentsJSONDecoder; }
	static get DeviceLibrary() { return DeviceLibrary; }
	static get ResourceIdentification() { return ResourceIdentification; }
	static get GitHubLibrary() { return GitHubLibrary; }
	static get GruntWorkspace() { return GruntWorkspace; }
	static get ImportLink() { return ImportLink; }
	static get Library() { return Library; }
	static get Logger() { return Logger; }
	static get Manager() { return Manager; }
	static get ProductImport() { return ProductImport; }
	static get Product() { return Product; }
	static get Project() { return Project; }
	static get ShellScripting() { return ShellScripting; }
	static get Workspace() { return Workspace; }

	static configureGruntForComponents(grunt, makefuncs) {
		Manager.configureGruntForComponents(grunt, makefuncs);
	}
};
