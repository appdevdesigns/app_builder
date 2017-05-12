steal(
// List your Controller's dependencies here:
function() {

  // webix.editors.richtext = {
  //   focus:function(){
  //       this.getInputNode(this.node).focus();
  //       this.getInputNode(this.node).select();
  //   },
  //   getValue:function(){
  //       return this.getInputNode(this.node).value;
  //   },
  //   setValue:function(value){
  //       this.getInputNode(this.node).value = value;
  //   },
  //   getInputNode:function(){
  //       return this.node.firstChild;
  //   },
  //   render:function(){
  //       return webix.html.create("div", {
  //           "class":"webix_dt_editor"
  //       }, "<input type='text'>");
  //   }
  // }

  webix.editors.$popup.richtext = {
    view: "popup",
    width: 250,
    height: 250,
    padding: 0,
    body: {
      view:"ckeditor"
    }
  };

  webix.editors.richtext = webix.extend({
    popupType: "richtext",

    render:function(){
        return webix.html.create("div", {
            "class":"webix_dt_editor"
        }, "<textarea name='richtext_view'>");
    }
  }, webix.editors.popup);

});
