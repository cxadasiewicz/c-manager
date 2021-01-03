
"use strict";

const Logger = require("./logger");
const WorkspaceImplementer = require("./workspace-implementer");


module.exports = class GruntWorkspace extends WorkspaceImplementer {

	static get debugConfigOption() { return "debug-config"; }

	constructor(grunt, plugins = {}) {
		super(plugins);
		this.grunt = grunt;
	}
	get descriptionOverrides() {
		return {
			"grunt": (this.grunt ? "<grunt>" : null)
		};
	}

	// Getting workspace options

	workspaceOption(option) {
		return this.grunt.option(option);
	}

	// Reading JSON files via the shell

	tryReadingJSONFileAt(path) {
		return this.grunt.file.readJSON(path);
	}

	// Defining shell tasks

	defineTaskWithNameAndScript(name, script) {
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
	defineTaskWithNameAndSubtasks(name, subtasks) {
		this.grunt.registerTask(name, subtasks);
	}

	// Configuring tasks

	beginConfiguringTasks() {
		this.grunt.initConfig({});
		this.grunt.registerTask("default", []);
		this.grunt.loadNpmTasks("grunt-shell");
	}

	// Debugging

	get shouldDebugConfig() { return this.workspaceOption(GruntWorkspace.debugConfigOption); }

	runDebugging() {
		super.runDebugging();
		if (this.shouldDebugConfig) {
			Logger.log(this.grunt.config);
		}
	}
};
