Emphasis
========

Emphasis provides dynamic paragraph-specific anchor links and the ability to highlight text in a document,
all of which is made available in the URL hash so it can be emailed, bookmarked, or shared.

For more information and examples please go to this blog post:

http://open.blogs.nytimes.com/2011/01/11/emphasis-update-and-source/

Configuration
-------------

The main configuration element si specifiying what paragraph elements are in scope and are not. To this end
we specify the elements on or near Line 54:

    this.paraSelctors = $$(
                        ".entry p:not(p[class]):not(:empty)",
                        ".post p:not(p[class]):not(:empty)", 
                        "article p:not(p[class]):not(:empty)"
                        );

This covers a lot of common markup in many sites and blog. However this could be configured for your specific site.

Example: If all you P tags reside in DIV tags with the "entry" classname, then this would be sufficient:

    this.paraSelctors = $$(".entry p:not(p[class]):not(:empty)");

Over at The New York Times, we use the following:

    this.paraSelctors = $$('.articleBody p:not(p[class]):not(:empty)', '#articleBody p:not(p[class]):not(:empty)', '#content div.entry-content p:not(p[class]):not(:empty)');

Dependencies
------------
Currently this requires that you use the PrototypeJS library - tested with version 1.6.

http://prototypejs.org/download

Thanks
------

Levenshtein calculation in the script is based on some nice code by Andrew Hedges
http://andrew.hedges.name/experiments/levenshtein/

To-Do
-----

 - Remove framework dependency (PrototypeJS)
 - Further work on UI for highlighting with focus on simplicity
 - Social
 - Support for touch-based devices
