var path = require("path");
var fs = require("fs");
var assert = require("assert");

var cache = {};
var loaded = false;

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
			cache[item] = {
				path: filePath
			};
		}
	}
}

function file (path) {
	assert(typeof path == "string", "Path must be a string.");
	if (cache[path]) {
		var item = cache[path];
		path = item.path;
		return require(path);
	} else {
		var cwd = process.cwd() + "/";
		return require(cwd + path);
	}
}

module.exports = function(moduleOrFile) {
	if (loaded == false) {
		var filepath;
		if (typeof moduleOrFile == "object") {
			filepath = moduleOrFile.filename;
		} else {
			filepath = moduleOrFile;
		}
		readDirectory(path.dirname(filepath));
		loaded = true;
		return file;
	} else {
		return file(moduleOrFile);
	}
}