module.exports = {
    roots: ['<rootDir>/UnitTests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleDirectories: [
        'Backend',
        'UnitTests',
        'node_modules',
        'Commons',
        'Advanced',
        'InStore',
        'Online'
    ],
    moduleNameMapper: {
        'N/(.*)$': '<rootDir>/UnitTests/Mocks/N/$1',
        'third_parties/(.*)$': '<rootDir>/UnitTests/Mocks/third_parties/$1',
        '/configurationManifest': '<rootDir>/UnitTests/Mocks/configurationManifest.js'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'Backend/**/*.{ts,tsx}',
        'Advanced/**/*.{ts,tsx}',
        'InStore/**/*.{ts,tsx}',
        'Online/**/*.{ts,tsx}'
    ],
    coveragePathIgnorePatterns: ['/node_modules/', '/UnitTests/']
};
