
"use strict";

const BuildInfo = require("./build-info");
const GitHubLibrary = require("./github-library");
const ImportLink = require("./import-link");
const LocalLibrary = require("./local-library");
const ProductImport = require("./product-import");
const Product = require("./product");
const ProjectDecoder = require("./project-decoder");


module.exports = class ProjectJSONDecoder extends ProjectDecoder {

	get _components() { return "components"; }
	get _variables() { return "variables"; }
	get _products() { return "products"; }
	get _libraries() { return "libraries"; }
	get _productImports() { return "imports"; }

	get _installFolder() { return "install"; }
	get _publicName() { return "public"; }
	get _build() { return "build"; }

	get _variableHead() { return "[["; }
	get _variableTail() { return "]]"; }
	get _inheritedValue() { return "inherit"; }

	get _archiveSpecSeparator() { return "|"; }
	get _gitHubLibrary() { return "github"; }
	get _localLibrary() { return "local"; }

	constructor() {
		super();
		this.variables = {};
	}

	// Managing variables

	resolveVariables(string) {
		let r = string;
		for (const key of Object.keys(this.variables)) {
			r = r.split(this._variableHead + key + this._variableTail).join(this.variables[key]);
		}
		return r;
	}

	addVariablesData(data) {
		if (!data) { return }
		for (let key of Object.keys(data)) {
			const value = this.resolveVariables(data[key]);
			key = this.resolveVariables(key);
			if (value != this._inheritedValue) {
				this.variables[key] = value;
			} else if (!(key in this.variables)) {
				this.variables[key] = "";
			}
		}
	}

	// Parsing component definitions

	// Products
	addProductsDataToProject(data, project) {
		if (!data) { return }
		for (const productKey of Object.keys(data)) {
			const product = new Product();
			product.name = this.resolveVariables(productKey);
			const productData = data[productKey];
			product.localInstallFolder = this.resolveVariables(productData[this._installFolder]);
			product.publicName = this.resolveVariables(productData[this._publicName]);
			const buildData = productData[this._build];
			if (buildData) {
				const buildInfo = new BuildInfo();
				buildInfo.makefuncName = this.resolveVariables(buildData);
				product.setBuildInfo(buildInfo);
			}
			project.addProduct(product);
		}
	}

	// Libraries
	addLibrariesDataToProject(data, project) {
		if (!data) { return }
		for (const libraryKey of Object.keys(data)) {
			const archiveData = this.resolveVariables(data[libraryKey]).split(this._archiveSpecSeparator);
			let library;
			switch (archiveData[0]) {
			case this._gitHubLibrary:
				library = new GitHubLibrary();
				library.publisherUsername = archiveData[1];
				library.publishedBundleName = archiveData[2];
				library.version = archiveData[3];
				library.publishedTagPrefix = (archiveData.length > 4 ? archiveData[4] : "");
				library.oauthToken = (archiveData.length > 5 ? archiveData[5] : "");
				break;
			case this._localLibrary:
				library = new LocalLibrary();
				library.publishedBundlePath = archiveData[1];
				break;
			}
			library.name = this.resolveVariables(libraryKey);
			project.addLibrary(library);
		}
	}

	// Product imports
	addProductImportsDataToProject(data, project) {
		if (!data) { return }
		for (const productKey of Object.keys(data)) {
			const product = project.products[this.resolveVariables(productKey)];
			const productData = data[productKey];
			for (const importKey of Object.keys(productData)) {
				const productImport = new ProductImport();
				productImport.importedBundle = project.bundles[this.resolveVariables(importKey)];
				const productImportData = productData[importKey];
				for (const aliasKey of Object.keys(productImportData)) {
					const importLink = new ImportLink();
					importLink.aliasFolder = this.resolveVariables(aliasKey);
					importLink.targetPath = this.resolveVariables(productImportData[aliasKey]);
					productImport.addImportLink(importLink);
				}
				product.addProductImport(productImport);
			}
		}
	}

	// Decoding components

	componentsDataFrom(data) {
		return (data ? data[this._components] : null);
	}
	addComponentsDataToProject(data, project) {
		this.addVariablesData(data[this._variables]);
		this.addProductsDataToProject(data[this._products], project);
		this.addLibrariesDataToProject(data[this._libraries], project);
		this.addProductImportsDataToProject(data[this._productImports], project);
	}
}
