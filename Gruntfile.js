module.exports = grunt => {
  const gruntConfig = {
    eslint: {
      all: { src: ['scripts/*.js', '*.js', 'scripts/protocols/**/*.js'] },
      options: { fix: grunt.option('fix') }
    }
  };

  grunt.initConfig(gruntConfig);
  grunt.loadNpmTasks('grunt-eslint');
  grunt.registerTask('style', ['eslint']);
  grunt.registerTask('test', ['style']);
  grunt.registerTask('build', ['test']);
};
