module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			javascript: {
				options: {
					separator: ";"
				},
				src: [
					'bower_components/jquery/jquery.min.js',
					'bower_components/bootstrap-css/js/bootstrap.min.js',
					'bower_components/rickshaw/vendor/d3.min.js',
					'bower_components/rickshaw/vendor/d3.layout.min.js',
					'bower_components/rickshaw/rickshaw.min.js',
					'bower_components/swig/js/swig.min.js'
				],
				dest: 'deps/vendor.js'
			},
			css: {
				src: [
					'bower_components/bootstrap-css/css/bootstrap.min.css',
					'bower_components/rickshaw/rickshaw.min.css'
				],
				dest: 'deps/vendor.css'
			}
		},
		copy: {
			vendor: {
				expand: true,
				src: 'deps/vendor.*',
				dest: 'static/',
				flatten: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('build', ['concat', 'copy']);
}
