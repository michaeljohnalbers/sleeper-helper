// Special webpack config to deal with the new React components
// This will eventually be removed once the React code is ready for production

const {exec} = require('child_process');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index_react.tsx',
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        // Docs: https://webpack.js.org/plugins/html-webpack-plugin/
        new HtmlWebpackPlugin({
            title: 'React - core.fantasy.football.league',
            favicon: 'src/icons/favicon.ico',
            meta: {
                viewport: 'width=device-width, initial-scale=1'
            },
            template: "src/index_react.html"
        })
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
        filename: 'main_react.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};
