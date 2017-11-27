window.PearsonGL=window.PearsonGL||{},window.PearsonGL.External=window.PearsonGL.External||{},PearsonGL.External.rootJS=function(){'use strict';var f,b={},c={common:{}},e={};return f={flattenFuncStruct:function(g,h){h=h||'';var q,t,m={},p=Object.keys(g),s=p.length;for(q=0;q<s;q+=1)if(t=g[p[q]],'object'==typeof t){if(!Object.assign(m,f.flattenFuncStruct(t,h+p[q]+'_')))return!1;}else if('function'==typeof t)m[h+p[q]]=t;else return console.log(h+p[q]+' is not a function or object'),!1;return m},reportDCJSError:function(g){window['widget_'+g.uniqueId]=g.desmos;var m,h={id:g.uniqueId,state:g.desmos.getState(),variables:c[g.uniqueId],helpers:e[g.uniqueId],screenshot:g.desmos.screenshot()};for(m=1;m<arguments.length;m+=1)h['arguments['+m+']']=arguments[m];var p=document.createElement('a');p.setAttribute('href','data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(h,null,'\t'))),p.setAttribute('download','Widget Error Report '+new Date().toISOString()+'.json'),p.style.display='none',document.body.appendChild(p),p.click(),document.body.removeChild(p)},parseArgs:function(){var g=Array.from(arguments);if(1>g.length)throw new Error('DCJS cannot parse empty argument list.');var h={log:console.log};if('object'==typeof g[0])Object.assign(h,g[0]);else if('number'==typeof g[0])h.value=g[0];else throw h.log(g),new Error('DCJS received non-standard arguments.');return void 0===h.desmos&&(h.desmos=g[2]||window.calculator||window.Calc),void 0===h.name&&(h.name=g[1]||''),void 0===h.value&&(h.value=NaN),void 0===h.uniqueId&&(h.uniqueId=h.desmos.guid),void 0===window.widget&&h.log===console.log&&(window.reportDesmosError=this.reportDCJSerror),c[h.uniqueId]=c[h.uniqueId]||{},e[h.uniqueId]=e[h.uniqueId]||{},h},eval:function(g,h,m){var p=f.parseArgs(h),q=p.desmos,s=e[p.uniqueId],t=s[g];if(void 0===t&&(t=s[g]=q.HelperExpression({latex:g})),void 0!==t.numericValue)m(t.numericValue);else if(void 0!==t.listValue)m(t.listValue);else{var u=Date.now(),v=function(z,A){isNaN(A[z])||void 0===A[z]||(A.unobserve('numericValue.'+u),A.unobserve('listValue.'+u),m(A[z]))};t.observe('numericValue.'+u,v),t.observe('listValue.'+u,v)}}},function(){function z(N){return new PearsonGL.Parameters.Parameter(parseInt(N.value),'single','integer')}b.textOnSVG_V1=function(N,O,P,Q,R,S,T){N=N.value,O=O.value,P=P.value,Q=Q.value,R=R.value,S=S.value,T=T.value;var U='';U+={createLabel:function(X,Y,Z,$){return'<text class="svg-text-on-table" x="'+X+'" y="'+Y+'" style="'+$+'">'+Z+'</text>'}}.createLabel(P,Q,R,S);var W='<svg style="'+T+'" width="'+N+'" height="'+O+'">'+U+'</svg>';return new PearsonGL.Parameters.Parameter(W,'single','string')},b.getUniqueRandom=function(N,O){N=N.value,O=O.value;var P,Q,R,S,T,U,V;if(-1!=(N+'').indexOf('|')){for(Q=(N+'').split('|'),R=+Q[0],S=+Q[1],T=[],P=R;P<=S;P++)T.push(P);N=T}if(-1!=(N+'').indexOf('::')){for(Q=(N+'').split('::'),R=+Q[0],S=+Q[1],T=[],P=R;P<=S;P++)T.push(P);N=T}for(P=N.length-1;0<=P;P--)U=Math.floor(Math.random()*(P+1)),V=N[U],N[U]=N[P],N[P]=V;var W=N,X=[];for(P=0;P<O;P++)X.push(W[P]);return'number'==typeof N[0]?new PearsonGL.Parameters.Parameter(X,'ordered','integer'):'string'==typeof N[0]?new PearsonGL.Parameters.Parameter(X,'ordered','string'):void 0},b.FractionReduce=function(N,O){for(var P=N<O?N:O,Q=N<O?O:N,R=P,S=P,T=[];S=R,R=Q%P,0!==R;)Q=P,P=R;if(S)return T.push(N/S),T.push(O/S),new PearsonGL.Parameters.Parameter(T,'ordered','integer')},b.decimalToFraction=function(N){var O='',P=(N+'').split('.'),Q=P[0],R=P[1],T=Math.pow(10,R.length);return O=Q+R+'/'+T,new PearsonGL.Parameters.Parameter(O,'single','string')},b.splitNumaratorDeno=function(N){var P=N.toString().split('/');return new PearsonGL.Parameters.Parameter(P,'ordered','string')},b.parseStrToInt=z,b.arrayFilter=function(N,O){N=N.value,O=O.value;var P=N.filter(function(Q){return-1==O.indexOf(Q)});return new PearsonGL.Parameters.Parameter(P,'ordered','integer')},b.sqrt=function(N){var O=Math.sqrt(N.value);return new PearsonGL.Parameters.Parameter(O,'single','float')},b.parseStrToInt=z,b.getUniqueRandomFloat=function(N,O,P,Q){N=N.value,O=O.value,P=P.value,Q=Q.value;var R,S,T;if(-1!==(N+'').indexOf('::')){var U=(N+'').split('::'),V=+U[0],W=+U[1],X=[];for(R=V;R<=W;R+=P)X.push(R);N=X}for(R=N.length-1;0<=R;R--)S=Math.floor(Math.random()*(R+1)),T=N[S],N[S]=N[R],N[R]=T;var Y=N,Z=[];for(R=0;R<O;R++)Z.push(+Y[R].toFixed(Q));if('number'==typeof N[0])return new PearsonGL.Parameters.Parameter(Z,'ordered','float')},b.getPlaceValue=function(N,O){var P=(N+'').length,Q=parseInt((N+'').charAt(P-O));return new PearsonGL.Parameters.Parameter(Q,'single','integer')},b.isSquare=function(N){var O=0<N.value&&0==Math.sqrt(N.value)%1;return new PearsonGL.Parameters.Parameter(O,'single','boolean')},b.createNumberLine_A0495260=function(N,O,P,Q,R){N=N.value,O=O.value,P=P.value,Q=Q.value,R=R.value;var V,S='',T=0,U=N-2*T,W=N-18.67,X={createLine:function(ea,fa,ga,ha,ia,ja){return'<line x1="'+ea+'" y1="'+fa+'" x2="'+ga+'" y2="'+ha+'" stroke="'+ia+'" stroke-width="'+ja+'"/>'},createCircle:function(ea,fa,ga){return'<circle cx="'+ea+'" cy="'+fa+'" r="'+ga+'" fill="#0092C8"/>'},createLabel:function(ea,fa,ga,ha){return'<text x="'+ea+'" y="'+fa+'" font-style="'+ha+'" font-size="12"  style="font-size:18px;">'+ga+'</text>'}};V=Math.abs(O)+Math.abs(P),S+='<polygon points="22.667,17 11.77,22.084 0,24.998 11.77,27.912 22.667,32.994 18.831,24.998"/>',S+=X.createLine(T,25,U+T,25,'rgb(0,0,0)',2);var aa,Y=10,Z=U/(Y+2),$=Z,_=[Z];for(aa=0;aa<Y+1;aa++)S+=X.createLine($,15,$,35,'rgb(0,0,0)',1),S+=0===aa?X.createLabel($-7,55,O,'normal'):aa==Y?X.createLabel($-7,55,parseInt(O+R),'normal'):X.createLabel($-14,55,O.toFixed(1),'normal'),O+=R,$+=Z,_.push($);var ba,ca;for(ba=0;ba<Q.length;ba++)ca=0.1*+Q[ba].toFixed(2).substring(2,4),console.log('number1:: ',ca,typeof ca),S+=Q[ba]==P?X.createCircle(11*Z,25,7):X.createCircle(Z*(ca+1),25,7);S+='<polygon points="'+W+' 32.79,'+(W+10.9)+' 27.71,'+(W+22.67)+' 24.80,'+(W+10.9)+' 22.88,'+W+' 16.80,'+(W+3.84)+' 24.80,'+W+' 32.79"/>';var da='<svg width="'+N+'" height="80">'+S+'</svg>';return new PearsonGL.Parameters.Parameter(da,'single','string')},b.StrToFloat=function(N){var O=+N.value;return new PearsonGL.Parameters.Parameter(O,'single','float')},b.getStrLength=function(N){return new PearsonGL.Parameters.Parameter((N+'').length,'single','integer')},b.numberWithCommas=function(N){N=N.toString(),N+='';for(var O=/(-?\d+)(\d{3})/;O.test(N);)N=(N+'').replace(O,'$1,$2');return new PearsonGL.Parameters.Parameter(N,'single','string')},b.addzeroafter=function(N,O){var R,P=N+'',Q='';for(R=0;R<O;R++)Q+=P[R]?P[R]:'0';return new PearsonGL.Parameters.Parameter(Q,'single','string')},b.addTrailFixZero=function(N,O){N=N.value,O=O.value;var P;return P=N.toFixed(O),new PearsonGL.Parameters.Parameter(P,'single','string')},b.strToFloat=function(N){var O=parseFloat(N.value);return new PearsonGL.Parameters.Parameter(O,'single','float')},b.isInteger=function(N){var O=+N.value;return O===parseInt(O,10)?new PearsonGL.Parameters.Parameter(!0,'single','boolean'):new PearsonGL.Parameters.Parameter(!1,'single','boolean')},b.arrToStrRand=function(N,O){N=N.value;var T,U,P=0,Q=0,R=[],S='';for(T=0;T<O;T++)U=N[Math.floor(Math.random()*N.length)],S+=''==S?U:', '+U,'H'==U?P++:Q++;return R[0]=S,R[1]=P,R[2]=Q,new PearsonGL.Parameters.Parameter(R,'ordered','string')},b.arrayShuffle=function(N){N=N.value;for(var P,Q,O=N.length;0!==O;)Q=Math.floor(Math.random()*O),O-=1,P=N[O],N[O]=N[Q],N[Q]=P;return new PearsonGL.Parameters.Parameter(N,'ordered','integer')},b.arrayToStr=function(N){var O;return N=N.value,O=N.join(', '),new PearsonGL.Parameters.Parameter(O,'single','string')},b.strletterRand=function(N,O){var W,P=[],Q='',R='',S='ABCDEFGHIJKLMNOPQRSTUVWXYZ',T='',U='',V=N/2;for(V=V===parseInt(V,10)?parseInt(V):parseInt(V)+1,Q=S.charAt(Math.floor(Math.random()*S.length)),W=0;W<O;W++)R+=Q;for(W=0;W<N-O;W++)T=S.charAt(Math.floor(Math.random()*S.length)),T==Q?W--:R+=T;var X=R.split('');N=X.length;var Y,Z;for(W=N-1;0<W;W--)Y=Math.floor(Math.random()*(W+1)),Z=X[W],X[W]=X[Y],X[Y]=Z;U=X.join(''),U=U.split('').sort(function(){return 0.5-Math.random()}).join('');var $=U.slice(0,V),_=U.slice(V,U.length);P[0]=Q,P[1]=U,P[2]=$,P[3]=_;var aa=U.lastIndexOf(Q),ba=U.substring(0,aa)+U.substring(aa+1);aa=ba.lastIndexOf(Q);var ca=ba.substring(0,aa)+ba.substring(aa+1);return P[4]=ba,P[5]=ca,new PearsonGL.Parameters.Parameter(P,'ordered','string')}}(),console.log('Root CJS loaded'),b}();