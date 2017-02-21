/**
 * @module grunt
 * @description exports Grunt config and tasks
 * @author Amplifi Commerce Presentation Layer Technology Group
 * [Built using Grunt, The JavaScript Task Runner]{@link http://gruntjs.com/}
 */
module.exports = function(grunt) {

	'use strict';

	var ampConfig = require('./amp-config.json');
	// Load grunt tasks

	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig(
		{

			pkg: grunt.file.readJSON('package.json'),

			/**
			 *   @description grunt task validates markup using vnu.jar markup checker (https://validator.github.io/validator/).
			 **/
			htmllint: {
				all: {
					options: {
						force: true,
						errorlevels: ['warning', 'error'],
						reporter: 'json',
						reporterOutput: 'reports/validation/html-validation.json'
					},
					src: ['http://www.cedurant.com']//'examples/**/*.html'
				}
			}

		}

	);

	/**
	 * @description This task omits the ccsmin and uglify tasks for debugging purposes, includes JSDoc
	 */
	grunt.registerTask(
		'default',
		'Default task executed when typing grunt',
		function() {
			grunt.task.run(
				['htmllint']
			);
		}
	);

};
