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

// Pre-DCJS Stuff
 {
    // Define functions

      function getUniqueRandom(arr,num)
       {
        var arr = arr.value;
        
        if(String(arr).indexOf('|') != -1)
        {
          var aTemp = String(arr).split('|')
          var num0 = Number(aTemp[0])
          var num1 = Number(aTemp[1])
          var aTemp2 = new Array();
          for(var i=num0;i<=num1;i++)
          {
            aTemp2.push(i)
          }
          arr = aTemp2;
        }

        if(String(arr).indexOf('::') != -1)
        {
          var aTemp = String(arr).split('::')
          var num0 = Number(aTemp[0])
          var num1 = Number(aTemp[1])
          var aTemp2 = new Array();
          for(var i=num0;i<=num1;i++)
          {
            aTemp2.push(i)
          }
          arr = aTemp2;
        }

        for (var i = arr.length-1; i >=0; i--) {
           
              var randomIndex = Math.floor(Math.random()*(i+1)); 
              var itemAtIndex = arr[randomIndex]; 
               
              arr[randomIndex] = arr[i]; 
              arr[i] = itemAtIndex;
          }
        
        var tempArr = arr;
        var aSet = new Array();
        for(var i=0;i<num;i++)
        {
          aSet.push(tempArr[i])
        }
        if(typeof arr[0] == 'number')
        {
          return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");
        }
        if(typeof arr[0] == 'string')
        {
          return new PearsonGL.Parameters.Parameter(aSet,"ordered","string");
        }
       }

      function textOnSVG_V1(width,height,xPos,yPos,text,style,canvasBgStyle)
       {
          
          var width = width.value;
          var height = height.value;
          var xPos = xPos.value;
          var yPos = yPos.value;
          var text = text.value;
          var style = style.value;
          var canvasBgStyle = canvasBgStyle.value;
          var canvas = '';
          
          var SVGObj = 
          {  
              createLabel : function(x,y,text,style)
              {   
                  return '<text class="svg-text-on-table" x="' + x + '" y="' + y + '" style="'+style+'">'+text+'</text>';
              }
          }
       

          canvas += SVGObj.createLabel(xPos,yPos,text,style);

          var textSVG =  '<svg style="'+canvasBgStyle+'" width="'+width+'" height="'+height+'">'+canvas+'</svg>';
        return new PearsonGL.Parameters.Parameter(textSVG,"single","string");



       }

      function FractionReduce(n,d)
       {

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

      function decimalToFraction(decimal)
       {
        var answer = "";
        var decimalArray = String(decimal).split("."); // 1.75
        var leftDecimalPart = decimalArray[0]; // 1
        var rightDecimalPart = decimalArray[1]; // 75

        var numerator = leftDecimalPart + rightDecimalPart; // 175
        var denominator = Math.pow(10, rightDecimalPart.length); // 100

        answer = numerator + "/" + denominator;
        return new PearsonGL.Parameters.Parameter(answer ,"single","string");
       }

      function splitNumaratorDeno(number) 
       {
          var str = number;
          var result = str.toString().split("/");
          return new PearsonGL.Parameters.Parameter(result,"ordered","string");
       }

      function parseStrToInt(exp)
       {
        return new PearsonGL.Parameters.Parameter(parseInt(exp),"single","integer"); 
       }

      function arrayFilter(array1,array2)
       {
        var array1 = array1.value;
        var array2 = array2.value;
          var aSet = array1.filter(function(obj) {
              return array2.indexOf(obj) == -1;
          });
        return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");
        
       }

      function getUniqueRandomFloat(arr,num,increament,round)
       {
        var arr = arr.value;
        var num = num.value;
        var increament = increament.value;
        var round = round.value;
        
        if(String(arr).indexOf('::') != -1)
        {
          var aTemp = String(arr).split('::')
          var num0 = Number(aTemp[0])
          var num1 = Number(aTemp[1])
          var aTemp2 = new Array();
          for(var i=num0;i<=num1;i=i+increament)
          {
            aTemp2.push(i);
          }
          arr = aTemp2;
        }

        for (var i = arr.length-1; i >=0; i--) {
           
              var randomIndex = Math.floor(Math.random()*(i+1)); 
              var itemAtIndex = arr[randomIndex]; 
               
              arr[randomIndex] = arr[i]; 
              arr[i] = itemAtIndex;
          }
        
         var tempArr = arr;
        var aSet = new Array();
        for(var i=0;i<num;i++)
        {
          aSet.push(Number(tempArr[i].toFixed(round)))
        }
        if(typeof arr[0] == 'number')
        {
            return new PearsonGL.Parameters.Parameter(aSet,"ordered","float");
        }
       
       }

      function getPlaceValue(num,placevalue)
       {

       
        var numLength = String(num).length;  
        var placeValueNumber = parseInt(String(num).charAt(numLength-placevalue));

        return new PearsonGL.Parameters.Parameter(placeValueNumber,"single","integer");
       }

      function sqrt(number)
       {
        var sqrt = Math.sqrt(number.value);
        return new PearsonGL.Parameters.Parameter(sqrt,"single","float");
        
       }

      function parseStrToInt(exp)
       {
        return new PearsonGL.Parameters.Parameter(parseInt(exp.value),"single","integer"); 
       }

      function isSquare(n)
       {

        var isTrue = n.value > 0 && Math.sqrt(n.value) % 1 === 0;
        return new PearsonGL.Parameters.Parameter(isTrue,"single","boolean"); 

       }

      function createNumberLine_A0495260(dim,minXRange,maxXRange,ptArr,interval)
       { 

              var dim = dim.value;
              var minXRange = minXRange.value;
              var maxXRange = maxXRange.value;
              var ptArr = ptArr.value;
              var interval = interval.value;

              var canvas = '';
              var factor;
              var offset = 0;
              var minValue = minXRange;
              var dimentions = dim-(offset*2);
              var finalGrid;
              var SVGNS = 'http://www.w3.org/2000/svg'
              var container;
              var aPoints = ptArr;
              var rightArrPos = dim - 18.67;
              var SVGObj = 
              {
                  
                  createLine : function (x1, y1, x2, y2, color, w) 
                  {
                      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + w + '"/>';
                  },
                  createCircle : function(x,y,r)
                  {
                      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#0092C8"/>';
                  },
                  createLabel : function(x,y,text,fontStyle)
                  {   
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

              

              for(var i=0;i<noOfParts+1;i++)
              {
                      
                      canvas += SVGObj.createLine(xPos, 15, xPos, 35, 'rgb(0,0,0)', 1);
                      if(i==0){
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
                  var multiplier = (ptArr[k]-minValue);
                  var nummber1 = Number(String(ptArr[k].toFixed(2)).substring(2, 4))*.1;
                  console.log("nummber1:: ",nummber1, typeof nummber1)
                  if(ptArr[k] == maxXRange){
                      canvas += SVGObj.createCircle(partDistance*11, 25, 7);
                  }else{
                      canvas += SVGObj.createCircle(partDistance*(nummber1+1), 25, 7);
                  }
                  
              }        

         
              canvas += '<polygon points="'+rightArrPos+' 32.79,'+(rightArrPos+10.9)+' 27.71,'+(rightArrPos+22.67)+' 24.80,'+(rightArrPos+10.9)+' 22.88,'+rightArrPos+' 16.80,'+(rightArrPos+3.84)+' 24.80,'+rightArrPos+' 32.79"/>';
              var sNumberLine =  '<svg width="'+dim+'" height="80">'+canvas+'</svg>';
        return new PearsonGL.Parameters.Parameter(sNumberLine,"single","string");
             

       }

      function FractionReduce(n,d)
       {

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

      function getStrLength(str)
       {
           return new PearsonGL.Parameters.Parameter(String(str).length,"single","integer"); 
       }

      function numberWithCommas(x)
       {
          var x = x.toString();
          x= String(x);
          var pattern = /(-?\d+)(\d{3})/;
          while (pattern.test(x))
              x = String(x).replace(pattern, "$1,$2");
          return new PearsonGL.Parameters.Parameter(x,"single","string");
       }

      function addzeroafter(var1, number)
       {
          var sNum = String(var1)
          var text = '';
         for (i = 0; i < number; i++) {
            if(sNum[i])
               text += sNum[i];
         else
             text += '0';
         }

        return new PearsonGL.Parameters.Parameter(text ,"single","string");
       }

      function addTrailFixZero(num,place)
       {
        var num = num.value;
        var place = place.value;  
        var n;
        n = num.toFixed(place);     
        return new PearsonGL.Parameters.Parameter(n,"single","string");

       }

      function StrToFloat(exp)
       {
        var floatValue = Number(exp.value);
        return new PearsonGL.Parameters.Parameter(floatValue,"single","float"); 
       }

      function strToFloat(str)
       {
        var floatval = parseFloat(str.value);
        return new PearsonGL.Parameters.Parameter(floatval ,"single","float");

       }

      function isInteger(exp)
       {
        var num = Number(exp.value);
        if (num === parseInt(num, 10))
          return new PearsonGL.Parameters.Parameter(true,"single","boolean"); 
        else
          return new PearsonGL.Parameters.Parameter(false,"single","boolean"); 
       }

      function arrToStrRand(myArray, length)
       {
        var myArray = myArray.value;
        var hcount = 0;
        var tcount = 0;
        var retArr = [];
        var str =  '';
        for(i = 0; i < length; i++){
          var rand = myArray[Math.floor(Math.random() * myArray.length)];
          if(str  != '')
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

      function arrayShuffle(arr)
       {
        var arr = arr.value;
        var currentIndex = arr.length, temporaryValue, randomIndex, str;
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

      function arrayToStr(arr)
       {
        var str;
        var arr = arr.value;
        str = arr.join(", ");
        return new PearsonGL.Parameters.Parameter(str,"single","string");
       }

      function strletterRand(n, k)
       {
        var retArr = [];
          var letter = "";
        var letterstr = "";
        var randomstr = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var newletter = "";
        var shuffled = "";
        var flength = n/2;
        if (flength === parseInt(flength, 10))
          var flength = parseInt(flength);
        else
          var flength = parseInt(flength)+1;
        letter = possible.charAt(Math.floor(Math.random() * possible.length));
          for( var i = 0; i < k; i++ )
          letterstr += letter;
          for( var i = 0; i < n-k; i++ ){
          newletter = possible.charAt(Math.floor(Math.random() * possible.length));
          if(newletter != letter)
            letterstr += newletter;
          else
            i--;
        }
        var a = letterstr.split("");
        var n = a.length;
          for(var i = n - 1; i > 0; i--) {
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
        exports.FractionReduce= FractionReduce;
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
 }
// End Pre-DCJS Stuff

// Export stuff
       console.log("Root CJS loaded");
       return exports;
})();
