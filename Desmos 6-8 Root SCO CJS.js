"use strict";

window.PearsonGL = window.PearsonGL || {};
window.PearsonGL.External = window.PearsonGL.External || {};
   
/******************************************************************************
* Module: rootJS
******************************************************************************/
PearsonGL.External.rootJS = (function() {
   
 /***********************************************************************************
   * PRIVATE VARIABLES / FUNCTIONS
   **********************************************************************************/
  var exports = {};  // This object is used to export public functions/variables
  
  
  /***********************************************************************************
   * EXPORTS / PUBLIC FUNCTIONS
   *
   * To declare your function
   * exports.myFunc1 = function() {};
   * exports.myFunc2 = function() {};
   **********************************************************************************/

// DCJS Stuff [TK]
  /* ←—PRIVATE VARIABLES———————————————————————————————————————————————————→ *\
       | Variable cache; access with vs[uniqueId].myVariable
       | Also helpers, for convenience. hxs
       * ←—————————————————————————————————————————————————————————————————→ */
    var vs = {common:{}};
    var hxs = {};
  /* ←—PRIVATE HELPER FUNCTIONS————————————————————————————————————————————→ *\
       | Subroutines; access with hs.functionName(args)
       * ←—————————————————————————————————————————————————————————————————→ */
    var hs = {
      /* ←— flattenFuncStruct —————————————————————————————————————————————→ *\
       ↑ Turn a nested function structure into a single layer; each function's   ↑
       |  name prefixed by its parent objects, connected by underscores.         |
       |                                                                         |
       | @Arg1: a hierarchical structure containing only Functions and objects   |
       | @Arg2: (Optional) a string to prefix all function names                 |
       |                                                                         |
       | @Returns: object whose members are all references to functions          |
       ↓ @Returns: false if input contains (sub-)*members that are not functions ↓
       * ←—————————————————————————————————————————————————————————————————————→ */
      flattenFuncStruct: function(funcStruct,prefix) {
        prefix = prefix || '';
        var functions={};
        var keys = Object.keys(funcStruct);
        var i;
        var l = keys.length;
        var item;
        for(i=0; i<l; i+=1) {
          item = funcStruct[keys[i]];
          if (typeof item === 'object') {
            if (!(Object.assign(functions,hs.flattenFuncStruct(item,prefix+keys[i]+'_')))) {
              return false;
            }
          } else if (typeof item === 'function') {
            functions[prefix+keys[i]] = item;
          } else {
            console.log(prefix+keys[i]+' is not a function or object');
            return false;
          }
        }
        return functions;
       },
      /* ←— reportDCJSError —————————————————————————————————————————————————→ *\
       ↑ Downloads an error report file including the current state and some     ↑
       |  other useful stuff.                                                    |
       | Additionally sets the Desmos calculator instance to a global variable   |
       |  for futher debugging.                                                  |
       |                                                                         |
       | @Arg1: A standard DCJS options struct                                   |
       | @Arg2: (Optional) additional info to be recorded in the error report    |
       ↓                                                                         ↓
       * ←—————————————————————————————————————————————————————————————————————→ */
      reportDCJSError: function(options) {

        window['widget_' + output.uniqueId] = options.desmos;

        var output = {
            id: options.uniqueId,
            state: options.desmos.getState(),
            variables: vs[options.uniqueId],
            helpers: hxs[options.uniqueId],
            screenshot: options.desmos.screenshot()
          };

        var i;
        for (i = 1; i < arguments.length; i += 1) {
          output["arguments["+i+"]"] = arguments[i];
         }

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(output,null,"\t")));
        element.setAttribute('download', 'Widget Error Report '+((new Date()).toISOString())+'.json');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
       },
      /* ←— parseArgs —————————————————————————————————————————————————————→ *\
       ↑ Returns a new struct merging given options with defaults for those   ↑
       | options not provided.                                                |
       |                                                                      |
       |          TODO TK STUB UPDATE WHEN MSWEB-7680 IS RESOLVED             |
       |                                                                      |
       | @arg: an argument list from a function call, either:                 |
       |           Standard Desmos Gadget helper function options struct:     |
       |              [{                                                      |
       |                desmos: Desmos,                                       |
       |                name: String,                                         |
       |                value: Number,                                        |
       |                uniqueId: String,                                     |
       |                (optional) log: Function                              |
       |              }]                                                      |
       |           or [value, name, desmos]                                   |
       |                                                                      |
       | @Returns: standard Desmos Gadget helper function options struct      |
       ↓ @Returns: default options if input is empty                          ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      parseArgs: function() {
        var args = Array.from(arguments);
        if (args.length < 1) {
          throw new Error("DCJS cannot parse empty argument list.");
        }

        var output = {
          log: console.log // Kill this when not debugging
        };

        if (typeof args[0] === "object") {
          Object.assign(output,args[0]);
         } else if (typeof args[0] === "number") {
          // Expect (value, name, desmos)
          output.value = args[0];
         } else {
          output.log(args);
          throw new Error ("DCJS received non-standard arguments.");
         }

        if (output.desmos === undefined) {
          output.desmos = args[2] || window.calculator || window.Calc;
        }

        if (output.name === undefined) {
          output.name = args[1] || "";
        }

        if (output.value === undefined) {
          output.value = NaN;
        }

        if (output.uniqueId === undefined) {
          output.uniqueId = output.desmos.guid;
        }

        if (window.widget === undefined && output.log === console.log) {
          window.reportDesmosError = this.reportDCJSerror;
        }

        vs[output.uniqueId] = vs[output.uniqueId] || {};

        hxs[output.uniqueId] = hxs[output.uniqueId] || {};

        return output;
       },
      /* ←— eval ——————————————————————————————————————————————————————————→ *\
       ↑ Evaluates a LaTeX expression using a given Desmos Calculator object  ↑
       |                                                                      |
       |                                                                      |
       | @arg0: A valid LaTeX expression (we trust you)                       |
       | @arg1: A standard DCJS Options Object                                |
       | @arg2: a callback to execute with the value once it is evaluated     |
       |                                                                      |
       |                                                                      |
       | @Returns: value of the given expression if a number                  |
       | @Returns: array of values if expression evaluates to a list          |
       ↓ @Returns: NaN if the expression does not evaluate                    ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      eval: function(expression,options,callback) {
        var o = hs.parseArgs(options),
            desmos = o.desmos,
            // vars = vs[o.uniqueId],
            helpers = hxs[o.uniqueId],
            helper = helpers[expression];

        // Access Helper Expression
        if(helper === undefined) {
          helper = helpers[expression] = desmos.HelperExpression({latex:expression});
        }
        
        if(helper.numericValue !== undefined) callback(helper.numericValue);
        else if(helper.listValue !== undefined) callback(helper.listValue);
        else {
          var thiscall = Date.now(),
              observeCallback = function(type,thishelper) {
                if(isNaN(thishelper[type]) || thishelper[type] === undefined) return;

                thishelper.unobserve('numericValue.'+thiscall);
                thishelper.unobserve('listValue.'+thiscall);

                callback(thishelper[type]);
               };
          helper.observe('numericValue.'+thiscall,observeCallback);
          helper.observe('listValue.'+thiscall,observeCallback);
         }
       }
     };

// Pre-DCJS Stuff 
  (function(){
    // Define functions

      function getUniqueRandom(arr,num) {
        arr = arr.value;
        num = num.value; // Added 2017-11-01 to match the rest of this stuff
        var i,
          aTemp,
          num0,
          num1,
          aTemp2;
        
        if(String(arr).indexOf('|') != -1) {
          aTemp = String(arr).split('|')
          num0 = Number(aTemp[0])
          num1 = Number(aTemp[1])
          aTemp2 = [];
          for(i=num0;i<=num1;i++) {
            aTemp2.push(i)
          }
          arr = aTemp2;
        }

        if(String(arr).indexOf('::') != -1) {
          aTemp = String(arr).split('::')
          num0 = Number(aTemp[0])
          num1 = Number(aTemp[1])
          aTemp2 = [];
          for(i=num0;i<=num1;i++) {
            aTemp2.push(i)
          }
          arr = aTemp2;
        }

        for (i = arr.length-1; i >=0; i--) {
           
              var randomIndex = Math.floor(Math.random()*(i+1)); 
              var itemAtIndex = arr[randomIndex]; 
               
              arr[randomIndex] = arr[i]; 
              arr[i] = itemAtIndex;
          }
        
        var tempArr = arr;
        var aSet = [];
        for(i=0;i<num;i++) {
          aSet.push(tempArr[i])
        }
        if(typeof arr[0] == 'number') {
          return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");
        }
        if(typeof arr[0] == 'string') {
          return new PearsonGL.Parameters.Parameter(aSet,"ordered","string");
        }
       }

      function textOnSVG_V1(width,height,xPos,yPos,text,style,canvasBgStyle) {
          
          width = width.value;
          height = height.value;
          xPos = xPos.value;
          yPos = yPos.value;
          text = text.value;
          style = style.value;
          canvasBgStyle = canvasBgStyle.value;
          var canvas = '';
          
          var SVGObj = {  
              createLabel : function(x,y,text,style) {   
                  return '<text class="svg-text-on-table" x="' + x + '" y="' + y + '" style="'+style+'">'+text+'</text>';
              }
          }
       

          canvas += SVGObj.createLabel(xPos,yPos,text,style);

          var textSVG =  '<svg style="'+canvasBgStyle+'" width="'+width+'" height="'+height+'">'+canvas+'</svg>';
        return new PearsonGL.Parameters.Parameter(textSVG,"single","string");



       }

      function FractionReduce(n,d) {

              var numerator = (n<d)?n:d;
              var denominator = (n<d)?d:n;        
              var remainder = numerator;
              var lastRemainder = numerator;
              var finalArr = [];

              while (true){
                  lastRemainder = remainder;
                  remainder = denominator % numerator;
                  if (remainder === 0){
                      break;
                  }
                  denominator = numerator;
                  numerator = remainder;
              }
              if(lastRemainder){
                finalArr.push(n/lastRemainder);
                finalArr.push(d/lastRemainder);

                return new PearsonGL.Parameters.Parameter(finalArr,"ordered","integer");
              }
       }

      function decimalToFraction(decimal) {
        var answer = "";
        var decimalArray = String(decimal).split("."); // 1.75
        var leftDecimalPart = decimalArray[0]; // 1
        var rightDecimalPart = decimalArray[1]; // 75

        var numerator = leftDecimalPart + rightDecimalPart; // 175
        var denominator = Math.pow(10, rightDecimalPart.length); // 100

        answer = numerator + "/" + denominator;
        return new PearsonGL.Parameters.Parameter(answer ,"single","string");
       }

      function splitNumaratorDeno(number) {
          var str = number;
          var result = str.toString().split("/");
          return new PearsonGL.Parameters.Parameter(result,"ordered","string");
       }

       // // Duplicated later—assuming exp.value is what we want to keep
      // function parseStrToInt(exp) {
      //   return new PearsonGL.Parameters.Parameter(parseInt(exp),"single","integer"); 
      //  }

      function arrayFilter(array1,array2) {
        array1 = array1.value;
        array2 = array2.value;
          var aSet = array1.filter(function(obj) {
              return array2.indexOf(obj) == -1;
          });
        return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");
        
       }

      function getUniqueRandomFloat(arr,num,increment,round) {
        arr = arr.value;
        num = num.value;
        increment = increment.value;
        round = round.value;
        var i;
        
        if(String(arr).indexOf('::') != -1) {
          var aTemp = String(arr).split('::')
          var num0 = Number(aTemp[0])
          var num1 = Number(aTemp[1])
          var aTemp2 = [];
          for(i=num0;i<=num1;i=i+increment) {
            aTemp2.push(i);
          }
          arr = aTemp2;
        }

        for (i = arr.length-1; i >=0; i--) {
           
              var randomIndex = Math.floor(Math.random()*(i+1)); 
              var itemAtIndex = arr[randomIndex]; 
               
              arr[randomIndex] = arr[i]; 
              arr[i] = itemAtIndex;
          }
        
         var tempArr = arr;
        var aSet = [];
        for(i=0;i<num;i++) {
          aSet.push(Number(tempArr[i].toFixed(round)))
        }
        if(typeof arr[0] == 'number') {
            return new PearsonGL.Parameters.Parameter(aSet,"ordered","float");
        }
       
       }

      function getPlaceValue(num,placevalue) {

       
        var numLength = String(num).length;  
        var placeValueNumber = parseInt(String(num).charAt(numLength-placevalue));

        return new PearsonGL.Parameters.Parameter(placeValueNumber,"single","integer");
       }

      function sqrt(number) {
        var sqrt = Math.sqrt(number.value);
        return new PearsonGL.Parameters.Parameter(sqrt,"single","float");
        
       }

      function parseStrToInt(exp) {
        return new PearsonGL.Parameters.Parameter(parseInt(exp.value),"single","integer"); 
       }

      function isSquare(n) {

        var isTrue = n.value > 0 && Math.sqrt(n.value) % 1 === 0;
        return new PearsonGL.Parameters.Parameter(isTrue,"single","boolean"); 

       }

      function createNumberLine_A0495260(dim,minXRange,maxXRange,ptArr,interval) { 

              dim = dim.value;
              minXRange = minXRange.value;
              maxXRange = maxXRange.value;
              ptArr = ptArr.value;
              interval = interval.value;

              var canvas = '';
              var factor;
              var offset = 0;
              // var minValue = minXRange;
              var dimentions = dim-(offset*2);
              var finalGrid;
              // var SVGNS = 'http://www.w3.org/2000/svg'
              // var container;
              // var aPoints = ptArr;
              var rightArrPos = dim - 18.67;
              var SVGObj = {
                  
                  createLine : function (x1, y1, x2, y2, color, w) {
                      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + w + '"/>';
                  },
                  createCircle : function(x,y,r) {
                      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#0092C8"/>';
                  },
                  createLabel : function(x,y,text,fontStyle) {   
                      return '<text x="' + x + '" y="' + y + '" font-style="' + fontStyle + '" font-size="12"  style="font-size:18px;">'+text+'</text>';
                  }
              }
              
              finalGrid = Math.abs(minXRange)+Math.abs(maxXRange);
              factor = Math.round(dimentions/finalGrid);
              // for grid
              canvas += '<polygon points="22.667,17 11.77,22.084 0,24.998 11.77,27.912 22.667,32.994 18.831,24.998"/>';
              canvas += SVGObj.createLine(offset, 25, dimentions+(offset), 25, 'rgb(0,0,0)', 2);
              var noOfParts = 10;
              var partDistance = dimentions/(noOfParts+2);

              var xPos = partDistance;
              var posArr = [partDistance];

              

              for(var i=0;i<noOfParts+1;i++) {
                      
                      canvas += SVGObj.createLine(xPos, 15, xPos, 35, 'rgb(0,0,0)', 1);
                      if(i===0){
                          canvas += SVGObj.createLabel(xPos-7, 55, minXRange ,"normal");
                      }else if(i == noOfParts){
                          canvas += SVGObj.createLabel(xPos-7, 55, parseInt(minXRange+interval) ,"normal");
                      }else{
                          canvas += SVGObj.createLabel(xPos-14, 55, minXRange.toFixed(1) ,"normal");
                      }
                      minXRange = minXRange+interval;
                      xPos = xPos+partDistance;
                      posArr.push(xPos);
                  
              }

              for(var k=0;k<ptArr.length;k++){
                  //var numLength = String(ptArr[k]).length;
                 // var placeValueNumber = parseInt(String(ptArr[k]).charAt(numLength-1))+1;
                 // var multiplier = (ptArr[k]-minValue); // ! not used, according to jsHint
                  var number1 = Number(ptArr[k].toFixed(2).substring(2, 4))*0.1;
                  console.log("number1:: ",number1, typeof number1)
                  if(ptArr[k] == maxXRange){
                      canvas += SVGObj.createCircle(partDistance*11, 25, 7);
                  }else{
                      canvas += SVGObj.createCircle(partDistance*(number1+1), 25, 7);
                  }
                  
              }        

         
              canvas += '<polygon points="'+rightArrPos+' 32.79,'+(rightArrPos+10.9)+' 27.71,'+(rightArrPos+22.67)+' 24.80,'+(rightArrPos+10.9)+' 22.88,'+rightArrPos+' 16.80,'+(rightArrPos+3.84)+' 24.80,'+rightArrPos+' 32.79"/>';
              var sNumberLine =  '<svg width="'+dim+'" height="80">'+canvas+'</svg>';
        return new PearsonGL.Parameters.Parameter(sNumberLine,"single","string");
             

       }

      function getStrLength(str) {
           return new PearsonGL.Parameters.Parameter(String(str).length,"single","integer"); 
       }

      function numberWithCommas(x) {
          x = x.toString();
          x= String(x);
          var pattern = /(-?\d+)(\d{3})/;
          while (pattern.test(x))
              x = String(x).replace(pattern, "$1,$2");
          return new PearsonGL.Parameters.Parameter(x,"single","string");
       }

      function addzeroafter(var1, number) {
          var sNum = String(var1)
          var text = '';
          var i;
         for (i = 0; i < number; i++) {
            if(sNum[i])
               text += sNum[i];
         else
             text += '0';
         }

        return new PearsonGL.Parameters.Parameter(text ,"single","string");
       }

      function addTrailFixZero(num,place) {
        num = num.value;
        place = place.value;  
        var n;
        n = num.toFixed(place);     
        return new PearsonGL.Parameters.Parameter(n,"single","string");

       }

      function StrToFloat(exp) {
        var floatValue = Number(exp.value);
        return new PearsonGL.Parameters.Parameter(floatValue,"single","float"); 
       }

      function strToFloat(str) {
        var floatval = parseFloat(str.value);
        return new PearsonGL.Parameters.Parameter(floatval ,"single","float");

       }

      function isInteger(exp) {
        var num = Number(exp.value);
        if (num === parseInt(num, 10))
          return new PearsonGL.Parameters.Parameter(true,"single","boolean"); 
        else
          return new PearsonGL.Parameters.Parameter(false,"single","boolean"); 
       }

      function arrToStrRand(myArray, length) {
        myArray = myArray.value;
        var hcount = 0;
        var tcount = 0;
        var retArr = [];
        var str =  '';
        var i;

        for(i = 0; i < length; i++){
          var rand = myArray[Math.floor(Math.random() * myArray.length)];
          if(str  !== '')
            str += ", "+rand;
          else
            str += rand;
            if ( rand == 'H') {
              hcount++;
            } else {
              tcount++;
            }
        }
        retArr[0] = str;
        retArr[1] = hcount;
        retArr[2] = tcount;
        return new PearsonGL.Parameters.Parameter(retArr,"ordered","string");
       }

      function arrayShuffle(arr) {
        arr = arr.value;
        var currentIndex = arr.length,
          temporaryValue,
          randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          // And swap it with the current element.
          temporaryValue = arr[currentIndex];
          arr[currentIndex] = arr[randomIndex];
          arr[randomIndex] = temporaryValue;
        }
        return new PearsonGL.Parameters.Parameter(arr,"ordered","integer");
       }

      function arrayToStr(arr) {
        var str;
        arr = arr.value;
        str = arr.join(", ");
        return new PearsonGL.Parameters.Parameter(str,"single","string");
       }

      function strletterRand(n, k) {
        var retArr = [];
          var letter = "";
        var letterstr = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var newletter = "";
        var shuffled = "";
        var flength = n/2;
        var i;
        if (flength === parseInt(flength, 10))
          flength = parseInt(flength);
        else
          flength = parseInt(flength)+1;
        letter = possible.charAt(Math.floor(Math.random() * possible.length));
          for(i = 0; i < k; i++ )
          letterstr += letter;
          for(i = 0; i < n-k; i++ ){
          newletter = possible.charAt(Math.floor(Math.random() * possible.length));
          if(newletter != letter)
            letterstr += newletter;
          else
            i--;
        }
        var a = letterstr.split("");
        n = a.length;
          for(i = n - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var tmp = a[i];
              a[i] = a[j];
              a[j] = tmp;
          }
        shuffled = a.join("");
        shuffled = shuffled.split('').sort(function(){return 0.5-Math.random()}).join('');
          var Listtop = shuffled.slice(0, flength);
          var Listbottom = shuffled.slice(flength, shuffled.length);
        retArr[0] = letter;
        retArr[1] = shuffled;
        retArr[2] = Listtop;
        retArr[3] = Listbottom;
        
        var pos = shuffled.lastIndexOf(letter);
        var List2 = shuffled.substring(0,pos) + shuffled.substring(pos+1);
        pos = List2.lastIndexOf(letter);
        var List3 = List2.substring(0,pos) + List2.substring(pos+1);
        retArr[4] = List2;
        retArr[5] = List3;
        return new PearsonGL.Parameters.Parameter(retArr,"ordered","string");
         // return letterstr+"<br>"+shuffled+"<br>"+Listtop+"<br>"+Listbottom;
       }

    // Assign functions to exports

        exports.textOnSVG_V1= textOnSVG_V1;
        exports.getUniqueRandom= getUniqueRandom;
        exports.FractionReduce= FractionReduce;
        exports.decimalToFraction= decimalToFraction;
        exports.splitNumaratorDeno= splitNumaratorDeno;
        exports.parseStrToInt= parseStrToInt;
        exports.arrayFilter= arrayFilter;
        exports.sqrt= sqrt;
        exports.parseStrToInt= parseStrToInt;
        exports.getUniqueRandomFloat= getUniqueRandomFloat;
        exports.getPlaceValue= getPlaceValue;
        exports.isSquare= isSquare;
        exports.createNumberLine_A0495260= createNumberLine_A0495260;
        exports.StrToFloat= StrToFloat;
        exports.getStrLength = getStrLength;
        exports.numberWithCommas = numberWithCommas;
        exports.addzeroafter = addzeroafter;
        exports.addTrailFixZero = addTrailFixZero;
        exports.strToFloat= strToFloat;
        exports.isInteger= isInteger;
        exports.arrToStrRand= arrToStrRand;
        exports.arrayShuffle= arrayShuffle;
        exports.arrayToStr= arrayToStr;
        exports.strletterRand= strletterRand;
   })();
// End Pre-DCJS Stuff

// Export stuff
       console.log("Root CJS loaded");
       return exports;
})();
