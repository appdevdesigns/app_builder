
export default {
	
	isComponent: function (Component) {

		assert.isDefined(Component, 'it should exist.');
		assert.isDefined(Component.ui, "should have a ui property");
		assert.isDefined(Component.init, "should have a init property");
		assert.isDefined(Component._logic, "should expose _logic property");
		
	} 
	
}