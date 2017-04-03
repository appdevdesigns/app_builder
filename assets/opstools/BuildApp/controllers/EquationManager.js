steal(

    // Note: the original Filtrex.js is not compatible with amd loaders.
    // we've taken the one from https://github.com/jaz303/filtrex/tree/npm-module
    // $ git clone https://github.com/jaz303/filtrex.git
    // $ cd filtrex
    // $ git checkout npm-module
    // $ cp filtrex.js  /path/to/our/assets/js/filtrex.js
    'js/filtrex.js',

    // Add any equation function definitions here:
    'opstools/BuildApp/controllers/equation_functions/_noArgs.js',
    'opstools/BuildApp/controllers/equation_functions/date_year.js',
    'opstools/BuildApp/controllers/equation_functions/age.js',

    function (filtrex) {
        var self = {};

        self.equations = {};  // hash of parsed equations:  'equation' : fn(data)


        // steal() will pass in each of the above loaded objects
        // as parameters to this function().


        // convert the provided plugins into a [functions]
        var functions = $.map(arguments, function(fn,indx){
            return [fn];
        }).filter(function(fn) {
            return (fn.token);  // don't include filtrex in our functions
        });


        var hashFunctions = {};

        // Listen save event
        functions.forEach(function (fn) {
            hashFunctions[fn.token] = fn.exec;
        });



        /*
         * @function getDescriptions
         * return an array of all the available function descriptions
         *
         * NOTE: ignores any functions where .isHidden is true.
         *
         * @return {array}
         */
        self.getDescriptions = function(equationType) {
            return $.map(functions.filter(function(fn){ return !fn.isHidden; }), function(fn, indx){
                console.log("fn:"+fn.returns);
                 console.log("equationType:"+equationType);
                if(fn.returns == equationType){
                    console.log("description:" + equationType);
                    return [fn.description];
                }
  
            });
        }


        /**
         * @function parse
         * return a javascript fn() that will execute the given equation.
         *
         * example: 
         *  var filter = EquationManager.parse(' 1 + 1');
         *  filter({});  // 2
         *
         *  var filter = EquationManager.parse(' year() - year( birthdate )');
         *  filter({ birthdate:new Date('07/21/1970')})  // 47
         *
         * 
         * @param equation {string}  an equation to parse
         * @return {fn}  if equation is parseable, or {null} otherwise.
         */
        self.parse = function( equation ) {

            // filtrex doesn't handle empty (), so let's replace them with ( noArgs(0) )
            equation = equation.replace(/[(]+[\s]*[)]+/g, '( noArgs(0) )');

            // get my copy of the parsed equation 
            var myFilter = this.equations[equation];
            if (!myFilter) {

                // 1st time: so parse it and save it for later

                // filtrex throws an error if not parseable:
                try {

                    myFilter = filtrex(equation, hashFunctions);
                    this.equations[equation] = myFilter;

                } catch(e) {

                    // something didn't parse:
                    return null;
                }
                
            }
            return myFilter;
        }


        return self;
    }
);
