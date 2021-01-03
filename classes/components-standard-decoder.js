
"use strict";

const BuildingInstruction = require("./building-instruction");
const ComponentsDecoderImplementer = require("./components-decoder-implementer");
const DeviceLibrary = require("./device-library");
const GitHubLibrary = require("./github-library");
const ImportLink = require("./import-link");
const ProductImport = require("./product-import");
const Product = require("./product");


module.exports = class ComponentsStandardDecoder extends ComponentsDecoderImplementer {

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

	// Decoding components data

	decodeProductsDataIntoProject(data, project) {
		if (data) {
			for (const [productKey, productData] of Object.entries(data)) {
				const product = project.addProduct(new Product({
					name: this.resolveVariables(productKey),
					localInstallFolder: this.resolveVariables(productData[ComponentsStandardDecoder.productLocalInstallFolderKey]),
					publicName: this.resolveVariables(productData[ComponentsStandardDecoder.productPublicNameKey]),
				}));
				const buildData = productData[ComponentsStandardDecoder.productBuildingInstructionKey];
				if (buildData) {
					product.setBuildingInstruction(new BuildingInstruction({
						makefuncName: this.resolveVariables(buildData)
					}));
				}
			}
		}
	}

	decodeLibrariesDataIntoProject(data, project) {
		if (data) {
			for (const [libraryKey, librarySpec] of Object.entries(data)) {
				const libraryName = this.resolveVariables(libraryKey);
				const librarySpecParts = this.resolveVariables(librarySpec).split(ComponentsStandardDecoder.specSeparator);
				let library;
				switch (librarySpecParts[0]) {
				case ComponentsStandardDecoder.gitHubLibraryOption:
					library = new GitHubLibrary({
						name: libraryName,
						publisherUsername: librarySpecParts[1],
						publishedBundleName: librarySpecParts[2],
						version: librarySpecParts[3],
						publishedTagPrefix: (librarySpecParts.length > 4 ? librarySpecParts[4] : ""),
						oauthToken: (librarySpecParts.length > 5 ? librarySpecParts[5] : "")
					});
					break;
				case ComponentsStandardDecoder.deviceLibraryOption:
					library = new DeviceLibrary({
						name: libraryName,
						publishedBundleLocalInstallPath: librarySpecParts[1]
					});
					break;
				}
				project.addLibrary(library);
			}
		}
	}

	decodeProductImportsDataIntoProject(data, project) {
		if (data) {
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
	}

	decodeComponentsDataIntoProject(componentsData, project) {
		this.decodeVariablesData(componentsData[ComponentsStandardDecoder.variablesKey]);
		this.decodeProductsDataIntoProject(componentsData[ComponentsStandardDecoder.productsKey], project);
		this.decodeLibrariesDataIntoProject(componentsData[ComponentsStandardDecoder.librariesKey], project);
		this.decodeProductImportsDataIntoProject(componentsData[ComponentsStandardDecoder.productImportsKey], project);
	}
};
