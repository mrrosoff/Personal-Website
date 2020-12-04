const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const outputDirectory = "dist";

module.exports = {
	entry: ["@babel/polyfill", "./src/index.js"],
	devtool: 'cheap-source-map',
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {presets: ['@babel/preset-env', '@babel/react']}
			},
			{test: /\.css$/i, use: ['style-loader', 'css-loader']},
			{
				test: /\.s[ac]ss$/i, use:
					[
						{loader: 'style-loader'},
						{loader: 'css-loader'},
						{loader: 'postcss-loader', options: {postcssOptions: {plugins: ['autoprefixer', 'precss']}}},
						{loader: 'sass-loader'}
					]
			},
			{test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpe?g|gif|mp4|wav|mp3)$/i, loader: ['file-loader']}
		]
	},
	plugins: [new CleanWebpackPlugin()],
	output: { filename: "bundle.js", path: path.join(__dirname, outputDirectory) },
};
