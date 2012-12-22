/**
 * Backbone chrome.storage.local adapter
 * https://github.com/tamilmani58/jus4friendzz/blob/master/backbonejs.chromeStorage.js
 */

(function(_, Backbone) {
// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Hold reference to Underscore.js and Backbone.js in the closure in order
// to make things work even if they are removed from the global namespace

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
// window.Store is deprectated, use Backbone.LocalStorage instead
Backbone.LocalStorage = window.Store = function(name) {
  this.name = name;
  var self = this;
  this.localStorage().get(this.name, function (item) {
	  self.records = item[self.name] && item[self.name] || [];
	  Backbone.LocalStorage.setup = true;
  });
};

_.extend(Backbone.LocalStorage.prototype, {

  getTempObj: function (name, value) {
	  var temp = {};
	  temp[name] = value;
	  return temp;
  },
	
  // Save the current state of the **Store** to *localStorage*.
  save: function(success, response) {
	response = response || true;
    this.localStorage().set(this.getTempObj(this.name, this.records), function () {
    	if(chrome.runtime.lastError) {
    		
    	} else {
    		success(response);
    	}
    });
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(success, model) {
    if (!model.id) {
        model.id = guid();
        model.set(model.idAttribute, model.id);
    }
    var self = this;
    this.localStorage().set(this.getTempObj(this.name+"-"+model.id, JSON.stringify(model)), function () {
    	if(chrome.runtime.lastError) {
    		
    	} else {
    		self.records.push(model.id.toString());
    		self.save(success, model);
    	}
    });
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(success, model) {
	var self = this;
    this.localStorage().set(this.getTempObj(this.name+"-"+model.id, JSON.stringify(model)), function () {
    	if(chrome.runtime.lastError) {
    	} else {
    		if (!_.include(self.records, model.id.toString())) {
    			self.records.push(model.id.toString());
    		}
    		self.save(success, model.toJSON());
    	}	
    });
  },

  // Retrieve a model from `this.data` by id.
  find: function(success, model) {
	var self = this;
    this.localStorage().get(this.name+"-"+model.id, function (item) {
    	if(chrome.runtime.lastError) {
	
    	} else {
    		success(JSON.parse(item[self.name+"-"+model.id]));
    	}
    });
  },

  // Return the array of all models currently in storage.
  findAll: function(success) {
	
	 var output = [];
	 
	 _.each(this.records, function (id, index) { 
		 var self = this, 
		 	 len = this.records.length, 
		 	 key = this.name+"-"+id;
		 this.localStorage().get(key, function (item) {
			 if(chrome.runtime.lastError) {
				 output.push(false);
			 } else {
				 output.push(JSON.parse(item[key]));
				 if(output.length == len) {
					 success(_.compact(output));
				 }
			 }
		 });
	 }, this); 
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model) {
    this.localStorage().removeItem(this.name+"-"+model.id);
    this.records = _.reject(this.records, function(record_id){return record_id == model.id.toString();});
    this.save();
    return model;
  },

  localStorage: function() {
      return chrome.storage.local; //Support for chrome app local storage
  }

});

// localSync delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
// window.Store.sync and Backbone.localSync is deprectated, use Backbone.LocalStorage.sync instead
Backbone.LocalStorage.sync = window.Store.sync = Backbone.localSync = function(method, model, options) {
  var store = model.localStorage || model.collection.localStorage;

  var resp; //If $ is having Deferred - use it. 

  var success = options && options.success;
  switch (method) {
	    case "read":    model.id != undefined ? store.find(success, model) : store.findAll(success); break;
	    case "create":  store.create(success, model);                            break;
	    case "update":  store.update(success, model);                            break;
	    case "delete":  store.destroy(success, model);                     		 break;
  }
};

Backbone.ajaxSync = Backbone.sync;

Backbone.getSyncMethod = function(model) {
  if(model.localStorage || (model.collection && model.collection.localStorage))
  {
    return Backbone.localSync;
  }

  return Backbone.ajaxSync;
};

// Override 'Backbone.sync' to default to localSync,
// the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
Backbone.sync = function(method, model, options) {
  return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
};

})(_, Backbone);
