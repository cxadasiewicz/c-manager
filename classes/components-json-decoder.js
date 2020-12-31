
"use strict";

const BuildingInstruction = require("./building-instruction");
const ComponentsDecoder = require("./components-decoder");
const DeviceLibrary = require("./device-library");
const GitHubLibrary = require("./github-library");
const ImportLink = require("./import-link");
const ProductImport = require("./product-import");
const Product = require("./product");


module.exports = class ComponentsJSONDecoder extends ComponentsDecoder {

	static get _components() { return "components"; }

	static get _variables() { return "variables"; }

	static get _products() { return "products"; }
	static get _productLocalInstallFolder() { return "install"; }
	static get _productPublicName() { return "public"; }
	static get _productBuildingInstruction() { return "build"; }

	static get _libraries() { return "libraries"; }
	static get _gitHubLibrary() { return "github"; }
	static get _deviceLibrary() { return "point"; }

	static get _productImports() { return "imports"; }

	constructor() {
		super();
	}

	// Parsing component definitions

	// Products
	addProductsDataToProject(data, project) {
		if (!data) { return }
		for (const [productKey, productData] of Object.entries(data)) {
			const product = new Product();
			product.name = this.resolveVariables(productKey);
			product.localInstallFolder = this.resolveVariables(productData[ComponentsJSONDecoder._productLocalInstallFolder]);
			product.publicName = this.resolveVariables(productData[ComponentsJSONDecoder._productPublicName]);
			const buildData = productData[ComponentsJSONDecoder._productBuildingInstruction];
			if (buildData) {
				const buildingInstruction = new BuildingInstruction();
				buildingInstruction.makeTaskPluginName = this.resolveVariables(buildData);
				product.setBuildingInstruction(buildingInstruction);
			}
			project.addProduct(product);
		}
	}

	// Libraries
	addLibrariesDataToProject(data, project) {
		if (!data) { return }
		for (const [libraryKey, librarySpec] of Object.entries(data)) {
			const librarySpecParts = this.resolveVariables(librarySpec).split(ComponentsJSONDecoder._specSeparator);
			let library;
			switch (librarySpecParts[0]) {
			case ComponentsJSONDecoder._gitHubLibrary:
				library = new GitHubLibrary();
				library.publisherUsername = librarySpecParts[1];
				library.publishedBundleName = librarySpecParts[2];
				library.version = librarySpecParts[3];
				library.publishedTagPrefix = (librarySpecParts.length > 4 ? librarySpecParts[4] : "");
				library.oauthToken = (librarySpecParts.length > 5 ? librarySpecParts[5] : "");
				break;
			case ComponentsJSONDecoder._deviceLibrary:
				library = new DeviceLibrary();
				library.publishedBundlePath = librarySpecParts[1];
				break;
			}
			library.name = this.resolveVariables(libraryKey);
			project.addLibrary(library);
		}
	}

	// Product imports
	addProductImportsDataToProject(data, project) {
		if (!data) { return }
		for (const [productKey, productData] of Object.entries(data)) {
			const product = project.products[this.resolveVariables(productKey)];
			for (const [importKey, productImportData] of Object.entries(productData)) {
				const productImport = new ProductImport();
				productImport.importedBundleReference = this.resolveVariables(importKey);
				for (const [aliasKey, sourceSubpath] of Object.entries(productImportData)) {
					const importLink = new ImportLink();
					importLink.aliasFolderReference = this.resolveVariables(aliasKey);
					importLink.sourceSubpath = this.resolveVariables(sourceSubpath);
					productImport.addImportLink(importLink);
				}
				product.addProductImport(productImport);
			}
		}
	}

	// Decoding components

	componentsDataFrom(data) {
		return (data ? data[ComponentsJSONDecoder._components] : null);
	}
	addComponentsDataToProject(data, project) {
		this.addVariablesData(data[ComponentsJSONDecoder._variables]);
		this.addProductsDataToProject(data[ComponentsJSONDecoder._products], project);
		this.addLibrariesDataToProject(data[ComponentsJSONDecoder._libraries], project);
		this.addProductImportsDataToProject(data[ComponentsJSONDecoder._productImports], project);
	}
};
