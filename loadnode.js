var path = require("path");
var fs = require("fs");
var assert = require("assert");
var format = require("util").format;

var pool = {};

function LoadError(message) {
	this.constructor.prototype.__proto__ = Error.prototype;
	this.name = this.constructor.name;
	this.message = message;
	Error.captureStackTrace(this, LoadError);
}

function readDirectory(path) {
	var items = fs.readdirSync(path);
	for (var i in items) {
		var item = items[i];
		if (item[0] == ".") continue;
		if (item[0] == "~") continue;
		var filePath = path + "/" + item;
		var ext = filePath.substr(filePath.lastIndexOf(".") + 1);
		var stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			if (item == "node_modules") continue;
			readDirectory(filePath);
		} else if (ext == "js") {
			if (!pool[item]) {
				pool[item] = [];
			}
			pool[item].push({path: filePath});
		}
	}
	return pool;
}

function file (searchPath) {
	assert(typeof searchPath == "string", "SearchPath must be a string.");
	var basename = path.basename(searchPath);
	if (pool[basename]) {
		var items = pool[basename];
		var item = {};
		if (items.length == 1) {
			item = items[0];
		} else {
			var match = [];
			for (var i = 0, count = items.length; i < count; i++) {
				item = items[i];
				if (item.path.slice(-searchPath.length) == searchPath) {
					match.push(item);
				}
			}
			if (match.length == 1) {
				// Add searchPath to pool.
				item = match[0];
				pool[searchPath] = [item];
			} else if (match.length > 1) {
				var message = format("'%s' is ambiguous identifier.", searchPath);
				throw new LoadError(message);
			} else {
				// Nothing found.
				return require(searchPath);
			}
		}
		var filePath = item.path;
		return require(filePath);
	} else {
		var cwd = process.cwd() + "/";
		return require(cwd + searchPath);
	}
}

var count = 0;

function findRootDirectory(directory, callback) {
	directory = directory || __dirname + "/..";
	var exists = fs.existsSync(directory + "/package.json");
	if (!exists) {
		if (++count > 100) {
			throw new Error("Couldn't find package.json file in parent directories.");
		}
		return findRootDirectory(directory + "/..");
	} else {
		directory = path.normalize(directory);
		return directory;
	}
}

module.exports = file;

var isTest = false;

if (module.parent) {
	var moduleParentFilename =  path.basename(module.parent.filename);
	isTest = (moduleParentFilename == "test-loadnode.js");
}

if (!isTest) {
	var rootDirectory = findRootDirectory(null);
	readDirectory(rootDirectory);
} else {
	module.exports.load = readDirectory;
}

