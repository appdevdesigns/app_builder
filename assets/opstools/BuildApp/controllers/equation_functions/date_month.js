steal(
    function () {

    // date_month
    //
    // A function that returns the month from a given date value.
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
    var monthFunction = {
        token: 'month', 
        description: AD.lang.label.getLabel('ab.equation.date_month', ['month( {datevalue} )']) || '*month( {datevalue} )\nReturns the month of a given date', 
        initialText: 'month( /* date */ )',

        returns: 'numeric',  

        /**
         * @function exec
         * return the month of the given date 
         * @return {int}
         */
        exec: function(dateValue) {

            if (typeof moment == 'undefined') {
                console.error('Shoot!  moment not defined before trying to use this!');
            }

            // if no dateValue given, assume today:
            if (!dateValue) {
                dateValue = new Date();
            }
            //month is 0 indexed, so January is 0, however 1 will be expected, so add 1 to the result
            return moment(dateValue).month() + 1;
        }
    };


    return monthFunction;
});