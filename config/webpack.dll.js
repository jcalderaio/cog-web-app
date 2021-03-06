var path = require("path");
var webpack = require("webpack");

module.exports = {
    entry: {
        vendor: [path.join(__dirname, "src", "vendor.js")]
    },
    output: {
        path: path.join(__dirname, "vendor"),
        filename: "[name].js",
        library: "[name]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, "vendor", "[name]-manifest.json"),
            name: "[name]",
            context: path.resolve(__dirname, "src")
        })
        //new webpack.optimize.OccurenceOrderPlugin(),
        //new webpack.optimize.UglifyJsPlugin()
    ],
    resolve: {
        //root: path.resolve(__dirname, "src"),
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    }
};
