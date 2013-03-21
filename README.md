HTMLplus
==========

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
    
    //view all cases in the project site ...
</body>
```

##Changelog

**1.0.1** (2013-03-21)
Fix JSHint warnings

**1.0.0** (2013-03-20)
First version

##Contribute

Anyone who wants to contribute to the project is welcome! Help me!!