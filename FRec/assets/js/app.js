var FilesList = [];
$(function () {
	var Feature = Backbone.Model.extend({});
	
	
	var FeatureCollection = Backbone.Collection.extend({
		model: Feature,
		localStorage: new Backbone.LocalStorage("FRec")
	});
	
	var Features =  new FeatureCollection;
	
	var FeaturesList = Backbone.View.extend({
		initialize: function () {
			this.listenTo(this.model, "change", this.render);
		},
		tagName: "div",
		className: "flist",
		events: {
			"click .tool-tip": "fillModelDetails",
			"hidden #feature-edit-modal": "removeInputs",
			"click #edit-feature": "editFeature",
			"click #aefile": "addFile",
			"shown #feature-edit-modal": "setTypeAhead"
		},
		template: function(obj){
			var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
			with(obj||{}){
			__p+='<div id="flist-cont"><div class="fdesc alert '+ (islive == "checked" ? "alert-success" : "alert-error") +'"><a href="#" class="tool-tip" data-toggle="modal" data-target="#feature-edit-modal" rel="tooltip" data-placement="left" data-original-title="Edit Feature"><i class="icon-edit"></i></a>'+
			((__t=( desc ))==null?'':__t)+
			' </div><ul>';
			 for (var file in files) { 
			__p+=' <li> <a href="#">'+
			((__t=( files[file] ))==null?'':__t)+
			'</a> </li> ';
			  } 
			__p+=' </ul></div><div id="feature-edit-modal" class="modal" tabindex="-1" role="dialogue" aria-hidden="false" aria-labelledby="feature-def" style="display:none;"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="feature-def">Edit Feature</h3></div><div class="modal-body"><input type="text" id="fename" rel="tooltip" data-placement="right" data-original-title="Can\'t be a nameless feature" class="required man-tooltip" placeholder="Feature Title" /> <br /><div class="ffiles-edit"><input type="text" placeholder="Add File" /><a href="#" id="aefile" style="font-size: 14px">&#10010;</a> <br /><label class="checkbox"><input id="felive" type="checkbox"> Live	</label></div><textarea rows="3" id="fedesc" class="optional" style="width: 350px" placeholder="Feature Description"></textarea> <br /><input type="button" id="edit-feature" class="btn" value="Save Feature" /></div></div>';
			}
			return __p;
		},
		render: function () {
			$("#feature-edit-modal").modal("hide");
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		addNew: function () {
			$(".fplaceholder").html(this.render().$el);
			$('.tool-tip').tooltip();
			this.$el.show();
		},
		fillModelDetails: function () {
			var fdetails = this.model.toJSON(), file;
			$("#fename").val(fdetails.title).attr("disabled", "disabled");
			$("#felive").attr("checked", fdetails.islive);
			for(file in fdetails.files) {
				if(file != 0) {
					this.addFile(fdetails.files[file]);
				} else {
					$('.ffiles-edit input[type=text]').val(fdetails.files[file]);
				}
			}
			$("#fedesc").val(fdetails.desc);
		},
		addFile: function (val) {
			if(typeof val == "object") { val = ''; }
			$("<br /><input type='text' value='"+val+"' placeholder='Add File' />")
			.insertBefore(".ffiles-edit > a")
			.typeahead({source: FilesList, items: 4});
		},
		removeInputs: function () {
			$('.ffiles-edit > input').not(":first-child").each(function (index, value) { $(value).remove(); } );
			$('.ffiles-edit > br').remove();
		},
		editFeature: function (event) {
			var data = {}, files = [], option = {
				success: function () {
					$("#feature-edit-modal").modal("hide");
				}
			};
			data['title'] = $('#fename').val();
			data['desc'] = $('#fedesc').val() || "No Description Yet";
			data['islive'] = $('#felive').attr("checked") || false;
			$('.ffiles-edit > input').each(function (index, value) {
				files.push($(value).val());
			});
			data['files'] = _.compact(files);
			FilesList = _.union(FilesList, files);
			this.model.save(data, option);
		},
		setTypeAhead: function () {
			$('.ffiles-edit > input').typeahead({source: FilesList, items: 4});
		}
	});
	
	var FeatureView = Backbone.View.extend({
		tagName : "li",
		template : function(obj){
			var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
			with(obj||{}){
			__p+='<a href="#"><i class="icon-chevron-right"></i>'+
			((__t=( title ))==null?'':__t)+
			'</a>';
			}
			return __p;
		},
		render : function() {
		  this.$el.html(this.template(this.model.toJSON()));
		  return this;
		},
		events: {
			"click a": "renderProj"
		},
		renderProj: function() {
			$('#feature-list > li').each(function (index, value) { $(value).removeClass("active"); });
			this.$el.addClass("active");
			this.view = new FeaturesList({model: this.model});
			this.view.addNew();
		}
	});
	
	var AppView = Backbone.View.extend({
		
		el: "#feature-modal",
		
		events: {
			"click #new-feature": "newFeature",
			"blur #fname": "validateInput",
			"blur #fdesc": "validateInput",
			"focus input": "removeErrors",
			"click #afile": "addFile",
			"hidden": "removeInputs",
			"shown": "initializeFileList"
		},
		
		initializeFileList: function () {
			$('.file-search').typeahead({source: FilesList, items: 4});
		},
		
		initialize: function () {
			var self = this;
			this.populate();
			$(".tool-tip").tooltip();
			this.listenTo(Features, "add", this.addOne);
		},

		populate: function () {
			var timeout,
			self = this,
			options = {
				success: function (collection, resp, options) {
					_.each(collection.models, function (model) {
						FilesList = _.union(FilesList, model.toJSON().files);
						self.addOne(model);
					});
				},
				error: function (collection, resp, options) {
					
				}
			};
		
			var pollFn = function () {
				if(Backbone.LocalStorage.setup) {
					Features.fetch(options);
					clearTimeout(timeout);
				} else {
					timeout = setTimeout(pollFn, 1000);
				}
			};
			
			pollFn();
		},
		
		rField: 1,
		
		cField: 0,
		
		validateInput: function (event) {
			var target = $(event.target);
			if(target.attr('class').indexOf('required') != -1) {
				if(target.val() == "") {
					this.displayError(target);
				} else if(target.attr('class').indexOf('complete') == -1) {
					target.addClass('complete');
					this.cField++;
				}
			}
			if(this.cField == this.rField) {
				$("input[type=button]", this.$el).removeAttr("disabled");
			}
			  
		},
		
		removeErrors: function () {
			var target = $(event.target);
			target.tooltip("hide");
		},
		
		displayError: function (target) {
			target.tooltip('show');
			if(target.attr('class').indexOf('complete') != -1) {
				this.cField--;
			}
			target.removeClass('complete');
			$("input[type=button]", this.$el).attr("disabled", "disabled");
		},
		newFeature: function (event) {
			var data = {}, files = [], option = {
					success: function () {
						$("#feature-modal").modal("hide");
					}
			};
			data['title'] = $('#fname').val();
			data['desc'] = $('#fdesc').val() || "No Description Yet";;
			data['islive'] = $('#flive').attr("checked") || false;
			$('.ffiles > input').each(function (index, value) {
				files.push($(value).val());
			});
			data['files'] = _.compact(files);
			Features.create(data, option);
		},
		addFile: function () {
			$("<br /><input type='text' placeholder='Add File' />").insertBefore(".ffiles > a");
		},
		addOne: function (model) {
			var view = new FeatureView({model: model});
		    $("#feature-list").append(view.render().el);
		},
		removeInputs: function () {
			$('.ffiles > input').not(":first-child").each(function (index, value) { $(value).remove(); } );
			$('.ffiles > br').remove();
			$('input[type=text]', this.$el).val('');
			$('input[type=checkbox]', this.$el).attr("checked", false);
			$('textarea', this.$el).val('');
			$('.ffiles > input').val('');
			
		}
	});
	var appview = new AppView;
});
