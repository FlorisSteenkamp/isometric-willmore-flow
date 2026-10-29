import type { Config } from 'jest';


const esModules = [
    'flo-bezier3',
    'flo-poly',
    'flo-gauss-quadrature',
    'flo-vector2d',
    'flo-boolean',
    'flo-draw',
    'flo-graham-scan',
    'flo-ll-rb-tree',
    'flo-lines-intersections',
    'flo-memoize',
    'big-float-ts',
    'double-double',
    'squares-rng'
].join('|');


const config: Config = {
    testEnvironment: 'node',
    resolver: "jest-ts-webcompat-resolver",
    setupFilesAfterEnv: ['<rootDir>/__tests__/helpers/jest.setup.ts'],
    testMatch: [ "**/__tests__/**/*.spec.ts"],
    transform: {
        "^.+\\.(t|j)sx?$": "@swc/jest"
    },
    transformIgnorePatterns: [
        `/node_modules/(?!${esModules})`
    ]
};


export default config;
