import { BundlerConfiguration, bundler } from '../index';

import gulp = require('gulp');
import map = require('map-stream');

function formatContent(content: string) {
    return content
        .replace(/\n|\r/g, '')
        .replace(/\s/g, '')
        .replace(/'/g, '"');
}

describe('bundler', () => {
    describe('File content ordered', () => {
        it('It should return all dependencies ordered. entrypoint2.js has a module EntryPoint2 that depends on Dependency1 that depends on Dependency2. It should ordered like Dependency2, Dependency1, EntryPoint2', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entrypoint2.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        expect(content.indexOf('Dependency3')).toBeLessThan(
                            content.indexOf('Dependency2')
                        );
                        expect(content.indexOf('Dependency2')).toBeLessThan(
                            content.indexOf('Dependency1')
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
        it('It should return a file with its content ordered by entry point.', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entrypoint2.js', 'entrypoint1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        expect(content.indexOf('EntryPoint2')).toBeLessThan(
                            content.indexOf('EntryPoint1')
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
        it('It should return only one file with name shopping.js.', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entrypoint2.js', 'entrypoint1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['(.*).js']
                            }
                        ]
                    }
                ]
            };
            const files = [];
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        files.push(file.path);
                        done(null, file);
                    })
                )
                .on('end', function() {
                    expect(files.length).toBe(1);
                    expect(files[0]).toBe('shopping.js');
                    cb();
                });
        });
        it('It should return a file with name shopping.js with its content ordered by dependencies', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entrypoint2.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            const files = [];
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        files.push(file.path);
                        done(null, file);
                    })
                )
                .on('end', function() {
                    expect(files.length).toBe(1);
                    expect(files[0]).toBe('shopping.js');
                    cb();
                });
        });
        it('It should throw an error because a module that is a dependency does not exist', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entryPointError.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'Missing module. Check that module NotExistingDependency is an existing module'
                    );
                    cb();
                });
        });
        it('It should throw an error because the entry point file does not exist', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['notExistingFile.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'Entry point notExistingFile.js does not exist(file extension required)'
                    );
                    cb();
                });
        });
        it('It should return a file with its content correctly ordered. This test is testing an error found in the file ordered', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['Application.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        expect(content.indexOf("define('SuiteLogs")).toBeLessThan(
                            content.indexOf("define('SC.Models.Init")
                        );
                        expect(content.indexOf("define('SC.Models.Init")).toBeLessThan(
                            content.indexOf("define('Utils")
                        );
                        expect(content.indexOf("define('Console")).toBeLessThan(
                            content.indexOf("define('Configuration")
                        );
                        expect(content.indexOf("define('Utils")).toBeLessThan(
                            content.indexOf("define('Configuration")
                        );
                        expect(content.indexOf("define('SC.Models.Init")).toBeLessThan(
                            content.indexOf("define('Configuration")
                        );
                        expect(content.indexOf("define('Configuration")).toBeLessThan(
                            content.indexOf("define('Application")
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('Insert content of entry point that is not an amd module', () => {
        it('It should insert the content of the entry point even if it is not an amd module', cb => {
            const entryPointContent = "console.log('notAmdModule');";
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entryPointNotAmdModule.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        expect(content.indexOf(entryPointContent)).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('Insert content of entry point that does not have an amd module name', () => {
        it('It should insert the content of the file and look for the defined dependency, in this case, Dependency2', cb => {
            const entryPointContent = "define(['Dependency2'], function() {});";
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entryPointNotAmdModuleName.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        expect(content.indexOf('Dependency2')).toBeLessThan(
                            content.indexOf(entryPointContent)
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('exportManifest', () => {
        it('It should returns 2 files, one with name shopping.js and the content of the entrypoint1.js file and other with name manifest.json and its content should be an array with the value entrypoint1.js', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entrypoint1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$'],
                                exportManifest: 'manifest.json'
                            }
                        ]
                    }
                ]
            };
            const filesNames = [];

            const shoppingFileContent = "define('EntryPoint1', function() {});";
            let manifestContent = '';
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = file.contents.toString();
                        filesNames.push(file.path);
                        if (file.path === 'manifest.json') {
                            manifestContent = file.contents.toString();
                        } else {
                            expect(content.indexOf(shoppingFileContent)).toBeGreaterThan(-1);
                        }
                        done(null, file);
                    })
                )
                .on('end', function() {
                    expect(filesNames).toEqual(
                        expect.arrayContaining(['shopping.js', 'manifest.json'])
                    );
                    expect(JSON.parse(manifestContent)).toEqual(
                        expect.arrayContaining(['EntryPoint1'])
                    );
                    cb();
                });
        });
        describe('skipManifestDependencies', () => {
            it('It should not include de dependency defined in the skipManifestDependencies', cb => {
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entrypoint1.js', 'entrypoint2.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$'],
                                    exportManifest: 'manifest.json'
                                }
                            ],
                            skipManifestDependencies: ['EntryPoint2']
                        }
                    ]
                };

                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            if (file.path === 'manifest.json') {
                                const manifestContent = JSON.parse(content);
                                expect(manifestContent.indexOf('EntryPoint2')).toEqual(-1);
                            }
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
    });
    describe('shim', () => {
        describe('exports', () => {
            it('It should return a file with its content following the exports template shim', cb => {
                const shimContent =
                    '(function(root) {\n' +
                    'define("DependencyShim", [], function() {\n' +
                    '  return (function() {\n' +
                    "console.log('shimFile');\n" +
                    'return root.dependencyShim = dependencyShim;\n' +
                    '  }).apply(root, arguments);\n' +
                    '});\n' +
                    '}(this));';
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointShim.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ]
                        }
                    ],
                    shim: {
                        DependencyShim: {
                            exports: 'dependencyShim'
                        }
                    }
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = formatContent(file.contents.toString());
                            expect(content.indexOf(formatContent(shimContent))).toBeGreaterThan(-1);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
        describe('deps', () => {
            it('It should return a file with its content following the deps template shim. The dependency used in the deps, should be written before the shim content', cb => {
                const shimContent =
                    '(function(root) {\n' +
                    'define("DependencyShim", ["Dependency1"], function() {\n' +
                    '  return (function() {\n' +
                    "console.log('shimFile');\n" +
                    '\n' +
                    '  }).apply(root, arguments);\n' +
                    '});\n' +
                    '}(this));';
                const dependency = "define('Dependency1', function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointShim.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ]
                        }
                    ],
                    shim: {
                        DependencyShim: {
                            deps: ['Dependency1']
                        }
                    }
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = formatContent(file.contents.toString());
                            const indexOfShim = content.indexOf(formatContent(shimContent));
                            const indexOfDependency = content.indexOf(formatContent(dependency));

                            expect(indexOfShim).toBeGreaterThan(-1);
                            expect(indexOfDependency).toBeLessThan(indexOfShim);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
            it('It should return a file with its content following the deps and exports template shim. The dependencies used in the deps, should be written before the shim content', cb => {
                const shimContent =
                    '(function(root) {\n' +
                    'define("DependencyShim", ["Dependency1", "Dependency3"], function() {\n' +
                    '  return (function() {\n' +
                    "console.log('shimFile');\n" +
                    '\n' +
                    '  }).apply(root, arguments);\n' +
                    '});\n' +
                    '}(this));';
                const dependency1 = "define('Dependency1', function() {});";
                const dependency3 = "define('Dependency3', function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointShim.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ]
                        }
                    ],
                    shim: {
                        DependencyShim: {
                            deps: ['Dependency1', 'Dependency3']
                        }
                    }
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = formatContent(file.contents.toString());
                            const indexOfShim = content.indexOf(formatContent(shimContent));
                            const indexOfDependency1 = content.indexOf(formatContent(dependency1));
                            const indexOfDependency3 = content.indexOf(formatContent(dependency3));
                            expect(indexOfShim).toBeGreaterThan(-1);
                            expect(indexOfDependency1).toBeLessThan(indexOfShim);
                            expect(indexOfDependency3).toBeLessThan(indexOfShim);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
        describe('exports and deps', () => {
            it('It should return a file with its content following the deps and exports template shim. The dependency used in the deps, should be written before the shim content', cb => {
                const shimContent =
                    '(function(root) {\n' +
                    'define("DependencyShim", ["Dependency1"], function() {\n' +
                    '  return (function() {\n' +
                    "console.log('shimFile');\n" +
                    'return root.dependencyShim = dependencyShim;\n' +
                    '  }).apply(root, arguments);\n' +
                    '});\n' +
                    '}(this));';
                const dependency = "define('Dependency1', function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointShim.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ]
                        }
                    ],
                    shim: {
                        DependencyShim: {
                            deps: ['Dependency1'],
                            exports: 'dependencyShim'
                        }
                    }
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = formatContent(file.contents.toString());
                            const indexOfShim = content.indexOf(formatContent(shimContent));
                            const indexOfDependency = content.indexOf(formatContent(dependency));
                            expect(indexOfShim).toBeGreaterThan(-1);
                            expect(indexOfDependency).toBeLessThan(indexOfShim);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
    });
    describe('paths', () => {
        it('It should return a file with its content taken from the file defined in the paths attribute', cb => {
            const pathContent = 'console.log("pathContent");';
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entryPointPath.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: { DependencyPath: 'pathFileContent.js' }
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf(pathContent)).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('paths and checkDuplicates', () => {
        it('It should return an error because there are duplicated dependencies in a file that is not an amd module', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointDuplicatedDependenciesNotAmdModule.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: {
                    EntryPointDuplicatedDependenciesNotAmdModule:
                        'EntryPointDuplicatedDependenciesNotAmdModule.js'
                }
            };
            gulp.src(
                './UnitTests/UnitTestFiles/DuplicateDependenciesTestFiles/EntryPointDuplicatedDependenciesNotAmdModule.js'
            )
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'The dependencies Dependency2,Dependency1 are duplicated in the file EntryPointDuplicatedDependenciesNotAmdModule.js'
                    );
                    cb();
                });
        });
    });
    describe('shim with path', () => {
        it('It should return a file with the exports shim template and its content taken from the file defined in the paths attribute', cb => {
            const shimPathContent =
                '(function(root) {\n' +
                'define("DependencyPath", [], function() {\n' +
                '  return (function() {\n' +
                'console.log("pathContent");\n' +
                'return root.shimWihPath = shimWihPath;\n' +
                '  }).apply(root, arguments);\n' +
                '});\n' +
                '}(this));';
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['entryPointPath.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: { DependencyPath: 'pathFileContent.js' },
                shim: {
                    DependencyPath: {
                        exports: 'shimWihPath'
                    }
                }
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf(formatContent(shimPathContent))).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('config.map', () => {
        describe('* map', () => {
            it('It should map all dependencies and only insert the one used in the map', cb => {
                const entryPointMap1 =
                    "define('EntryPointMap1', ['DependencyMap1'], function() {});";
                const dependencyMap1 = "define('DependencyMap1', function() {});";
                const dependencyMap2 = "define('DependencyMap2', function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap1.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ],
                            config: { map: { '*': { DependencyMap1: 'DependencyMap2' } } }
                        }
                    ]
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            expect(content.indexOf(dependencyMap2)).toBeLessThan(
                                content.indexOf(entryPointMap1)
                            );
                            expect(content.indexOf(dependencyMap1)).toEqual(-1);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
        describe('module name map', () => {
            it('It should map only the dependencies related to the module name and insert them in the resulting file.', cb => {
                const dependencyMap2 = "define('DependencyMap2', function() {});";
                const dependencyMap3 = "define('DependencyMap3', function() {});";
                const defineEntryPointMap3 =
                    "define('EntryPointMap3', ['DependencyMap2'], function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap3.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ],
                            config: {
                                map: { EntryPointMap3: { DependencyMap2: 'DependencyMap3' } }
                            }
                        },
                        {
                            names: ['entryPointMap3.js'],
                            output: [
                                {
                                    name: 'shopping2.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ]
                        }
                    ]
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            if (file.path === 'shopping.js') {
                                // for this entry point there is a map defined
                                // for that reason dependencyMap2 should not be
                                // in the resulting file, in its place it should be
                                // dependencyMap3
                                expect(content.indexOf(dependencyMap3)).toBeGreaterThan(-1);
                                expect(content.indexOf(dependencyMap3)).toBeLessThan(
                                    content.indexOf(defineEntryPointMap3)
                                );
                                expect(content.indexOf(dependencyMap2)).toEqual(-1);
                            }
                            if (file.path === 'shopping2.js') {
                                // for this entry point there is not a map defined
                                // for that reason dependencyMap2 should be
                                // in the resulting file
                                expect(content.indexOf(dependencyMap2)).toBeGreaterThan(-1);
                                expect(content.indexOf(dependencyMap2)).toBeLessThan(
                                    content.indexOf(defineEntryPointMap3)
                                );
                                expect(content.indexOf(dependencyMap3)).toEqual(-1);
                            }
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
            it('It should not insert dependencyMap2 because it is mapped in the configuration map', cb => {
                const dependencyMap2 = "define('DependencyMap2', function() {});";
                const dependencyMap3 = "define('DependencyMap3', function() {});";
                const defineEntryPointMap3 =
                    "define('EntryPointMap3', ['DependencyMap2'], function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap3.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ],
                            config: {
                                map: { EntryPointMap3: { DependencyMap2: 'DependencyMap3' } }
                            }
                        }
                    ]
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            expect(content.indexOf(dependencyMap2)).toEqual(-1);
                            expect(content.indexOf(dependencyMap3)).toBeLessThan(
                                content.indexOf(defineEntryPointMap3)
                            );
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
            it('It should map a dependency inside a dependency and insert it in the resulting file', cb => {
                const dependencyMap1 = "define('DependencyMap1', function() {});";
                const dependencyMap3 = "define('DependencyMap3', function() {});";
                const defineEntryPointMap2 =
                    "define('EntryPointMap2', ['DependencyMap4'], function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap2.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ],
                            config: {
                                map: { DependencyMap4: { DependencyMap1: 'DependencyMap3' } }
                            }
                        }
                    ]
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            expect(content.indexOf(dependencyMap3)).toBeGreaterThan(-1);
                            expect(content.indexOf(dependencyMap3)).toBeLessThan(
                                content.indexOf(defineEntryPointMap2)
                            );
                            expect(content.indexOf(dependencyMap1)).toEqual(-1);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
            it('It should insert a mapped dependency because is a dependency of another module', cb => {
                const dependencyMap1 = "define('DependencyMap1', function() {});";
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap2.js', 'entryPointMap1.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$']
                                }
                            ],
                            config: {
                                map: { DependencyMap4: { DependencyMap1: 'DependencyMap3' } }
                            }
                        }
                    ]
                };
                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            console.log(content);
                            // entryPointMap1 depends on DependencyMap1 and even though
                            // DependencyMap1 is mapped, is mapped only for DependencyMap4,
                            // for that reason DependencyMap1 should be in the resulting file
                            expect(content.indexOf(dependencyMap1)).toBeGreaterThan(-1);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
        describe('includeConfig', () => {
            it('It should insert at the end of the file content the text require.config:({map: stringify config.map attribute', cb => {
                const defineEntryPointMap =
                    "define('EntryPointMap1', ['DependencyMap1'], function() {});";
                const mapConfig =
                    'require.config({"map":{"*":{"DependencyMap1":"DependencyMap2"}}});';
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['entryPointMap1.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$'],
                                    includeConfig: true
                                }
                            ],
                            config: { map: { '*': { DependencyMap1: 'DependencyMap2' } } }
                        }
                    ]
                };

                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            expect(content.indexOf(defineEntryPointMap)).toBeLessThan(
                                content.indexOf(mapConfig)
                            );
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
            it('It should insert at the end of the file the content of the map, paths and shim', cb => {
                const defineEntryPointMap =
                    "define('EntryPointConfigContent', ['DependencyPath', 'DependencyShim','DependencyMap1'], function() {});";
                const configContent =
                    'require.config({"map":{"*":{"DependencyMap1":"DependencyMap2"}},"paths":{"DependencyPath":"pathFileContent.js"},"shim":{"DependencyShim":{"exports":"dependencyShim"}}});';
                const config: BundlerConfiguration = {
                    entryPoints: [
                        {
                            names: ['EntryPointConfigContent.js'],
                            output: [
                                {
                                    name: 'shopping.js',
                                    order: 1,
                                    patterns: ['.js$'],
                                    includeConfig: true
                                }
                            ],
                            config: { map: { '*': { DependencyMap1: 'DependencyMap2' } } }
                        }
                    ],
                    paths: { DependencyPath: 'pathFileContent.js' },
                    shim: {
                        DependencyShim: {
                            exports: 'dependencyShim'
                        }
                    }
                };

                gulp.src('./UnitTests/UnitTestFiles/*.js')
                    .pipe(bundler(config))
                    .pipe(
                        map((file, done) => {
                            const content = file.contents.toString();
                            expect(content.indexOf(configContent)).toBeGreaterThan(-1);
                            done(null, file);
                        })
                    )
                    .on('end', cb);
            });
        });
    });
    describe('checkConfigEntryPoint', () => {
        const errorConfigPrefix = 'Wrong value in the config:';
        it('It should throw an error because the entry point does not have an entry point array', () => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {};
            expect(() => {
                bundler(config);
            }).toThrow(`${errorConfigPrefix} The entryPoints attribute is required`);
        });
        it('It should throw an error because the entry point does not have an entry point array', () => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {
                entryPoints: [
                    {
                        names: ['entryPointMap1.js']
                    }
                ]
            };
            expect(() => {
                bundler(config);
            }).toThrow(
                `${errorConfigPrefix} The output attribute is required in the entry point array`
            );
        });
        it('It should throw an error because the entry point does not have an attribute call names', () => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {
                entryPoints: [
                    {
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$'],
                                includeConfig: true
                            }
                        ]
                    }
                ]
            };
            expect(() => {
                bundler(config);
            }).toThrow(
                `${errorConfigPrefix} The attribute names is required in the entryPoints object`
            );
        });
        it('It should throw an error because the output does not have an order attribute', () => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {
                entryPoints: [
                    {
                        names: ['entryPointMap1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            expect(() => {
                bundler(config);
            }).toThrow(`${errorConfigPrefix} The order attribute is required`);
        });
        it('It should throw an error because the output does not have a name attribute', () => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {
                entryPoints: [
                    {
                        names: ['entryPointMap1.js'],
                        output: [
                            {
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            expect(() => {
                bundler(config);
            }).toThrow(`${errorConfigPrefix} The attribute name is required in the output object`);
        });
        it('It should put a default patterns if the patterns attribute is not being passed and for that reason it should has created a new file called shopping.js because the default pattern is [.js$]', cb => {
            // we are using any just to test that
            // we are passing a wrong config object type
            const config: any = {
                entryPoints: [
                    {
                        names: ['entryPointMap1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1
                            }
                        ]
                    }
                ]
            };
            const files = [];
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        files.push(file.path);
                        done(null, file);
                    })
                )
                .on('end', function() {
                    expect(files.length).toBe(1);
                    expect(files[0]).toBe('shopping.js');
                    cb();
                });
        });
    });
    describe('Cycling Dependencies', () => {
        it('It should return an error because there are cycling dependencies. EntryPointCycling1 has a circular dependency with DependencyCycling1', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointCycling1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ],
                        throwCyclingError: true
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'Circular dependency: EntryPointCycling1 -> DependencyCycling1 -> EntryPointCycling1'
                    );
                    cb();
                });
        });
        it('It should return an error because there are cycling dependencies between transitives dependencies. DependencyCycling4 has a circular dependency with DependencyCycling5', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointCycling2.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ],
                        throwCyclingError: true
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'Circular dependency: EntryPointCycling2 -> DependencyCycling2 -> DependencyCycling4 -> DependencyCycling5 -> DependencyCycling4'
                    );
                    cb();
                });
        });
    });
    describe('checkForDuplicatedDependencies', () => {
        it('It should return an error because there are duplicated dependencies in a module amd', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointDuplicatedDependencies.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src(
                './UnitTests/UnitTestFiles/DuplicateDependenciesTestFiles/EntryPointDuplicatedDependencies.js'
            )
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'The dependencies Dependency2,Dependency1 are duplicated in the file EntryPointDuplicatedDependencies.js'
                    );
                    cb();
                });
        });
    });
    describe('defines calls without a module name', () => {
        it('It should put as module name the key in the path attribute and keep the rest of the define intact, in this case is an empty array and a function', cb => {
            const expectedModule = 'define("EmptyDefineWithArray",[],function(){});';
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointEmptyDefine1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: { EmptyDefineWithArray: 'EmptyDefineWithArray.js' }
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf(expectedModule)).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
        it('It should put as module name the key in the path attribute and keep the rest of the define intact, in this case a function', cb => {
            const expectedModule = 'define("EmptyDefineWithFunction",function(){});';
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointEmptyDefine2.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: { EmptyDefineWithFunction: 'EmptyDefineWithFunction.js' }
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf(expectedModule)).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
        it('It should put as module name the key in the path attribute and keep the rest of the define intact, in this case is an array with values and a function', cb => {
            const expectedModule =
                'define("DependencyEmptyDefineWithArrayWithValues",["Dependency2"],function(){});';
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointEmptyDefine3.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ],
                paths: { DependencyEmptyDefineWithArrayWithValues: 'entryPointNotAmdModuleName.js' }
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf(expectedModule)).toBeGreaterThan(-1);
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('removeRequireAndExports', () => {
        it('It should not take into account require and exports dependencies and only used Dependency3 as valid dependency', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointRequireAndExports1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf('Dependency3')).toBeLessThan(
                            content.indexOf('EntryPointRequireAndExports1')
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
    describe('checkForBlankDependencies', () => {
        it('It should return an error because there are empty dependencies ([""]) declared in the file', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EmptyDependencyEntryPoint1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src(
                './UnitTests/UnitTestFiles/EmptyDependenciesTestFiles/EmptyDependencyEntryPoint1.js'
            )
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(formatContent(error)).toBe(
                        formatContent(
                            'In the file EmptyDependencyEntryPoint1.js are empty dependencies or there is a "," at the end of the dependencies declaration'
                        )
                    );
                    cb();
                });
        });
        it('It should return an error because there are empty dependencies (a comma at the end of the dependencies declaration for this case) declared in the file', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EmptyDependencyEntryPoint2.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src(
                './UnitTests/UnitTestFiles/EmptyDependenciesTestFiles/EmptyDependencyEntryPoint2.js'
            )
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(formatContent(error)).toBe(
                        formatContent(
                            'In the file EmptyDependencyEntryPoint2.js are empty dependencies or there is a "," at the end of the dependencies declaration'
                        )
                    );
                    cb();
                });
        });
    });
    describe('checkDuplicatesAmdModules', () => {
        it('It should return an error because there are duplicate amd modules', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointDuplicateAmdModule1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ]
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/DuplicateAmdModuleNames/*.js')
                .pipe(bundler(config))
                .on('error', function(error) {
                    expect(error).toBe(
                        'The amd module EntryPointDuplicateAmdModule1 is duplicated'
                    );
                    cb();
                })
                .on('end', cb);
        });
    });
    describe('skipDependencies', () => {
        it('It should skip the dependencies SkipDependency1 and SkipDependency12 and put the Dependency3 before the EntryPointSkipDependencies1', cb => {
            const config: BundlerConfiguration = {
                entryPoints: [
                    {
                        names: ['EntryPointSkipDependencies1.js'],
                        output: [
                            {
                                name: 'shopping.js',
                                order: 1,
                                patterns: ['.js$']
                            }
                        ],
                        skipDependencies: ['SkipDependency1', 'SkipDependency2']
                    }
                ]
            };
            gulp.src('./UnitTests/UnitTestFiles/*.js')
                .pipe(bundler(config))
                .pipe(
                    map((file, done) => {
                        const content = formatContent(file.contents.toString());
                        expect(content.indexOf('Dependency3')).toBeLessThan(
                            content.indexOf('EntryPointSkipDependencies1')
                        );
                        done(null, file);
                    })
                )
                .on('end', cb);
        });
    });
});
