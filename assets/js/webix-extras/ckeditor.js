webix.protoUI({
	name:"ckeditor",
	$init:function(config){
		this.$view.className += " webix_selectable";
		this._waitEditor = webix.promise.defer();
	},
	defaults:{
		borderless:true,
		language:"en",
		toolbar: [
			[ 'Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink' ],
			[ 'FontSize', 'TextColor', 'BGColor' ]
		]
	},
	_init_ckeditor_once:function(){
		var tid = this.config.textAreaID = "t"+webix.uid();
		this.$view.innerHTML = "<textarea id='"+tid+"'>"+this.config.value+"</textarea>";
		console.log('webix.codebase: ', webix.codebase)
		window.CKEDITOR_BASEPATH = webix.codebase+"/ckeditor/";
		webix.require("ckeditor/ckeditor.js", function(){
			this._3rd_editor = CKEDITOR.replace( this.config.textAreaID, {
				toolbar: this.config.toolbar,
				language: this.config.language,
				width:this.$width -2,
				height:this.$height - 44
			});
			this._waitEditor.resolve(this._3rd_editor);
		}, this);
		this._init_ckeditor_once = function(){};
	},
	_set_inner_size:function(x, y){
		if (!this._3rd_editor || !this._3rd_editor.container || !this.$width) return;
		this._3rd_editor.resize(x, y);
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._init_ckeditor_once();
			this._set_inner_size(x,y);
		}
	},
	setValue:function(value){
		this.config.value = value;
		if (this._3rd_editor)
			this._3rd_editor.setData(value);
		else webix.delay(function(){
			this.setValue(value);
		},this,[],100);
	},
	getValue:function(){
		return this._3rd_editor?this._3rd_editor.getData():this.config.value;
	},
	focus:function(){
		this._focus_await = true;
		if (this._3rd_editor)
			this._3rd_editor.focus();
	},
	getEditor:function(waitEditor){
		return waitEditor?this._waitEditor:this._3rd_editor;
	}
}, webix.ui.view);
