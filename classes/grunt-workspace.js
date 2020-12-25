
"use strict";

const Debugger = require("./debugger");
const Workspace = require("./workspace");


module.exports = class GruntWorkspace extends Workspace {

	constructor() {
		super();
		this.grunt = null;
	}

	get descriptionOverrides() {
		let r = super.descriptionOverrides;
		r["grunt"] = (this.grunt ? "<grunt>" : null);
		return r;
	}

	// Accessing files

	readJSONAt(path) {
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

	// Running main operations

	// Debugging options
	get debugConfigOptionName() {
		return "debug-config";
	}
	get debugWorkspaceOptionName() {
		return "debug-workspace";
	}

	runDebuggingOptions() {
		if (this.grunt.option(this.debugConfigOptionName)) {
			Debugger.log(this.grunt.config);
		}
		if (this.grunt.option(this.debugWorkspaceOptionName)) {
			Debugger.log(this);
		}
	}
}
