/*  --------------------------------------------------

    Emphasis
    by Michael Donohoe (@donohoe)
    https://github.com/NYTimes/Emphasis
    http://open.blogs.nytimes.com/2011/01/10/emphasis-update-and-source/

    - - - - - - - - - -

    jQueryized by Rob Flaherty (@ravelrumba)
    https://github.com/robflaherty/Emphasis

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

(function($) {

var Emphasis = {
    init: function(obj, options) {
        this.config();
        options = options || {};
        this.settings = $.extend(this.defaults(obj), options);
        this.addCSS();
        this.readHash();

        $(document).bind('keydown', this.keydown);
    },

    defaults: function(obj) {
        return {
            selector: obj,
            pl: false, // Paragraph List
            p: false, // Paragraph Anchor
            h: false, // Highlighted paragraphs
            s: false, // Highlighted sentences
            vu: false, // Are paragraph links visible or not
            kh: "|",
            kc : '16', // The keyboard key that triggers emphasis
            kcCount: 2, // Number of times trigger key must be pressed
            classReady        : "emReady",
            classActive       : "emActive",
            classHighlight    : "emHighlight",
            classInfo         : "emInfo",
            classAnchor       : "emAnchor",
            classActiveAnchor : "emActiveAnchor"
        };
    },

    config: function() {
        this.classReady        = "emReady";
        this.classActive       = "emActive";
        this.classHighlight    = "emHighlight";
        this.classInfo         = "emInfo";
        this.classAnchor       = "emAnchor";
        this.classActiveAnchor = "emActiveAnchor";
    },

    /**  Inject the minimum styles rules required */
    addCSS: function() {
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

    /**  Read and interpret the URL hash */
    readHash: function() {
        var lh = decodeURI(location.hash),
          p  = false,
          h = [],
          s = {},
          a, re, f, r, i, findp, findh, undef, hi, key, pos, b, j;


        if (lh.indexOf('[')<0 && lh.indexOf(']')<0) {
        /*  Version 1 Legacy support
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
        /*  Version 2
            #h[tbsaoa,Sstaoo,2,4],p[FWaadw] -> p = "FWaadw", h = [ "tbsaoa", "Sstaoo" ], s = { "Sstaoo" : [ 2, 4 ] }
        */
            findp = lh.match(/p\[([^[\]]*)\]/);
            findh = lh.match(/h\[([^[\]]*)\]/);

            p  = (findp && findp.length>0) ? findp[1] : false;
            hi = (findh && findh.length>0) ? findh[1] : false;

            if (hi) {
                hi = hi.match(/[a-zA-Z]+(,[0-9]+)*/g);
                for (i = 0; i < hi.length; i++) {
                    a   = hi[i].split(',');
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

        this.settings.p = p; this.settings.h = h; this.settings.s = s;

        this.goAnchor(p);
        this.goHighlight(h, s);
    },

    /**  Look for double-shift keypress */
    keydown: function(e){
        var self = Emphasis;

        self.settings.kh  = self.settings.kh + e.keyCode + '|';

        // If an invalid value for kcCount is set, default to 2.
        if (self.settings.kcCount <= 0){
            self.settings.kcCount = 2;
        }

        // Determine the key pattern that should trigger Emphasis.
        var search_string = '|';
        for (i = 0; i <= self.settings.kcCount - 1; i++) {
            search_string += self.settings.kc + '|';
        }

        if (self.settings.kh.indexOf(search_string) >-1 ) {
            self.settings.vu = (self.settings.vu) ? false : true;
            self.paragraphInfo(self.settings.vu);
        }
        setTimeout(function(){ self.settings.kh = '|'; }, 500);
    },

    /**
     * Build a list of Paragraphs, keys, and add meta-data to each Paragraph
     * in DOM, saves list for later re-use
     */
    paragraphList: function() {
        if (this.settings.pl && this.settings.pl.list.length > 0) {
          return this.settings.pl;
        }
        var instance = this,
          list = [],
          keys = [],
          c    = 0,
          len  = this.settings.selector.length,
          p, pr, k;

        for (p=0; p<len; p++) {
            pr = this.settings.selector[p];
            if ((pr.innerText || pr.textContent || "").length>0) {
                k = instance.createKey(pr);
                list.push(pr);
                keys.push(k);
                pr.setAttribute("data-key", k); // Unique Key
                pr.setAttribute("data-num", c); // Order

                $(pr).bind('click', function(e) {
                  instance.paragraphClick(e);
                });
                c++;
            }
        }

        this.settings.pl = { list: list, keys: keys };
        return this.settings.pl;
    },

    /**
     * Clicking a Paragraph has consequences for Highlighting, selecting and
     * changing active Anchor
     */
    paragraphClick: function(e) {
        if (!this.settings.vu) { return; }

        // Let other scripts react.
        $.event.trigger('emphasisParagraphClick', [this]);

        var hasChanged = false,
          pr = (e.currentTarget.nodeName === "P") ? e.currentTarget : false, // Paragraph
          $pr = $(pr),
          sp = (e.target.nodeName === "SPAN")     ? e.target        : false, // Span
          an = (e.target.nodeName === "A")        ? e.target        : false, // Anchor
          lines, jLen, j, txt, chr;

        if (an) {
        /*  Click an Anchor link */
            if (!$(an).hasClass(this.classActiveAnchor)) {
                this.updateAnchor(an);
                hasChanged = true;
                e.preventDefault();
            }
        }

        if (!pr && !sp) {
            this.removeClass(this.classActive);
            return;
        }

        if ($pr.hasClass(this.classReady)) {
            if (!$pr.hasClass(this.classActive) && (sp && !$(sp).hasClass(this.classHighlight))) {
            //  If not current Active p tag, clear any others out there and make this the Active p tag
                $(this).removeClass(this.classActive);
                $pr.addClass(this.classActive); // Mark as Active
            } else {
                if (!$pr.hasClass(this.classActive)) {
                    $(this).removeClass(this.classActive);
                    $pr.addClass(this.classActive); // Mark as Active
                }

                if (sp) {
                    $(sp).toggleClass(this.classHighlight);
                    hasChanged = true;
                }
            }
        } else {
        //  Add span tags to all Sentences within Paragraph and mark Paragraph as Ready
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

            $(this).removeClass(this.classActive);
            $pr.addClass(this.classActive); // Mark as Active
            $pr.addClass(this.classReady);  // Mark as Ready
            hasChanged = true;
        }

        if (hasChanged) {
            this.updateURLHash();
        }
    },

    /**
     * Toggle anchor links next to Paragraphs
     */
    paragraphInfo: function(mode) {
      var hasSpan, pl, len, i, para, key, isActive, spans;

        if (mode) {
            hasSpan = $('span.' + this.classInfo);
            if (hasSpan.length === 0) {
                pl  = this.paragraphList();
                len = pl.list.length;
                for (i=0; i<len; i++) {
                    para = pl.list[i] || false;
                    if (para) {
                        key        = pl.keys[i];
                        isActive   = (key===this.settings.p) ? (" " + this.classActiveAnchor) : "";
                        para.innerHTML = "<span class='" + this.classInfo + "'><a class='"+ this.classAnchor + isActive + "' href='#p[" + key + "]' data-key='" + key + "' title='Link to " + this.ordinal(i+1) + " paragraph'>&para;</a></span>" + para.innerHTML;
                    }
                }
            }
        } else {
            spans = $('span.' + this.classInfo);

            len = spans.length;
            for (i=0; i<len; i++) {
                $(spans[i]).remove();
            }
            $(this).removeClass(this.classActive);
        }
    },

    /**
     * Make this A tag the one and only Anchor
     */
    updateAnchor: function(an) {
        this.settings.p = an.getAttribute("data-key");
        $(this).removeClass(this.classActiveAnchor);
        $(an).addClass(this.classActiveAnchor);
    },

    /**
     * Scan the Paragraphs, note selections, highlights and update the URL with
     * the new Hash
     */
    updateURLHash: function() {
        var h     = "h[",
          paras = $('p.emReady'),
          pLen  = paras.length,
          p, key, spans, sLen, nSent, anchor, hash,s;

        for (p=0; p < pLen; p++) {
            key = paras[p].getAttribute("data-key");
            if ($(paras[p]).hasClass(this.classHighlight)) {
                h += "," + key; // Highlight full paragraph
            } else {
                spans = $('span.' + this.classHighlight, paras[p]);
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

        anchor    = ((this.settings.p) ? "p[" + this.settings.p + "]," : "");
        hash      = (anchor + (h.replace("h[,", "h[") + "]")).replace(",h[]", "");
        if (location.hash != hash) {
            location.hash = hash;
            $.event.trigger('emphasisHashUpdated', [this]);
        }


    },

    /**  From a Paragraph, generate a Key */
    createKey: function(p) {
        var key = "",
          len = 6,
          txt = (p.innerText || p.textContent || '').replace(/[^a-z\. ]+/gi, ''),
          lines, first, last, k, max, i;

        if (txt && txt.length>1) {

            lines = this.getSentences(txt);
            if (lines.length>0) {
                first = this.cleanArray(lines[0].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
                last  = this.cleanArray(lines[lines.length-1].replace(/[\s\s]+/gi, ' ').split(' ')).slice(0, (len/2));
                k     = first.concat(last);

                max = (k.length>len) ? len : k.length;
                for (i=0; i<max; i++) {
                    key += k[i].substring(0, 1);
                }
            }
        }
        return key;
    },

    /**  From a list of Keys, locate the Key and corresponding Paragraph */
    findKey: function(key) {
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

    /**  Move view to top of a given Paragraph */
    goAnchor: function(p) {
        if (!p) {
          return;
        }
        var pg = (isNaN(p)) ? this.findKey(p)['elm'] : (this.paragraphList().list[p-1] || false);

        if (pg) {
            setTimeout(function(){
                $(window).scrollTop($(pg).offset().top);
            }, 500);
        }
    },

    /**  Highlight a Paragraph, or specific Sentences within it */
    goHighlight: function(h, s) {
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

            /*  First pass. Add SPAN tags to all lines. */
                for (j=0; j<jLen; j++) {
                    k = (multi) ? j : sntns[j]-1;
                    lines[j] = "<span data-num='" + (j+1) + "'>" + lines[j] + "</span>";
                }

            /*  Second pass, update span to Highlight selected lines */
                for (j=0; j<jLen; j++) {
                    k    = (multi) ? j : sntns[j]-1;
                    line = lines[k] || false;
                    if (line) {
                        lines[k] = lines[k].replace("<span", "<span class='" + this.classHighlight + "'");
                    }
                }

                para.setAttribute("data-sentences", jLen);
                para.innerHTML = lines.join('. ').replace(/__DOT__/g, ".").replace(/<\/span>\./g, ".<\/span>");
                $(para).addClass('emReady'); /* Mark the paragraph as having SPANs */
            }
        }
    },

    /** Break a Paragraph into Sentences, bearing in mind that the "." is not
     * the definitive way to do so
     */
    getSentences: function(el) {
        var html    = (typeof el==="string") ? el : el.innerHTML,
          mrsList = "Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr",
          topList = "A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St",
          geoList = "Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR",
          numList = "0,1,2,3,4,5,6,7,8,9",
          webList = "aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx",
          extList = "www",
          d       = "__DOT__",

          list = (topList+","+geoList+","+numList+","+extList).split(","),
          len  = list.length,
          i, lines;

        for (i=0;i<len;i++) {
            html = html.replace(new RegExp((" "+list[i]+"\\."), "g"), (" "+list[i]+d));
        }

        list = (mrsList+","+numList).split(",");
        len  = list.length;
        for (i=0;i<len;i++) {
            html = html.replace(new RegExp((list[i]+"\\."), "g"), (list[i]+d));
        }

        list = (webList).split(",");
        len  = list.length;
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

    /**
     * Get the Levenshtein distance - a measure of difference between two
     * sequences
     */
    lev: function(a, b) {
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

    /**  Return smallest of two values */
    smallest: function(x,y,z) {
        if (x < y && x < z) { return x; }
        if (y < x && y < z) { return y; }
        return z;
    },

    /**  Trim whitespace from right of string */
    rtrim: function(txt) {
        return txt.replace(/\s+$/, "");
    },

    /**  Remove empty items from an array */
    cleanArray: function(a){
        var n = [],
          i;
        for (i = 0; i<a.length; i++){
            if (a[i] && a[i].replace(/ /g,'').length>0){ n.push(a[i]); }
        }
        return n;
    }
};

$.fn.emphasis = function(options) {
    Emphasis.init(this, options);
};

}(jQuery));
