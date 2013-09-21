module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['./'],
            shallow: ['**.js'],
            gruntfile: ['GruntFile.js'],
            src: ['src/'],
            test: ['test/'],
            build: ['<%= pkg.name %>.js'],
            options: {
                // `**/**` matches in current and sub dirs.
                ignores: ['**/**/node_modules/', '**/**/vendor/', '**/**.min.js'],
                expr:true, sub:true, supernew:true, debug:true, node:true, 
                boss:true, devel:true, evil:true, laxcomma:true, eqnull:true, 
                undef:true, unused:true, browser:true, jquery:true, maxerr:10
            }
        },
        concat: {
            build: {
                files: {'<%= pkg.name %>.js': ['src/<%= pkg.name %>.js']},
                options: {process: function(src) {
                    return grunt.template.process(src).trim();
                }}
            },
            component: {
                // Fill `component.json` w/ `package.json` data.
                files: {'component.json': ['package.json']},
                options: {process: function(pkg) {
                    var dest = 'component.json';
                    pkg = JSON.parse(pkg);
                    return JSON.stringify(['name', ['repo', function() {
                        return pkg.repository.url.replace(/.*\/([\w]+\/[\w.-]+)\.git$/, '$1');                                
                    }], 'description', 'version', 'license', 'main', ['scripts', function(comp) {
                        // Assume "main" occupies index 0.
                        comp.scripts ? comp.scripts.shift() : comp.scripts = [];
                        comp.scripts.unshift(comp.main || 'index.js');
                    }], 'keywords'].reduce(function(comp, key, i) {
                        if (typeof key != 'object') pkg.hasOwnProperty(key) && (comp[key] = pkg[key]);
                        else undefined === (i = key[1](comp)) || (comp[key[0]] = i);
                        return comp;
                    }, grunt.file.isFile(dest) && grunt.file.readJSON(dest) || {}), undefined, 4);
                }}
            }
        },
        uglify: {
            options: {report: 'gzip', preserveComments: 'some'},
            build: {files: {'<%= pkg.name %>.min.js': ['<%= pkg.name %>.js']}}
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['jshint:gruntfile', 'jshint:src', 'concat', 'jshint:build', 'uglify']);
};