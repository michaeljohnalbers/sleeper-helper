const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/index.tsx",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "." }, // copies public/* into dist/
      ],
    }),
    // Docs: https://webpack.js.org/plugins/html-webpack-plugin/
    new HtmlWebpackPlugin({
      title: "core.fantasy.football.league",
      favicon: "icons/favicon.ico",
      meta: {
        viewport: "width=device-width, initial-scale=1",
      },
      template: "src/index.html",
    }),
    // Uncomment to examine bundle size (doesn't work with 'pnpm start')
    // new BundleAnalyzerPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // Tells webpack to look for files without extensions
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    chunkFilename: "chunks/[name].[contenthash].chunk.js",
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all", // Splitting vendor modules out of main bundles automatically,
      maxInitialRequests: 25,
      maxAsyncRequests: 30,
      minSize: 20000,
      cacheGroups: {
        // Isolate React Core so it never invalidates browser caches
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: "vendor-react",
          priority: 40,
          enforce: true,
        },
        // Pull the heavy thematic calculation engine into its own isolated file
        muiStyles: {
          test: /[\\/]node_modules[\\/]@mui[\\/]material[\\/]styles/,
          name: "vendor-mui-styles",
          priority: 35, // Higher priority than general muiVendor to catch styles first
          enforce: true,
        },
        muiOverlays: {
          // Catches Menu, Popover, Popper, and Modal together
          test: /[\\/]node_modules[\\/]@mui[\\/]material[\\/](Menu|Popover|Popper|Modal)/,
          name: "vendor-mui-overlays",
          priority: 32,
          enforce: true,
        },
        //Separate Material UI from your core business logic
        muiVendor: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: "vendor-mui",
          priority: 30,
          enforce: true,
        },
      },
    },
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
    },
  },
};
