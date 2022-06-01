module.exports = {
    roots: ['<rootDir>'],
    testMatch: ['**/Commons/ns_npm_repository/ns-async/UnitTests/**/*.js'],
    testPathIgnorePatterns: ['/Mocks/', '/coverage/'],
    collectCoverage: false,
    coverageDirectory: 'UnitTests/coverage',
    collectCoverageFrom: ['async.js', 'src/*.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/UnitTests/'],
    moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js', 'json', 'node', 'd.ts']
};
