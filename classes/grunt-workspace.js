
"use strict";

const Debugger = require("./debugger");
const Workspace = require("./workspace");


module.exports = class GruntWorkspace extends Workspace {

	constructor(grunt, makefuncs = {}) {
		super(makefuncs);
		this.grunt = grunt;
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

	// Getting workspace options

	workspaceOption(option) {
		return this.grunt.option(option);
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

	get debugConfigOption() { return "debug-config"; }

	runDebugging() {
		super.runDebugging();
		if (this.workspaceOption(this.debugConfigOption)) {
			Debugger.log(this.grunt.config);
		}
	}
}
