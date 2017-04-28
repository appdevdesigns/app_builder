steal(
    function () {

    // mean
    //
    // A function that returns the mean from a list of numbers
    //



    // To plug-in to the AppBuilder, each Function must define the following:
    //      .token  {string}    
    //          a unique token to resolve in a given equation.
    //      .description    {string}    
    //          a descriptive text to show as a choice for the user to enter 
    //          in an equation popdown box.
    //      .initialText    {string}    
    //          the text that gets placed initially if chosen in the equation
    //          popdown box
    //      .returns  {string}
    //          what kind of value will this function return 
    //          ['numeric', 'date']
    //      .isHidden  {bool}
    //          set to true to keep a function from being displayed as an 
    //          option for the user to select.
    //      .exec   {fn}
    //          the function to execute
    // 
    var meanFunction = {
        token: 'mean', 
        description: AD.lang.label.getLabel('ab.equation.mean', ['mean( {number} [, number] )']) || '*mean( {datevalue} [, number] )\nReturns the mean of a list of values', 
        initialText: 'mean( /* number */... )',

        returns: 'numeric',  
        exec: function() {
            if (arguments.length == 0) return 0;
            var total = 0;
            for (var i = 0; i < arguments.length; i++) {
                total += arguments[i];
                
            }
            return total / arguments.length;
        }
    };


    return meanFunction;
});