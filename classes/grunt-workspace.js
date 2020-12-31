
"use strict";

const Logger = require("./logger");
const Workspace = require("./workspace");


module.exports = class GruntWorkspace extends Workspace {

	static get _debugConfigOption() { return "debug-config"; }

	constructor(grunt, configureMakeTaskPlugins = {}) {
		super(configureMakeTaskPlugins);
		this.grunt = grunt;
	}
	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["grunt"] = (this.grunt ? "<grunt>" : null);
		return r;
	}

	// Getting workspace options

	workspaceOption(option) {
		return this.grunt.option(option);
	}

	// Reading files

	tryReadingJSONAt(path) {
		return this.grunt.file.readJSON(path);
	}

	// Configuring tasks

	beginConfiguringTasks() {
		this.grunt.initConfig({});
		this.grunt.registerTask("default", []);
		this.grunt.loadNpmTasks("grunt-shell");
	}

	addShellTask(name, script) {
		if (script.length) {
			this.grunt.config.merge({
				shell: {
					[name]: {
						command: script.join("&&")
					}
				}
			});
			this.grunt.registerTask(name, ["shell:" + name]);
		} else {
			this.grunt.registerTask(name, []);
		}
	}
	addCompoundTask(name, subnames) {
		this.grunt.registerTask(name, subnames);
	}

	// Managing debugging

	get shouldDebugConfig() { return this.workspaceOption(GruntWorkspace._debugConfigOption); }

	runDebugging() {
		super.runDebugging();
		if (this.shouldDebugConfig) {
			Logger.log(this.grunt.config);
		}
	}
};
