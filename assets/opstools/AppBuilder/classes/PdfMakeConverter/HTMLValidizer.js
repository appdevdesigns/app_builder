export default class HTMLValidizer {
   constructor() {}

   // In some cases copying from word to OpenSlides results in umlauts
   // that are the base letter and then the entity #776; to make the dots
   // above the base letter. This breaks the PDF.
   replaceMalformedUmlauts(text) {
      return text.replace(/([aeiouAEIOUy])[\u0308]/g, function(
         match,
         baseChar
      ) {
         return "&" + baseChar + "uml;";
      });
   }

   //checks if str is valid HTML. Returns valid HTML if not,
   //return emptystring if empty
   validize(str) {
      if (str) {
         str = this.replaceMalformedUmlauts(str);
         // Sometimes, some \n are in the text instead of whitespaces. Replace them.
         str = str.replace(/\n/g, " ");

         var a = document.createElement("div");
         a.innerHTML = str;
         _.forEach(a.childNodes, function(child) {
            if (child.nodeType == 1) {
               return str;
            }
         });
         return "<p>" + str + "</p>";
      } else {
         return ""; //needed for blank 'reasons' field
      }
   }
}
