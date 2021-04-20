module.exports = {
   "env": {
      "node": true,
      "browser": true,
      "jquery": true
   },

   "parserOptions": {
      "ecmaVersion": 8,
      "sourceType": "module"
   },

   globals: {
      "_": "readonly",
      "AB": "readonly",
      "AD": "readonly",
      "cordova" : "readonly",
      "Countly" : "readonly",
      "Framework7": "readonly",
      "OP": "readonly",
      "webix": "readonly",
      "$$": "readonly"
   },

   // "parser": "babel-eslint",
   extends: ["eslint:recommended", "prettier", "plugin:jsdoc/recommended"], // extending recommended config and config derived from eslint-config-prettier
   plugins: ["prettier"], // activating esling-plugin-prettier (--fix stuff)
   rules: {
      "prettier/prettier": [
         // customizing prettier rules (unfortunately not many of them are customizable)
         "error",
         {
            "arrowParens": "always",
            "endOfLine": "lf",
            "printWidth": 80,
            "tabWidth": 3
         }
      ],
      "no-console": 0, // "off",
      // eqeqeq: ["error", "always"] // adding some custom ESLint rules
   }
};
