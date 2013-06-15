Prologue
========

Emphasis, with patient help, has moved from its dependency on PrototypeJS to jQuery.

Emphasis
========

Emphasis provides dynamic paragraph-specific anchor links and the ability to highlight text in a document,
all of which is made available in the URL hash so it can be emailed, bookmarked, or shared.

For more information and examples please go to this blog post:

http://open.blogs.nytimes.com/2011/01/11/emphasis-update-and-source/

Configuration
---------------

To enable Emphasis on your website, include the Emphasis JS library and call the
.emphasis method on a paragraph selector.

### Custom selectors

Simple example:

    $("#article-content p").emphasis();

More comprehensive selector example:

    $(".entry p:not(p[class]):not(:empty), .post p:not(p[class]):not(:empty), article p:not(p[class]):not(:empty)").emphasis();

This covers a lot of common markup in many sites and blog. However this could be configured for your specific site.

Example: If all your P tags reside in DIV tags with the "entry" classname, then this would be sufficient:

    $(".entry p:not(p[class]):not(:empty)").emphasis();

Over at The New York Times, we use the following:

    $(".articleBody p:not(p[class]):not(:empty), #articleBody p:not(p[class]):not(:empty), #content div.entry-content p:not(p[class]):not(:empty)").emphasis();

### Custom options

In this example, 'ctrl' must be pressed once to trigger Emphasis:

    $("#article-content p").emphasis({kc: 17, kcCount : 1});

### Emphasis jQuery triggers

Emphasis triggers custom jQuery events, to which your custom jQuery script may react.

React to emphasis-enabled paragraph being clicked.

    $(document).bind('emphasisParagraphClick', function(event, emphasis) {
      alert('You clicked an Emphasis enabled paragraph!');
    });

React to Emphasis changing hash.

    $(document).bind('emphasisHashUpdated', function(event, emphasis) {
      alert('Emphasis has updated the URL hash to ' + window.location.hash);
    });


Dependencies
------------

jQuery (Tested with 1.4.4)

Thanks
------------

Levenshtein calculation in the script is based on some nice code by Andrew Hedges
http://andrew.hedges.name/experiments/levenshtein/

To-Do
------------

 - Further work on UI for highlighting with focus on simplicity
 - Social
 - Support for touch-based devices
