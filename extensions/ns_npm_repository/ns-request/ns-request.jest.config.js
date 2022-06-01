module.exports = {
    roots: ['<rootDir>'],
    testMatch: ['**/Commons/ns_npm_repository/ns-request/UnitTests/**/*.js'],
    testPathIgnorePatterns: ['/Mocks/', '/coverage/'],
    collectCoverage: false,
    coverageDirectory: 'UnitTests/coverage',
    collectCoverageFrom: ['index.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/UnitTests/'],
    moduleFileExtensions: ['ts', 'tsx', 'jsx', 'js', 'json', 'node', 'd.ts']
};
