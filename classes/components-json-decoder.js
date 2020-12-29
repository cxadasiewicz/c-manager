
"use strict";

const BuildingInstruction = require("./building-instruction");
const ComponentsDecoder = require("./components-decoder");
const GitHubLibrary = require("./github-library");
const ImportLink = require("./import-link");
const PointerLibrary = require("./pointer-library");
const ProductImport = require("./product-import");
const Product = require("./product");


module.exports = class ComponentsJSONDecoder extends ComponentsDecoder {

	get _components() { return "components"; }

	get _variables() { return "variables"; }

	get _products() { return "products"; }
	get _productLocalInstallFolder() { return "install"; }
	get _productPublicName() { return "public"; }
	get _productBuildingInstruction() { return "build"; }

	get _libraries() { return "libraries"; }
	get _gitHubLibrary() { return "github"; }
	get _pointerLibrary() { return "point"; }

	get _productImports() { return "imports"; }

	constructor() {
		super();
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
			const buildData = productData[this._productBuildingInstruction];
			if (buildData) {
				const buildingInstruction = new BuildingInstruction();
				buildingInstruction.makefuncName = this.resolveVariables(buildData);
				product.setBuildingInstruction(buildingInstruction);
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
			case this._pointerLibrary:
				library = new PointerLibrary();
				library.pointedBundlePath = libraryData[1];
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
				productImport.importedBundleReference = this.resolveVariables(importKey);
				const productImportData = productData[importKey];
				for (const aliasKey of Object.keys(productImportData)) {
					const importLink = new ImportLink();
					importLink.aliasFolder = this.resolveVariables(aliasKey);
					importLink.targetSubpath = this.resolveVariables(productImportData[aliasKey]);
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
};
