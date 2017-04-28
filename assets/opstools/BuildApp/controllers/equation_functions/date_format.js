steal(
    function () {

    // date_format
    //
    // A function that formats a given date value.
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
    var formatFunction = {
        token: 'formatDate', 
        description: AD.lang.label.getLabel('ab.equation.formatDate', ['formatDate( {datevalue}, {format} )']) || '*formatDate( {datevalue}, {format} )\nFormatts a given date based on the pattern', 
        initialText: 'formatDate( /* date, pattern */ )',

        returns: 'string',  

        /**
         * @function exec
         * formats a date
         * @return {int}
         */
        exec: function(dateValue, format) {

            if (typeof moment == 'undefined') {
                console.error('Shoot!  moment not defined before trying to use this!');
            }

            // if no dateValue given, assume today:
            if (!dateValue) {
                dateValue = new Date();
            }
           
            return moment(dateValue).format(format);
        }
    };


    return formatFunction;
});