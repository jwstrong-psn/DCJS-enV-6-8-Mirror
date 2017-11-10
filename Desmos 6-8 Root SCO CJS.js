window.PearsonGL = window.PearsonGL || {};
window.PearsonGL.External = window.PearsonGL.External || {};

/******************************************************************************
* Module: rootJS
******************************************************************************/
PearsonGL.External.rootJS = (function() {
  "use strict";
  var debugLog = console.log; // change to function(){return false;}

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

// DCJS Stuff
  /* ←—PRIVATE VARIABLES———————————————————————————————————————————————————→ *\
       | Variable cache; access with vs[uniqueId].myVariable
       | Also helpers, for convenience. hxs
       * ←—————————————————————————————————————————————————————————————————→ */
    var vs = {};
    var hxs = {};
    var cs = {
      color:{
        mgmColors:{ // Colors for MGM
          blue: '#0092C8',
          red: '#F15A22',
          green: '#0DB14B',
          purple: '#812990',
          black: '#000000',
          grey: '#58595B'
        }
      },
      precision:{
        COORDINATES:2,
        DEGREES:0,
        EVAL:1,
        FLOAT:6
      },
      lineType:{
        SOLID:((Desmos && Desmos.Styles)?Desmos.Styles.SOLID:'normal'),
        DASHED:((Desmos && Desmos.Styles)?Desmos.Styles.DASHED:'dashed')
      },
      tolerance:{
        RESCALE:0.3 // Granularity of zoom levels, in powers of 2
      }
    };
  /* ←—PRIVATE HELPER FUNCTIONS————————————————————————————————————————————→ *\
       | Subroutines; access with hs.functionName(args)
       * ←—————————————————————————————————————————————————————————————————→ */
    var hs;
    hs = {
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
      flattenFuncStruct: function flattenFuncStruct(funcStruct,prefix) {
        if(prefix === undefined) {
          prefix = '';
        }
        var functions={};
        Object.keys(funcStruct).forEach(function(key){
          var item = funcStruct[key];
          if (typeof item === 'object') {
            Object.assign(functions,flattenFuncStruct(item,prefix+key+'_'));
          } else if (typeof item === 'function') {
            functions[prefix+key] = item;
          } else {
            debugLog(prefix+key+' is not a function or object');
          }
        });
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

        window['widget_' + options.uniqueId] = options.desmos;

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
       | @args: an argument list from a function call, either:                |
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
      parseArgs: function(args) {
        if (typeof args.length !== 'number' || args.length < 1) {
          throw new Error('DCJS parseArgs requires a non-empty array-like argument.');
        }

        var arg = args[0];

        var output = {
          log: debugLog // Kill this when not debugging
        };

        if (typeof arg === 'object') {
          Object.assign(output,arg);
         } else if (typeof arg === 'number') {
          // Expect (value, name, desmos)
          output.value = arg;
          output.name = args[1];
          output.desmos = args[2] || window.calculator || window.Calc;
          output.uniqueId = output.desmos.guid;
         } else {
          throw new Error('DCJS parseArgs received non-standard arguments.');
         }

        var desmos = output.desmos;

        var uid = output.uniqueId;

        vs[uid] = vs[uid] || {};
        hxs[uid] = hxs[uid] || {};

        if(hxs[uid].maker === undefined) {
          hxs[uid].maker = function(){
            return desmos.HelperExpression.apply(desmos,arguments);
          };
        }

        if (output.log === console.log) {
          window.widget = desmos;
          window.reportDesmosError = window.reportDesmosError || function() {
            hs.reportDCJSerror(output);
          };
        }

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
        var o = hs.parseArgs(options);
        var helpers = hxs[o.uniqueId];
        var helper = helpers[expression] || helpers.maker({latex:expression});

        if (typeof helper.numericValue === 'number' && !(Number.isNaN(helper.numericValue))) {
          callback(helper.numericValue);
        } else if (Array.isArray(helper.listValue)) {
          callback(helper.listValue);
        } else {
          var thiscall = Date.now();
          var observeCallback = function(type,thishelper) {
            if(Number.isNaN(thishelper[type]) || thishelper[type] === undefined) {
              return;
            }

            thishelper.unobserve('numericValue.'+thiscall);
            thishelper.unobserve('listValue.'+thiscall);

            callback(thishelper[type]);
          };
          helper.observe('numericValue.'+thiscall,observeCallback);
          helper.observe('listValue.'+thiscall,observeCallback);
        }
       },
      /* ←— getPrimes(min,max) (memoized) —————————————————————————————————→ *\
       ↑ Returns a list of prime numbers between min and max, inclusive       ↑
       |                                                                      |
       |                                                                      |
       | @arg0: Lower bound on prime numbers—defaults to 2                    |
       | @arg1: Upper bound on prime numbers—defaults to the maximum found    |
       |                                                                      |
       |                                                                      |
       | @Returns: array of values, in order                                  ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      getPrimes: (function(){
        //  Composites is an object so as to allow indexing by number,
        //  and is not an array, because length would be misleading
        var composites = {};
        Object.assign(composites,{
          toArray: function() {
            return Object.keys(composites).filter(function(key) {
              return composites[key] === true;
            });
          },
          toString: function() {
            return composites.toArray().toString();
          },
          length: function() {
            // Subtract 3 for these 3 functions
            return Object.keys(composites).length-3;
          }
        });
        var primes = [2];
        var lastChecked = 2;
        var lastMax = 2;
        var hardMax = 3; // product of all known primes plus 1. Credit Euclid.

        function sieve(min,max) {
          var i;
          var prime;
          var composite;
          debugLog('Sieving from '+min+' to '+max+' with primes '+primes+' over composites '+composites);
          for(i = 0; i < primes.length; i += 1) {

            prime = primes[i];
            
            for(composite = (1+Math.floor(min/prime))*prime; composite <= max; composite += prime) {
              composites[composite] = true;
            }
          }
        }

        function advance() {
          var j;
          var max;
          while (lastChecked <= hardMax) {
            // keep checking the sieve until you find one
            while(lastChecked < lastMax) {
              lastChecked += 1;
              if (!(composites[lastChecked])) {
                
                primes.push(lastChecked);

                hardMax = (hardMax - 1) * lastChecked + 1;

                // Add this new prime to the sieve.
                for (j = lastChecked*2; j <= lastMax; j += lastChecked) {
                  composites[j] = true;
                }

                return(lastChecked);
              }
            }
            // increase max by another reasonable interval, e.g. the largest known prime
            max = lastMax + primes[primes.length-1];
            sieve(lastMax,max);
            lastMax = max;
          }

          throw new Error("For some reason can't find the next prime number after "+primes[primes.length-1]+", despite looking all the way up to "+max+" = 2×3×5×…×"+primes[primes.length-1]);
        }

        return function(min,max) {
          min = min || 2;
          max = max || lastChecked;
          while(lastChecked < max) {
            advance();
          }
          return primes.filter(function(p){return (p <= max && p >= min);});
        };
       }()),
      /* ←— powerSet ——————————————————————————————————————————————————————→ *\
       ↑ Returns a list of all products, given a catalog of factors and       ↑
       |  multiplicities.                                                     |
       |                                                                      |
       | @arg0: catalog of the form {f1:m1,f2:m2,...}                         |
       |                                                                      |
       | @Returns: array of products, in no particular order                  ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      powerSet: function powerSet(factorization) {
        factorization = Object.assign({},factorization);
        var factorList = Object.keys(factorization);

        var factor;
        var mult; //-iplicity

        // Clear factors with multiplicity 0
        while (!mult) {
          // If there are no remaining factors, then 1 is the loneliest
          if(factorList.length === 0) {
            debugLog('No more factors');
            return [1];
          }
          factor = Number(factorList.shift());
          mult = factorization[factor];
          delete factorization[factor];
          debugLog('Choosing factor '+factor+':'+mult);
        }

        // Start with the products of everything else
        var products = powerSet(factorization);

        // Multiply this factor by each product
        products.forEach(function(product){
          var multiplier = factor;
          var i;
          for(i = 1; i <= mult; i += 1) {
            products.push(product*multiplier);
            multiplier *= factor;
          }
        });
        debugLog(products);
        return products;
       },
      /* ←— factorize(n) (memoized) ———————————————————————————————————————→ *\
       ↑ Converts a number into a catalog of prime factors and their          |
       |  multiplicities.                                                     |
       |                                                                      |
       | @arg0: number ≥ 1                                                    |
       |                                                                      |
       | @Returns: catalog of the form {f1:m1,f2:m2,...}                      ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      factorize: (function(){
        var catalog = {};
       return function(n) {
        if (n < 1) {
          throw new Error('Cannot factor numbers less than 1');
        } else if (n % 1) {
          throw new Error('Cannot factor non-integer values');
        }

        if (catalog[n]) {
         return Object.assign({},catalog[n]);
        }

        var factorList = hs.getPrimes(2,n);
        var factorization = {};
        var k;
        var multiplicity;
        factorList.forEach(function(prime){
          k = n;
          multiplicity = 0;
          while (k > 1 && k % prime === 0) {
            multiplicity += 1;
            k /= prime;
          }
          if(multiplicity > 0) {
            factorization[prime] = multiplicity;
          }
        });

        catalog[n] = factorization;

        return Object.assign({},factorization);
        };
       }()),
      /* ←— divisors(n) (memoized) ————————————————————————————————————————→ *\
       ↑ Converts a number into a catalog of prime factors and their          |
       |  multiplicities.                                                     |
       |                                                                      |
       | @arg0: number n ≥ 1                                                    |
       |                                                                      |
       | @Returns: array of divisors, sorted from 1 to n                      ↓
       * ←—————————————————————————————————————————————————————————————————→ */
      divisors: (function() {
        var catalog = {};

       return function(n) {

        if(!catalog[n]) {
          catalog[n] = hs.powerSet(hs.factorize(n)).sort(function(a,b){return a>b});
        }

        return catalog[n].slice();
        };
       }())
     };

  /* ←— EXPORTS / PUBLIC FUNCTIONS ————————————————————————————————————————→ *\
       |
       | To declare your function
       | exports.myFunc1 = function() {};
       |
       | OR
       | fs.myCategory2 = {myFunc2: function() {}}
       | fs[myCategory3] = fs[myCategory3] || {};
       | fs.myCategory3.myFunc3 = function() {};
       |
       | The Desmos gadget can be authored to use helper expressions which call custom JavaScript
       | when observed variables are updated. For example, if a Desmos graph were authored to show
       | a parabola "y=a(x-h)^2+k" a helper expression with Observed Variable "h" and JavaScript
       | Function Name "reflectParabola" would cause the below function to run whenever h was
       | updated and would draw another parabola reflected across the x axis.
       |
       | NOTE: (val, name, desmos) will be deprecated in favour of:
       |       options={value,name,desmos,uniqueId}
       |       as a result, hs.parseArgs(arguments) should be used to determine whether the function
       |       has been called with the old API (3 arguments) or the new API (1 argument)
       |
       | fs.reflectParabola = function() {
       |   var o = hs.parseArgs(arguments);
       |   if (o.log) {o.log(name + " was updated to " + val);}
       |   o.desmos.setExpression({
       |     id: "reflected",
       |     latex: "y=-a(x-" + val + ")^2-k",
       |     color:"#00AA00"
       |   });
       | };
       |
       | Note that console logging should only be used for debugging and is not
       | recommended for production.
       * ←—————————————————————————————————————————————————————————————————→ */
    var fs = {
      common:{}
     };

    /* ←— observeZoom ———————————————————————————————————————————————————→ *\
     | Keeps track of the zoom level by monitoring graph state
     | Zoom level is saved to variables "x_{pxScale}" and "y_{pxScale}"
     | Values are Units/Pixel, to optimise for scaling images onto the graph
     |  e.g. size: 1024*x_{pxScale} × 768*y_{pxScale}.
     |
     | EXPRESSIONS MUST BE MANUALLY AUTHORED USING API:
     |  calculator.setExpression({id:'x_pxScale',latex:'x_{pxScale}'});
     |  calculator.setExpression({id:'y_pxScale',latex:'y_{pxScale}'});
     |
     | For testing, use option {log:console.log}, which will log whenever
     |  the scale or aspect ratio changes by a significant amount.
     * ←———————————————————————————————————————————————————————————————————→ */
     fs.common.observeZoom = function(){
      var o = hs.parseArgs(arguments);

      o.log('observeZoom activated on '+o.uniqueId);

      var v = vs[o.uniqueId];

      var desmos = o.desmos;

      function unitsPerPixel() {
        var pixelCoordinates = desmos.graphpaperBounds.pixelCoordinates;
        var mathCoordinates = desmos.graphpaperBounds.mathCoordinates;
        return {
          x: mathCoordinates.width/pixelCoordinates.width,
          y: mathCoordinates.height/pixelCoordinates.height
        };
       }

      // function pixelsPerUnit() {
      //   var pixelCoordinates = desmos.graphpaperBounds.pixelCoordinates;
      //   var mathCoordinates = desmos.graphpaperBounds.mathCoordinates;
      //   return {
      //     x: pixelCoordinates.width/mathCoordinates.width,
      //     y: pixelCoordinates.height/mathCoordinates.height
      //   };
      //  }

      // record for posterity
      v.oldScale = unitsPerPixel();

      // Initialize the expressions
      desmos.setExpression({id:'x_pxScale',latex:'x_{pxScale}=' + v.oldScale.x});
      desmos.setExpression({id:'y_pxScale',latex:'y_{pxScale}=' + v.oldScale.y});

      // Update whenever the bounds change.
      o.desmos.observe('graphpaperBounds.observeZoom', function() {
        var newScale = unitsPerPixel();

        // If debugging, report on zooming when it passes the RESCALE threshold
        if(o.log() !== false) {
          if (Math.abs(Math.log2(newScale.x) - Math.log2(v.oldScale.x)) > cs.tolerance.RESCALE) {
            o.log('x-scale change: ' +
              Number(1/v.oldScale.x).toPrecision(3) + 'px/unit to ' +
              Number(1/newScale.x).toPrecision(3) + 'px/unit'
            );
            v.oldScale.x = newScale.x;
          }
          if (Math.abs(Math.log2(newScale.y) - Math.log2(v.oldScale.y)) > cs.tolerance.RESCALE) {
            o.log('y-scale change: ' +
              Number(1/v.oldScale.y).toPrecision(3) + 'px/unit to ' +
              Number(1/newScale.y).toPrecision(3) + 'px/unit'
            );
            v.oldScale.y = newScale.y;
          }
        }

        desmos.setExpression({id:'x_pxScale',latex:'x_{pxScale}='+newScale.x});
        desmos.setExpression({id:'y_pxScale',latex:'y_{pxScale}='+newScale.y});

      });
     };

    /* ←— usabilityTestNumberLine FUNCTIONS ————————————————————————————————→ */
     fs.usabilityTestNumberLine = {};
      /* ←— init —————————————————————————————————————————————————————————→ *\
       | stuff
       * ←—————————————————————————————————————————————————————————————————→ */
       fs.usabilityTestNumberLine.init = (function(){
        // Helper Functions
          var o = {log:console.log}; //function(){}}; // change log to console.log to debug

          var intervalPreferences = (function(){
            var catalog = {};

            return function(n, min, max, excludeRelativePrimes) {
              if (min === undefined) {
                min = 1;
              }
              if (excludeRelativePrimes === undefined) {
                excludeRelativePrimes = false;
              }
              //  returns array of integers from minIntervals to maxIntervals or n, whichever is lower
              //  
              //  sorted as, from lowest to highest at each level:
              //    1. divisors of n
              //    2. divisors of 2^k*n (unless excluded as a relative prime)
              //    3. divisors of 10n (unless excluded as a relative prime)
              //    4*. divisors of n*(each prime divisor of n, in order)
              //    5*. divisors of n*(each prime divisor of n, in order, squared)
              //    6*. divisors of n^2
              //    7*. all other integers less than n (unless excludeRelativePrimes is set)
              //
              //  the array will have additional properties:
              //    order: array of values of m = k*n considered above, in order they were considered

              max = max || n;

              var orderInclusive = [];
              var orderExclusive = [];
              var m;
              var k;
              var primes;
              var listInclusive = [];
              var coveredInclusive = [];
              var listExclusive = [];
              var coveredExclusive = [];
              var answer;
              var out;
              var i;

              if(!(catalog[n])) {

                catalog[n] = {
                  inclusive:{},
                  exclusive:{}
                };

                // 1. divisors of n
                orderInclusive.push(n);
                orderExclusive.push(n);

                // 2. divisors of 2^k*n
                m = n;
                k = 2;
                while(m % 2 === 0) {
                  m /= 2;
                  k *= 2;
                }
                while(k < n) {
                  orderInclusive.push(k*m);
                  if(n % 2 === 0) {
                    orderExclusive.push(k*m);
                  }
                  k *= 2;
                }

                // 3. divisors of 10n
                orderInclusive.push(10*n);
                if(n % 10 === 0) {
                  orderExclusive.push(10*n);
                }

                // 4. prime divisors of n
                primes = Object.keys(hs.factorize(n));
                primes.forEach(function(e) {
                  orderInclusive.push(e*n);
                  orderExclusive.push(e*n);
                });

                // 5. prime divisors of n, squared
                primes.forEach(function(e) {
                  orderInclusive.push(e*e*n);
                  orderExclusive.push(e*e*n);
                });

                // 6. divisors n^2
                orderInclusive.push(n*n);
                orderExclusive.push(n*n);

                catalog[n].inclusive.order = orderInclusive.filter(function(e,i,a) {
                  return (a.indexOf(e) === i);
                });

                catalog[n].exclusive.order = orderExclusive.filter(function(e,i,a) {
                  return (a.indexOf(e) === i);
                });

                orderInclusive.forEach(function(e) {
                  var divs = hs.divisors(e);
                  divs.forEach(function(e) {
                    if(!(coveredInclusive[e])) {
                      coveredInclusive[e] = true;
                      listInclusive.push(e);
                    }
                  });
                });
                catalog[n].inclusive.list = listInclusive;

                orderExclusive.forEach(function(e) {
                  var divs = hs.divisors(e);
                  divs.forEach(function(e) {
                    if(!(coveredExclusive[e])) {
                      coveredExclusive[e] = true;
                      listExclusive.push(e);
                    }
                  });
                });
                catalog[n].exclusive.list = listExclusive;
              }

              if (excludeRelativePrimes) {
                answer = catalog[n].exclusive;
              } else {
                answer = catalog[n].inclusive;
              }

              out = answer.list.filter(function(e){
                return (min <= e && e <= max);
              });
              out.order = answer.order.slice();

              if(!excludeRelativePrimes) {
                for(i = min; i <= max; i += 1) {
                  if(out.indexOf(i) === -1) {
                    out.push(i);
                  }
                }
              }

              return out;
            };
          }());

          function alignPreferences(list1,list2,distance) {
            if(distance === undefined) {
              distance = function(l1,l2,a,b){
                l1 = l1;
                l2 = l2;
                return a+b;
              };
            }
            var preferences = [];
            var i;
            var j;
            var k;

            // start with taxicab distance, preferring list2 ([1,0] comes before [0,1])
            for(i = 0; i <= list1.length+list2.length; i += 1) {
              j = Math.min(i,list1.length);
              for(k = i - j; j >= 0 && k < list2.length; k += 1) {
                if(list1[j] === list2[k]) {
                  preferences.push({'1':j,'2':k});
                }
                j -= 1;
              }
            }

            preferences.sort(function(a,b){
              var d1 = distance(list1,list2,a[1],a[2]);
              var d2 = distance(list1,list2,b[1],b[2]);
              var p;
              var q;

              // slight preference for the smaller value, if two preferences are equal
              if (d1 === d2) {
                p = list1[a[1]];
                q = list1[b[1]];

                if(typeof p === "number" && !(Number.isNaN(p)) &&
                  typeof q === "number" && !(Number.isNaN(q))) {
                  return (p - q);
                }
              }

              return (d1 - d2);
            });

            var coords;

            for (i = 0; i < preferences.length; i += 1) {
              coords = preferences[i];
              if (list1[coords[1]] !== list2[coords[2]]) {
                o.log("NOOOOOOO");
              }
              preferences[i] = list1[coords[1]];
            }

            return preferences;
          }

          // function divideWholeForPart(whole,part,wholePreferences) {

            //   if(wholePreferences === undefined) wholePreferences = intervalPreferences(whole);

            //   var preferences = Array.from(wholePreferences);

            //   var evenDivisors = [];
            //   var catalog = {};
            //   var i;
            //   var j;
            //   var newPref;

            //   for(i = 0; i < wholePreferences.length; i += 1) {
            //     catalog[i] = true;
            //     if(whole%wholePreferences[i] === 0) evenDivisors.push(wholePreferences[i]);
            //   }
            //   for(i = 0; i < evenDivisors.length; i += 1) {
            //     for(j = i; j < evenDivisors.length; j += 1) {
            //       newPref = evenDivisors[i]*evenDivisors[j];
            //       if(!(catalog[newPref])) {
            //         catalog[newPref] = true;
            //         preferences.push(newPref);
            //       }
            //     }
            //   }

            //   var scaledParts = preferences.map(function(i){return part*i;});

            //   var simpleErrors = scaledParts.map(function(p){return p%whole;}).map(function(E){return Math.min(E,whole-E);});

            //   var intervalRelativeError = simpleErrors.map(function(r){return r/whole;});

            //   var wholeRelativeError = [];
            //   for(i = 0; i < intervalRelativeError.length; i += 1) {
            //     wholeRelativeError[i] = intervalRelativeError[i]/preferences[i];
            //   }

            //   var indices = [];
            //   for(i = 0; i < preferences.length; i += 1) {
            //     indices.push(i);
            //   }

            //   indices.sort((a,b)=>{
            //     var preferA;
            //     if(simpleErrors[a]===0 && simpleErrors[b] === 0) {
            //       o.log('both '+preferences[a]+' and '+preferences[b]+' divide');
            //       return (a - b);
            //     } else if (simpleErrors[a] === 0) {
            //       o.log(preferences[a]+' divides');
            //       return -1;
            //     } else if (simpleErrors[b] === 0) {
            //       o.log(preferences[b]+' divides');
            //       return 1;
            //     } else if (intervalRelativeError[a] <= 0.1 && intervalRelativeError[b] <= 0.1) {
            //       o.log('close contenders '+preferences[a]+','+preferences[b]);
            //       return (a - b);
            //     } else if ((a < wholePreferences.length) == (b < wholePreferences.length)) {
            //       preferA = (wholeRelativeError[a] - wholeRelativeError[b]);
            //       if(preferA < 0) o.log(preferences[a]+' is better than '+preferences[b]);
            //       else o.log(preferences[b]+' is better than '+preferences[a]);
            //       return preferA;
            //     } else if (a < wholePreferences.length) {
            //       o.log(preferences[b]+' was fabricated; '+preferences[a]+' was not.')
            //       return -1;
            //     } else if (b < wholePreferences.length) {
            //       o.log(preferences[a]+' was fabricated; '+preferences[b]+' was not.')
            //       return 1;
            //     }
            //     o.log('something\'s wrong');
            //     return 0;
            //   });

            //   preferences = indices.map(function(i){return preferences[i];});

            //   return preferences;
            // }

          function chooseIntervals(W,p,min,maxMajor,maxMinor) {
            p = p;
            if(min === undefined) {
              min = 1;
            }
            if(maxMajor === undefined) {
              maxMajor = 20;
            }
            if(maxMinor === undefined) {
              maxMinor = 100;
            }

            var majorIntervalsW = 1;
            var minorIntervalsW;
            var majorIntervals100 = 2;
            var minorIntervals100;

            // Prefer divisors of both.
            var preferencesW = intervalPreferences(W,1,maxMinor,true);
            var preferences100 = intervalPreferences(100,2,maxMinor,true);
            var preferences = alignPreferences(preferencesW,preferences100,
              function(w,c,iw,ic) {
                w = w;
                c = c;
                return iw*10+ic*Math.sqrt(W);
              }
            );

            o.log('W',preferencesW,'100',preferences100,'joint',preferences);

            var i;
            var interval;
            if(preferences.length > 0) {
              for(i = 0; i < preferences.length; i += 1) {
                interval = preferences[i];
                if((i === 0 ||
                  interval > majorIntervalsW) &&
                  interval <= maxMajor &&
                  interval % 2 === 0 && // Always show 50%
                  100 % interval === 0 &&
                  W % interval === 0) {
                  majorIntervalsW = interval;
                  majorIntervals100 = interval;
                }
              }
            }

            // Subdivide based on chosen Major Interval (if any)
            minorIntervalsW = 1;
            for(i = 0; i < preferencesW.length; i += 1) {
              interval = preferencesW[i];
              if(interval > minorIntervalsW &&
                interval % majorIntervalsW === 0 &&
                W % interval === 0) {
                minorIntervalsW = interval;
              }
            }

            minorIntervals100 = 2;
            for(i = 0; i < preferences100.length; i += 1) {
              interval = preferences100[i];
              if(interval > minorIntervals100 &&
                interval % majorIntervals100 === 0 &&
                100 % interval === 0) {
                minorIntervals100 = interval;
              }
            }

            // Increase Major Interval resolution, aligning with subdivisions
            var betterMajor = majorIntervalsW;
            for(i = 0; i < preferencesW.length; i += 1) {
              interval = preferencesW[i];
              if(interval > betterMajor &&
                interval <= maxMajor &&
                interval % majorIntervalsW === 0 &&
                minorIntervalsW % interval === 0 &&
                W % interval === 0) {
                betterMajor = interval;
              }
            }
            majorIntervalsW = betterMajor;

            betterMajor = majorIntervals100;
            for(i = 0; i < preferences100.length; i += 1) {
              interval = preferences100[i];
              if(interval > betterMajor &&
                interval <= maxMajor &&
                interval % majorIntervals100 === 0 &&
                minorIntervals100 % interval === 0 &&
                100 % interval === 0) {
                betterMajor = interval;
              }
            }
            majorIntervals100 = betterMajor;

            o.log('W Major:',majorIntervalsW,'100 Major:',majorIntervals100);


            var out = {
              majorIntervalsW: majorIntervalsW,
              minorIntervalsW: minorIntervalsW,
              majorIntervals100: majorIntervals100,
              minorIntervals100: minorIntervals100
            };

            return out;
          }

          var mostMajorIntervals = 29;

        return function(){
          var obj = hs.parseArgs(arguments);
          var hlps = hxs[obj.uniqueId];
          Object.assign(hlps,{
            W:hlps.maker({latex:'W'}),
            p:hlps.maker({latex:'p'}),
            scalex:hlps.maker({latex:'t_{ickx}'})
          });

          function updateBar() {
            var p = hlps.p.numericValue;
            var W = hlps.W.numericValue;

            obj.desmos.setExpressions([
              {
                id:'p_labelP',
                label:''+(Math.round(100*p)/100)
              },
              {
                id:'p_label100',
                label:''+(Math.round(100*100*p/W)/100)+'%'
              }
            ]);
          }

          function updateIntervals() {
            var W = hlps.W.numericValue;
            if(W <= 0) {
              return;
            }
            var p = hlps.p.numericValue;
            var tick = hlps.scalex.numericValue;
            var spacing = 2*tick/3;
            var width = 100;
            var maxMinorIntervals = Math.max(2,Math.floor(width/spacing));
            var maxMajorIntervals = Math.max(2,Math.floor(width/(4*spacing)));
            var minIntervals = Math.max(2,Math.floor(width/(7*spacing)));

            var choices = chooseIntervals(W,p,minIntervals,maxMajorIntervals,maxMinorIntervals);
            obj.log(choices);
            var pSlider = {
              id:'pSlider',
              sliderBounds:{min:0,max:W}//,step:1} // apparently the step breaks everything
            };
            console.log('pSlider:',pSlider);
            obj.desmos.setExpressions([
              {
                id:'majorIntervalsW',
                latex:'I_w='+choices.majorIntervalsW
              },
              {
                id:'majorIntervals100',
                latex:'I='+choices.majorIntervals100
              },
              {
                id:'minorIntervalsW',
                latex:'I_W='+choices.minorIntervalsW
              },
              {
                id:'minorIntervals100',
                latex:'I_{100}='+choices.minorIntervals100
              },
              {
                id:'p_labelW',
                label:''+(Math.round(100*W)/100)
              }// ,pSlider // apparently this removes the snapping interval
            ]);
            var newMostMajors = Math.max(choices.majorIntervals100,choices.majorIntervalsW);
            var exprs = [];
            var i;
            if(newMostMajors > mostMajorIntervals) {
              for (i = mostMajorIntervals+1; i <= newMostMajors; i += 1) {
                exprs.push(
                  {
                    id:'label100_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I},h_{100}-t_{icky}\\right)',
                    label:''+(Math.round(100*i*100/choices.majorIntervals100)/100)+'%',
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.agaColors.black
                  },
                  {
                    id:'labelP_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-t_{icky}\\right)',
                    label:''+(Math.round(100*i*W/choices.majorIntervalsW)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.agaColors.black
                  },
                  {
                    id:'labelFrac_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-1.4\\cdot t_{icky}\\right)',
                    label:''+(Math.round(100*W)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.agaColors.black
                  },
                  {
                    id:'labelW_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-2\\cdot t_{icky}\\right)',
                    label:''+(Math.round(100*W)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.agaColors.black
                  }
                );
              }
              obj.desmos.setExpressions(exprs);
              mostMajorIntervals = newMostMajors;
            }
            exprs = [];
            for (i = 0; i <= mostMajorIntervals; i += 1) {
              if(i <= choices.majorIntervals100) {
                exprs.push(
                  {
                    id:'label100_'+i,
                    label:''+(Math.round(100*i*100/choices.majorIntervals100)/100),
                    showLabel:true
                  }
                );
              } else {
                exprs.push(
                  {
                    id:'label100_'+i,
                    showLabel:false
                  }
                );
              }

              if(i <= choices.majorIntervalsW) {
                exprs.push(
                  {
                    id:'labelP_'+i,
                    label:''+(Math.round(100*i*W/choices.majorIntervalsW)/100),
                    showLabel:true
                  // },
                  // {
                  //   id:'labelFrac_'+i,
                  //   showLabel:false
                  // },
                  // {
                  //   id:'labelW_'+i,
                  //   label:''+(Math.round(100*W)/100),
                  //   showLabel:false
                  }
                );
              } else {
                exprs.push(
                  {
                    id:'labelP_'+i,
                    showLabel:false
                  // },
                  // {
                  //   id:'labelFrac_'+i,
                  //   showLabel:false
                  // },
                  // {
                  //   id:'labelW_'+i,
                  //   showLabel:false
                  }
                );
              }
            }
            obj.desmos.setExpressions(exprs);
            updateBar();
          }

          hlps.W.observe('numericValue',updateIntervals);
          hlps.scalex.observe('numericValue',updateIntervals);
          hlps.p.observe('numericValue',updateBar);
        };
       }());
   

  // Pre-DCJS Stuff
   ;(function(){
    // Define functions

      function getUniqueRandom(arr,num) {
        arr = arr.value;
        num = num.value; // Added 2017-11-01 to match the rest of this stuff
        var i;
        var aTemp;
        var num0;
        var num1;
        var aTemp2;
        var randomIndex;
        var itemAtIndex;

        if(String(arr).indexOf('|') !== -1) {
          aTemp = String(arr).split('|');
          num0 = Number(aTemp[0]);
          num1 = Number(aTemp[1]);
          aTemp2 = [];
          for(i=num0;i<=num1;i+=1) {
            aTemp2.push(i);
          }
          arr = aTemp2;
        }

        if(String(arr).indexOf('::') !== -1) {
          aTemp = String(arr).split('::');
          num0 = Number(aTemp[0]);
          num1 = Number(aTemp[1]);
          aTemp2 = [];
          for(i=num0;i<=num1;i+=1) {
            aTemp2.push(i);
          }
          arr = aTemp2;
        }

        for (i = arr.length-1; i >=0; i-=1) {

              randomIndex = Math.floor(Math.random()*(i+1));
              itemAtIndex = arr[randomIndex];

              arr[randomIndex] = arr[i];
              arr[i] = itemAtIndex;
          }

        var tempArr = arr;
        var aSet = [];
        for(i=0;i<num;i+=1) {
          aSet.push(tempArr[i]);
        }
        if(typeof arr[0] === 'number') {
          return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");
        }
        if(typeof arr[0] === 'string') {
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
        };


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

      // Duplicated later—assuming exp.value is what we want to keep
      // function parseStrToInt(exp) {
        //   return new PearsonGL.Parameters.Parameter(parseInt(exp),"single","integer");
        //  }

      function arrayFilter(array1,array2) {
        array1 = array1.value;
        array2 = array2.value;
          var aSet = array1.filter(function(obj) {
              return array2.indexOf(obj) === -1;
          });
        return new PearsonGL.Parameters.Parameter(aSet,"ordered","integer");

       }

      function getUniqueRandomFloat(arr,num,increment,round) {
        arr = arr.value;
        num = num.value;
        increment = increment.value;
        round = round.value;
        var i;
        var randomIndex;
        var itemAtIndex;

        if(String(arr).indexOf('::') !== -1) {
          var aTemp = String(arr).split('::');
          var num0 = Number(aTemp[0]);
          var num1 = Number(aTemp[1]);
          var aTemp2 = [];
          for(i=num0;i<=num1;i=i+increment) {
            aTemp2.push(i);
          }
          arr = aTemp2;
        }

        for (i = arr.length-1; i >=0; i-=1) {

              randomIndex = Math.floor(Math.random()*(i+1));
              itemAtIndex = arr[randomIndex];

              arr[randomIndex] = arr[i];
              arr[i] = itemAtIndex;
          }

         var tempArr = arr;
        var aSet = [];
        for(i=0;i<num;i+=1) {
          aSet.push(Number(tempArr[i].toFixed(round)));
        }
        if(typeof arr[0] === 'number') {
            return new PearsonGL.Parameters.Parameter(aSet,"ordered","float");
        }

       }

      function getPlaceValue(num,placevalue) {


        var numLength = String(num).length;
        var placeValueNumber = parseInt(String(num).charAt(numLength-placevalue));

        return new PearsonGL.Parameters.Parameter(placeValueNumber,"single","integer");
       }

      function sqrt(number) {
        var sqart = Math.sqrt(number.value);
        return new PearsonGL.Parameters.Parameter(sqart,"single","float");

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
        // var factor;
        var offset = 0;
        // var minValue = minXRange;
        var dimentions = dim-(offset*2);
        // var finalGrid;
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
        };

        // finalGrid = Math.abs(minXRange)+Math.abs(maxXRange);
        // factor = Math.round(dimentions/finalGrid);
        // for grid
        canvas += '<polygon points="22.667,17 11.77,22.084 0,24.998 11.77,27.912 22.667,32.994 18.831,24.998"/>';
        canvas += SVGObj.createLine(offset, 25, dimentions+(offset), 25, 'rgb(0,0,0)', 2);
        var noOfParts = 10;
        var partDistance = dimentions/(noOfParts+2);

        var xPos = partDistance;
        var posArr = [partDistance];

        var i;

        for(i=0;i<noOfParts+1;i+=1) {

            canvas += SVGObj.createLine(xPos, 15, xPos, 35, 'rgb(0,0,0)', 1);
            if(i===0){
                canvas += SVGObj.createLabel(xPos-7, 55, minXRange ,"normal");
            }else if(i === noOfParts){
                canvas += SVGObj.createLabel(xPos-7, 55, parseInt(minXRange+interval) ,"normal");
            }else{
                canvas += SVGObj.createLabel(xPos-14, 55, minXRange.toFixed(1) ,"normal");
            }
            minXRange = minXRange+interval;
            xPos = xPos+partDistance;
            posArr.push(xPos);

        }

        var k;
        var number1;

        for(k=0;k<ptArr.length;k+=1){
            //var numLength = String(ptArr[k]).length;
           // var placeValueNumber = parseInt(String(ptArr[k]).charAt(numLength-1))+1;
           // var multiplier = (ptArr[k]-minValue); // ! not used, according to jsHint
            number1 = Number(ptArr[k].toFixed(2).substring(2, 4))*0.1;
            debugLog("number1:: ",number1, typeof number1);
            if(ptArr[k] === maxXRange){
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
        while (pattern.test(x)) {
          x = String(x).replace(pattern, "$1,$2");
        }
        return new PearsonGL.Parameters.Parameter(x,"single","string");
       }

      function addzeroafter(var1, number) {
        var sNum = String(var1);
        var text = '';
        var i;
        for (i = 0; i < number; i+=1) {
            if(sNum[i]) {
                text += sNum[i];
            }
            else {
                text += '0';
            }
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
        if (num === parseInt(num, 10)) {
          return new PearsonGL.Parameters.Parameter(true,"single","boolean");
        } else {
          return new PearsonGL.Parameters.Parameter(false,"single","boolean");
        }
       }

      function arrToStrRand(myArray, length) {
        myArray = myArray.value;
        var hcount = 0;
        var tcount = 0;
        var retArr = [];
        var str =  '';
        var i;
        var rand;

        for(i = 0; i < length; i+=1){
          rand = myArray[Math.floor(Math.random() * myArray.length)];
          if(str  !== '') {
            str += ", "+rand;
          } else {
            str += rand;
          }
            // 2017-11-01 don't know if this block is supposed to be part of else
            if ( rand === 'H') {
              hcount+=1;
            } else {
              tcount+=1;
            }
        }
        retArr[0] = str;
        retArr[1] = hcount;
        retArr[2] = tcount;
        return new PearsonGL.Parameters.Parameter(retArr,"ordered","string");
       }

      function arrayShuffle(arr) {
        arr = arr.value;
        var currentIndex = arr.length;
        var temporaryValue;
        var randomIndex;
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
        if (flength === parseInt(flength, 10)) {
          flength = parseInt(flength);
        } else {
          flength = parseInt(flength)+1;
        }
        letter = possible.charAt(Math.floor(Math.random() * possible.length));
        for(i = 0; i < k; i+=1 ) {
          letterstr += letter;
        }
        for(i = 0; i < n-k; i+=1 ){
          newletter = possible.charAt(Math.floor(Math.random() * possible.length));
          if(newletter !== letter) {
            letterstr += newletter;
          } else {
            i-=1;
          }
        }
        var a = letterstr.split("");
        n = a.length;
        var j;
        var tmp;
          for(i = n - 1; i > 0; i-=1) {
              j = Math.floor(Math.random() * (i + 1));
              tmp = a[i];
              a[i] = a[j];
              a[j] = tmp;
          }
        shuffled = a.join("");
        shuffled = shuffled.split('').sort(function(){
          return 0.5-Math.random();
        }).join('');
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
      //
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
   }());
   // End Pre-DCJS Stuff

  // Export stuff
    Object.assign(exports,hs.flattenFuncStruct(fs));
       console.log("Root CJS loaded");
       return exports;
}());
