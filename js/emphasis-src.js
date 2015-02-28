/*	--------------------------------------------------

	Emphasis
	by Michael Donohoe (@donohoe)
	https://github.com/NYTimes/Emphasis
	http://open.blogs.nytimes.com/2011/01/10/emphasis-update-and-source/

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

(function() {
	
	var Emphasis = {
		init: function() {
			this.config();
			this.pl = false; // Paragraph List
			this.p	= false; // Paragraph Anchor
			this.h	= false; // Highlighted paragraphs
			this.s	= false; // Highlighted sentences
			this.vu = false; // Are paragraph links visible or not
			this.kh = "|";

			this.addCSS();
			this.readHash();

			document.addEventListener ("keydown", this.keydown);
		},

		config: function() {
		/*
			Eligible Paragraphs
			This uses some common markup for plain and simple paragraphs - those that are not empty, no classes.
			We use PrototypeJS for its css selector awesomeness, but your needs might be simpler (getElementsByTagName('p') etc.)
		*/
			this.paraSelctors	   = document.querySelectorAll('#article-content p');

		//	Class names
			this.classReady		   = "emReady";
			this.classActive	   = "emActive";
			this.classHighlight	   = "emHighlight";
			this.classInfo		   = "emInfo";
			this.classAnchor	   = "emAnchor";
			this.classActiveAnchor = "emActiveAnchor";
		},

		addCSS: function() {
		/*	Inject the minimum styles rules required */
			var st = document.createElement('style');
			st.setAttribute('type', 'text/css');
			/* for validation goodness */
			var stStr = 'p.' + this.classActive + ' span { background-color:#f2f4f5; } p span.' + this.classHighlight + ' { background-color:#fff0b3; } span.' + this.classInfo + ' { position:absolute; margin:-1px 0px 0px -8px; padding:0; font-size:10px; background-color: transparent !important} span.' + this.classInfo + ' a { text-decoration: none; } a.' + this.classActiveAnchor + ' { color: #000; font-size: 11px; }';
			try {
			/* try the sensible way */
				st.innerHTML = stStr;
			} catch(e) {
			/* IE's way */
				st.styleSheet.cssText = stStr;
			}
			document.getElementsByTagName("head")[0].appendChild(st);
		},

		readHash: function() {
		/*	Read and interpret the URL hash */
			var lh = decodeURI(location.hash),
				p = false,
				h = [],
				s = {},
				a, re, f, r, i, findp, findh, undef, hi, key, pos, b, j;

			if (lh.indexOf('[')<0 && lh.indexOf(']')<0) {
			/*	Version 1 Legacy support
				#p20h4s2,6,10,h6s5,1 -> p = 20, h = [ 4, 6 ], s = { "4": [ 2, 6, 10 ] , "6": [ 5, 1 ] }
			*/
				re = /[ph][0-9]+|s[0-9,]+|[0-9]/g;
				if (lh) {
					while ((a = re.exec(lh)) !== null) {
						f = a[0].substring(0, 1);
						r = a[0].substring(1);
						if (f === 'p') {
							p = parseInt(r, 10);
						} else if (f === 'h') {
							h.push(parseInt(r, 10));
						} else {
							a = r.split(',');
							for (i = 0; i < a.length; i++) {
								a[i] = parseInt(a[i], 10);
							}
							s[h[h.length - 1]] = a;
						}
					}
				}
			} else {
			/*	Version 2
				#h[tbsaoa,Sstaoo,2,4],p[FWaadw] -> p = "FWaadw", h = [ "tbsaoa", "Sstaoo" ], s = { "Sstaoo" : [ 2, 4 ] }
			*/
				findp = lh.match(/p\[([^[\]]*)\]/);
				findh = lh.match(/h\[([^[\]]*)\]/);

				p  = (findp && findp.length>0) ? findp[1] : false;
				hi = (findh && findh.length>0) ? findh[1] : false;

				if (hi) {
					hi = hi.match(/[a-zA-Z]+(,[0-9]+)*/g);
					for (i = 0; i < hi.length; i++) {
						a	= hi[i].split(',');
						key = a[0];
						pos = this.findKey(key).index;

						if (pos !== undef) {
							h.push(parseInt(pos, 10)+1);
							b = a;
							b.shift();
							if (b.length>0) {
								for (j=1; j<b.length; j++) {
									b[j] = parseInt(b[j], 10);
								}
							}
							s[h[h.length - 1]] = b;
						}
					}
				}
			}

			this.p = p; this.h = h; this.s = s;
			this.goAnchor(p);
			this.goHighlight(h, s);
		},

		keydown: function(e){
		/*	Look for double-shift keypress */
			var self = Emphasis,
				kc = e.keyCode;
		
			self.kh	 = self.kh + kc + '|';
			if (self.kh.indexOf('|16|16|')>-1) {
				self.vu = (self.vu) ? false : true;
				self.paragraphInfo(self.vu);
			}
			setTimeout(function(){ self.kh = '|'; }, 500);
		},

		paragraphList: function() {
		/*	Build a list of Paragrphs, keys, and add meta-data to each Paragraph in DOM, saves list for later re-use */
			if (this.pl && this.pl.list.length > 0) {
				return this.pl;
			}
			var instance = this,
				list = [],
				keys = [],
				c	 = 0,
				len	 = this.paraSelctors.length,
				p, pr, k;

			for (p=0; p<len; p++) {
				pr = this.paraSelctors[p];
				if ((pr.innerText || pr.textContent || "").length > 0) {
					k = instance.createKey(pr);
					list.push(pr);
					keys.push(k);
					pr.setAttribute("data-key", k); // Unique Key
					pr.setAttribute("data-num", c); // Order

					pr.addEventListener ("click", function(e) {
						instance.paragraphClick(e);
					});

					c++;
				}
			}

			this.pl = { list: list, keys: keys };
			return this.pl;
		},

		paragraphClick: function(e) {
		/*	Clicking a Paragrsph has consequences for Highlighting, selecting and changing active Anchor */
			if (!this.vu) { return; }

			var self = Emphasis;
			var hasChanged = false,
				pr = (e.currentTarget.nodeName === "P") ? e.currentTarget : false, // Paragraph
				sp = (e.target.nodeName === "SPAN")	? e.target : false, // Span
				an = (e.target.nodeName === "A")	? e.target : false, // Anchor
				lines, jLen, j, txt, chr;

			if (an) {
			/*	Click an Anchor link */
				if ( !self.hasClass(an, self.classActiveAnchor) ) {
					self.updateAnchor(an);
					hasChanged = true;
					e.preventDefault();
				}
			}

			if (!pr && !sp) {
				pr.className.replace(self.classActive, "");
				return;
			}

			if (self.hasClass(pr, self.classReady)) {
		
				if (!self.hasClass(pr, self.classActive) && (sp && !self.hasClass(sp, self.classHighlight))) {

				//	If not current Active p tag, clear any others out there and make this the Active p tag	
					self.removeAllWithClass(self.classActive);
					self.addClass(pr, self.classActive);

				} else {
					if (! self.hasClass(pr, self.classActive)) {
						self.removeAllWithClass(self.classActive);
						self.addClass(pr, self.classActive); // Mark as Active
					}
					if (sp) {
						self.toggleClass(sp, self.classHighlight);
						hasChanged = true;
					}
				}

			} else {
			//	Add span tags to all Sentences within Paragraph and mark Paragraph as Ready
				lines = this.getSentences(pr);
				jLen  = lines.length;

				for (j=0; j<jLen; j++) {
					lines[j] = "<span data-num='" + (j+1) + "'>" + this.rtrim(lines[j]) + "</span>";
				}

				txt = lines.join('. ').replace(/__DOT__/g, ".").replace(/<\/span>\./g, ".<\/span>");
				chr = txt.substring(txt.length-8).charCodeAt(0);
				if ("|8221|63|46|41|39|37|34|33|".indexOf(chr) === -1) { txt += "."; }

				pr.innerHTML = txt;
				pr.setAttribute('data-sentences', jLen);

				this.removeAllWithClass(self.classActive);
				this.addClass(pr, self.classActive); // Mark as Active
				this.addClass(pr, self.classReady);	 // Mark as Ready

				hasChanged = true;
			}

			if (hasChanged) {
				this.updateURLHash();
			}
		},

		paragraphInfo: function(mode) {
		/*	Toggle anchor links next to Paragraphs */
			var hasSpan, pl, len, i, para, key, isActive, spans;

			if (mode) {
				hasSpan = document.querySelectorAll('span.' + this.classInfo);
				if (hasSpan.length === 0) {
					pl	= this.paragraphList();
					len = pl.list.length;
					for (i=0; i<len; i++) {
						para = pl.list[i] || false;
						if (para) {
							key			= pl.keys[i];
							isActive	= (key===this.p) ? (" " + this.classActiveAnchor) : "";
							para.innerHTML = "<span class='" + this.classInfo + "'><a class='"+ this.classAnchor + isActive + "' href='#p[" + key + "]' data-key='" + key + "' title='Link to " + this.ordinal(i+1) + " paragraph'>&para;</a></span>" + para.innerHTML;
						}
					}
				}
			} else {
				spans = document.querySelectorAll('span.' + this.classInfo);
				len = spans.length;
				for (i=0; i<len; i++) {
					this.removeFromDOM(spans[i]);
				}
				this.removeAllWithClass(this.classActive);
			}
		},

		updateAnchor: function(an) {
		/*	Make this A tag the one and only Anchor */
			this.p = an.getAttribute("data-key");
			this.removeAllWithClass(this.classActiveAnchor);
			this.addClass(an, this.classActiveAnchor);
		},

		updateURLHash: function() {
		/*	Scan the Paragraphs, note selections, highlights and update the URL with the new Hash */
			var h = "h[",
				paras = document.querySelectorAll('p.emReady'),
				pLen  = paras.length,
				p, key, spans, sLen, nSent, anchor, hash,s;

			for (p=0; p < pLen; p++) {
				key = paras[p].getAttribute("data-key");
				if ( this.hasClass(paras[p], this.classHighlight) ) {
					h += "," + key; // Highlight full paragraph
				} else {
					spans = paras[p].querySelectorAll('span.' + this.classHighlight);
					sLen  = spans.length;
					nSent = paras[p].getAttribute("data-sentences");

					if (sLen>0) { h += "," + key; }

					if (nSent!==sLen) {
						for (s=0; s<sLen; s++) {
							h += "," + spans[s].getAttribute("data-num");
						}
					}
				}
			}

			anchor	= ((this.p) ? "p[" + this.p + "]," : "");
			hash	= (anchor + (h.replace("h[,", "h[") + "]")).replace(",h[]", "").replace("h[]", "");

			location.hash = hash;
		},

		createKey: function(p) {
		/*	From a Paragraph, generate a Key */
			var key = "",
				len = 6,
				txt = (p.innerText || p.textContent || '').replace(/[^a-z\. ]+/gi, ''),
				lines, first, last, k, max, i;

			if (txt && txt.length>1) {

				lines = this.getSentences(txt);
				if (lines.length>0) {
					first = this.cleanArray(lines[0].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
					last  = this.cleanArray(lines[lines.length-1].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
					k	  = first.concat(last);

					max = (k.length>len) ? len : k.length;
					for (i=0; i<max; i++) {
						key += k[i].substring(0, 1);
					}
				}
			}
			return key;
		},

		findKey: function(key) {
		/*	From a list of Keys, locate the Key and corresponding Paragraph */
			var pl = this.paragraphList(),
				ln = pl.keys.length,
				ix = false,
				el = false,
				i, ls, le;

			for (i=0;i<ln;i++) {
				if (key===pl.keys[i]) { // Direct Match
					return { index: i, elm: pl.list[i] };
				} else { // Look for 1st closest Match
					if (!ix) {
						ls = this.lev(key.slice(0, 3), pl.keys[i].slice(0, 3));
						le = this.lev(key.slice(-3)  , pl.keys[i].slice(-3));
						if ((ls+le)<3) {
							ix = i;
							el = pl.list[i];
						}
					}
				}
			}
			return { index: ix, elm: el };
		},

		goAnchor: function(p) {
		/*	Move view to top of a given Paragraph */
			if (!p) {
				return; 
			}

			var pg = (isNaN(p)) ? this.findKey(p)['elm'] : (this.paragraphList().list[p-1] || false);
			if (pg) {
				setTimeout(function(){
					window.scrollTo(0, pg.offsetTop);
				}, 499);
			}
		},

		goHighlight: function(h, s) {
		/*	Highlight a Paragraph, or specific Sentences within it */
			if (!h) {
				return;
			}

			var hLen = h.length,
				i, para, sntns, multi, lines, jLen, j, k, line;

			for (i=0; i<hLen; i++) {
				para = this.paragraphList().list[h[i]-1] || false;
				if (para) {
					sntns = s[h[i].toString()] || false;
					multi = !sntns || sntns.length===0; // Individual sentences, or whole paragraphy?
					lines = this.getSentences(para);
					jLen  = lines.length;

				/*	First pass. Add SPAN tags to all lines. */
					for (j=0; j<jLen; j++) {
						k = (multi) ? j : sntns[j]-1;
						lines[j] = "<span data-num='" + (j+1) + "'>" + lines[j] + "</span>";
					}

				/*	Second pass, update span to Highlight selected lines */
					for (j=0; j<jLen; j++) {
						k	 = (multi) ? j : sntns[j]-1;
						line = lines[k] || false;
						if (line) {
							lines[k] = lines[k].replace("<span", "<span class='" + this.classHighlight + "'");
						}
					}

					para.setAttribute("data-sentences", jLen);
					para.innerHTML = lines.join('. ').replace(/__DOT__/g, ".").replace(/<\/span>\./g, ".<\/span>");
					this.addClass(para, 'emReady'); /* Mark the paragraph as having SPANs */
				}
			}
		},

		getSentences: function(el) {
		/*	Break a Paragraph into Sentences, bearing in mind that the "." is not the definitive way to do so */
			var html	= (typeof el==="string") ? el : el.innerHTML,
				mrsList = "Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr",
				topList = "A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St",
				geoList = "Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR",
				numList = "0,1,2,3,4,5,6,7,8,9",
				webList = "aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx",
				extList = "www",
				d		= "__DOT__",

				list = (topList+","+geoList+","+numList+","+extList).split(","),
				len  = list.length,
				i, lines;
		
			for (i=0;i<len;i++) {
				html = html.replace(new RegExp((" "+list[i]+"\\."), "g"), (" "+list[i]+d));
			}

			list = (mrsList+","+numList).split(",");
			len	 = list.length;
			for (i=0;i<len;i++) {
				html = html.replace(new RegExp((list[i]+"\\."), "g"), (list[i]+d));
			}

			list = (webList).split(",");
			len	 = list.length;
			for (i=0;i<len;i++) {
				html = html.replace(new RegExp(("\\."+list[i]), "g"), (d+list[i]));
			}

			lines = this.cleanArray(html.split('. '));
			return lines;
		},

		ordinal: function(n) {
			var sfx = ["th","st","nd","rd"], 
				val = n%100;
			return n + (sfx[(val-20)%10] || sfx[val] || sfx[0]);
		},

		lev: function(a, b) {
		/*	Get the Levenshtein distance - a measure of difference between two sequences */
			var m = a.length,
				n = b.length,
				r = [],
				c, o, i, j;
				r[0] = [];

			if (m < n) { c = a; a = b; b = c; o = m; m = n; n = o; }
			for (c = 0; c < n+1; c++) { r[0][c] = c; }
			for (i = 1; i < m+1; i++) {
				r[i] = [];
				r[i][0] = i;
				for (j=1; j<n+1; j++) {
					r[i][j] = this.smallest(r[i-1][j]+1, r[i][j-1]+1, r[i-1][j-1]+((a.charAt(i-1)===b.charAt(j-1))? 0 : 1));
				}
			}
			return r[m][n];
		},

		smallest: function(x,y,z) {
		/*	Return smallest of two values */
			if (x < y && x < z) { return x; }
			if (y < x && y < z) { return y; }
			return z;
		},

		rtrim: function(txt) {
		/*	Trim whitespace from right of string */
			return txt.replace(/\s+$/, "");
		},

		cleanArray: function(a){
		/*	Remove empty items from an array */
			var n = [],
				i;
			for (i = 0; i<a.length; i++){
				if (a[i] && a[i].replace(/ /g,'').length>0) { n.push(a[i]); }
			}
			return n;
		},

	/*	Class helpers */
		removeClass: function(el, klass) {
			el.className = el.className.replace(klass, "");
		},

		removeAllWithClass: function(klass) {
			var els = document.querySelectorAll("."+klass);
			var len = els.length;
			for (var i=0; i<len; i++) {
				this.removeClass(els[i], klass);
			}
		},

		addClass: function(el, klass) {
			if (!this.hasClass(el, klass)) {
				el.className = el.className + " " + klass;
			}
		},

		hasClass: function(el, klass) {
			if (el.className.indexOf(klass) === -1) {
				return false;
			}
			return true;
		},
		
		removeFromDOM: function(el) {
			el.parentNode.removeChild(el);
		},
		
		toggleClass: function(el, klass) {
			if (this.hasClass(el, klass)) {
				this.removeClass(el, klass);
			} else {
				this.addClass(el, klass);
			}
		}
	};

	document.addEventListener("DOMContentLoaded", function(){
		Emphasis.init();
	}, true);

})();
