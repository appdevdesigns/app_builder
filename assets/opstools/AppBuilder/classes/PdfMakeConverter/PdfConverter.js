/**
 * Convert from Angular's factory to ES6
 * https://raw.githubusercontent.com/OpenSlides/OpenSlides/master/openslides/core/static/js/core/pdf.js
 */

import HTMLValidizer from "./HTMLValidizer";

const DIFF_MODE_NORMAL = 0,
   DIFF_MODE_INSERT = 1,
   DIFF_MODE_DELETE = 2,
   // Space between list elements
   LI_MARGIN_BOTTOM = 8,
   STANDARD_FONT_SIZE = 10;

export default class PdfConverter {
   constructor() {}

   /**
    * Convertes HTML for use with pdfMake
    * @function
    * @param {object} html - html
    * @param {string} lineNumberMode - [inline, outside, none]
    */
   convertHTML(html, lineNumberMode) {
      var slice = Function.prototype.call.bind([].slice),
         map = Function.prototype.call.bind([].map);

      /**
       * Creates containerelements for pdfMake
       * e.g create('text':'MyText') result in { text: 'MyText' }
       * or complex objects create('stack', [{text:'MyText'}, {text:'MyText2'}])
       *for units / paragraphs of text
       *
       * @function
       * @param {string} name      - name of the attribute holding content
       * @param {object} content   - the actual content (maybe empty)
       */
      var create = function(name, content) {
         var o = {};
         content = content || [];
         o[name] = content;
         return o;
      };

      var elementStyles = {
            b: ["font-weight:bold"],
            strong: ["font-weight:bold"],
            u: ["text-decoration:underline"],
            em: ["font-style:italic"],
            i: ["font-style:italic"],
            h1: ["font-size:14", "font-weight:bold"],
            h2: ["font-size:12", "font-weight:bold"],
            h3: ["font-size:10", "font-weight:bold"],
            h4: ["font-size:10", "font-style:italic"],
            h5: ["font-size:10"],
            h6: ["font-size:10"],
            a: ["color:blue", "text-decoration:underline"],
            strike: ["text-decoration:line-through"],
            del: ["color:red", "text-decoration:line-through"],
            ins: ["color:green", "text-decoration:underline"]
         },
         classStyles = {
            delete: ["color:red", "text-decoration:line-through"],
            insert: ["color:green", "text-decoration:underline"]
         },
         getLineNumber = function(element) {
            if (
               element &&
               element.nodeName == "SPAN" &&
               element.getAttribute("class") &&
               element.getAttribute("class").indexOf("os-line-number") > -1
            ) {
               return element.getAttribute("data-line-number");
            }
         },
         /**
          *
          * Removes all line number nodes (not line-breaks)
          * and returns an array containing the reoved numbers in this format:
          * { lineNumber: '<lineNumber>', marginBottom: <number> }
          * where marginBottom is optional.
          *
          * @function
          * @param {object} element
          */
         extractLineNumbers = function(element) {
            var foundLineNumbers = [];
            var lineNumber = getLineNumber(element);
            if (lineNumber) {
               foundLineNumbers.push({ lineNumber: lineNumber });
               element.parentNode.removeChild(element);
            } else if (element.nodeName === "BR") {
               // Check if there is a new line, but it does not get a line number.
               // If so, insert a dummy line, so the line nubers stays aligned with
               // the text.
               if (!getLineNumber(element.nextSibling)) {
                  foundLineNumbers.push({ lineNumber: "" });
               }
            } else {
               var children = element.childNodes,
                  childrenLength = children.length,
                  childrenLineNumbers = [];
               for (var i = 0; i < children.length; i++) {
                  childrenLineNumbers = _.concat(
                     childrenLineNumbers,
                     extractLineNumbers(children[i])
                  );
                  if (children.length < childrenLength) {
                     i -= childrenLength - children.length;
                     childrenLength = children.length;
                  }
               }
               // If this is an list item, add some space to the lineNumbers:
               if (childrenLineNumbers.length && element.nodeName === "LI") {
                  _.last(childrenLineNumbers).marginBottom = LI_MARGIN_BOTTOM;
               }
               foundLineNumbers = _.concat(
                  foundLineNumbers,
                  childrenLineNumbers
               );
            }
            return foundLineNumbers;
         },
         /**
          * Parses Children of the current paragraph
          * @function
          * @param {object} converted  -
          * @param {object} element   -
          * @param {object} currentParagraph -
          * @param {object} styles -
          * @param {number} diff_mode
          */
         parseChildren = function(
            converted,
            element,
            currentParagraph,
            styles,
            diff_mode
         ) {
            var elements = [];
            var children = element.childNodes;
            if (children.length !== 0) {
               _.forEach(children, function(child) {
                  currentParagraph = ParseElement(
                     elements,
                     child,
                     currentParagraph,
                     styles,
                     diff_mode
                  );
               });
            }
            if (elements.length !== 0) {
               _.forEach(elements, function(el) {
                  converted.push(el);
               });
            }
            return currentParagraph;
         },
         /**
          * Returns the color in a hex format (e.g. #12ff00).
          * Tries to convert the rgb form into this.
          * @function
          * @param {string} color
          */
         parseColor = function(color) {
            var hexRegex = new RegExp("^#([0-9a-f]{3}|[0-9a-f]{6})$");
            // e.g. #fff or #ff0048
            var rgbRegex = new RegExp(
               "^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$"
            );
            // e.g. rgb(0,255,34) or rgb(22, 0, 0)
            var nameRegex = new RegExp("^[a-z]+$");
            // matches just text like 'red', 'black', 'green'

            if (hexRegex.test(color)) {
               return color;
            } else if (rgbRegex.test(color)) {
               var decimalColors = rgbRegex.exec(color).slice(1);
               for (var i = 0; i < 3; i++) {
                  var decimalValue = parseInt(decimalColors[i]);
                  if (decimalValue > 255) {
                     decimalValue = 255;
                  }
                  var hexString = "0" + decimalValue.toString(16);
                  hexString = hexString.slice(-2);
                  decimalColors[i] = hexString;
               }
               return "#" + decimalColors.join("");
            } else if (nameRegex.test(color)) {
               return color;
            } else {
               console.error('Could not parse color "' + color + '"');
               return color;
            }
         },
         /**
          * Extracts the style from an object
          * @function
          * @param {object} o       - the current object
          * @param {object} styles  - an array with styles
          */
         ComputeStyle = function(o, styles) {
            styles.forEach(function(singleStyle) {
               var styleDefinition = singleStyle
                  .trim()
                  .toLowerCase()
                  .split(":");
               var style = styleDefinition[0];
               var value = styleDefinition[1];
               if (styleDefinition.length === 2) {
                  switch (style) {
                     case "padding-left":
                        o.margin = [parseInt(value), 0, 0, 0];
                        break;
                     case "font-size":
                        o.fontSize = parseInt(value);
                        break;
                     case "text-align":
                        switch (value) {
                           case "right":
                           case "center":
                           case "justify":
                              o.alignment = value;
                              break;
                        }
                        break;
                     case "font-weight":
                        switch (value) {
                           case "bold":
                              o.bold = true;
                              break;
                        }
                        break;
                     case "text-decoration":
                        switch (value) {
                           case "underline":
                              o.decoration = "underline";
                              break;
                           case "line-through":
                              o.decoration = "lineThrough";
                              break;
                        }
                        break;
                     case "font-style":
                        switch (value) {
                           case "italic":
                              o.italics = true;
                              break;
                        }
                        break;
                     case "color":
                        o.color = parseColor(value);
                        break;
                     case "background-color":
                        o.background = parseColor(value);
                        break;
                  }
               }
            });
         },
         // A little helper function to check, if an element has the given class.
         hasClass = function(element, className) {
            var classes = element.getAttribute("class");
            if (classes) {
               classes = classes.toLowerCase().split(" ");
               return _.indexOf(classes, className) > -1;
            } else {
               return false;
            }
         },
         // Helper function for determinating whether a parent of element is a list item.
         isInsideAList = function(element) {
            var parent = element.parentNode;
            while (parent !== null) {
               if (parent.nodeName.toLowerCase() === "li") {
                  return true;
               }
               parent = parent.parentNode;
            }
            return false;
         },
         /**
          * Parses a single HTML element
          * @function
          * @param {object} alreadyConverted  -
          * @param {object} element   -
          * @param {object} currentParagraph -
          * @param {object} styles -
          * @param {number} diff_mode
          */
         ParseElement = function(
            alreadyConverted,
            element,
            currentParagraph,
            styles,
            diff_mode
         ) {
            styles = styles ? _.clone(styles) : [];
            var classes = [];
            if (element.getAttribute) {
               var nodeStyle = element.getAttribute("style");
               if (nodeStyle) {
                  nodeStyle.split(";").forEach(function(nodeStyle) {
                     var tmp = nodeStyle.replace(/\s/g, "");
                     styles.push(tmp);
                  });
               }
               var nodeClass = element.getAttribute("class");
               if (nodeClass) {
                  classes = nodeClass.toLowerCase().split(" ");
                  classes.forEach(function(nodeClass) {
                     if (typeof classStyles[nodeClass] != "undefined") {
                        classStyles[nodeClass].forEach(function(style) {
                           styles.push(style);
                        });
                     }
                     if (nodeClass == "insert") {
                        diff_mode = DIFF_MODE_INSERT;
                     }
                     if (nodeClass == "delete") {
                        diff_mode = DIFF_MODE_DELETE;
                     }
                  });
               }
            }
            var nodeName = element.nodeName.toLowerCase();
            switch (nodeName) {
               case "h1":
               case "h2":
               case "h3":
               case "h4":
               case "h5":
               case "h6":
                  if (
                     lineNumberMode === "outside" &&
                     element.childNodes.length > 0 &&
                     element.childNodes[0].getAttribute
                  ) {
                     // A heading may have multiple lines, so handle line by line separated by line number elements
                     var outerStack = create("stack");
                     var currentCol, currentText;
                     _.forEach(element.childNodes, function(node) {
                        if (
                           node.getAttribute &&
                           node.getAttribute("data-line-number")
                        ) {
                           if (currentCol) {
                              ComputeStyle(currentCol, elementStyles[nodeName]);
                              outerStack.stack.push(currentCol);
                           }
                           currentText = create("text");
                           currentCol = {
                              columns: [
                                 getLineNumberObject({
                                    lineNumber: node.getAttribute(
                                       "data-line-number"
                                    )
                                 }),
                                 currentText
                              ],
                              margin: [0, 2, 0, 0]
                           };
                        } else {
                           var parsedText = ParseElement(
                              [],
                              node,
                              create("text"),
                              styles,
                              diff_mode
                           );
                           // append the parsed text to the currentText
                           _.forEach(parsedText.text, function(text) {
                              currentText.text.push(text);
                           });
                        }
                     });
                     ComputeStyle(currentCol, elementStyles[nodeName]);
                     outerStack.stack.push(currentCol);
                     outerStack.margin = [0, 0, 0, 0];
                     if (
                        !/h[1-6]/.test(
                           element.previousSibling.nodeName.toLowerCase()
                        )
                     ) {
                        outerStack.margin[1] = 10;
                     }
                     alreadyConverted.push(outerStack);
                  } else {
                     currentParagraph = create("text");
                     currentParagraph.marginBottom = 4;
                     currentParagraph.marginTop = 10;
                     currentParagraph = parseChildren(
                        alreadyConverted,
                        element,
                        currentParagraph,
                        styles.concat(elementStyles[nodeName]),
                        diff_mode
                     );
                     alreadyConverted.push(currentParagraph);
                  }
                  break;
               case "a":
               case "b":
               case "strong":
               case "u":
               case "em":
               case "i":
               case "ins":
               case "del":
               case "strike":
                  currentParagraph = parseChildren(
                     alreadyConverted,
                     element,
                     currentParagraph,
                     styles.concat(elementStyles[nodeName]),
                     diff_mode
                  );
                  break;
               case "table":
                  var t = create("table", {
                     widths: [],
                     body: []
                  });
                  var border = element.getAttribute("border");
                  var isBorder = false;
                  if (border) {
                     isBorder = parseInt(border) === 1;
                  } else {
                     t.layout = "noBorders";
                  }
                  currentParagraph = parseChildren(
                     t.table.body,
                     element,
                     currentParagraph,
                     styles,
                     diff_mode
                  );
                  var widths = element.getAttribute("widths");
                  if (!widths) {
                     if (t.table.body.length !== 0) {
                        if (t.table.body[0].length !== 0)
                           for (var k = 0; k < t.table.body[0].length; k++)
                              t.table.widths.push("*");
                     }
                  } else {
                     var w = widths.split(",");
                     for (var ko = 0; ko < w.length; ko++)
                        t.table.widths.push(w[ko]);
                  }
                  alreadyConverted.push(t);
                  break;
               case "tbody":
                  currentParagraph = parseChildren(
                     alreadyConverted,
                     element,
                     currentParagraph,
                     styles,
                     diff_mode
                  );
                  break;
               case "tr":
                  var row = [];
                  currentParagraph = parseChildren(
                     row,
                     element,
                     currentParagraph,
                     styles,
                     diff_mode
                  );
                  alreadyConverted.push(row);
                  break;
               case "td":
                  currentParagraph = create("text");
                  var st = create("stack");
                  st.stack.push(currentParagraph);
                  var rspan = element.getAttribute("rowspan");
                  if (rspan) st.rowSpan = parseInt(rspan);
                  var cspan = element.getAttribute("colspan");
                  if (cspan) st.colSpan = parseInt(cspan);
                  currentParagraph = parseChildren(
                     st.stack,
                     element,
                     currentParagraph,
                     styles,
                     diff_mode
                  );
                  alreadyConverted.push(st);
                  break;
               case "span":
                  if (element.getAttribute("data-line-number")) {
                     if (lineNumberMode === "inline") {
                        if (diff_mode !== DIFF_MODE_INSERT) {
                           var lineNumberInline = element.getAttribute(
                                 "data-line-number"
                              ),
                              lineNumberObjInline = {
                                 text: lineNumberInline,
                                 color: "gray",
                                 fontSize: 5
                              };
                           currentParagraph.text.push(lineNumberObjInline);
                        }
                     } else if (lineNumberMode === "outside") {
                        var lineNumberOutline;
                        if (diff_mode === DIFF_MODE_INSERT) {
                           lineNumberOutline = "";
                        } else {
                           lineNumberOutline = element.getAttribute(
                              "data-line-number"
                           );
                        }
                        var col = {
                           columns: [
                              getLineNumberObject({
                                 lineNumber: lineNumberOutline
                              })
                           ]
                        };
                        currentParagraph = create("text");
                        currentParagraph.lineHeight = 1.25;
                        col.columns.push(currentParagraph);
                        alreadyConverted.push(col);
                     }
                  } else {
                     currentParagraph = parseChildren(
                        alreadyConverted,
                        element,
                        currentParagraph,
                        styles,
                        diff_mode
                     );
                  }
                  break;
               case "br":
                  var brParent = element.parentNode;
                  var brParentNodeName = brParent.nodeName;
                  //in case of no or inline-line-numbers and the ignore os-line-breaks.
                  if (
                     (lineNumberMode === "inline" ||
                        lineNumberMode === "none") &&
                     hasClass(element, "os-line-break")
                  ) {
                     break;
                  } else {
                     currentParagraph = create("text");
                     if (
                        lineNumberMode === "outside" &&
                        brParentNodeName !== "LI" &&
                        element.parentNode.parentNode.nodeName !== "LI"
                     ) {
                        if (
                           brParentNodeName === "INS" ||
                           brParentNodeName === "DEL"
                        ) {
                           var hasPrevSiblingALineNumber = function(element) {
                              // Iterare all nodes up to the top from element.
                              while (element) {
                                 if (getLineNumber(element)) {
                                    return true;
                                 }
                                 if (element.previousSibling) {
                                    element = element.previousSibling;
                                 } else {
                                    element = element.parentNode;
                                 }
                              }
                              return false;
                           };
                           if (hasPrevSiblingALineNumber(brParent)) {
                              currentParagraph.margin = [20, 0, 0, 0];
                           }
                        } else {
                           currentParagraph.margin = [20, 0, 0, 0];
                        }
                     }
                     // Add a dummy line, if the next tag is a BR tag again. The line could
                     // not be empty otherwise it will be removed and the empty line is not displayed
                     if (
                        element.nextSibling &&
                        element.nextSibling.nodeName === "BR"
                     ) {
                        currentParagraph.text.push(create("text", " "));
                     }
                     currentParagraph.lineHeight = 1.25;
                     alreadyConverted.push(currentParagraph);
                  }
                  break;
               case "li":
               case "div":
                  currentParagraph = create("text");
                  currentParagraph.lineHeight = 1.25;
                  var stackDiv = create("stack");
                  if (_.indexOf(classes, "os-split-before") > -1) {
                     stackDiv.listType = "none";
                  }
                  if (nodeName === "li") {
                     stackDiv.marginBottom = LI_MARGIN_BOTTOM;
                  }
                  stackDiv.stack.push(currentParagraph);
                  ComputeStyle(stackDiv, styles);
                  currentParagraph = parseChildren(
                     stackDiv.stack,
                     element,
                     currentParagraph,
                     [],
                     diff_mode
                  );
                  alreadyConverted.push(stackDiv);
                  break;
               case "p":
                  var pObjectToPush; //determine what to push later
                  currentParagraph = create("text");
                  // If this element is inside a list (happens if copied from word), do not set spaces
                  // and margins. Just leave the paragraph there..
                  if (!isInsideAList(element)) {
                     currentParagraph.margin = [0, 0, 0, 0];
                     if (classes.indexOf("os-split-before") === -1) {
                        currentParagraph.margin[1] = 8;
                     }
                     if (classes.indexOf("insert") > -1) {
                        currentParagraph.margin[0] = 20;
                     }
                  }
                  currentParagraph.lineHeight = 1.25;
                  var stackP = create("stack");
                  stackP.stack.push(currentParagraph);
                  ComputeStyle(stackP, styles);
                  currentParagraph = parseChildren(
                     stackP.stack,
                     element,
                     currentParagraph,
                     [],
                     diff_mode
                  );
                  pObjectToPush = stackP; //usually we want to push stackP
                  if (lineNumberMode === "outside") {
                     if (element.childNodes.length > 0) {
                        //if we hit = 0, the code would fail
                        // add empty line number column for inline diff or pragraph diff mode
                        if (
                           element.childNodes[0].tagName === "INS" ||
                           element.childNodes[0].tagName === "DEL"
                        ) {
                           var pLineNumberPlaceholder = {
                              width: 20,
                              text: "",
                              fontSize: 8,
                              margin: [0, 2, 0, 0]
                           };
                           var pLineNumberPlaceholderCol = {
                              columns: [pLineNumberPlaceholder, stackP]
                           };
                           pObjectToPush = pLineNumberPlaceholderCol; //overwrite the object to push
                        }
                     }
                  }
                  alreadyConverted.push(pObjectToPush);
                  break;
               case "img":
                  var path = element.getAttribute("src");
                  var height = images[path].height;
                  var width = images[path].width;
                  var maxWidth = 450;
                  var scale = 100;

                  var style = element.getAttribute("style");
                  if (style) {
                     var match = style.match(/width:\s*(\d+)\%/);
                     if (match) {
                        scale = parseInt(match[1]);
                     }
                  }

                  // scale image
                  width = (width * scale) / 100;
                  height = (height * scale) / 100;

                  if (width > maxWidth) {
                     height = (height * maxWidth) / width;
                     width = maxWidth;
                  }

                  // remove trailing / for the virtual file system (there is no root)
                  if (path.indexOf("/") === 0) {
                     path = path.substr(1);
                  }
                  alreadyConverted.push({
                     image: path,
                     width: width,
                     height: height
                  });
                  break;
               case "ul":
               case "ol":
                  var list = create(nodeName);
                  if (nodeName == "ol") {
                     var start = element.getAttribute("start");
                     if (start) {
                        list.start = start;
                     }
                  }
                  ComputeStyle(list, styles);
                  if (lineNumberMode === "outside") {
                     var lines = extractLineNumbers(element);
                     currentParagraph = parseChildren(
                        list[nodeName],
                        element,
                        currentParagraph,
                        styles,
                        diff_mode
                     );
                     if (lines.length > 0) {
                        var listCol = {
                           columns: [
                              {
                                 width: 20,
                                 stack: []
                              }
                           ]
                        };
                        _.forEach(lines, function(line) {
                           listCol.columns[0].stack.push(
                              getLineNumberObject(line)
                           );
                        });
                        listCol.columns.push(list);
                        if (!hasClass(element, "os-split-before")) {
                           listCol.margin = [0, 5, 0, 0];
                        }
                        alreadyConverted.push(listCol);
                     } else {
                        list.margin = [20, 0, 0, 0];
                        alreadyConverted.push(list);
                     }
                  } else {
                     list.margin = [0, LI_MARGIN_BOTTOM, 0, 0];
                     currentParagraph = parseChildren(
                        list[nodeName],
                        element,
                        currentParagraph,
                        styles,
                        diff_mode
                     );
                     alreadyConverted.push(list);
                  }
                  break;
               default:
                  var defaultText = create(
                     "text",
                     element.textContent.replace(/\n/g, "")
                  );
                  ComputeStyle(defaultText, styles);
                  if (!currentParagraph) {
                     currentParagraph = {};
                     currentParagraph.text = [];
                  }
                  currentParagraph.text.push(defaultText);
                  break;
            }
            return currentParagraph;
         },
         /**
          * Parses HTML
          * @function
          * @param {string} converted      -
          * @param {object} htmlText   -
          */
         ParseHtml = function(converted, htmlText) {
            var html = new HTMLValidizer().validize(htmlText);
            html = $(html.replace(/\t/g, "").replace(/\n/g, ""));
            var emptyParagraph = create("text");
            slice(html).forEach(function(element) {
               ParseElement(converted, element, null, [], DIFF_MODE_NORMAL);
            });
         },
         /* Returns the object to push first into every column, that represents the given line. */
         getLineNumberObject = function(line) {
            var standardFontsize = STANDARD_FONT_SIZE;
            return {
               width: 20,
               text: [
                  {
                     text: " ", // Add a blank with the normal font size here, so in rare cases the text
                     // is rendered on the next page and the linenumber on the previous page.
                     fontSize: standardFontsize,
                     decoration: ""
                  },
                  {
                     text: line.lineNumber,
                     color: "gray",
                     fontSize: standardFontsize - 2,
                     decoration: ""
                  }
               ],
               marginBottom: line.marginBottom,
               lineHeight: 1.25
            };
         },
         content = [];
      ParseHtml(content, html);
      return content;
   }
}
