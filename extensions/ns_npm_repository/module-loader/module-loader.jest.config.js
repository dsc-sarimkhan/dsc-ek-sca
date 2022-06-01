module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['**/Commons/ns_npm_repository/module-loader/UnitTests/**/*.[jt]s?(x)'],
    testPathIgnorePatterns: ['/Mocks/'],
    collectCoverage: false,
    coverageDirectory: 'UnitTests/coverage',
    collectCoverageFrom: ['module-loader.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/UnitTests/'],
    moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js', 'json', 'node', 'd.ts'],
    globals: {
        'ts-jest': {
            tsConfig: {
                experimentalDecorators: true,
                baseUrl: '.',
                esModuleInterop: true,
                composite: true,
                module: 'amd',
                target: 'es5',
                allowJs: true,
                types: [],
                lib: ['DOM', 'ES5', 'ES2015']
            },
            isolatedModules: true
        }
    }
};
