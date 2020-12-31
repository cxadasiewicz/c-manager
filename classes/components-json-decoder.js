
"use strict";

const BuildingInstruction = require("./building-instruction");
const ComponentsDecoder = require("./components-decoder");
const DeviceLibrary = require("./device-library");
const GitHubLibrary = require("./github-library");
const ImportLink = require("./import-link");
const ProductImport = require("./product-import");
const Product = require("./product");


module.exports = class ComponentsJSONDecoder extends ComponentsDecoder {

	static get componentsKey() { return "components"; }

	static get variablesKey() { return "variables"; }

	static get productsKey() { return "products"; }
	static get productLocalInstallFolderKey() { return "install"; }
	static get productPublicNameKey() { return "public"; }
	static get productBuildingInstructionKey() { return "build"; }

	static get librariesKey() { return "libraries"; }
	static get gitHubLibraryOption() { return "github"; }
	static get deviceLibraryOption() { return "point"; }

	static get productImportsKey() { return "imports"; }

	constructor() {
		super();
	}

	// Parsing component definitions

	// Products
	addProductsDataToProject(data, project) {
		if (!data) { return }
		for (const [productKey, productData] of Object.entries(data)) {
			const product = project.addProduct(new Product({
				name: this.resolveVariables(productKey),
				localInstallFolder: this.resolveVariables(productData[ComponentsJSONDecoder.productLocalInstallFolderKey]),
				publicName: this.resolveVariables(productData[ComponentsJSONDecoder.productPublicNameKey]),
			}));
			const buildData = productData[ComponentsJSONDecoder.productBuildingInstructionKey];
			if (buildData) {
				product.setBuildingInstruction(new BuildingInstruction({
					makeTaskPluginName: this.resolveVariables(buildData)
				}));
			}
		}
	}

	// Libraries
	addLibrariesDataToProject(data, project) {
		if (!data) { return }
		for (const [libraryKey, librarySpec] of Object.entries(data)) {
			const libraryName = this.resolveVariables(libraryKey);
			const librarySpecParts = this.resolveVariables(librarySpec).split(ComponentsJSONDecoder.specSeparator);
			let library;
			switch (librarySpecParts[0]) {
			case ComponentsJSONDecoder.gitHubLibraryOption:
				library = new GitHubLibrary({
					name: libraryName,
					publisherUsername: librarySpecParts[1],
					publishedBundleName: librarySpecParts[2],
					version: librarySpecParts[3],
					publishedTagPrefix: (librarySpecParts.length > 4 ? librarySpecParts[4] : ""),
					oauthToken: (librarySpecParts.length > 5 ? librarySpecParts[5] : "")
				});
				break;
			case ComponentsJSONDecoder.deviceLibraryOption:
				library = new DeviceLibrary({
					name: libraryName,
					publishedBundleLocalInstallPath: librarySpecParts[1]
				});
				break;
			}
			project.addLibrary(library);
		}
	}

	// Product imports
	addProductImportsDataToProject(data, project) {
		if (!data) { return }
		for (const [productKey, productData] of Object.entries(data)) {
			const product = project.products[this.resolveVariables(productKey)];
			for (const [importKey, productImportData] of Object.entries(productData)) {
				const productImport = product.addProductImport(new ProductImport({
					importedBundleReference: this.resolveVariables(importKey)
				}));
				for (const [aliasKey, sourceSubpath] of Object.entries(productImportData)) {
					productImport.addImportLink(new ImportLink({
						aliasFolderReference: this.resolveVariables(aliasKey),
						sourceSubpath: this.resolveVariables(sourceSubpath)
					}));
				}
			}
		}
	}

	// Decoding components

	componentsDataFrom(data) {
		return (data ? data[ComponentsJSONDecoder.componentsKey] : null);
	}
	addComponentsDataToProject(data, project) {
		this.addVariablesData(data[ComponentsJSONDecoder.variablesKey]);
		this.addProductsDataToProject(data[ComponentsJSONDecoder.productsKey], project);
		this.addLibrariesDataToProject(data[ComponentsJSONDecoder.librariesKey], project);
		this.addProductImportsDataToProject(data[ComponentsJSONDecoder.productImportsKey], project);
	}
};
