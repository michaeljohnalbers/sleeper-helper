const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    plugins: [
        // Docs: https://webpack.js.org/plugins/html-webpack-plugin/
        new HtmlWebpackPlugin({
            title: 'core.fantasy.football.league',
            favicon: 'src/icons/favicon.ico',
            meta: {
                viewport: 'width=device-width, initial-scale=1'
            },
            template: "src/index.html"
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
