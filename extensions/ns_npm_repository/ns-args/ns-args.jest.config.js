module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['**/Commons/ns_npm_repository/ns-args/UnitTests/**/*.[jt]s?(x)'],
    testPathIgnorePatterns: ['/Mocks/'],
    collectCoverage: false,
    coverageDirectory: 'UnitTests/coverage',
    collectCoverageFrom: ['index.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/UnitTests/'],
    moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js', 'json', 'node', 'd.ts']
};
