const path = require('path');


module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/app.tsx',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js'
    },
    resolve: {
        extensions: [
            '.js', '.mjs', '.cjs',
            '.jsx', '.cjsx', '.mjsx',
            '.tsx', '.ts', '.d.ts'
        ],
        extensionAlias: {
            ".js": [".js", ".ts", ".tsx"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        }
    },
    module: {
        // swc only transpiles (no type checking) - run `npm run typecheck`
        rules: [{
            test: /\.tsx?$/,
            loader: 'swc-loader',
            options: {
                jsc: {
                    parser: { syntax: 'typescript', tsx: true },
                    // tsconfig `"jsx": "react-jsx"` (automatic runtime)
                    transform: { react: { runtime: 'automatic' } },
                    target: 'esnext'
                },
                sourceMaps: true
            },
            exclude: /node_modules/
        }]
    },
    stats: {
        // Don't display anything, then add back colors, ...
        all: false,
        colors: true,
        errors: true,
        builtAt: true
    },
    optimization: {
        minimize: false
    },
    experiments: {
        outputModule: true
    }
};
