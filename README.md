HTML+
==========
HTML+ is a JQuery plugin that adds useful features to HTML tags, allowing webpages to maintain compatibility with all HTML/XHTML standards.
To add new features to the HTML standard, HTML+ simply uses the class attribute. In general, the class attribute is mostly used to point to a class in a style sheet. HTML+ uses this attribute to add new features to html tags.

Site project: http://htmlplus.simplit.it

##Using
Loading:
```html
<head>
    <script src="/path/to/jquery.js" type="text/javascript" charset="utf-8"></script>
    <script src="/path/to/jquery.HTMLplus.js" type="text/javascript" charset="utf-8"></script>
    <script>
        $('body').HTMLplus();
    </script>
</head>
```

Popular examples:
```html
<body>
    //open link in new window
    <a class="blank" href="page.htm">Link 1</a>
    
    //open link in a popup window
    <a class="win" href="page.htm">Link 2</a>
    
    //open link in a jqueryUI dialog
    <a class="dialog" href="page.htm">Link 3</a>
    
    //block iframe until is loading
    <iframe class="loading" src="page.htm">Link 4</iframe>
    
    //max 50 chars in the textarea
    <textarea class="maxlength-50">Lorem ipsum dolor sit amet, consectetur ...</textarea>

    //sets the height of the div to the same height of the parent element
    <div class="heightas-parent">Lorem ipsum dolor sit amet, consectetur ...</div>
    
    //view all cases in the project site ...
</body>
```

##Changelog

**1.3.2** (2013-09-16)
* Fixed bug in the creation of a new window

**1.3.1** (2013-09-10)
* Fixed bug in the class **height-as** of the DIV tag. Fix for IE9/IE10

**1.3.0** (2013-05-20)
* Add class **autogrow** for TEXTAREA elements
* Improved class **autoheight** for TEXTAREA elements
* Add option **lb** for TEXTAREA elements

**1.2.2** (2013-05-08)
* Fixed a bug in the class **win-center** of the A tag. The pop-up window was not centered correctly if the browser was not in fullscreen mode 

**1.2.1** (2013-04-19)
* Fixed error in tag selection
* Fixed error in IFRAME options

**1.2.0** (2013-04-17)
* Add class **ajax** for A elements
* Add class **ajax-to-**_value_ for A elements
* Add class **ajax-from-**_value_ for A elements
* Add option **ajax** for A elements

**1.1.0** (2013-04-02)
* Add class **heightas-**_value_ for DIV elements
* Add class **language-**_value_ for CODE elements
* Add general option **disableTags**
* Reorganized code to extend/add classnames by a custom plugin

**1.0.1** (2013-03-21)
* Make JSHint friendly

**1.0.0** (2013-03-20)
* First version

##Contribute

Anyone who wants to contribute to the project is welcome! Help me!!