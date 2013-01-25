requirejs.config({
	baseUrl: "assets/js",
	paths: {
		'jquery': 'libs/jquery',
		'backbone': 'libs/backbone',
		'underscore': 'libs/underscore',
		'json2': 'libs/json2' 
	},
	shim: {	        
		
	},
	map: {
		//We will add when needed
	},
	config: {
		//We will add when needed
	},
	packages: {
		//We will add when needed
	},
	urlArgs: "",
	waitSeconds: 10
});


define(['jquery', 'underscore', 'backbone'], function ($, _, BackBone) {
	
});