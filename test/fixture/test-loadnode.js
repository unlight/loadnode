var wru = require("wru");
var path = require("path");
var loadnode = require("../..");

var rootDirectory = path.resolve("./");
var pool = loadnode.load(rootDirectory);

wru.test([{
	name: "loaderror exception",
	test: function() {
		try {
			loadnode("dummy1.js");	
		} catch (exception) {
			wru.assert(exception.name == 'LoadError');
			wru.assert(exception instanceof Error);
		}
	}
},

{
	name: "load dummy 1",
	test: function() {
		var result = loadnode("directory2/dummy1.js");	
		wru.assert(result == "dummy1.js in directory2");
	}
},

{
	name: "load dummy 2",
	test: function() {
		var result = loadnode("dummy2.js");	
		wru.assert(result == "dummy2.js in directory2");
	}
}


]);
