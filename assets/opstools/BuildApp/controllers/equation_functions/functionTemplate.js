steal(function () {

    // [Equation]Function
    //
    // [what does this fn do?]
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
    //          ['numeric', 'date', 'null']
    //      .isHidden  {bool}
    //          set to true to keep a function from being displayed as an 
    //          option for the user to select.
    //      .exec   {fn}
    //          the function to execute
    // 
    var [Equation]Function = {
        token: '[Equation]', 

        // multilingual note: the '[Equation]( {paramType} )' is a programming 
        // token.  This part is not translated.  Just the description.
        // so the multilingual label should be something like:  '%s\n[what does this fn do?]'
        description: AD.lang.label.getLabel('ab.equation.[Equation]', '[Equation]( {paramType} )') || '*[Equation]( {paramType} )\n[what does this fn do?]', 
        
        initialText: '[Equation]( /* paramType */ )',  

        returns: 'numeric',  // [ 'numeric', 'date', 'null', ... ]

        isHidden: false,     // set to true to hide this from the user.

        /**
         * @function exec
         * [what does this fn do?] 
         * @return {int}
         */
        exec: function( data ) {

        }
    };


    return [Equation]Function;
});