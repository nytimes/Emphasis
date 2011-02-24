/*  --------------------------------------------------

    Emphasis
    by Michael Donohoe (@donohoe)
    https://github.com/NYTimes/Emphasis
    http://open.blogs.nytimes.com/2011/01/10/emphasis-update-and-source/

    (Modified 1/13/11 by BB to rely on jQuery library rather than prototype) 
	
    - - - - - - - - - -

    Copyright (C) 2011 The New York Times (http://www.nytimes.com)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    -------------------------------------------------- */
 
(function(){var j={init:function(){this.config();this.vu=this.s=this.h=this.p=this.pl=false;this.kh="|";this.addCSS();this.readHash();$(document).keydown(function(a){j.keydown(a)})},config:function(){this.paraSelctors=$("p");this.classReady="emReady";this.classActive="emActive";this.classHighlight="emHighlight";this.classInfo="emInfo";this.classAnchor="emAnchor";this.classActiveAnchor="emActiveAnchor"},addCSS:function(){var a=document.createElement("style");a.innerHTML="p."+this.classActive+" span { background-color:#f2f4f5; } p span."+
this.classHighlight+" { background-color:#fff0b3; } span."+this.classInfo+" { position:absolute; margin:-1px 0px 0px -8px; padding:0; font-size:10px; background-color: transparent !important} span."+this.classInfo+" a { text-decoration: none; } a."+this.classActiveAnchor+" { color: #000; font-size: 11px; }";document.getElementsByTagName("head")[0].appendChild(a)},readHash:function(){var a=decodeURI(location.hash),b=false,c=[],d={};if(a.indexOf("[")<0&&a.indexOf("]")<0){var e,f=/[ph][0-9]+|s[0-9,]+|[0-9]/g;
if(a)for(;(e=f.exec(a))!==null;){var g=e[0].substring(0,1);e=e[0].substring(1);if(g=="p")b=parseInt(e);else if(g=="h")c.push(parseInt(e));else{e=e.split(",");for(g=0;g<e.length;g++)e[g]=parseInt(e[g]);d[c[c.length-1]]=e}}}else{b=a.match(/p\[([^[\]]*)\]/);g=a.match(/h\[([^[\]]*)\]/);b=b&&b.length>0?b[1]:false;if(a=g&&g.length>0?g[1]:false){a=a.match(/[a-zA-Z]+(,[0-9]+)*/g);for(g=0;g<a.length;g++){e=a[g].split(",");f=this.findKey(e[0]).index;if(f!=void 0){c.push(parseInt(f)+1);e=e;e.shift();if(e.length>
0)for(f=1;f<e.length;f++)e[f]=parseInt(e[f]);d[c[c.length-1]]=e}}}}this.p=b;this.h=c;this.s=d;this.goAnchor(b);this.goHighlight(c,d)},keydown:function(a){var b=j;b.kh=b.kh+a.keyCode+"|";if(b.kh.indexOf("|16|16|")>-1){b.vu=b.vu?false:true;b.paragraphInfo(b.vu)}setTimeout(function(){b.kh="|"},500)},paragraphList:function(){if(this.pl)return this.pl;for(var a=[],b=[],c=0,d=this.paraSelctors.length,e=0;e<d;e++){var f=this.paraSelctors[e];if((f.innerText||f.textContent||"").length>0){var g=this.createKey(f);
a.push(f);b.push(g);f.setAttribute("data-key",g);f.setAttribute("data-num",c);$(f).click(function(h){j.paragraphClick(h)});c++}}return this.pl={list:a,keys:b}},paragraphClick:function(a){if(this.vu){var b=false,c=a.currentTarget.nodeName=="P"?a.currentTarget:false,d=a.target.nodeName=="SPAN"?a.target:false,e=a.target.nodeName=="A"?a.target:false;if(e)if(!$(e).hasClass(this.classActiveAnchor)){this.updateAnchor(e);b=true;a.preventDefault()}if(!c&&!d)this.removeAllClasses("p",this.classActive);else{if($(c).hasClass(this.classReady))if(!$(c).hasClass(this.classActive)&&
d&&!$(d).hasClass(this.classHighlight)){this.removeAllClasses("p",this.classActive);$(c).addClass(this.classActive)}else{if(!$(c).hasClass(this.classActive)){this.removeAllClasses("p",this.classActive);$(c).addClass(this.classActive)}if(d){$(d).toggleClass(this.classHighlight);b=true}}else{b=this.getSentences(c);a=b.length;for(d=0;d<a;d++)b[d]="<span data-num='"+(d+1)+"'>"+this.rtrim(b[d])+"</span>";b=b.join(". ").replace(/__DOT__/g,".").replace(/<\/span>\./g,".</span>");if("|8221|63|46|41|39|37|34|33|".indexOf(b.substring(b.length-
8).charCodeAt(0))==-1)b+=".";c.innerHTML=b;c.setAttribute("data-sentences",a);this.removeAllClasses("p",this.classActive);$(c).addClass(this.classActive);$(c).addClass(this.classReady);b=true}b&&this.updateURLHash()}}},paragraphInfo:function(a){if(a){if(!($("span."+this.classInfo)[0]?true:false)){var b=this.paragraphList();a=b.list.length;for(var c=0;c<a;c++){var d=b.list[c]||false;if(d){var e=b.keys[c];d.innerHTML="<span class='"+this.classInfo+"'><a class='"+this.classAnchor+(e==this.p?" "+this.classActiveAnchor:
"")+"' href='#p["+e+"]' data-key='"+e+"' title='Link to "+this.ordinal(c+1)+" paragraph'>&para;</a></span>"+d.innerHTML}}}}else{b=document.body.select("span."+this.classInfo);a=b.length;for(c=0;c<a;c++)b[c].remove();this.removeAllClasses(this.classActive)}},updateAnchor:function(a){this.p=a.getAttribute("data-key");this.removeAllClasses("a",this.classActiveAnchor);$(a).addClass(this.classActiveAnchor)},updateURLHash:function(){for(var a="h[",b=$("p.emReady"),c=b.length,d=0;d<c;d++){var e=b[d].getAttribute("data-key");
if($(b[d]).hasClass(this.classHighlight))a+=","+e;else{var f=$(b[d]).children("span."+this.classHighlight),g=f.length,h=b[d].getAttribute("data-sentences");if(g>0)a+=","+e;if(h!=g)for(e=0;e<g;e++)a+=","+f[e].getAttribute("data-num")}}a=((this.p?"p["+this.p+"],":"")+(a.replace("h[,","h[")+"]")).replace(",h[]","");location.hash=a},createKey:function(a){var b="";if((a=(a.innerText||a.textContent||"").replace(/[^a-z\. ]+/gi,""))&&a.length>1){var c=this.getSentences(a);if(c.length>0){a=this.cleanArray(c[0].replace(/[\s\s]+/gi,
" ").split(" ")).slice(0,3);c=this.cleanArray(c[c.length-1].replace(/[\s\s]+/gi," ").split(" ")).slice(0,3);a=a.concat(c);c=a.length>6?6:a.length;for(var d=0;d<c;d++)b+=a[d].substring(0,1)}}return b},findKey:function(a){for(var b=this.paragraphList(),c=b.keys.length,d=false,e=false,f=0;f<c;f++)if(a==b.keys[f])return{index:f,elm:b.list[f]};else if(!d){var g=this.lev(a.slice(0,3),b.keys[f].slice(0,3)),h=this.lev(a.slice(-3),b.keys[f].slice(-3));if(g+h<3){d=f;e=b.list[f]}}return{index:d,elm:e}},goAnchor:function(a){if(a){var b=
isNaN(a)?this.findKey(a).elm:this.paragraphList().list[a-1]||false;b&&setTimeout(function(){$.scrollTo(b)},500)}},goHighlight:function(a,b){if(a)for(var c=a.length,d=0;d<c;d++){var e=this.paragraphList().list[a[d]-1]||false;if(e){for(var f=b[a[d].toString()]||false,g=!f||f.length==0,h=this.getSentences(e),l=h.length,i=0;i<l;i++){var k=g?i:f[i]-1;h[i]="<span data-num='"+(i+1)+"'>"+h[i]+"</span>"}for(i=0;i<l;i++){k=g?i:f[i]-1;if(h[k])h[k]=h[k].replace("<span","<span class='"+this.classHighlight+"'")}e.setAttribute("data-sentences",
l);e.innerHTML=h.join(". ").replace(/__DOT__/g,".").replace(/<\/span>\./g,".</span>");$(e).addClass("emReady")}}},getSentences:function(a){a=typeof a=="string"?a:a.innerHTML;for(var b="A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St,Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR,0,1,2,3,4,5,6,7,8,9,www".split(","),
c=b.length,d=0;d<c;d++)a=a.replace(RegExp(" "+b[d]+"\\.","g")," "+b[d]+"__DOT__");b="Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr,0,1,2,3,4,5,6,7,8,9".split(",");c=b.length;for(d=0;d<c;d++)a=a.replace(RegExp(b[d]+"\\.","g"),b[d]+"__DOT__");b="aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx".split(",");c=b.length;for(d=0;d<c;d++)a=a.replace(RegExp("\\."+b[d],"g"),"__DOT__"+b[d]);return this.cleanArray(a.split(". "))},
ordinal:function(a){var b=["th","st","nd","rd"],c=a%100;return a+(b[(c-20)%10]||b[c]||b[0])},lev:function(a,b){var c=a.length,d=b.length,e=[];e[0]=[];if(c<d){var f=a;a=b;b=f;f=c;c=d;d=f}for(f=0;f<d+1;f++)e[0][f]=f;for(f=1;f<c+1;f++){e[f]=[];e[f][0]=f;for(var g=1;g<d+1;g++)e[f][g]=this.smallest(e[f-1][g]+1,e[f][g-1]+1,e[f-1][g-1]+(a.charAt(f-1)==b.charAt(g-1)?0:1))}return e[c][d]},smallest:function(a,b,c){if(a<b&&a<c)return a;if(b<a&&b<c)return b;return c},rtrim:function(a){return a.replace(/\s+$/,
"")},cleanArray:function(a){for(var b=[],c=0;c<a.length;c++)a[c]&&a[c].replace(/ /g,"").length>0&&b.push(a[c]);return b},removeAllClasses:function(a,b){if(b&&a)for(var c=$(a+"."+b),d=0;d<c.length;d++)$(c[d]).removeClass(b)}};jQuery(document).ready(function(){j.init()})})();

/**
 * jQuery.ScrollTo
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Works with jQuery +1.2.6. Tested on FF 2/3, IE 6/7/8, Opera 9.5/6, Safari 3, Chrome 1 on WinXP.
 *
 * @author Ariel Flesler
 * @version 1.4.2
*/
(function(c){function o(b){return typeof b=="object"?b:{top:b,left:b}}var m=c.scrollTo=function(b,g,a){c(window).scrollTo(b,g,a)};m.defaults={axis:"xy",duration:parseFloat(c.fn.jquery)>=1.3?0:1};m.window=function(){return c(window)._scrollable()};c.fn._scrollable=function(){return this.map(function(){if(!(!this.nodeName||c.inArray(this.nodeName.toLowerCase(),["iframe","#document","html","body"])!=-1))return this;var b=(this.contentWindow||this).document||this.ownerDocument||this;return c.browser.safari||
b.compatMode=="BackCompat"?b.body:b.documentElement})};c.fn.scrollTo=function(b,g,a){if(typeof g=="object"){a=g;g=0}if(typeof a=="function")a={onAfter:a};if(b=="max")b=9E9;a=c.extend({},m.defaults,a);g=g||a.speed||a.duration;a.queue=a.queue&&a.axis.length>1;if(a.queue)g/=2;a.offset=o(a.offset);a.over=o(a.over);return this._scrollable().each(function(){function i(n){j.animate(e,g,a.easing,n&&function(){n.call(this,b,a)})}var k=this,j=c(k),d=b,p,e={},t=j.is("html,body");switch(typeof d){case "number":case "string":if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(d)){d=
o(d);break}d=c(d,this);case "object":if(d.is||d.style)p=(d=c(d)).offset()}c.each(a.axis.split(""),function(n,q){var h=q=="x"?"Left":"Top",l=h.toLowerCase(),f="scroll"+h,r=k[f],s=m.max(k,q);if(p){e[f]=p[l]+(t?0:r-j.offset()[l]);if(a.margin){e[f]-=parseInt(d.css("margin"+h))||0;e[f]-=parseInt(d.css("border"+h+"Width"))||0}e[f]+=a.offset[l]||0;if(a.over[l])e[f]+=d[q=="x"?"width":"height"]()*a.over[l]}else{h=d[l];e[f]=h.slice&&h.slice(-1)=="%"?parseFloat(h)/100*s:h}if(/^\d+$/.test(e[f]))e[f]=e[f]<=0?
0:Math.min(e[f],s);if(!n&&a.queue){r!=e[f]&&i(a.onAfterFirst);delete e[f]}});i(a.onAfter)}).end()};m.max=function(b,g){var a=g=="x"?"Width":"Height",i="scroll"+a;if(!c(b).is("html,body"))return b[i]-c(b)[a.toLowerCase()]();a="client"+a;var k=b.ownerDocument.documentElement,j=b.ownerDocument.body;return Math.max(k[i],j[i])-Math.min(k[a],j[a])}})(jQuery);
