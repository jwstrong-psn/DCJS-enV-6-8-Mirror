Math.log2 = Math.log2 || function(arg) {return Math.log(arg)*Math.LOG2E;};

/* ←— objKeys —————————————————————————————————————————————————→ *\
 | replaces Object.keys in case of *shudder* IE
 * ←————————————————————————————————————————————————————————————————→ */
 var objKeys = (function(){
  if(typeof Object.keys === "function"){
    return Object.keys;
  } else {
    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    return (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }
 })();

/* ←— mergeObjects —————————————————————————————————————————————————→ *\
 | replaces Object.assign in case of *shudder* IE
 * ←————————————————————————————————————————————————————————————————→ */
 var mergeObjects = (function() {
  if (typeof Object.assign === "function") {
    return Object.assign;
  } else {
    return function(){
      var obj = arguments[0];

      [].forEach.call(arguments, function(arg,i) {
        var keys = [];
        if(typeof arg === "string") {
          while(keys.length < arg.length) {
            keys.push(keys.length);
          }
        } else {
          keys = objKeys(arg);
        }

        if(i > 0) {
          keys.forEach(function(key) {
            obj[key] = arg[key];
          });
        }
      });

      return obj;
    };
  }
   })();

window.xs = { // Commonly useful Desmos expressions (in LaTeX string form)
  /* — pointAlongArc ————————————————————————————————————————————————→ *\
   | pointAlongArc: For drawing points by polar reference from a point.
   |
   | !! REQUIRES: thetaXY(x,y)
   |
   | @Args: x1, y1, x2, y2, r, theta1, theta2, t
   |  (x1,y1) is the center of the arc and r is its radius
   |  <x2,y2>-<x1,y1> is the reference direction from which the angles are measured
   |  theta1 and theta2 are reference angles, measured from the reference direction
   |  t is the position along the arc, from 0 (at theta1) to 1 (at theta2)
   |
   | @Returns: (x,y), a point along the arc.
   |
   | #EXAMPLE: Draw an arc of radius 0.5 from to -pi/24 to 5pi/6
   |  C = P_onArc(0,0,1,1,0.5,pi/3,-pi/6,t) from t = -0.5 to 1.25
   |
   | #TIP: Use t as a parameter in the call to draw an arc.
   | #TIP: Use t as an animation slider to trace a point along the arc.
   | #TIP: Multiply t by an animation slider to animate the drawing of the arc.
   | #TIP: Use P_onArc(x,y,x+1,y,r,0,1,theta) to draw vector <r,theta> from (x,y)
   * ←—————————————————————————————————————————————————————————————————→ */
   pointAlongArc:[{"id":"pointAlongArc","latex":"P_{onArc}\\left(x,y,x_{functionArg},y_{functionArg},r_{functionArg},\\theta,\\theta_{functionArg},t_{functionArg}\\right)=\\left(x+r_{functionArg}\\cos \\left(\\theta_{xy}\\left(x_{functionArg}-x,y_{functionArg}-y\\right)+\\theta\\left(1-t_{functionArg}\\right)+\\theta_{functionArg}t_{functionArg}\\right),y+r_{functionArg}\\sin \\left(\\theta_{xy}\\left(x_{functionArg}-x,y_{functionArg}-y\\right)+\\theta\\left(1-t_{functionArg}\\right)+\\theta_{functionArg}t_{functionArg}\\right)\\right)","hidden":"true"}],
  /* — tick —————————————————————————————————————————————————————————→ *\
   | tick: measurement of tick size in units (based on 18px standard)
   |
   | !! REQUIRES: xPixelScale or observeZoom()
   | !! REQUIRES: square grid
   |
   | Used for extending auxiliary lines and arcs, and drawing congruence markers
   * ←—————————————————————————————————————————————————————————————————→ */
   tick:[{"id":"tick","latex":"t_{ick}=18x_{pxScale}","hidden":"true"},{"id":"x_pxScale","latex":"x_{pxScale}"},{"id":"y_pxScale","latex":"y_{pxScale}"}],
  /* — bracket —————————————————————————————————————————————————————————→ *\
   | bracket: draws a horizontal bracket with a given width and curve radii
   | 
   | y = b_rac(x,r,theta,t)
   | @args: x, r, theta, t
   |  x: free variable
   |  r: width of the bracket
   |  theta: curve diameter (in x)
   |  t: curve diameter (in y)
   * ←—————————————————————————————————————————————————————————————————→ */
   bracket:[{"id":"bracket","latex":"b_{rac}\\left(x,r,\\theta,t\\right)=t\\left\\{0\\le x\\le r:\\left\\{0\\le r\\le2\\theta:\\sqrt{1-\\frac{x-\\frac{r}{2}}{\\theta}^2},2\\theta<r\\le4\\theta:\\sqrt{\\frac{\\frac{r}{2\\theta}^2+1}{2}^2-\\frac{x-\\frac{r}{2}}{\\theta}^2}-\\sqrt{\\frac{\\frac{r}{2\\theta}^2+1}{2}^2-\\frac{r}{2\\theta}^2},0\\le x\\le\\theta:\\sqrt{1-\\frac{x-\\theta}{\\theta}^2},0\\le r-x\\le\\theta:\\sqrt{1-\\frac{x-\\left(r-\\theta\\right)}{\\theta}^2},\\left|\\frac{r}{2}-x\\right|\\le\\theta:2-\\sqrt{1-\\frac{x-\\left(\\frac{r}{2}-\\operatorname{sign}\\left(0.5+\\operatorname{sign}\\left(\\frac{r}{2}-x\\right)\\right)\\theta\\right)}{\\theta}^2},1\\right\\}\\right\\}"}],
  /* — cong —————————————————————————————————————————————————————————→ *\
   | cong: draws a congruence tick mark
   |
   | !! REQUIRES: tick
   | !! REQUIRES: square grid
   |
   | @args: x1, y1, x2, y2, numTicks, t
   |  (x1,y1) and (x2,y2) are endpoints of the segment.
   |  numTicks is the number of congruence markes for the segment.
   |  t is a parameter, -1<=t<=1 draws the tick
   * ←—————————————————————————————————————————————————————————————————→ */
   cong:[{"id":"cong","latex":"c_{ong}\\left(x,y,x_{functionArg},y_{functionArg},\\theta ,t_{functionArg}\\right)=\\left(\\frac{x+x_{functionArg}}{2}+\\frac{x_{functionArg}-x}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\cdot \\frac{t_{ick}}{3}\\cdot \\left[-\\frac{\\theta -1}{2}...\\frac{\\theta -1}{2}\\right]+\\frac{y_{functionArg}-y}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\cdot t_{functionArg}\\cdot \\frac{t_{ick}}{2},\\frac{y+y_{functionArg}}{2}+\\frac{y_{functionArg}-y}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\frac{t_{ick}}{3}\\cdot \\left[-\\frac{\\theta -1}{2}...\\frac{\\theta -1}{2}\\right]+\\frac{x-x_{functionArg}}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\cdot \\frac{t_{functionArg}t_{ick}}{2}\\right)","hidden":"true"}],
  /* — parall —————————————————————————————————————————————————————————→ *\
   | parall: draws a parallel arrow marker
   |
   | !! REQUIRES: tick
   | !! REQUIRES: square grid
   |
   | @args: x1, y1, x2, y2, numTicks, t, angle
   |  (x1,y1) and (x2,y2) are endpoints of the segment.
   |  numTicks is the number of congruence markes for the segment.
   |  t is a parameter, -1<=t<=1 draws the tick
   |  angle is the angle the arrow"s sides should make with the line (recommend 15°)
   * ←—————————————————————————————————————————————————————————————————→ */
   parall:[{"id":"parall","latex":"p_{arall}\\left(x,y,x_{functionArg},y_{functionArg},\\theta ,t_{functionArg},\\theta_{functionArg}\\right)=\\left(\\frac{x+x_{functionArg}}{2}+\\frac{x_{functionArg}-x}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}t_{ick}\\cdot \\left(\\left(\\frac{1}{2}-\\left|t_{functionArg}\\right|\\right)\\cdot \\frac{\\cos \\theta_{functionArg}}{2}+\\left[-\\frac{\\theta -1}{2}...\\frac{\\theta -1}{2}\\right]\\right)+\\frac{y_{functionArg}-y}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\cdot t_{functionArg}\\cdot \\frac{t_{ick}\\sin \\theta_{functionArg}}{2},\\frac{y+y_{functionArg}}{2}+\\frac{y_{functionArg}-y}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}t_{ick}\\cdot \\left(\\left(\\frac{1}{2}-\\left|t_{functionArg}\\right|\\right)\\cdot \\frac{\\cos \\theta_{functionArg}}{2}+\\left[-\\frac{\\theta -1}{2}...\\frac{\\theta -1}{2}\\right]\\right)+\\frac{x-x_{functionArg}}{\\operatorname{distance}\\left(\\left(x,y\\right),\\left(x_{functionArg},y_{functionArg}\\right)\\right)}\\cdot t_{functionArg}\\frac{t_{ick}\\sin \\theta_{functionArg}}{2}\\right)","hidden":"true"}],
  /* — compassArcRadians ————————————————————————————————————————————→ *\
   | compassArcRadians: Angle for tracing a compass arc, including ticks on ends
   |
   | !! REQUIRES: tick
   | !! REQUIRES: degreeMode: false
   |
   | @Args: r, theta, t
   |  r is the length of the compass
   |  theta is the arc measure between endpoints
   |  t is the compass progress
   |
   | @Returns: angle measured from the first endpoint, between -tick/r and theta+tick/r
   * ←—————————————————————————————————————————————————————————————————→ */
   compassArcRadians:[{"id":"compassArcRadians","latex":"\\theta_{compR}\\left(x,\\theta ,y\\right)=y\\theta +\\left(2y-1\\right)\\max \\left(\\frac{\\pi }{6},\\frac{t_{ick}}{x}\\right)","hidden":"true"}],
  /* — compassArcDegrees ————————————————————————————————————————————→ *\
   | compassArcDegrees: Angle for tracing a compass arc, including ticks on ends
   |
   | !! REQUIRES: tick
   | !! REQUIRES: degreeMode: true
   |
   | @Args: r, theta, t
   |  r is the length of the compass
   |  theta is the arc measure between endpoints
   |  t is the compass progress
   |
   | @Returns: angle measured from the first endpoint
   * ←—————————————————————————————————————————————————————————————————→ */
   compassArcDegrees:[{"id":"compassArcDegrees","latex":"\\theta_{compD}\\left(x,\\theta ,y\\right)=y\\theta +\\left(2y-1\\right)\\max \\left(30,\\frac{180t_{ick}}{\\pi x}\\right)","hidden":"true"}],
  /* — rotCPTheta ———————————————————————————————————————————————————→ *\
   | rotCPTheta: Rotate a point a given angle around a given center
   |
   | @Args: center, point, theta
   |  center and point should be in Homogeneous coordinates
   |  theta is an angle to rotate
   |
   | @Returns: image of the rotated point in Homogeneous coordinates
   * ←—————————————————————————————————————————————————————————————————→ */
   rotCPTheta:[{"id":"rotCPTheta","latex":"P_{rot}\\left(x,y,\\theta \\right)=\\frac{x+\\left[\\operatorname{total}\\left(\\left(\\frac{yx\\left[3\\right]}{y\\left[3\\right]}-x\\right)\\cdot \\left[\\cos \\theta ,-\\sin \\theta ,0\\right]\\right),\\operatorname{total}\\left(\\left(\\frac{yx\\left[3\\right]}{y\\left[3\\right]}-x\\right)\\cdot \\left[\\sin \\theta ,\\cos \\theta ,0\\right]\\right),0\\right]}{x\\left[3\\right]}","hidden":"true"}],
  /* — polarFromXY ——————————————————————————————————————————————————→ *\
   | polarFromXY: For drawing points by polar reference from a point.
   |
   | @Args: x, y, r, theta
   |  (x,y) is a point in cartesian coordinates
   |  <r,theta> is a vector in polar form
   |
   | @Returns: a point that is the translation of (x,y) by <r,theta>
   * ←—————————————————————————————————————————————————————————————————→ */
   polarFromXY:[{"id":"polarFromXY","latex":"P_{xyrt}\\left(x,y,r_{functionArg},\\theta \\right)=\\left(x+r_{functionArg}\\cos \\theta ,y+r_{functionArg}\\sin \\theta \\right)","hidden":"true"}],
  /* — thetaXY ——————————————————————————————————————————————————————→ *\
   | thetaXY: Extracts the angle from a vector in cartesian coordinates
   |
   | @Args: x, y
   | @Returns: -180 < theta ≤ 180 (or -pi < theta ≤ pi) from the positive x-axis

   | #EXAMPLE: Find the angle of the vector <1,4>
   |  theta_1 = theta_xy(1,4)
   |
   | #TIP: Use theta_xy(x2-x1,y2-y1) to set a base angle for drawing an arc
   * ←—————————————————————————————————————————————————————————————————→ */
   thetaXY:[{"id":"thetaXY","latex":"\\theta_{xy}\\left(x,y\\right)=\\left\\{y=0:\\operatorname{arccos}\\left(0\\right)\\left(1-\\operatorname{sign}\\left(x\\right)\\right),\\operatorname{arccot}\\frac{x}{y}-\\operatorname{arccos}\\left(-1\\right)\\operatorname{round}\\left(\\frac{1-\\operatorname{sign}\\left(y\\right)}{2}\\right)\\right\\}","hidden":"true"}],
  /* — angleLVL ———————————————————————————————————————————————————————→ *\
   | angleLVL: measures an angle given by three points, with the vertex
   |           in the middle.
   |
   | @Args: point1, vertex, point2
   | @Returns: Unsigned angle, 0 <= theta <= pi (or 180)
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   angleLVL:[{id:"angleLVL",latex:"\\theta_{LVL}\\left(x,\\theta ,y\\right)=\\arccos \\left(\\frac{\\operatorname{distance}\\left(x,\\theta \\right)^2+\\operatorname{distance}\\left(y,\\theta \\right)^2-\\operatorname{distance}\\left(x,y\\right)^2}{2\\operatorname{distance}\\left(x,\\theta \\right)\\operatorname{distance}\\left(y,\\theta \\right)}\\right)"}],
  /* — angleTri ———————————————————————————————————————————————————————→ *\
   | angleTri: measures an angle given by three lengths using the law of
   |           cosines, with the length opposite the angle in the middle
   |
   | @Args: leg1, opposite, leg2
   | @Returns: Unsigned angle, 0 <= theta <= pi (or 180)
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   angleTri:[{id:"angleTri",latex:"\\theta_{tri}\\left(x,\\theta,y\\right)=\\arccos\\left(\\frac{x^2+y^2-\\theta^2}{2xy}\\right)"}],
  /* — rXY ——————————————————————————————————————————————————————————→ *\
   | rXY: Extracts the magnitude from a vector in cartesian coordinates
   |
   | @Args: x, y
   | @Returns: r, the magnitude of the vector <x,y>
   |
   | #EXAMPLE: Find the magnitude of the vector <1,4>
   |  r_1 = r_xy(1,4)
   |
   | #TIP: use distance((x1,y1),(x2,y2)) to find the distance between two points
   * ←—————————————————————————————————————————————————————————————————→ */
   rXY:[{"id":"rXY","latex":"r_{xy}\\left(x,y\\right)=\\sqrt{x^2+y^2}","hidden":"true"}],
  /* — linePP ———————————————————————————————————————————————————————→ *\
   | linePP: Returns standard coefficients of a line through two points
   |
   | !! REQUIRES: distancePP
   |
   | @Args: point1, point2
   |  points in Homogeneous coordinates, [X,Y,W]; [ax,ay,a]; or [x,y,1]
   | @Returns: Normalized [A,B,C] of Ax+By+C=0
   |
   | #EXAMPLE: draw a line through two points
   |  total([x,y,1]*U_through([x1,y1,1],[x2,y2,1]))=0
   |
   | #TIP: Compute signed distance with total([x0,y0,1]*line_PP(…))
   * ←—————————————————————————————————————————————————————————————————→ */
   linePP:[{"id":"linePP","latex":"U_{through}\\left(x,y\\right)=\\frac{\\left[y\\left[2\\right]-x\\left[2\\right],x\\left[1\\right]-y\\left[1\\right],y\\left[1\\right]x\\left[2\\right]-y\\left[2\\right]x\\left[1\\right]\\right]}{D_{pp}\\left(x,y\\right)}","hidden":"true"}],
  /* — linePerp ———————————————————————————————————————————————————————→ *\
   | linePerp: Returns standard coefficients of a line perpendicular
   |           to a line through a given point
   |
   | @Args: line, point
   |  point in homogeneous coordinates, [X,Y,W]; [ax,ay,a]; or [x,y,1]
   |  line in homogeneous coordinates, [a,b,c]
   | @Returns: Normalized [A,B,C] of Ax+By+C=0
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   linePerp:[{"id":"linePerp","latex":"U_{perp}\\left(x,y\\right)=\\left[x\\left[2\\right],-x\\left[1\\right],\\frac{-x\\left[2\\right]y\\left[1\\right]+x\\left[1\\right]y\\left[2\\right]}{y\\left[3\\right]}\\right]","hidden":"true"}],
  /* — distancePP —————————————————————————————————————————————————————→ *\
   | distancePP: Returns the distance between two points expressed in
   |             homogeneous coordinates
   |
   | @Args: point1, point2
   |  points in homogeneous coordinates, [X,Y,W]; [ax,ay,a]; or [x,y,1]
   | @Returns: distance between normalized points (W = 1)
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   distancePP:[{"id":"distancePP","latex":"D_{pp}\\left(x,y\\right)=\\sqrt{\\operatorname{total}\\left(\\left(\\frac{x}{x\\left[3\\right]}-\\frac{y}{y\\left[3\\right]}\\right)^2\\right)}","hidden":"true"}],
  /* — distancePL —————————————————————————————————————————————————————→ *\
   | distancePL: Returns the distance between two points expressed in
   |             homogeneous coordinates
   |
   | @Args: point, line
   |  point in homogeneous coordinates, [X,Y,W]; [ax,ay,a]; or [x,y,1]
   |  line in homogeneous coordinates, [a,b,c]
   | @Returns: distance between normalized point (W = 1) and line (a²+b²=1)
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   distancePL:[{"id":"distancePL","latex":"D_{pl}\\left(x,y\\right)=\\operatorname{total}\\left(\\frac{x}{x\\left[3\\right]}\\cdot \\frac{y}{\\sqrt{y\\left[1\\right]^2+y\\left[2\\right]^2}}\\right)","hidden":"true"}],
  /* — intersectLL ————————————————————————————————————————————————————→ *\
   | intersectLL: Returns the point of intersection between two lines in
   |              homogeneous coordinates
   |
   | @Args: line1, line2
   |  lines in homogeneous coordinates, [a,b,c]
   | @Returns: 
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   intersectLL:[{"id":"intersectLL","latex":"I_{ll}\\left(x,y\\right)=\\left[\\frac{x\\left[2\\right]y\\left[3\\right]-y\\left[2\\right]x\\left[3\\right]}{x\\left[1\\right]y\\left[2\\right]-y\\left[1\\right]x\\left[2\\right]},\\frac{y\\left[1\\right]x\\left[3\\right]-x\\left[1\\right]y\\left[3\\right]}{x\\left[1\\right]y\\left[2\\right]-y\\left[1\\right]x\\left[2\\right]},1\\right]","hidden":"true"}],
  /* — intersectCL ————————————————————————————————————————————————————→ *\
   | intersectLL: Returns the point of intersection between two lines in
   |              homogeneous coordinates
   |
   | @Args: circle, line, root
   |  circle in [x,y,r] with center (x,y)
   |  line in homogeneous coordinates, [a,b,c]
   |  root 1 uses the positive root and root −1 the negative root
   | @Returns: 
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   intersectCL:[{"id":"intersectCL","latex":"P_{cl}\\left(x,y,\\theta \\right)=\\left\\{D_{pl}\\left(\\left[x\\left[1\\right],x\\left[2\\right],1\\right],y\\right)\\le x\\left[3\\right]\\right\\}P_{rot}\\left(\\left[x\\left[1\\right],x\\left[2\\right],1\\right],\\left[x\\left[1\\right]+x\\left[3\\right],x\\left[2\\right],1\\right],\\operatorname{arccot}\\left(-\\frac{y\\left[2\\right]}{y\\left[1\\right]}\\right)+\\left\\{y\\left[1\\right]\\ge 0:90,-90\\right\\}+\\theta \\arccos \\left(\\frac{D_{pl}\\left(\\left[x\\left[1\\right],x\\left[2\\right],1\\right],y\\right)}{x\\left[3\\right]}\\right)\\right)","hidden":"true"}],
  /* — distanceCLP ————————————————————————————————————————————————————→ *\
   | intersectLL: Returns the distance between a point on a line and the
   |              point of intersection of that line with a circle
   |
   | @Args: circle, line, point, root
   |  circle in [x,y,r] with center (x,y) and radius r
   |  line in homogeneous coordinates, [a,b,c], MUST BE NORMALIZED
   |  point in homogeneous coordinates, [x,y,1], MUST BE NORMALIZED
   |  root 1 uses the positive root and root -1 the negative root
   | @Returns: 
   |
   | #EXAMPLE: P+T_{clp}(C,L,P,1)*[L[2],-L[1],0] gives the point of intersection
   |           of C with L, assuming P is a point on L
   * ←—————————————————————————————————————————————————————————————————→ */
   distanceCLP:[{"id":"distanceCLP","latex":"T_{clp}\\left(x,y,\\theta,n_{egRootFunctionArg}\\right)=y\\left[1\\right]\\left(\\theta\\left[2\\right]-x\\left[2\\right]\\right)-y\\left[2\\right]\\left(\\theta\\left[1\\right]-x\\left[1\\right]\\right)+n_{egRootFunctionArg}\\sqrt{x\\left[3\\right]^2-\\left(y\\left[1\\right]\\left(\\theta\\left[1\\right]-x\\left[1\\right]\\right)+y\\left[2\\right]\\left(\\theta\\left[2\\right]-x\\left[2\\right]\\right)\\right)^2}","hidden":"true"}],
  /* — reflectPL ——————————————————————————————————————————————————————→ *\
   | reflectPL: Reflects a given point across a given line
   |              homogeneous coordinates
   |
   | !! REQUIRES: intersectLL
   | !! REQUIRES: linePerp
   | !! REQUIRES: distancePL
   |
   | @Args: point, line
   |  point in homogeneous coordinates, [X,Y,W]; [ax,ay,a]; or [x,y,1]
   |  line in homogeneous coordinates, [a,b,c]
   | @Returns: Homogeneous coordinates
   |
   | #EXAMPLE: 
   * ←—————————————————————————————————————————————————————————————————→ */
   reflectPL:[{"id":"reflectPL","latex":"P_{reflPL}\\left(x,y\\right)=I_{ll}\\left(U_{perp}\\left(y,x\\right),y+\\left[0,0,D_{pl}\\left(x,y\\right)\\right]\\right)","hidden":"true"}]
 };

 window.addHelper = function(name,desmos) {
   desmos = desmos || window["calculator"] || window["Calc"];
   desmos.setExpressions(window.xs[name]);
 }

 function drawTriangle(desmos) {
   desmos = (desmos || window["calculator"] || window["Calc"]);
   desmos.setExpressions([
    {id:"vertexA",latex:"\\left(x_1,y_1\\right)"},
    {id:"vertexB",latex:"\\left(x_2,y_2\\right)"},
    {id:"vertexC",latex:"\\left(x_3,y_3\\right)"},
    {id:"sideA",latex:"\\left(x_2t+x_3\\left(1-t\\right),y_2t+y_3\\left(1-t\\right)\\right)"},
    {id:"sideB",latex:"\\left(x_1t+x_3\\left(1-t\\right),y_1t+y_3\\left(1-t\\right)\\right)"},
    {id:"sideC",latex:"\\left(x_1t+x_2\\left(1-t\\right),y_1t+y_2\\left(1-t\\right)\\right)"},
    {id:"x1",latex:"x_1=1"},
    {id:"y1",latex:"y_1=1"},
    {id:"x2",latex:"x_2=1"},
    {id:"y2",latex:"y_2=2"},
    {id:"x3",latex:"x_3=2"},
    {id:"y3",latex:"y_3=1"}
    ]);
 }

 var optimalRatio = function(p, larges, smalls) {
  smalls = (Array.isArray(smalls) && Array.from(smalls)) ||
    [1, 2, 3, 4, 5];
  larges = (Array.isArray(larges) && Array.from(larges)) ||
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30, 40, 50,
      100, 1000, 10000, 100000, 1000000, 1000000000, 1/0];

  if(p < 0 || p > 1) {
    throw new Error("Cannot calculate odds for probabilities outside [0,1].");
  }

  if(p === 0 || p === 1) {
    if(smalls.find(0)) {
      if(larges.find(Infinity)) {
        return {
          small: 0,
          large: Infinity,
          favor: (p === 1)
        };
      } else {
        return {
          small: 0,
          large: Math.min.apply(null,larges.filter(function(e){
            return e > 0;
          })),
          favor: (p === 1)
        };
      }
    } else if (larges.find(Infinity)) {
      return {
        small: Math.min.apply(null,smalls.filter(function(e){
          return e > 0;
        })),
        large: Infinity,
        favor: (p === 1)
      };
    } else {
      return {
        small: Math.min.apply(null,smalls.filter(function(e){
          return e > 0;
        })),
        large: Math.max.apply(null,larges),
        favor: (p === 1)
      };
    }
  }

  smalls = smalls.filter(function(e){
    return (e > 0 && e < Infinity);
  });
  var small = Math.min.apply(null,smalls);

  larges = larges.filter(function(e){
    return (e > small && e < Infinity);
  });
  var large = Math.max.apply(null,larges);

  if(small > large) {
    throw new Error("optimalOdds requires a smaller number less than " +
      "or equal to a large number");
  }

  var output = {};
  var x;

  if(p >= 0.5) {
    output.favor = true;
    x = 1 - p;
  } else {
    output.favor = false;
    x = p;
  }

  var error = Math.abs(x - small/(small + large));

  smalls.forEach(function(s){
    var l = large;
    var e = Math.abs(x - s/(s+l));
    larges.forEach(function(newLarge){
      if(s > newLarge) {
        return;
      }
      var newError = Math.abs(x - s/(s + newLarge));
      if(newError < e) {
        l = newLarge;
        e = newError;
      }
    });

    if(e < error || e === error && (l < large && s < small)) {
      small = s;
      large = l;
      error = e;
    }
  });

  output.small = small;
  output.large = large;

  return output;
};

var optimalOdds = function optimalOdds(p, smalls, larges) {
  var K = Math.min(p, 1-p);
  // Find the smallest small number in the ratio that is closest
  var small = Array.from(smalls).sort(function(a,b){
    var first = Array.from(larges).sort(function(c,d){
      if(Math.abs(a/(a+c) - K) < Math.abs(a/(a+d) - K)) {
        return -1;
      } else if (Math.abs(a/(a+c) - K) > Math.abs(a/(a+d) - K)) {
        return 1;
      } else if (c < d) {
        return -1;
      } else {
        return 1;
      }
    })[0];
    var second = Array.from(larges).sort(function(c,d){
      if(Math.abs(b/(b+c) - K) < Math.abs(b/(b+d) - K)) {
        return -1;
      } else if (Math.abs(b/(b+c) - K) > Math.abs(b/(b+d) - K)) {
        return 1;
      } else if (c < d) {
        return -1;
      } else {
        return 1;
      }
    })[0];
    if (Math.abs(a/(a+first) - K) < Math.abs(b/(b+second) - K)) {
      return -1;
    } else if (Math.abs(a/(a+first) - K) > Math.abs(b/(b+second) - K)) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 1;
    }
  })[0];

  var large = Array.from(larges).sort(function(a,b){
    if(Math.abs(small/(small+a) - K) < Math.abs(small/(small+b) - K)) {
      return -1;
    } else {
      return 1;
    }
  })[0];

  if(small/large < 1/3) {
    smalls.push(1);
  }

  return {
    first: large,
    second: small,
    favor: (K < p)
  };
};

var easePointList = function easePointList(currentX,currentY,targetX,targetY,t,dt,timeout,cb) {
  var x = targetX;
  var y = targetY;
  var X = currentX;
  var Y = currentY;
  if(t + dt >= 1) {
    X = x;
    Y = y;
  } else {
    var ddt = (Math.cos(Math.PI*t) - Math.cos(Math.PI*(t+dt))) / (Math.cos(Math.PI*t) + 1);
    X = X.map(function(e,i,a) {
      var result = e + (x[i] - e)*ddt;
      if ((result - x[i])*(e - x[i]) <= 0) {
        result = x[i];
      }
      return result;
    });
    Y = Y.map(function(e,i,a) {
      var result = e + (y[i] - e)*ddt;
      if ((result - y[i])*(e - y[i]) <= 0) {
        result = y[i];
      }
      return result;
    });
  }
  cb(X,Y,x,y,t,dt);
  if(t < 1) setTimeout(function(){
    easePointList(X,Y,x,y,t+dt,dt,timeout,cb);
  },timeout);
};

var ease2 = function ease(x,y,t,dt) {
  var X = window.X.listValue;
  var Y = window.Y.listValue;
  if(t + dt >= 1) {
    X = x;
    Y = y;
  } else {
    var ddt = (Math.cos(Math.PI*t) - Math.cos(Math.PI*(t+dt))) / (Math.cos(Math.PI*t) + 1);
    X = X.map(function(e,i,a) {
      var result = e + (x[i] - e)*ddt;
      if ((result - x[i])*(e - x[i]) <= 0) {
        result = x[i];
      }
      return result;
    });
    Y = Y.map(function(e,i,a) {
      var result = e + (y[i] - e)*ddt;
      if ((result - y[i])*(e - y[i]) <= 0) {
        result = y[i];
      }
      return result;
    });
  }

  var exprs = [];

  X.forEach(function(e,i,a) {
    exprs.push({
      id:'u_'+i,
      latex:'u_'+i+'='+e
    });
    exprs.push({
      id:'v_'+i,
      latex:'v_'+i+'='+Y[i]
    });
  });

  Calc.setExpressions(exprs);

  if(t < 1) setTimeout(function(){ease2(x,y,t+dt,dt);},200);
};


      /* ←— A0633977 generate —————————————————————————————————————————————————→ *\
       | For generating points iteratively, so it looks more like a progressive
       |  sampling process, than just everything showing up at once
       * ←————————————————————————————————————————————————————————————————→ */
       window.fs = window.fs || {};
       var fs = fs || {};
       fs.A0633977 = fs.A0633977 || {};
      fs.A0633977.generate = fs.A0633977.generate || function() {
        var o = hs.parseArgs(arguments);
        var vars = vs[o.uniqueId];
        var hlps = hxs[o.uniqueId];
      
        // Adds an element to a random bucket
        function anotherHeight(n,y) {
          var sum = 0;
          y.forEach(function(e){
            sum+=e;
          });

          var i;
          for(i = sum; i <= Math.min(n-1,Math.ceil(1.2*sum)); i++) {
            y[Math.floor(Math.random()*12)] += 1;
          }
          o.desmos.setExpressions([{id:'y_1',latex:'y_1=['+y+']'}]);
          if(i < n) setTimeout(function(){
            anotherHeight(n,y);
          },500);
        }
        
        // Places a dot in a random place in [0,1]×[0,1]
        function anotherElement(k,n,x,y) {
          while(x.length < Math.min(n,1.2*k)) {
            x.push(Math.random());
            y.push(Math.random());
          }
          o.desmos.setExpressions([{id:'x_1',latex:'x_1=['+x+']'},{id:'y_1',latex:'y_1=['+y+']'}]);
          if(k < n) setTimeout(function(){
            anotherElement(x.length,n,x,y);
          },500);
        }
       };

var stats2D = function(x,y){
  var total = function(x) {
    return x.reduce(function(acc,val) {
      return acc + val;
    }, 0);
  }
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
};

var splat = function(a,b,opts) {
  opts = mergeObjects({
    n:10,
    xMin:0,
    xMax:10,
    yMin:0,
    yMax:10,
    xJitter:1,
    yJitter:1,
    strict:false
  },opts);

  var n = opts.n;
  var xMin = opts.xMin;
  var xMax = opts.xMax;
  var yMin = opts.yMin;
  var yMax = opts.yMax;
  var yJitter = opts.yJitter;
  var xJitter = opts.xJitter;
  var strict = opts.strict;

  yMin = Math.max(yMin, a * ((a >= 0) ? xMin : xMax) + b - yJitter);
  yMax = Math.min(yMax, a * ((a >= 0) ? xMax : xMin) + b + yJitter);

  xMin = Math.max(xMin, (((a >= 0) ? yMin - yJitter : yMax + yJitter) - b) / a);
  xMax = Math.min(xMax, (((a >= 0) ? yMax + yJitter : yMin - yJitter) - b) / a);

  console.log('X: ['+xMin+', '+xMax+'], Y: ['+yMin+', '+yMax+']');

  var xs = [];
  var ys = [];

  if ((xMin > xMax) || (yMin > yMax)) {
    throw new Error('No values available within given range.');
  }

  var x;
  var y;
  var yUpper;
  var yLower;
  var xBase;
  var xLower;
  var xUpper;
  var dir;
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