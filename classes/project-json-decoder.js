
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
	get _variableDefault() { return "default"; }

	get _products() { return "products"; }
	get _productLocalInstallFolder() { return "install"; }
	get _productPublicName() { return "public"; }
	get _productBuildInfo() { return "build"; }

	get _libraries() { return "libraries"; }
	get _gitHubLibrary() { return "github"; }
	get _localLibrary() { return "local"; }

	get _productImports() { return "imports"; }

	get _specSeparator() { return "|"; }

	constructor() {
		super();
	}

	// Managing variables

	addVariablesData(data) {
		if (!data) { return }
		for (let key of Object.keys(data)) {
			const value = this.resolveVariables(data[key]);
			key = this.resolveVariables(key);
			if (!value.startsWith(this._variableDefault + this._specSeparator)) {
				this.variables[key] = value;
			} else if (!(key in this.variables)) {
				this.variables[key] = value.replace(this._variableDefault + this._specSeparator, "");
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
			product.localInstallFolder = this.resolveVariables(productData[this._productLocalInstallFolder]);
			product.publicName = this.resolveVariables(productData[this._productPublicName]);
			const buildData = productData[this._productBuildInfo];
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
			const libraryData = this.resolveVariables(data[libraryKey]).split(this._specSeparator);
			let library;
			switch (libraryData[0]) {
			case this._gitHubLibrary:
				library = new GitHubLibrary();
				library.publisherUsername = libraryData[1];
				library.publishedBundleName = libraryData[2];
				library.version = libraryData[3];
				library.publishedTagPrefix = (libraryData.length > 4 ? libraryData[4] : "");
				library.oauthToken = (libraryData.length > 5 ? libraryData[5] : "");
				break;
			case this._localLibrary:
				library = new LocalLibrary();
				library.publishedBundlePath = libraryData[1];
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
