/******************************************************************************
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NOTICE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! *
* !!!!!!!!!! This file is managed through the DCJS/envision-6-8 !!!!!!!!!!!!! *
* !!!!!!!!!!  repository on BitBucket. Changes made directly in !!!!!!!!!!!!! *
* !!!!!!!!!!  DCAT will be overwritten periodically when new    !!!!!!!!!!!!! *
* !!!!!!!!!!  versions are pushed.                              !!!!!!!!!!!!! *
* !!!!!!!!!! If you need access to the BitBucket repository,    !!!!!!!!!!!!! *
* !!!!!!!!!!  please contact: joseph.strong@pearson.com         !!!!!!!!!!!!! *
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! *
******************************************************************************/


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
      /* ←— mergeObjects —————————————————————————————————————————————————→ *\
       | replaces Object.assign in case of *shudder* IE
       * ←————————————————————————————————————————————————————————————————→ */
       function mergeObjects() {
          if (typeof Object.assign === "function") {
            return Object.assign.apply(Object,arguments);
          }

          var obj = arguments[0];

          [].forEach.call(arguments, function(arg,i) {
            if(i > 0) {
              Object.keys(arg).forEach(function(key) {
                obj[key] = arg[key];
              });
            }
          });

          return obj;
       }
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
            mergeObjects(functions,flattenFuncStruct(item,prefix+key+'_'));
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
          mergeObjects(output,{uniqueId:arg.desmos.guid},arg);
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
          hxs[uid].maker = function(expr){
            return desmos.HelperExpression.call(desmos,{latex:expr});
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
      /* ←— calcEval ——————————————————————————————————————————————————————→ *\
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
      calcEval: function(expression,options,callback) {
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
      /* ←— latexToText ———————————————————————————————————————————————————————→ *\
       ↑ Convert a latex string to a plaintext string, e.g. for labels
       ↓
       * ←—————————————————————————————————————————————————————————————————————→ */
      latexToText: function(expr){
        expr = (''+expr);
        expr = expr.
          replace(/\\cdot\s?/g,'\u22c5').
          replace(/._\{([a-zA-Z])Var\}/g,'$1').
          replace(/([+=÷×\u22c5])/g,' $1 ').
          replace(/,/g,',\u202f').
          replace(/\^2/g,'²').
          replace(/\^3/g,'³').
          replace(/\\sqrt\{([^{}]*?)\}/g,'√($1)').
          replace(/\\theta\s?/g,'θ').
          replace(/\\pi\s?/g,'π').
          replace(/_0/g,'₀').
          replace(/_1/g,'₁').
          replace(/_2/g,'₂').
          replace(/\\(?:right|left)\\*([()\[\]|{}])/g,'$1').
          replace(/\\right/g,'').
          replace(/\\left/g,'').
          replace(/([^\s \u202f(\[{|])\-|(\|[^|]*\|)-(?=\|)/g,'$1$2 − ').
          replace(/\-/g,'−');
        return expr;
       },
      /* ←— number to letter (lowercase) —————————————————————————————————→ *\
       | Convert a number to its lowercase letter with cs.alpha[n]`
       * ←————————————————————————————————————————————————————————————————→ */
      alpha:(function(){
        var alphabet = '_abcdefghijklmnopqrstuvwxyz';
        var func = function(x){
          return alphabet[x];
        };
        mergeObjects(func,alphabet);
        return func;
       }()),
      /* ←— number to letter (uppercase) —————————————————————————————————→ *\
       | Convert a number to its uppercase letter with `cs.ALPHA[n]`
       * ←————————————————————————————————————————————————————————————————→ */
      ALPHA:(function(){
        var alphabet = '_ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var func = function(x){
          return alphabet[x];
        };
        mergeObjects(func,alphabet);
        return func;
       }()),
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
        mergeObjects(composites,{
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
        factorization = mergeObjects({},factorization);
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
        }
        if (n % 1 !== 0) {
          throw new Error('Cannot factor non-integer values');
        }

        if (catalog[n]) {
         return mergeObjects({},catalog[n]);
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

        return mergeObjects({},factorization);
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
          catalog[n] = hs.powerSet(hs.factorize(n)).sort(function(a,b){return a>b;});
        }

        return catalog[n].slice();
        };
       }()),
      /* ←— easeFunc —————————————————————————————————————————————————→ *\
       | Given a current value, current rate, destination, and target
       |  ease time, returns parameters for f(t) = A sin(b * t - h) + k
       |  NOTE: Assumes current time is 0, so f(0) = current value
       |  Also returns t, expected time of ease completion.
       * ←———————————————————————————————————————————————————————————————→ */
      ease: function(now, rate, target, time) {
        var out = {};
        var diff = target - now;

        if (diff === 0) {
          return {
            A: 0,
            b: 1,
            h: 0,
            k: 0,
            t: 0
          };
        }

        out.b = Math.PI / time;
        rate = rate / out.b;

        out.k = (diff * diff - rate * rate) / (2 * diff);
        out.h = Math.atan(out.k / rate);
        var cosh = Math.cos(out.h);
        out.A = (cosh === 0 ? diff / 2 : rate / Math.cos(out.h));
        out.t = time / 2 + out.h / out.b;

        if(out.A < 0) {
          out.t += out.d;
        }

        return out;
       },
      /* ←— easePointList ———————————————————————————————————————————————→ *\
       | Given a list of x-values, a list of y-values, target values,
       |  ease time (0–1), framerate (1/#frames), and timeout
       |  between frames, calls a given callback function at each frame,
       |  with arguments being the same, with the same arguments.
       |  also sends a ninth argument, the timeoutID for the next iteration,
       |  in case you want to cancel it.
       * ←———————————————————————————————————————————————————————————————→ */
      easePointList: function easePointList(currentX,currentY,targetX,targetY,t,dt,timeout,cb) {
        var x = targetX;
        var y = targetY;
        var X = currentX;
        var Y = currentY;
        if(t + dt >= 1) {
          X = Array.from(x);
          Y = Array.from(y);
        } else {
          var ddt = (Math.cos(Math.PI*t) - Math.cos(Math.PI*(t+dt))) / (Math.cos(Math.PI*t) + 1);
          X = X.map(function(e,i) {
            var result = e + (x[i] - e)*ddt;
            if ((result - x[i])*(e - x[i]) <= 0) {
              result = x[i];
            }
            return result;
          });
          Y = Y.map(function(e,i) {
            var result = e + (y[i] - e)*ddt;
            if ((result - y[i])*(e - y[i]) <= 0) {
              result = y[i];
            }
            return result;
          });
        }

        var timeoutID;
        if(t < 1) {
          timeoutID = setTimeout(function(){
            easePointList(X,Y,x,y,t+dt,dt,timeout,cb);
          },timeout);
        }
        cb(X,Y,x,y,t,dt,timeout,cb,timeoutID);
        return timeoutID;
       },
      /* ←— stats2D —————————————————————————————————————————————————————→ *\
       | Generates various statistics for bivariate data
       * ←———————————————————————————————————————————————————————————————→ */
      stats2D: function(x,y){
        var total = function(x) {
          return x.reduce(function(acc,val) {
            return acc + val;
          }, 0);
        };
        var xBar = total(x) / x.length;
        var yBar = total(y) / y.length;
        var dxs = x.map(function(val) {return val - xBar;});
        var dys = y.map(function(val) {return val - yBar;});
        var xVars = dxs.map(function(val) {return val * val;});
        var yVars = dys.map(function(val) {return val * val;});
        var sx = Math.sqrt(total(xVars) / x.length);
        var sy = Math.sqrt(total(yVars) / y.length);
        var covars = x.map(function(val,i) {return val*y[i];});
        var rxy = (total(covars) - x.length * xBar * yBar) / (x.length * sx * sy);
        var B = rxy * sy / sx;
        var A = yBar - B * xBar;
        return {
          a:B,
          b:A,
          r:rxy,
          x_mean:xBar,
          y_mean:yBar,
          x_variance:total(xVars)/x.length,
          y_variance:total(yVars)/y.length
        };
       },
      /* ←— optimalRatio ————————————————————————————————————————————————→ *\
       | Calculates the closest fraction to a given number, given a list of
       |  candidate numerators & denominators. The fraction returned is in
       |  reduced form (down to the smallest given denominator with a corresponding
       |  numerator).
       |    {
       |      numerator: Number,
       |      denominator: Number,
       |      integerPart: Number
       |    }
       | By default, the return value is a mixed number, i.e., only fractions
       |  where the numerator is less than or equal to the denominator.
       |  If `improper` is set to `true`, the choice will include options where
       |  the numerator is greater than the denominator.
       | If no list of numerators & denominators is included, or if falsey
       |  values are passed, uses an arbitrary default.
       |
       | NOTE: if `improper` is set to `true`, the `integerPart` returned will
       |  always be 0, even if a mixed number would be closer to the given value
       |  than an improper fraction with the given numerators & denominators;
       |  i.e., optimalRatio will NOT generate numerators not given in the list.
       |  This means that for very large numbers, the optimalRatio will always
       |  return the maximum given numerator and minimum given denominator.
       * ←———————————————————————————————————————————————————————————————→ */
      optimalRatio: function(x, numerators, denominators, improper) {
        var mixed = !improper;
        numerators = (Array.isArray(numerators) && Array.from(numerators).sort(function(a,b){return (a - b);})) ||
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 15, 17, 19, 49, 99, 97];
        denominators = (Array.isArray(denominators) && Array.from(denominators).sort(function(a,b){return (a - b);})) ||
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20, 50, 100];
        // Find the smallest numerator in the ratio that is closest
        var numerator = Math.min.apply(null,numerators);
        var denominator = Math.max.apply(null,denominators);

        var output = {};

        if(mixed) {
          if(numerator > denominator) {
            throw new Error("optimalRatio requires a numerator less than or equal to a " +
              "denominator unless `improper` is `true`");
          }
          output.integerPart = Math.floor(x);
          x = x % 1;
        } else {
          output.integerPart = 0;
        }

        var error = Math.abs(x - numerator/denominator);

        numerators.forEach(function(n){
          var d = denominator;
          var e = Math.abs(x - n/d);
          denominators.forEach(function(newDenominator){
            if(mixed && n > newDenominator) {
              return;
            }
            var newError = Math.abs(x - n/newDenominator);
            // console.log(n+'/'+newDenominator+': '+(newError<e));
            if(newError < e) {
              d = newDenominator;
              e = newError;
            }
          });

          if(e < error || e === error && (d < denominator && n < numerator)) {
            numerator = n;
            denominator = d;
            error = e;
          }
        });

        output.numerator = numerator;
        output.denominator = denominator;

        return output;
       },
      /* ←— optimalOdds —————————————————————————————————————————————————→ *\
       | Calculates the closest integer pair approximating the odds associated
       |  with a given probability, given a catalog of candidate pairs, where the
       |  keys are the possible values for the first number, and the values are
       |  arrays of possible associated values for the second number. By default,
       |  gives odds symmetrically, i.e. if the pair (key,val) is in the catalog,
       |  the pair (val,key) will also be considered.
       |
       | Returns an object of the form:
       |    {
       |      first: Number,
       |      second: Number,
       |      favor: Boolean (true if p ≈ first/sum, false if p ≈ second/sum)
       |    }
       |
       | If a catalog of candidate pairs is not given, then an arbitrary default
       |  is used.
       * ←———————————————————————————————————————————————————————————————→ */
      optimalOdds: function(p, pairs, asymmetric) {
        pairs = pairs || {
          1:[1,2,3,4,5,6,7,8,9,10,15,20,25,30,40,50,60,70,80,90,100,1000,10000,100000,1000000,Infinity],
          2:[3,5],
          3:[4,5],
          4:[5],
          5:[6],
          "Infinity":[1]
        };

        var keys = Object.keys(pairs).map(function(e){
          return +e;
        });

        var first = keys[0];
        var second = pairs[first][0];
        var favor = true;
        var error = Math.abs(p - first/(first+second));

        // First test for even odds.
        var even;
        if(p === 0.5) {
          even = Math.min.apply(null,keys.filter(function(e){
            return (pairs[e].indexOf(e) > -1);
          }));
          if(even < Infinity || pairs[Infinity].indexOf(Infinity) > -1) {
            return {
              first: even,
              second: even,
              favor: true
            };
          }
        }

        // Then test for impossible/certain
        if(Array.isArray(pairs[Infinity]) && pairs[Infinity].length > 0) {
          if(asymmetric) {
            if(p === 1) {
              return {
                first:Infinity,
                second:Math.min.apply(null,pairs[Infinity]),
                favor:true
              };
            }
          } else if (p === 0 || p === 1) {
            first = Infinity;
            second = Math.min.apply(null,pairs[Infinity]);
            favor = (p === 1);
            error = 0;
          }
        }

        var symmetric = !asymmetric;

        // Now test for all the fuzzy stuff
        keys.forEach(function(newFirst){
          if(newFirst === Infinity) {
            return;
          } else {
            pairs[newFirst].forEach(function(newSecond){
              if(newSecond === Infinity) {
                // Let's not deal with infinity arithmetic if we can help it
                if((p === 0 || p === 1) &&
                  // Only overwrite if this is the first infinity, or if
                  // the non-infinity value decreases
                   (error > 0 || newFirst < Math.min(first, second))) {
                  first = newFirst;
                  second = Infinity;
                  favor = (p === 0);
                  // p === 1 has already been handled for asymmetric
                  error = 0;
                }
                return;
              }
              // Now that infinity is out of the way…
              var ratio = newFirst / (newFirst + newSecond);
              var newError = Math.abs(p - ratio);
              if(newError < error || (newError === error &&
                newFirst < (favor ? first : second))) {
                first = newFirst;
                second = newSecond;
                favor = true;
                error = newError;
              }
              if(symmetric) {
                // NOTE: even odds are always in your favour
                ratio = 1 - ratio;
                newError = Math.abs(p - ratio);
                if(newError < error || (newError === error &&
                newFirst < (favor ? first : second))) {
                  first = newFirst;
                  second = newSecond;
                  favor = false;
                  error = newError;
                }
              }
            });
          }
        });

        return {
          first: first,
          second: second,
          favor: favor
        };
       },
      /* ←— reroundError —————————————————————————————————————————————————→ *\
       | gives the relative observable error from switching the rounding
       |  direction of a given number.
       * ←————————————————————————————————————————————————————————————————→ */
      reroundError: function(x) {
        // (x + 0.5)%1 - 0.5 is the relative location of x from its rounded value
        //  If x = *.5, this value is −0.5, if x = *.95, it is −0.05, etc.
        // (0.5 - |…|) is how close it is from being rounded the other way.
        //  If x = *.5, this value is 0, if x = *.95, it is 0.05, etc.
        return (0.5 - Math.abs((x + 0.5)%1 - 0.5)) / Math.abs(x);
       },
      /* ←— distributeByProportion ———————————————————————————————————————→ *\
       | Given a number of items n and an array, returns an array of integers
       |  with total n, closely approximating the distribution of the given array.
       | If a simple rounded product does not add to n, adds or subtracts items
       |  from each section in order of relative error.
       * ←————————————————————————————————————————————————————————————————→ */
      distributeByProportion: function(n,proportions) {
        var total = proportions.reduce(function(s,t){return s + t;});
        var distribution = proportions.map(function(p){return n * p/total});

        // Round everything
        var rounded = distribution.map(function(x) {return Math.round(x);});
        total = rounded.reduce(function(s,t) {return s + t;});

        // Switch roundings until the total is n (hopefully no more than k/2 where
        //  k is the number of buckets.

        // List the distribution in descending (.pop() = lowest) order of relative error
        //  in switching roundings.
        var order = Object.keys(distribution).sort(function(a,b){
          return hs.reroundError(distribution[b]) - hs.reroundError(distribution[a]);
        });

        var i;
        while(total > n) {
          i = order.pop();
          if(distribution[i]%1 >= 0.5) {
            rounded[i] -= 1;
            total -= 1;
          }
        }
        while(total < n) {
          i = order.pop();
          if(distribution[i]%1 < 0.5) {
            rounded[i] += 1;
            total += 1;
          }
        }

        return rounded;
       }
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
        common:{
          label:{}
        },
        tool:{
          histogram:{},
          table:{}
        }
       };

    // COMMON FUNCTIONS
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
      /* ←— observeBounds ———————————————————————————————————————————————————→ *\
       | Keeps track of the edges of the Desmos Gadget, in the following vars
       |
       | EXPRESSIONS MUST BE MANUALLY AUTHORED USING API:
       |  o.desmos.setExpressions([
       |    {id:'leftBound',   latex:'x_{leftBound}'   },
       |    {id:'rightBound',  latex:'x_{rightBound}'  },
       |    {id:'topBound',    latex:'y_{topBound}'    },
       |    {id:'bottomBound', latex:'y_{bottomBound}' }
       |  ]);
       * ←———————————————————————————————————————————————————————————————————→ */
      fs.common.observeBounds = function(){
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];

        o.log('observeBounds activated on '+o.uniqueId);

        function updateBounds(t,h) {
          vars.mathBounds = h[t].mathCoordinates;
          vars.pixelFrame = h[t].pixelCoordinates;

          var bounds = vars.mathBounds;

          o.desmos.setExpressions([
            {
              id:'leftBound',
              latex:'x_{leftBound}='+bounds.left
            },
            {
              id:'rightBound',
              latex:'x_{rightBound}='+bounds.right
            },
            {
              id:'topBound',
              latex:'y_{topBound}='+bounds.top
            },
            {
              id:'bottomBound',
              latex:'y_{bottomBound}='+bounds.bottom
            }
          ]);
        }

        o.desmos.observe('graphpaperBounds.observeBounds', updateBounds);

        updateBounds('graphpaperBounds',o.desmos);
       };
      /* ←— record value —————————————————————————————————————————————————→ *\
       | Simply saves the value of a variable to the variable cache.
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.record = function() {
        var o = hs.parseArgs(arguments);
        vs[o.uniqueId][o.name] = o.value;
       };
      /* ←— show/hide expression —————————————————————————————————————————→ *\
       | Shows or hides an expression with a given ID
       | ID is given or assumed to match variable name
       | pass 0 to hide, 1 to show
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.showHide = function() {
        var o = hs.parseArgs(arguments);
        o.desmos.setExpression({
          id:o.id || o.name,
          hidden: !o.value
        });
       };
      /* ←— set value —————————————————————————————————————————————————————→ *\
       | Set the value of a variable.
       | Does the same thing as a slider without a function would do, but
       |  doesn't update the position of the slider when the variable changes.
       |
       | n.b.: Theoretically could be authored to interpret ID from Name,
       |   in order that it could be used from the "Expressions" tab,
       |   however either this would overwrite the variable's value with
       |   itself (making it pointless), or, if used with an Expression,
       |   would set a variable to the evaluation of an expression, which
       |   should be done using the Expression List itself. Seriously, why
       |   would you want to do that?
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.setValue = function(){
        var o = hs.parseArgs(arguments);
        if(!o.id) {
          throw new Error('Cannot set variable without expression ID. Use the Expression List for setting variables to the evaluation of an expression.');
        }
        o.desmos.setExpression({
          id:o.id,
          latex:o.name+'='+o.value
        });
       };
      /* ←— label value —————————————————————————————————————————————————————→ *\
       | Label a point according to the value of an expression.
       | Use for labeling anonymous sliders, or e.g. side lengths.
       |
       | POINT MUST FIRST BE MANUALLY AUTHORED USING API:
          calculator.setExpression({
            id:'[expressionLaTeX]',
            latex:'\\left(X,Y\\right)',
            showLabel:true
          });
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.label.value = function(){
        var o = hs.parseArgs(arguments);
        o.desmos.setExpression({id:((o.id && (o.id !== ''))? o.id : o.name),label:hs.latexToText(o.value)});
       };
      /* ←— show/hide label ——————————————————————————————————————————————→ *\
       | Shows or hides the label of an expression with a given ID
       | ID is given or assumed to match variable name
       | pass 0 to hide the label, 1 to show
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.label.showHide = function() {
        var o = hs.parseArgs(arguments);
        o.desmos.setExpression({
          id:o.id || o.name,
          showLabel: !!o.value
        });
       };
      /* ←— point —— point_A_x_named —— or —— point_A_x ———————————————————→ *\
       | Label a point according to its coordinates.
       | Substitute A with the point name.
       | Use on both the x- and y-coordinates, obviously
       | Add "_named" to the function to get the point's name at the front
       |  e.g., "A(3,−4)" instead of "(3,−4)"
       |
       | POINT MUST FIRST BE MANUALLY AUTHORED USING API:
          calculator.setExpression({
            id:'point'+name,
            latex:'\\left(X,Y\\right)',
            showLabel:true
          });
       * ←————————————————————————————————————————————————————————————————→ */
      fs.common.label.point = {};
       (function(){
        function storePoint(name,coord,named) {
          return function() {
            var o = hs.parseArgs(arguments);
            var vars = vs[o.uniqueId];
            vars.coords = vars.coords || {x:{},y:{}};

            vars.coords[coord][name] = o.value;

            var x = vars.coords.x[name] || 0;
            var y = vars.coords.y[name] || 0;

            o.desmos.setExpression({
              id:'point'+name,
              label:hs.latexToText((named?name:'')+'('+x+','+y+')')
            });
          };
        }
        var i;
        var P;
        for(i = 1; i <= 26; i += 1) {
          P = hs.ALPHA[i];
          fs.common.label.point[P] = {
            x:storePoint(P,'x',false),
            y:storePoint(P,'y',false),
            x_named:storePoint(P,'x',true),
            y_named:storePoint(P,'y',true)
          };
        }
       }());
    // TOOL FUNCTIONS
      // Freeform Histogram Tool
      /* ←— updateVHandles ————————————————————————————————————————————————→ *\
       | Updates the position of the handles that control the height
       | of the bars in the histogram
       | Call when the base handles change. Remember the base & height lists
       | should be sorted by x-position
       * ←—————————————————————————————————————————————————————————————————→ */
      fs.tool.histogram.updateVHandles = function(){
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];

        var bases = vars.bases;
        var centers = [];

        var heights = vars.heights;

        var i;
        for (i = 1; i < bases.length; i += 1) {
          centers.push((bases[i-1]+bases[i])/2);
          if (i > heights.length) {
            heights.push(1);
          }
        }

        o.desmos.setExpression({
          id:'heights',
          type:'table',
          columns:[
            {
              latex:'x_3',
              values:centers
            },
            {
              latex:'h',
              values:heights,
              columnMode:Desmos.ColumnModes.POINT,
              dragMode:Desmos.DragModes.Y
            }
          ]
        });
       };
      /* ←— Bar Diagram —————————————————————————————————————————————————→ *\
       | Resizes the number line
       * ←————————————————————————————————————————————————————————————————→ */
       fs.tool.barDiagram = {};
      fs.tool.barDiagram.init = function() {
        var o = hs.parseArgs(arguments);
        //var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];
      
        hlps.w = hlps.maker('w');
        hlps.W = hlps.maker('W');
        hlps.p = hlps.maker('p');
        hlps.P = hlps.maker('P');

        var updateBounds = function() {
          // stuff
          var bounds = o.desmos.graphpaperBounds.mathCoordinates;
          var unit = Math.max(bounds.width/12, hlps.P.numericValue/10, hlps.W.numericValue/10);
          if(typeof unit !== "number" || Number.isNaN(unit)) {
            unit = bounds.width/12;
          }

          var newBounds = {
            top: 8,
            bottom: -12,
            left: -unit,
            right: 11*unit
          };

          o.log(bounds,newBounds);

          o.desmos.setMathBounds(newBounds);
          o.desmos.setExpressions([
            {
              id:"lower",
              latex:"l_{ower}="+newBounds.bottom
            },{
              id:"right",
              latex:"r_{ight}="+newBounds.right
            }
          ]);
        };

        o.desmos.observe('graphpaperBounds.barDiagramHeight',updateBounds);
        hlps.W.observe('numericValue',updateBounds);
        hlps.P.observe('numericValue',updateBounds);
       };
      fs.tool.barDiagram.swapFix = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];

        // 1: fix amount
        if(o.value === 1) {
          if (typeof hlps.P.numericValue === "number" && !Number.isNaN(hlps.P.numericValue)) {
            o.desmos.setExpressions([
              {
                id:'part',
                latex:'P='+hlps.P.numericValue
              },
              {
                id:'final',
                latex:'p=P\\frac{w}{W}'
              },
              {
                id:'part_handle',
                latex:'\\left(P,\\frac{s+h}{2}\\right)'
              }
            ]);
          } else {
            hlps.P.observe('numericValue.initialize',function(t,h){
              h.unobserve('numericValue.initialize');
              o.desmos.setExpressions([
                {
                  id:'part',
                  latex:'P='+h[t]
                },
                {
                  id:'final',
                  latex:'p=P\\frac{w}{W}'
                },
                {
                  id:'part_handle',
                  latex:'\\left(P,\\frac{s+h}{2}\\right)'
                }
              ]);
            });
          }
        // 0: fix percent
        } else {
          if (typeof hlps.p.numericValue === "number" && !Number.isNaN(hlps.p.numericValue)) {
            o.desmos.setExpressions([
              {
                id:'part',
                latex:'P=p\\frac{W}{w}'
              },
              {
                id:'final',
                latex:'p='+hlps.p.numericValue
              },
              {
                id:'part_handle',
                latex:'\\left(\\frac{W}{w}p,\\frac{s+h}{2}\\right)'
              }
            ]);
          } else {
            hlps.p.observe('numericValue.initialize',function(t,h){
              h.unobserve('numericValue.initialize');
              o.desmos.setExpressions([
                {
                  id:'part',
                  latex:'P=p\\frac{W}{w}'
                },
                {
                  id:'final',
                  latex:'p='+h[t]
                },
                {
                  id:'part_handle',
                  latex:'\\left(\\frac{W}{w}p,\\frac{s+h}{2}\\right)'
                }
              ]);
            });
          }
        }
       };
      /* ←— Dot Plot ———————————————————————————————————————————→ *\
       | ---
       * ←————————————————————————————————————————————————————————————————→ */
        fs.tool.dotPlot = {};
      fs.tool.dotPlot.init = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];

        // h[x] = number of dots at position X
        vars.height = {};

        hlps.xs = hlps.maker('x_1');
        hlps.ys = hlps.maker('y_1');
        hlps.x2 = hlps.maker('x_2');
        hlps.y2 = hlps.maker('y_2');

        hlps.xs.observe('listValue.watch',function(t,h) {
          if(!Array.isArray(h[t])) {
            return;
          }
          var xs = Array.from(h[t]);
          vars.xs = xs;
          var height = {};
          if(Array.isArray(vars.ys)) {
            vars.ys.forEach(function(y,i) {
              if(i < xs.length) {
                height[xs[i]] = (height[xs[i]] || 0) + y;
              }
            });
            vars.height = height;
          }
        });

        hlps.ys.observe('listValue.watch',function(t,h) {
          if(!Array.isArray(h[t])) {
            return;
          }
          var ys = Array.from(h[t]);
          vars.ys = ys;
          var height = {};
          if(Array.isArray(vars.xs)) {
            vars.xs.forEach(function(x,i) {
              if(i < ys.length) {
                height[x]= (height[x] || 0) + ys[i];
              }
            });
            vars.height = height;
          }
        });

       };
      fs.tool.dotPlot.setHeight = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];

        // Record the new height
        var height = vars.height;
        height[hlps.x2.numericValue] = hlps.y2.numericValue;

        // Do a little clean-up just in case
        var xs = Object.keys(vars.height).filter(function(x){
          if(height[x] > 0) {
            return true;
          } else {
            delete height[x];
            return false;
          }
        }).sort(function(a,b) {
          return a - b;
        });

        // Bad things happen if a variable is defined as an empty list.
        if(xs.length === 0) {
          xs = [0];
        }

        var ys = xs.map(function(x){
          return (height[x] || 0);
        });

        vars.xs = Array.from(xs);
        vars.ys = Array.from(ys);

        o.desmos.setExpressions([
          {
            id:'values',
            latex:'x_1=['+xs+']'
          },{
            id:'counts',
            latex:'y_1=['+ys+']'
          }
        ]);
       };
      /* ←— add point to table ———————————————————————————————————————————→ *\
       | adds (0,0) to a Table of coordinates
       | table ID must be given, and should not have more than two columns
       | Variable Name should be in the form (x,y), with x and y being the
       |  LaTeX values of the table headers
       | n.b. it is surprisingly arduous to take the output of listValue and
       |  feed it back into the table column values, if any cells are empty
       * ←————————————————————————————————————————————————————————————————→ */
      fs.tool.table.addOriginPoint = function addOriginPoint() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];

        var vars = o.name.slice(1,o.name.length-1).split(',');
        var xVar = vars[0];
        var yVar = vars[1];
      
        hlps[xVar] = hlps[xVar] || hlps.maker(xVar);
        hlps[yVar] = hlps[yVar] || hlps.maker(yVar);

        var x = hlps[xVar];
        var y = hlps[yVar];

        var thisCall;
        var cb;

        if(x.numericValue === undefined || y.numericValue === undefined) {
          thisCall = 'numericValue.'+Date.now();
          cb = (function(theCall,args) {
            return function() {
              if(Number.isNaN(x.numericValue) && Number.isNaN(y.numericValue)) {
                x.unobserve(theCall);
                y.unobserve(theCall);
                addOriginPoint(args);
              }
            };
          }(thisCall,o));
          x.observe(thisCall,cb);
          y.observe(thisCall,cb);
          return;
        }

        x = x.listValue;
        y = y.listValue;

        if (Array.isArray(x)) {
          x = x.slice();
        } else {
          x = [];
        }

        if (Array.isArray(y)) {
          y = y.slice();
        } else {
          y = [];
        }

        function parseNaN(v,i,a){
          if(Number.isNaN(v)) {
            a[i]='';
          }
        }

        x.forEach(parseNaN);
        y.forEach(parseNaN);

        while(x.length < y.length) {
          x.push('');
        }

        while(y.length < x.length) {
          y.push('');
        }

        x.push(0);
        y.push(0);

        o.desmos.setExpression({
          id:o.id,
          type:'table',
          columns:[
          {
            latex:xVar,
            values:x
          },
          {
            latex:yVar,
            values:y
          }]
        });
       };

    // SCO-SPECIFIC FUNCTIONS
      /* ←— A0633963 7-2-5 KC ————————————————————————————————————————————→ *\
       | Change the graph based on the ticket cost.
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633963 = {};
      fs.A0633963.changeSlope = function() {
        var o = hs.parseArgs(arguments);

        var m = o.value;

        o.desmos.setExpressions([
        {
          id:'slope',
          latex:'m='+m
        },
        {
          id:'rise',
          label:'+'+m
        },
        {
          id:'one_more',
          label:'1 more ticket increases total cost by $'+m+'.'
        },
        {
          id:'m',
          label:'1 ticket costs $'+m+'.'
        }
        ]);
       };
      /* ←— A0633919 6-2-1 KC ————————————————————————————————————————————→ *\
       | recolors the point based on the side of 0
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633919 = {};
      fs.A0633919.color = function() {
        var o = hs.parseArgs(arguments);

        o.log(o.value);
      
        o.desmos.setExpressions([
        {
          id:'6',
          color:(o.value >= 0 ? cs.color.mgmColors.blue : cs.color.mgmColors.red)
        },
        {
          id:'7',
          color:(o.value > 0 ? cs.color.mgmColors.red : cs.color.mgmColors.blue)
        }]);
       };
      /* ←— A0633935 6-4-10 Ex.2 —————————————————————————————————————————————————→ *\
       | WiP TK TODO
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633935 = {};
       cs.A0633935 = {pixelTolerance:5};
      fs.A0633935.init = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];

        hlps.init = hlps.maker('i_{nit}');
        hlps.init.observe('numericValue.init',function(t,h) {
          if(h[t] === 0) {
            h.unobserve(t);
            newProblem();
          }
        });

        // returns a random number from 1 and n with equal probability of each
        function randInt(n) {
          return Math.min(n,Math.max(1,Math.ceil(Math.random()*n)));
        }

        // Generate a y-intercept and a random second point
        function newProblem() {
          var x1 = 0;
          var y1 = randInt(19)-10;
          var x2 = randInt(9);
          var y2 = randInt(19)-10;

          o.desmos.setExpression({
            id:'equation',
            latex:'('+x2+'-'+x1+')('+y2+'-y)=('+y2+'-'+y1+')('+x2+'-x)',
            color:cs.color.mgmColors.blue,
            hidden:false
          });

          o.desmos.setExpressions([
            {
              id:'p1',
              latex:'('+x1+','+y1+')',
              color:cs.color.mgmColors.blue,
              hidden:true
            },
            {
              id:'p2',
              latex:'('+x2+','+y2+')',
              color:cs.color.mgmColors.blue,
              hidden:true
            }
            ]);
        }

        // Make sure [−10...10] is always visible
        function constrainBounds(){
          var mathCoordinates = mergeObjects({},o.desmos.graphpaperBounds.mathCoordinates);

          var pixelCoordinates = o.desmos.graphpaperBounds.pixelCoordinates;

          if (mathCoordinates.left === -mathCoordinates.right &&
              mathCoordinates.bottom === -mathCoordinates.top &&
              Math.min(mathCoordinates.height, mathCoordinates.width) === 20 &&
              Math.abs(pixelCoordinates.height - mathCoordinates.height/mathCoordinates.width * pixelCoordinates.width) <= cs.A0633935.pixelTolerance) {
            return;
          }

          if (pixelCoordinates.height > pixelCoordinates.width) {
            mathCoordinates.left = -10;
            mathCoordinates.right = 10;
            mathCoordinates.top = pixelCoordinates.height*10/pixelCoordinates.width;
            mathCoordinates.bottom = -mathCoordinates.top;
          } else {
            mathCoordinates.bottom = -10;
            mathCoordinates.top = 10;
            mathCoordinates.right = pixelCoordinates.width*10/pixelCoordinates.height;
            mathCoordinates.left = -mathCoordinates.right;
          }

          delete mathCoordinates.height;
          delete mathCoordinates.width;

          o.desmos.setMathBounds(mathCoordinates);
        }

        o.desmos.observeEvent('graphReset.A0633935',newProblem);
        o.desmos.observe('graphpaperBounds.A0633935',constrainBounds);
        constrainBounds();
       };
      /* ←— A0633976 7-6-1 Ex.4 Try It! ——————————————————————————————————→ *\
       | mirror work on page 1 onto page 2
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633976 = {};
       vs.A0633976 = {};
      fs.A0633976.init_a = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs.A0633976;
        var hlps = hxs[o.uniqueId];

        vars.h = hlps.maker('h');

        if(vars.answer !== undefined) {
          vars.h.observe('listValue',function(t,h){
            vars.answer.setExpression({
              id:'heights',
              latex:'h=['+h[t]+']'
            });
          });
        }
       };
      fs.A0633976.init_b = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs.A0633976;

        vars.answer = o.desmos;

        if(vars.h !== undefined) {
          if(Array.isArray(vars.h.listValue)) {
            vars.answer.setExpression({
              id:'heights',
              latex:'h=['+vars.h.listValue+']'
            });
          }
          vars.h.observe('listValue',function(t,h){
            vars.answer.setExpression({
              id:'heights',
              latex:'h=['+h[t]+']'
            });
          });
        }
       };
      /* ←— A0633959 6-2-1 KC ————————————————————————————————————————————→ *\
       | recolors the point based on the side of 0
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633959 = {};
      fs.A0633959.color = function() {
        var o = hs.parseArgs(arguments);

        o.log(o.name + ' = ' + o.value);
      
        o.desmos.setExpression(
        {
          id:(o.name === 'x_1' ? '6' : '7'),
          color:((o.name === 'x_1' ? (o.value >= 0) : (o.value < 0)) ? cs.color.mgmColors.blue : cs.color.mgmColors.red)
        });
       };
      /* ←— A0633965 7-3-2 Ex.1 ——————————————————————————————————————————→ *\
       | Records score of hits & misses
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633965 = {};
      fs.A0633965.reset = function() {
        var o = hs.parseArgs(arguments);

        o.desmos.setExpressions([
          {
            id:'misses',
            latex:'M=0'
          },{
            id:'scores',
            latex:'S=0'
          }
        ]);
       };
       /* ←— A0633965_record ————————————————————————————————————————————→ *\
       | Call with id:"scores" or id:"misses"
       * ←———————————————————————————————————————————————————————————————→ */
      fs.A0633965.record = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];

        var expr;
        if(o.id === 'scores') {
          expr = 'S='+(hlps.P.numericValue+1);
        } else {
          expr = 'M='+(hlps.W.numericValue-hlps.P.numericValue+1);
        }

        if(hlps.W.numericValue === 0) {
          o.desmos.setMathBounds({
            top: 8,
            bottom: -12,
            left: -1,
            right: 11
          });
        } else if(hlps.W.numericValue / o.desmos.graphpaperBounds.mathCoordinates.width > 0.7) {
          o.desmos.setMathBounds({
            top:8,
            bottom:-12,
            left:o.desmos.graphpaperBounds.mathCoordinates.left*1.5,
            right:o.desmos.graphpaperBounds.mathCoordinates.right*1.5
          });
        }

        o.desmos.setExpression({
          id:o.id,
          latex:expr
        });
       };
      /* ←— A0633977 7-6-1 KC ————————————————————————————————————————————→ *\
       | Approximates a given percent distribution with a random sample
       | Distribution is defined in a histogram on the left
       | Sample is generated in a dot plot on the right
       |  TODO: Animate the picking of the sample
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633977 = {};
      fs.A0633977.invalidate = function() {
        if(hxs.A0633977 !== undefined && hxs.A0633977.right !== undefined) {
          vs.A0633977.invalidated = true;
          hxs.A0633977.right.setExpression({
            id:'dots',
            hidden:true
          });
        }
       };
      fs.A0633977.validateAccumulator = function(s,t,i) {
        // Assume it's called on the left's percents, check with the right's distribution
        return (s && (t === hxs.A0633977.distribution.listValue[i]));
       };
      fs.A0633977.validate = function() {
        var vars = vs.A0633977;
        var hlps = hxs.A0633977;

        if(vars.invalidated === true) {
          return;
        }

        // Only invalidate if both widgets have loaded
        if(hlps.left !== undefined && hlps.right !== undefined) {
          if (
            // If the left has a different number of elements than the right thinks it does
            (hlps.N !== undefined && hlps.n !== undefined &&
              hlps.N.numericValue !== undefined && hlps.n.numericValue !== undefined &&
              hlps.N.numericValue !== hlps.n.numericValue) ||
            // If the percents on the left are different than the right's distribution
            (Array.isArray(vars.percents) && hlps.distribution !== undefined &&
              Array.isArray(hlps.distribution.listValue) &&
              (vars.percents.length !== hlps.distribution.listValue.length ||
                !(vars.percents.reduce(fs.A0633977.validateAccumulator,true))))
          ) {
            fs.A0633977.invalidate();
          }
        }
       };
      fs.A0633977.initLeft = function() {
        var o = hs.parseArgs(arguments);

        // Until proper o.uniqueId happens, we have to use our own
        vs.A0633977 = vs.A0633977 || {};
        hxs.A0633977 = hxs.A0633977 || {};

        var vars = vs.A0633977;
        var hlps = hxs.A0633977;

        hlps.left = o.desmos;

        hlps.N = hxs[o.uniqueId].maker('n');

        hlps.N.observe('numericValue.validate',fs.A0633977.validate);

        hlps.p = hxs[o.uniqueId].maker('p');

        hlps.p.observe('listValue.updatePercents', function(t,h){

          var percents = Array.from(h[t]);

          // Round everything
          var rounded = hs.distributeByProportion(100,percents);

          // Save the rounded percents so the dot plot can grab 'em.
          vars.percents = rounded;

          fs.A0633977.validate();

          o.desmos.setExpression({
            id:'percents',
            latex:'P=\\left['+rounded+'\\right]'
          });
        });

        fs.A0633977.validate();
        o.log('Initial population validation complete.');
       };
      fs.A0633977.initRight = function() {
        var o = hs.parseArgs(arguments);

        // Until proper o.uniqueId happens, we have to use our own
        vs.A0633977 = vs.A0633977 || {};
        hxs.A0633977 = hxs.A0633977 || {};

        var vars = vs.A0633977;
        var hlps = hxs.A0633977;

        // Don't invalidate if we're just resuming from a saved state.
        vars.invalidated = false;

        hlps.right = o.desmos;

        // Sample size
        hlps.k = hxs[o.uniqueId].maker('k');
        hlps.k.observe('numericValue.validate',function(){
          // Don't automatically invalidate on initialization
          hlps.k.unobserve('numericValue.validate');
          // But do invalidate whenever k changes from then on
          hlps.k.observe('numericValue.invalidate',fs.A0633977.invalidate);
        });

        // Validation will look for these
        hlps.n = hxs[o.uniqueId].maker('n');
        hlps.distribution = hxs[o.uniqueId].maker('d');

        // Initial validation—only need to do this once, because the left
        //  widget will handle it from here.
        hlps.n.observe('numericValue.validate',function(t,h){
          h.unobserve(t+'.validate');
          fs.A0633977.validate();
          o.log('Initial sample validation 1/2 complete.');
        });
        hlps.distribution.observe('listValue.validate',function(t,h){
          h.unobserve(t+'.validate');
          fs.A0633977.validate();
          o.log('Initial sample validation 2/2 complete.');
        });
       };
      fs.A0633977.sample = function() {
        // A0633977_sample
        var o = hs.parseArgs(arguments);

        var vars = vs.A0633977;
        var hlps = hxs.A0633977;

        vars.invalidated = false;

        if (hlps.left === undefined || hlps.N.numericValue === undefined) {
          fs.A0633977.invalidate;
          return;
        }

        var N = hlps.N.numericValue;
        var percents = vars.percents;

        var exprs = [
          {
            id:'n',
            latex:'n='+N
          },
          {
            id:'distribution',
            latex:'d=\\left['+percents+'\\right]'
          }
        ];

        // Generate the population based on the percent distribution and population size
        var population = hs.distributeByProportion(N,percents);
        exprs.push({
          id:'population',
          latex:'P=\\left['+population+'\\right]'
        });

        var k = hlps.k.numericValue;
        var sample = population.map(function(){return 0;});
        var order = [];

        var n = N;
        var random;
        var i;
        while(order.length < k && order.length < N) {
          i = 0;
          // Pick a random member of the population and add it to the sample
          random = n*Math.random();
          while(population[i] < random) {
            random -= population[i];
            i += 1;
          }

          population[i] -= 1;
          n -= 1;
          sample[i] += 1;
          order.push(i);
        }

        exprs.push(
          {
            id:'order',
            latex:'o=\\left['+order+'\\right]'
          },
          {
            id:'sample',
            latex:'S=\\left['+sample+'\\right]'
          },
          {
            id:'remainder',
            latex:'R=\\left['+population+'\\right]'
          },
          {
            id:'sample_distribution',
            latex:'D=\\left['+hs.distributeByProportion(100,sample)+'\\right]'
          },
          {
            id:'dots',
            hidden:false
          }
        );

        o.desmos.setExpressions(exprs);
       };
      /* ←— A0633979 7-6-3 Ex.1 ——————————————————————————————————————————→ *\
       | generates a new set of data between 0 and 50
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633979 = {};
      fs.A0633979.newData = function() {
        var o = hs.parseArgs(arguments);

        o.desmos.setExpression({
          id:'answer',
          hidden:true
        });

        if(typeof o.value !== "number" || o.value <= 0 || o.value % 1 !== 0) {
          o.value = 20;
        }

        if(typeof o.id !== "string" || o.id === '') {
          o.id = "data";
        }

        if(typeof o.name !== "string" || o.name === '') {
          o.name = "S"
        }

        var expr = o.name + "=\\left[";

        var data = [];
        while(data.length < o.value) {
          data.push(Math.round((1-Math.random()*Math.random())*25+Math.random()*Math.random()*25));
        }

        data.sort(function(a,b){
          return (a - b);
        });
        
        expr += data;
        expr += "\\right]";

        o.desmos.setExpression({
          id:o.id,
          latex:expr
        });
       };
      /* ←— A0633980 7-7-1 KC ————————————————————————————————————————————→ *\
       | description
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633980 = {};
       cs.A0633980 = {
        even_threshold:0.07,
        likely_threshold:0.3,
        very_likely_threshold: 0.48,
        practically_impossible_threshold:0.0035,
        impossible_threshold:0.0005
       };
      fs.A0633980.updateP = function() {
        var o = hs.parseArgs(arguments);

        var p = o.value;

        var ratio = hs.optimalRatio(p, undefined, undefined, true);
        var odds = hs.optimalOdds(p);

        var temp;
        if(odds.second > odds.first) {
          temp = odds.first;
          odds.first = odds.second;
          odds.second = temp;
          odds.favor = !(odds.favor);
        }

        var description;
        if(Math.abs(p-0.5) < cs.A0633980.even_threshold) {
          description = 'coin flip';
        } else if (p > 0.5) {
          if (p < 0.5 + cs.A0633980.likely_threshold) {
            description = 'likely';
          } else if (p < 0.5 + cs.A0633980.very_likely_threshold) {
            description = 'very likely';
          } else if (p < 1) {
            description = 'almost certain';
          } else {
            description = 'certain';
          }
        } else {
          if (p > 0.5 - cs.A0633980.likely_threshold) {
            description = 'unlikely';
          } else if (p > 0.5 - cs.A0633980.very_likely_threshold) {
            description = 'very unlikely';
          } else if (p > 0) {
            description = 'practically impossible';
          } else {
            description = 'impossible';
          }
        }

        var exprs = [
          {
            id:'numerator',
            latex:'f_n='+ratio.numerator
          },
          {
            id:'denominator',
            latex:'f_d='+ratio.denominator
          },
          {
            id:'odds_first',
            latex:'o_l='+odds.first
          },
          {
            id:'odds_second',
            latex:'o_r='+odds.second
          },
          {
            id:'descriptive',
            label:description
          }
        ];

        if (odds.first === odds.second) {
          exprs.push({
            id:'odds',
            label:'1:1 (even) odds'
          });
        } else if (p < cs.A0633980.impossible_threshold || p >= 1-cs.A0633980.impossible_threshold) {
          exprs.push({
            id:'odds',
            label:'1,000,000:1 odds '+(p > 0.5 ? 'in favor' : 'against')
          });
        } else if (p < cs.A0633980.practically_impossible_threshold || p >= 1-cs.A0633980.practically_impossible_threshold) {
          exprs.push({
            id:'odds',
            label:'1,000:1 odds '+(p > 0.5 ? 'in favor' : 'against')
          });
        } else {
          exprs.push({
            id:'odds',
            label:'{o_l}:{o_r} odds '+(p >= 0.5 ? 'in favor' : 'against')
          });
        }

        o.desmos.setExpressions(exprs);
       };
      /* ←— A0633981 7-7-7 Ex.3 ——————————————————————————————————————————→ *\
       | description
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633981 = {};
      fs.A0633981.init = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];

        var regIndex = /^[Bb]_{?([0-9]+)}?$/;

        vars.B = [undefined];
        vars.maxTrial = 0;
        hlps.B = [];

        var recalc = function() {
          var successes = 0;
          var trials = 0;

          o.log('Recalculating experimental probability.');
          vars.B.forEach(function(e,i){
            if(i > 0) {
              successes += (e ? 1 : 0);
              trials += 1;
            }
          });

          o.log('Experimental probability: '+successes+'/'+trials);
          o.desmos.setExpressions([
            {
              id:'ratio',
              latex:'\\frac{'+successes+'}{'+trials+'}'
            },
            {
              id:'successes',
              latex:'S='+successes
            },
            {
              id:'trials',
              latex:'T='+trials
            }
          ]);
        };

        var countCards = function(t,h) {
          var id = regIndex.exec(h.latex)[1];
          var list = h[t];
          var label = 'Trial '+(id+':').padEnd(4,' ');

          var point = '\\left(x_B,y_B-'+id+'d_y\\right)';
          var exprs = [];
          var collection = {};
          var size = 0;
          var i;

          if(Array.isArray(list)) {
            label += list.toString().replace(/,/g,', ');
            o.log('Counting cards for '+label);
            // Count'em
            list.forEach(function(e) {
              if(collection[e] !== true) {
                collection[e] = true;
                size += 1;
              }
            });

            o.log(label+' has '+size+' different cards.');
            // Make sure that all the labels for trials before this one are shown
            for(i = vars.maxTrial + 1 ; i < id ; i += 1) {
              o.log('Showing label for trial '+i);
              exprs.push({
                id:'trial_'+i,
                showLabel:true
              });
            }
            vars.maxTrial = Math.max(vars.maxTrial,id);
            // Record whether the trial has 6 cards or not
            if (size === 6) {
              label = '\u2714 '+label;
              vars.B[id] = true;
            } else {
              label = '\u2718 '+label;
              vars.B[id] = false;
            }
          } else {
            label = '… ' + label + '…';
            o.log('Not counting cards for undefined '+label);
            delete vars.B[id];
            vars.maxTrial = Math.max.apply(this,Object.keys(vars.B));
            // If there are other undefined lists before this one, hide their labels
            for(i = vars.maxTrial + 1 ; i < id ; i += 1) {
              o.log('Hiding label for trial '+i);
              exprs.push({
                id:'trial_'+i,
                showLabel:false
              });
            }
          }

          exprs.push({
            id:'topExpr',
            latex:'y_B='+(vars.maxTrial + 1)+'d_y'
          });

          exprs.push({
            id:'trial_'+id,
            latex:point,
            label:label,
            showLabel:(id <= vars.maxTrial),
            hidden:true,
            secret:true,
            color:cs.color.mgmColors.black
          });

          o.log('Setting expressions:',exprs);

          o.desmos.setExpressions(exprs);

          recalc();
        };
      
        hlps.watchNew = function watchNew(n) {
          o.log('Looking for B_'+n);
          hlps.B[n] = hlps.maker('B_{'+n+'}');
          hlps.B[n].observe('listValue.next',function(t,h) {
            // Once the helperExpression is looking at a list
            // Add that list to the samples and await the next
            if (Array.isArray(h[t])) {
              h.unobserve('listValue.next');

              countCards(t,h);
              o.log('Now observing B_'+n);
              h.observe('listValue.recount',countCards);

              watchNew(n+1);
            }
          });
        };

        hlps.watchNew(1);
       };
      fs.A0633981.addTrial = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];

        var which = 1;

        while(vars.B[which] !== undefined) {
          which += 1;
        }

        var collection = [];

        while(collection.length < 10) {
          collection.push(Math.max(Math.ceil(6*Math.random()),1));
        }

        o.desmos.setExpression({
          id:'B_'+which,
          latex:'B_{'+which+'}=['+collection+']'
        });
       };
      /* ←— A0633992 7-8-5 KC ————————————————————————————————————————————→ *\
       | Shows how to calculate circumference given diameter, and vice-versa
       |  as well as the calculation of pi given both.
       * ←————————————————————————————————————————————————————————————————→ */
       fs.A0633992 = {};
      fs.A0633992.init = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];
      
        hlps.r = hlps.maker('r_0');
        hlps.d = hlps.maker('d');
        hlps.C = hlps.maker('C');

        o.desmos.observe('graphpaperBounds.updateFrame',function() {
          window.setTimeout(function(){
            fs.A0633992.updateFrame(Object.assign({},o,{value:hlps.r.numericValue}));
          },100);
        });
       };
      fs.A0633992.swapSlider = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];

        if(o.value === 0) {
          o.desmos.setExpressions([
            {
              id:'slider',
              latex:'s='+Math.min(Math.max(1,Math.round(hlps.d.numericValue)),50)
            },
            {
              id:'radius',
              latex:'r_0=\\frac{\\operatorname{round}\\left(50\\cdot\\frac{d}{2}\\right)}{50}'
            },
            {
              id:'circumference',
              latex:'C=\\frac{\\operatorname{round}\\left(50\\cdot2\\pi r_0\\right)}{50}'
            },
            {
              id:'diameter',
              latex:'d=s'
            },
            {
              id:'label_r',
              latex:'\\left(\\frac{R}{2}\\cos\\theta_0+t_{ick}\\cos\\theta_1+2.5t_{ick},\\frac{R}{2}\\sin\\theta_0+t_{ick}\\sin\\theta_1\\right)',
              label:'r = {d} ÷ 2 = {r0}'
            },
            {
              id:'label_d',
              label:'Diameter = {d}'
            },
            {
              id:'label_C(r)',
              latex:'\\left(0,R+t_{ick}\\right)',
              showLabel: true,
              label:'C = 2π({r0}) ≈ {C}'
            },
            {
              id:'label_C(d)',
              latex:'\\left(0,R+2.5t_{ick}\\right)',
              showLabel: true,
              label:'C = π({d}) ≈ {C}'
            },
            {
              id:'label_pi',
              latex:'\\left(0,-\\sqrt{R^2-\\left(5t_{ick}\\right)^2}\\right)',
              label:'π ≈ {C} ÷ {d} ≈ 3.14'
            }
          ]);
        } else if (o.value === 1) {
          o.desmos.setExpressions([
            {
              id:'slider',
              latex:'s='+Math.min(Math.max(1,Math.round(hlps.C.numericValue)),50)
            },
            {
              id:'radius',
              latex:'r_0=\\frac{\\operatorname{round}\\left(50\\cdot\\frac{d}{2}\\right)}{50}'
            },
            {
              id:'circumference',
              latex:'C=s'
            },
            {
              id:'diameter',
              latex:'d=\\frac{\\operatorname{round}\\left(50\\cdot\\frac{C}{\\pi}\\right)}{50}'
            },
            {
              id:'label_r',
              latex:'\\left(\\frac{R}{2}\\cos\\theta_0+t_{ick}\\cos\\theta_1+3.5t_{ick},\\frac{R}{2}\\sin\\theta_0+t_{ick}\\sin\\theta_1\\right)',
              label:'r = {C} ÷ (2π) ≈ {r0}'
            },
            {
              id:'label_d',
              label:'d = {C} ÷ π ≈ {d}'
            },
            {
              id:'label_C(r)',
              latex:'\\left(0,R+t_{ick}\\right)',
              showLabel: false,
              label:'Circumference = {C}'
            },
            {
              id:'label_C(d)',
              latex:'\\left(0,R+t_{ick}\\right)',
              showLabel: true,
              label:'Circumference = {C}'
            },
            {
              id:'label_pi',
              latex:'\\left(0,-\\sqrt{R^2-\\left(5t_{ick}\\right)^2}\\right)',
              label:'π ≈ {C} ÷ {d} ≈ 3.14'
            }
          ]);
        }
       };
      fs.A0633992.updateFrame = function() {
        var o = hs.parseArgs(arguments);

        // var math = o.desmos.graphpaperBounds.mathCoordinates;
        var pixels = o.desmos.graphpaperBounds.pixelCoordinates;

        var newBounds = {};

        newBounds.top = Math.min(o.value+70*2*o.value/(pixels.height-200),2*o.value);
        newBounds.bottom = -Math.min(o.value+130*2*o.value/(pixels.height-200),4*o.value);
        newBounds.right = Math.min(o.value+10*2*o.value/(pixels.width-20),3*o.value);
        newBounds.left = -newBounds.right;

        if(newBounds.top < o.value) {
          newBounds.top = 2*o.value;
          newBounds.bottom = -4*o.value;
        }

        if(newBounds.right < o.value) {
          newBounds.right = 3*o.value;
          newBounds.left = -3*o.value;
        }

        var newHeight = newBounds.top - newBounds.bottom;
        var newWidth = newBounds.right - newBounds.left;

        var newAspect = +((newWidth / newHeight).toPrecision(3));
        var aspect = +((pixels.width / pixels.height).toPrecision(3));

        o.log("Changing aspect "+newAspect+" to "+aspect);

        // Pixel frame is narrower than required → buffer the height to keep
        //  the aspect ratio matching the pixel dimensions
        if(newAspect > aspect) {
          newBounds.top = +((newBounds.top*newAspect/aspect).toPrecision(4));
          newBounds.bottom = +((newBounds.bottom*newAspect/aspect).toPrecision(4));
          newBounds.left = +(newBounds.left.toPrecision(4));
          newBounds.right = +(newBounds.right.toPrecision(4));
        } else if (newAspect < aspect) {
          newBounds.left = +((newBounds.left*aspect/newAspect).toPrecision(4));
          newBounds.right = +((newBounds.right*aspect/newAspect).toPrecision(4));
          newBounds.top = +(newBounds.top.toPrecision(4));
          newBounds.bottom = +(newBounds.bottom.toPrecision(4));
        }

        // o.log("Now "+(newBounds.right-newBounds.left)+":"+(newBounds.top-newBounds.bottom));
        // o.log(" or "+((newBounds.right-newBounds.left)/(newBounds.top-newBounds.bottom)));

        o.desmos.setMathBounds(newBounds);
       };
      /* ←— A0634006 8-4-1 KC ————————————————————————————————————————————→ *\
       | generates random bivariate data with given properties
       * ←————————————————————————————————————————————————————————————————→ */
       cs.A0634006 = {
        framerate: 0.1,
        speed: 100,
        n:10
       };
       fs.A0634006 = {};
      fs.A0634006.init = function() {
        var o = hs.parseArgs(arguments);
        var hlps = hxs[o.uniqueId];
      
        hlps.X0 = hlps.maker('x_0');
        hlps.Y0 = hlps.maker('y_0');

        hlps.X1 = hlps.maker('x_1');
        hlps.Y1 = hlps.maker('y_1');
       };
      /* ←— splat ————————————————————————————————————————————————————————→ *\
       | throws paint at the wall (generates random data approximating a line)
       * ←————————————————————————————————————————————————————————————————→ */
      fs.A0634006.splat = function(a,b,opts) {
        opts = Object.assign({
          n:10,
          xMin:0,
          xMax:10,
          yMin:0,
          yMax:10,
          xJitter:1,
          yJitter:1
        },opts);

        var n = opts.n;
        var xMin = opts.xMin;
        var xMax = opts.xMax;
        var yMin = opts.yMin;
        var yMax = opts.yMax;
        var yJitter = opts.yJitter;
        var xJitter = opts.xJitter;

        yMin = Math.max(yMin, a * ((a >= 0) ? xMin : xMax) + b - yJitter);
        yMax = Math.min(yMax, a * ((a >= 0) ? xMax : xMin) + b + yJitter);

        xMin = Math.max(xMin, (((a >= 0) ? yMin - yJitter : yMax + yJitter) - b) / a);
        xMax = Math.min(xMax, (((a >= 0) ? yMax + yJitter : yMin - yJitter) - b) / a);

        var xs = [];
        var ys = [];

        if ((xMin > xMax) || (yMin > yMax)) {
          throw new Error('No values available within given range.');
        }

        var x;
        var yUpper;
        var yLower;
        var xBase;
        var xLower;
        var xUpper;
        var dx = (xMax-xMin)/(n+1);
        while (xs.length < n) {
          xBase = xMin + (xs.length + 0.5) * dx;
          xUpper = xBase + Math.min(xJitter, xMax - xBase);
          xLower = xBase - Math.min(xJitter, xBase - xMin);
          x = Math.random()*(xUpper - xLower) + xLower;

          yUpper = Math.min(a*x+b+yJitter,yMax);
          yLower = Math.max(a*x+b-yJitter,yMin);

          xs.push(x);
          ys.push(Math.random()*(yUpper-yLower)+yLower);
        }

        return {
          x:xs,
          y:ys
        };
       };
      /* ←— newData —————————————————————————————————————————————————→ *\
       | value passed is the direction of association
       |  1: positive association
       |  −1: negative association
       |  0: no association
       * ←————————————————————————————————————————————————————————————————→ */
      fs.A0634006.newData = function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];

        o.log(arguments);
        clearTimeout(vars.timeoutID);

        var x0;
        var y0;
        var x1;
        var y1;
        var a;
        var b;

        // Start with high variability; whittle down as much as we need
        var yJitter = 5;

        var data;
        var stats;

        do {
          if(o.value !== 0) {
            yJitter = yJitter * 0.5;
          }
          x0 = Math.random()*5;
          y0 = Math.random()*5 + 5*(1-o.value)/2;
          x1 = Math.random()*5 + 5;
          y1 = Math.random()*5 + 5*(o.value+1)/2;
          a = (y1 - y0) / (x1 - x0);
          b = y0 - a * x0;
          data = fs.A0634006.splat(a,b,{yJitter:yJitter,n:cs.A0634006.n});
          // add in a random point
          data.y[Math.floor(Math.random()*cs.A0634006.n)] = 10*Math.random();
          stats = hs.stats2D(data.x,data.y);
          o.log('('+Math.round(100*x0)/100+', '+Math.round(100*y0)/100+') to (' +
            Math.round(100*x1)/100+', '+Math.round(100*y1)/100+')');
          o.log('y ~ '+Math.round(100*a)/100+'x + '+Math.round(100*b)/100);
        } while ((o.value !== 0) ? (Math.abs(stats.r) < 0.5) : (Math.abs(stats.r) > 0.25));

        var ids = [0,1,2,3,4,5,6,7,8,9].sort(function(a,b){return (data.x[a] > data.x[b]);});
        data.x = data.x.map(function(e,i,a){return a[ids[i]];});
        data.y = data.y.map(function(e,i,a){return a[ids[i]];});

        /*/ OPTION A: uses table to hold data
        // FOR SOME REASON table manipulation is hella laggy using the API
        hs.easePointList(hlps.X1.listValue,hlps.Y1.listValue,data.x,data.y,0,cs.A0634006.framerate,cs.A0634006.speed,function(x,y,tx,ty,t,dt,d,cb,id) {
          vars.timeoutID = id;
          o.desmos.setExpression({
            id:'table',
            type:'table',
            columns:[
              {
                latex:'x_1',
                values:x
              },
              {
                latex:'y_1',
                values:y
              }
            ]
          });
        }); //*/

        // OPTION B: uses individual points
        hs.easePointList(hlps.X0.listValue,hlps.Y0.listValue,data.x,data.y,0,cs.A0634006.framerate,cs.A0634006.speed,function(x,y,tx,ty,t,dt,d,cb,id) {
          vars.timeoutID = id;
          var exprs = [];
          x.forEach(function(e,i) {
            exprs.push({
              id:'u_'+i,
              latex:'u_'+i+'='+e
            });
          });
          y.forEach(function(e,i) {
            exprs.push({
              id:'v_'+i,
              latex:'v_'+i+'='+e
            });
          });
          o.desmos.setExpressions(exprs);
        }); //*/
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
          mergeObjects(hlps,{
            W:hlps.maker('W'),
            p:hlps.maker('p'),
            scalex:hlps.maker('t_{ickx}')
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
                    color:cs.color.mgmColors.black
                  },
                  {
                    id:'labelP_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-t_{icky}\\right)',
                    label:''+(Math.round(100*i*W/choices.majorIntervalsW)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.mgmColors.black
                  },
                  {
                    id:'labelFrac_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-1.4\\cdot t_{icky}\\right)',
                    label:''+(Math.round(100*W)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.mgmColors.black
                  },
                  {
                    id:'labelW_'+i,
                    latex:'\\left(\\frac{100\\cdot'+i+'}{I_w},h_W-2\\cdot t_{icky}\\right)',
                    label:''+(Math.round(100*W)/100),
                    showLabel:false,
                    hidden:true,
                    secret:true,
                    color:cs.color.mgmColors.black
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
          var placeValueNumber = parseInt(String(num).charAt(numLength-placevalue),10);

          return new PearsonGL.Parameters.Parameter(placeValueNumber,"single","integer");
         }

        function sqrt(number) {
          var sqart = Math.sqrt(number.value);
          return new PearsonGL.Parameters.Parameter(sqart,"single","float");

         }

        function parseStrToInt(exp) {
          return new PearsonGL.Parameters.Parameter(parseInt(exp.value,10),"single","integer");
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
                  canvas += SVGObj.createLabel(xPos-7, 55, parseInt(minXRange+interval,10) ,"normal");
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
            flength = parseInt(flength,10);
          } else {
            flength = parseInt(flength,10)+1;
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
    mergeObjects(exports,hs.flattenFuncStruct(fs));
       console.log("Root CJS loaded");
       return exports;
}());
