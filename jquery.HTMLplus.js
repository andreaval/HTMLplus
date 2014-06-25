/*!
 * jQuery HTMLplus plugin
 * Version 1.4.0b4
 * @requires jQuery v1.5.0 or later
 *
 * Copyright (c) 2013 Andrea Vallorani, andrea.vallorani@gmail.com
 * Released under the MIT license
 */
(function (factory) {
    if( typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery.
        define(['jquery'], factory);
    } else{
        // No AMD. Register plugin with global jQuery object.
        factory(jQuery);
    }
}(function($) {
    /*jshint debug:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, browser:true, devel:true, jquery:true, indent:4*/
    $.fn.HTMLplus = function(options){
        options = $.extend(true,{
            tags: ['A','CODE','DIV','IFRAME','IMG','TEXTAREA'],
            disableTags: [],
            prefix: ''
        },options);
        
        var $root=this;
        var inArray = function(needle,haystack){
            var length = haystack.length;
            for(var i = 0; i < length; i++){
                if(haystack[i] === needle) return true;
            }
            return false;
        };
        
        $.each(options.tags,function(i,tag){
            if(!inArray(tag,options.disableTags)){
                var nodes=$(tag+'[class]',$root);
                if($root.is(tag+'[class]')) nodes.push($root.get(0));
                if(nodes.length){
                    var tagOptions={};
                    if(typeof options[tag] === 'object'){
                        tagOptions=options[tag];
                    }
                    $.fn.HTMLplus[tag](nodes,tagOptions,options.prefix);
                }
            }
        });
    };
    
    $.fn.HTMLplus.A = function(nodes,options,x){
        //console.time('loading');
        var IsAnchor = function(url){
            return (url.toString().charAt(0)==='#') ? true : false;
        };
        options = $.extend(true,{
            win: {width:400,height:400,scrollbars:0,toolbar:0,check:true},
            confirm: 'Are you sure you want to open the link?',
            confirmType: false,
            disabledMsg: 'alert',
            scroll: {speed:300,offsetY:0},
            notify: {life:10,type:null},
            dialog: {dialogClass:'htmlplus-dialog'},
            ajax: {loadMsg:'<img src="loader.gif" />'}
        },options);
        
        nodes.each(function(){
            var $this = $(this);
            if(!$this.is('a')){
                $this.find('a.'+x+'confirm,a.'+x+'dialog,a.'+x+'disabled').each(function(){
                    if($(this).is('[title]')){
                        var e=$(this);
                        e.data('title',e.attr('title')).removeAttr('title');
                    }
                });
                $this.delegate('a[class]','click',parser);
            }
            else if($this.is('[class]')){
                if($this.is('.'+x+'confirm,.'+x+'dialog,.'+x+'disabled') && $this.is('[title]')){
                    $this.data('title',$this.attr('title')).removeAttr('title');
                }
                $this.click(parser);
            }
        });

        function parser(e){
            var a=$(this);
            if(a.hasClass(x+'disabled')){
                if(a.data('title') && options.disabledMsg==='alert') alert(a.data('title'));
                return false; 
            }
            if(a.hasClass(x+'print')){
                window.setTimeout(window.print,0);
                return false;
            }
            if(!a.is('[href]')) return;
            var url=a.attr('href');
            var confirmed=a.data('confirmed');
            if(confirmed) a.data('confirmed',false);
            else if(a.hasClass(x+'confirm')){
                var msg=options.confirm;
                var mask=a.classPre(x+'confirm-mask');
                if(!mask){
                    if(IsAnchor(url)) mask=url;
                    else if(a.data('title') && IsAnchor(a.data('title'))){
                        mask=a.data('title');
                    }
                }
                else mask='#'+mask;
                if(mask && $(mask).length){
                    msg=$(mask).html();
                    if(a.data('title')){
                        msg=msg.replace(/\[title\]/g,a.data('title'));
                    }
                    msg=msg.replace(/\[href]/g,url);
                    msg=msg.replace(/\[text]/g,a.text());
                }
                else if(a.data('title')) msg=a.data('title');

                if(options.confirmType!==false){
                    switch(options.confirmType){
                    case 'dialog':
                        if(!jQuery.ui) return false;
                        $("<div/>").html(msg).dialog({
                            modal:true,
                            resizable:false,
                            dialogClass:'htmlplus-dialog',
                            buttons:{
                                Ok:function(){
                                    if($(this).children('form').length===0){
                                        a.data('confirmed',true).click();
                                    }
                                    else $(this).children('form').submit();
                                    $(this).dialog("close");
                                },
                                Cancel:function(){
                                    $(this).dialog("close");
                                }
                            }
                        });
                        break;
                    default:
                        if(typeof options.confirmType==='function'){
                            options.confirmType(a,msg,function(){
                                if($(mask+' form').length) $('form',this).submit();
                                 else a.data('confirmed',true).click();
                            });
                        }
                    }
                }
                else if(confirm(msg)){
                    a.unbind('click',$.fn.Aplus).click(parser);
                    return a.data('confirmed',true).triggerHandler('click');
                }
                return false;
            }
            if(a.hasClass('ajax')){
                var ajaxSett=$.extend({},options.ajax,a.classPre(x+'ajax',1));
                if(typeof(a.attr('id'))==='undefined') a.attr('id',(new Date()).getTime());
                var aId = a.attr('id');
                ajaxSett.to = (typeof(ajaxSett.to)==='undefined' || !ajaxSett.to) ? 'body' : '#'+ajaxSett.to;
                ajaxSett.from = (typeof(ajaxSett.from)==='undefined' || !ajaxSett.from) ? null : '#'+ajaxSett.from;
                var to=$(ajaxSett.to);
                var localCache=to.children('div[data-rel="'+aId+'"]');
                var toH=to.height();
                to.children().hide();
                if(localCache.length){
                    localCache.show();
                }
                else{
                    var container=$('<div data-rel="'+aId+'" />');
                    container.html('<div class="loader" style="text-align:center;line-height:'+toH+'px;">'+ajaxSett.loadMsg+'</div>').appendTo(to);
                    $.ajax({url:url,dataType:'html'}).done(function(data){
                        data = $('<div>'+data.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')+'</div>');
                        container.html((ajaxSett.from) ? data.find(ajaxSett.from).html() : data.html());
                        to.triggerHandler("ajaxToComplete.aplus",{
                            obj: container
                        });
                    });
                }
                return false;
            }
            else if(a.hasClass(x+'dialog')){
                if(jQuery.ui){
                    var dSett=$.extend({},options.dialog,a.classPre(x+'dialog',1));
                    if(!IsAnchor(url)){
                        var frame;
                        if(a.hasClass(x+'dialog-ajax')){
                            frame=$('<div></div>');
                            frame.load(url);
                        }
                        else{
                            frame=$('<iframe src="'+url+'" style="padding:0;"></iframe>');
                            dSett.open=function(){
                                frame.css('width',$(this).parent().width());
                            };
                        }
                        dSett.dragStart=dSett.resizeStart=function(){
                            frame.hide();
                        };
                        dSett.dragStop=dSett.resizeStop=function(){
                            frame.show();
                        };
                        url=frame;
                    }
                    else url=$(url);
                    if(a.data('title')) dSett.title=a.data('title');

                    var wP=$(window).width();
                    var hP=$(window).height();
                    if(dSett.full){
                        dSett.width=wP-15;
                        dSett.height=hP;
                        dSett.position = [3,3];
                        if(typeof dSett.draggable==='undefined') dSett.draggable=false;
                    }
                    else{
                        if(dSett.w) dSett.width = dSett.w;
                        if(dSett.h) dSett.height = dSett.h;
                        if(dSett.l && dSett.t) dSett.position = [dSett.l,dSett.t];
                        if(dSett.width){
                            var w=dSett.width;
                            if(w.toString().charAt(w.length-1)==='p'){
                                w=parseInt(w,10)*(wP/100);
                            }
                            dSett.width=Math.min(w,wP);
                        }
                        if(dSett.height){
                            var h=dSett.height;
                            if(h.toString().charAt(h.length-1)==='p'){
                                h=parseInt(h,10)*(hP/100);
                            }
                            dSett.height=Math.min(h,hP);
                        }
                    }
                    url.dialog(dSett);
                }
                else alert('jqueryUI required!');
                return false;
            }
            else if(a.hasClass(x+'win')){
                e.preventDefault();
                if(!a.data('win-id')){
                    a.data('win-id','win_'+((a.is('[id]')) ? a.attr('id') : new Date().getTime()));
                }
                var winID=a.data('win-id');
                var wSett='';
                var aSett=$.extend({},options.win,a.classPre(x+'win',1));
                if(aSett.check) a.addClass(x+'disabled');
                var wPage=$(window).width();
                var hPage=$(window).height();
                if(aSett.fullpage){
                    aSett.width=wPage;
                    aSett.height=hPage;
                    delete aSett.fullpage;
                }
                else if(aSett.fullscreen){
                    aSett.width=screen.width;
                    aSett.height=screen.height;
                    delete aSett.fullscreen;
                }
                else{
                    var winW=aSett.width;
                    var winH=aSett.height;
                    if(winW.toString().charAt(winW.length-1)==='p'){
                        winW=parseInt(winW,10)*(wPage/100);
                    }
                    if(winH.toString().charAt(winH.length-1)==='p'){
                        winH=parseInt(winH,10)*(hPage/100);
                    }
                    aSett.width=Math.min(winW,wPage);
                    aSett.height=Math.min(winH,hPage);
                    if(aSett.center){
                        var screenX, screenY;
                        if(navigator.userAgent.match(/msie/i)){
                            screenX=window.screenLeft;
                            screenY=window.screenTop;
                        }
                        else{
                            screenX=window.screenX;
                            screenY=window.screenY;
                        }
                        aSett.left = (wPage/2)-(aSett.width/2)+screenX;
                        aSett.top = (hPage/2)-(aSett.height/2)+screenY;
                        delete aSett.center;
                    }
                }
                $.each(aSett,function(i,v){
                    wSett+=','+i+'='+v;
                });
                wSett=wSett.substr(1);
                var myWin=window.open('',winID,wSett);
                if(myWin.location.href==='about:blank'){
                    myWin.location.href = url;
                }
                myWin.focus();
                $(myWin.document).ready(function(){
                    if(aSett.check) a.removeClass(x+'disabled');
                });
                return false;
            }
            else if(a.hasClass(x+'scroll')){
                if(!IsAnchor(url)) return true;
                var scroll=$.extend({},options.scroll,a.classPre(x+'scroll',1));
                $('html,body').animate({scrollTop:$(url).offset().top+scroll.offsetY},scroll.speed);
                return false;
            }
            else if(a.hasClass(x+'notify')){
                if(IsAnchor(url)) return false;
                $.get(url,function(response){
                    var nSett=$.extend({},options.notify,a.classPre(x+'notify',1));
                    switch(nSett.type){
                    case 'jGrowl':
                        if($.jGrowl){
                            var conf={};
                            if(nSett.life) conf.life=nSett.life*1000;
                            else conf.sticky=true;
                            $.jGrowl(response,conf);
                        }
                        break;
                    case 'growlUI':
                        if($.growlUI){
                            var life = (nSett.life) ? nSett.life*1000 : undefined;
                            $.growlUI('',response,life);
                        }
                        break;
                    default: 
                        alert(response);
                    }
                });
                return false;
            }
            else if(!IsAnchor(url)){
                var target=null;
                if(a.hasClass(x+'blank')) target='_blank';
                else if(a.hasClass(x+'parent')) target='_parent';
                else if(a.classPre(x+'frame')) target=a.classPre(x+'frame');
                else if(a.hasClass(x+'self') || confirmed) target='_self';
                if(target){
                    window.open(url,target);
                    return false;
                } 
            }
        }
    };
                    
    $.fn.HTMLplus.CODE = function(nodes,options,x){
        nodes.each(function(){
            var $el=$(this);
            var syntax=$el.classPre(x+'language');
            if(syntax){
                if(syntax==='html'){
                    var code=$.trim($el.html());
                    if(code.substring(0,4)==='<!--'){
                        code=code.substring(4,code.length-3);
                        $el.text(code);
                    }
                }
                if(typeof(hljs)==='object'){
                    if(!$el.parent().is('pre')) $el.wrap('<pre>');
                    hljs.highlightBlock(this);
                }
                else{
                    $el.css({display:'block',whiteSpace:'pre',overflow:'hidden'});
                }
            }
        });
    };
                    
    $.fn.HTMLplus.DIV = function(nodes,options,x){
        nodes.each(function(){
            var $el=$(this);
            var heightas=$el.classPre(x+'heightas');
            if(heightas){
                var newHeight=0;
                switch(heightas){
                case 'parent':
                    if($el.parent().is('body')){
                        var body=$el.parent();
                        if($(window).height()>body.height()){
                            newHeight=$(window).height()-parseInt(body.css('marginTop'),10)-parseInt(body.css('marginBottom'),10);
                        }
                        else{
                            newHeight=body.height();
                        }
                    }
                    else{
                        newHeight=$el.parent().height();
                    }
                    break;
                case 'sibling':
                    $el.parent().children('div').each(function(){
                        if($(this).height()>newHeight){
                            newHeight=$(this).height();
                        }
                    });
                    break;
                default: 
                    var $obj=$('#'+heightas);
                    if($obj.length) newHeight=$obj.eq(0).height();
                }
                $el.css('height',newHeight);
            }
            /*else{
                var pheight=$el.classPre(x+'pheight');
                if(pheight!==false){
                    var parentH=$el.parent().height();
                    pheight=parseInt(pheight);
                    parentH=parentH/100*pheight;
                    $el.height(parentH);
                }
            }*/
        });
    };
    
    $.fn.HTMLplus.IFRAME = function(nodes,options,x){
        options = $.extend(true,{
            autoheightSpeed:600,
            loadingCss:{opacity:0.8,background:'#ddd',textAlign:'center'},
            loadingHtml:'loading ...'
        },options);
        nodes.each(function(){
            var el=this;
            var $el=$(el);
            var isIE=navigator.userAgent.match(/msie/i);
            var loading=false;
            var autoheight=false;
            if($el.hasClass(x+'autoheight')){
                var hostname = new RegExp(location.host);
                if(hostname.test(el.src) || (!/http:\/\//i.test(el.src) && !/https:\/\//i.test(el.src))){
                    var resize=function(){
                        autoheight = true;
                        var height = false;
                        if(isIE){ 
                            height = el.contentWindow.document.body.scrollHeight;
                        }
                        else{
                            height = $el.contents().find("html").height();
                        }
                        height+=35;
                        if(options.autoheightSpeed && options.autoheightSpeed>0){
                            if(loading){
                                loading.animate({height:height},options.autoheightSpeed,function(){
                                    loading.fadeOut('fast'); 
                                });
                            }
                            $el.animate({height:height},options.autoheightSpeed);
                        }
                        else{
                            $el.css('height',height);
                        }
                    };
                    if(isIE && el.contentWindow.document.body !== null){
                        resize();
                    }
                    else{
                        $el.load(resize);  
                    }

                }
                else if(typeof console!=='undefined'){
                    console.error('IFRAMEplus: autoheight don\'t work with crossdomain content ('+el.src+')');
                }
            }
            if($el.hasClass(x+'loading')){
                var pos = $el.offset();
                var base=$.extend({},options.loadingCss,{width:$el.outerWidth(),height:$el.outerHeight(),
                          lineHeight:$el.height()+'px',position:'absolute',top:pos.top,left:pos.left});
                loading=$('<div>').css(base).html(options.loadingHtml).appendTo('body');
                if(isIE && el.contentWindow.document.body !== null){
                    loading.fadeOut('fast');
                }
                else{
                    $el.load(function(){
                        if(!options.autoheightSpeed || !autoheight) loading.fadeOut('fast');
                    });
                }
            }
        });
    };
    
    $.fn.HTMLplus.IMG = function(nodes,options,x){
        options = $.extend(true,{
           
        },options);
        var natural = function(obj,prop){
            var f = 'natural'+prop;
            if(f in new Image()) return obj[f];
            else if(obj.tagName.toLowerCase()==='img'){
                var img = new Image();
                img.src = obj.src;
                return img[prop.toLowerCase()];
            }
        };
        nodes.each(function(){
            var el=this;
            var $el=$(el);
            var zoom=$el.classPre(x+'zoom',1);
            if($(this).width()<natural(this,'Width') || $(this).height()<natural(this,'Height')){
                if(zoom.inline){
                    $el.unbind('click',$.fn.HTMLplus).click(function(){
                        var $t = $(this);
                        if($t.data('zoomed')){
                            $t.animate({width:$t.data('zoomed')},200);
                            $t.data('zoomed',false);
                        }
                        else{
                            $t.data('zoomed',$t.width());
                            var clone=$t.next();
                            if(!clone.is('img.cloned')){
                                clone=$t.clone().hide().css('width','auto').addClass('cloned');
                                $t.after(clone);
                            }
                            if(!zoom.max) zoom.max='9000';
                            var $parent=$el.parent();
                            var diff=$el.outerWidth(true)-$el.width();
                            if($parent.is('figure,div.figure')){
                                diff=$parent.outerWidth(true)-$el.width();
                                $parent=$parent.parent();
                            }
                            var max = Math.min(clone.width(),zoom.max,$parent.width()-diff);
                            $t.animate({width:max},200);
                        }
                    }).css('cursor','pointer');
                }
                else if(zoom.popup){
                    $el.unbind('click',$.fn.HTMLplus).click(function(){
                        var $t = $(this);
                        if(!$t.data('zoomed')){
                            $t.data('zoomed',true);
                            var pre = new Image();
                            pre.onload = function(){
                                var ratio=1;
                                var maxWidth = $(window).width()-50;
                                var maxHeight = $(window).height()-50;
                                if(pre.width > maxWidth) ratio = maxWidth / pre.width;
                                if(pre.height > maxHeight && ratio>(maxHeight / pre.height)) ratio = maxHeight / pre.height;
                                var nW=pre.width*ratio;
                                var nH=pre.height*ratio;
                                var mt='-'+(nH/2)+'px';
                                var ml='-'+(nW/2)+'px';
                                var $mask=$('<div style="position:fixed;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0;background:#000;z-index:1000000000;opacity:0.7">');
                                var $clone=$t.clone().css({width:nW,height:nH,position:'fixed',top:'50%',left:'50%',marginTop:mt,marginLeft:ml,zIndex:1000000001,border:'1px solid #fff'});
                                var $caption=null;
                                var remove = function(e){
                                    if(e.which === 1 || e.which === 27 || e.wich === undefined){
                                        $mask.remove();
                                        $t.data('zoomed',false);
                                        $clone.remove();
                                        if($caption) $caption.remove();
                                        $(document).unbind('keydown',$.fn.HTMLplus);
                                    }
                                };
                                $clone.click(remove);
                                $(document).keydown(remove);
                                $('body').append([$mask,$clone]);
                                if($el.is('[title]') && !zoom.nocaption){
                                    var offset = $clone.offset();
                                    $caption=$('<div class="zoom-caption" style="position:fixed;z-index:1000000001;background:#fff;padding:0 5px;top:50%;margin-top:'+(nH/2-17)+'px;height:18px;left:'+(offset.left)+'px">').html($el.attr('title'));
                                    $clone.attr('title','');
                                    $('body').append($caption);
                                }
                            };
                            pre.src = $t.attr('src');
                        }
                    }).css('cursor','pointer');
                }
            }
            if(jQuery.fn.lazy && $el.data('src') && $el.hasClass('lazy')){
                $el.lazy();
            }
            if($el.is('[title]') && $el.hasClass('caption') && $el.css('position')==='static'){
                if(/MSIE [678]/.test(navigator.userAgent)){
                    $el.wrap('<div class="figure">');
                    $el.after('<div class="figcaption">');
                }
                else{ 
                    $el.wrap('<figure>');
                    $el.after('<figcaption>');
                }
                $el.next().html($el.attr('title')).css('width',$el.outerWidth(true));
                $el.parent().css({float:$el.css('float')});
                $el.css('float','none');
            }
        });
    };
    
    $.fn.HTMLplus.TEXTAREA = function(nodes,options,x){
        options = $.extend(true,{
            lb:'\n'
        },options);
        nodes.each(function(){
            var el=this;
            var $el=$(el);
            var $mirror=null;
            var setHeight=function(){
                if(!$mirror){
                    $mirror=$('<div class="autogrow-mirror"></div>').css({
                        display:'block',
                        position:'absolute',
                        visibility:'hidden',
                        wordWrap:'break-word',
                        padding:$el.css('padding'),
                        width:$el.css('width'),
                        fontFamily:$el.css('font-family'),
                        fontSize:$el.css('font-size'),
                        lineHeight:$el.css('line-height'),
                        maxHeight:$el.css('max-height')
                    });
                    $mirror.insertAfter($el);
                    $el.css({overflow:'hidden',minHeight:$el.attr('rows')+"em"});
                }
                $mirror.html($el.val().toString().replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />')+'.<br/>.<br/>.');
                $el.height($mirror.height());
            };
            if($el.hasClass(x+'autoheight')) setHeight();
            var maxLength=$el.classPre(x+'maxlength',false);
            var lbox=$el.classPre(x+'lbox',false);
            if(lbox){
                lbox=$('#'+lbox).eq(0);
                var lboxInput=lbox.is(':input');
                var invertCount=(!lboxInput && parseInt(lbox.html(),10)>0) ? true : false;
            }
            if(maxLength || lbox){
                $el.keypress(function(e){
                    if(maxLength){
                        var c=String.fromCharCode(e.charCode===undefined ? e.keyCode : e.charCode);
                        return (e.ctrlKey || e.metaKey || c==='\u0000' || $el.val().length < maxLength);
                    }
                    else return true;
                }).keyup(function(){
                    var txt = $el.val();
                    var t=(options.lb==='\n') ? '~' : '~~';
                    var used = txt.replace(/\r\n/g,t).replace(/\n/g,t).length;
                    if(maxLength && (used > maxLength)){
                        var lines = txt.split(/\r\n|\n/);
                        txt = '';
                        var i = 0;
                        while(txt.length<maxLength && i<lines.length){
                            txt += lines[i].substring(0,maxLength-txt.length)+options.lb;
                            i++;
                        }
                        $el.val(txt.substring(0,maxLength));
                        $el[0].scrollTop = $el[0].scrollHeight; //Scroll to bottom
                        used = maxLength;
                    }
                    if(lbox){
                        if(lboxInput) lbox.val(used);
                        else{
                            lbox.html((invertCount) ? (maxLength-used) : used);
                        }
                    }
                });
                $el.trigger('keyup');
            }
            var maxWords=$el.classPre(x+'maxwords',false);
            var wbox=$el.classPre(x+'wbox',false);
            if(wbox){
                wbox=$('#'+wbox).eq(0);
            } 
            if(maxWords || wbox){
                $el.keyup(function(){
                    var txt = $el.val();
                    var len = (txt==='') ? [] : txt.replace(/\s+$/,"").split(/[\s]+/);
                    var used = len.length;
                    if(maxWords && (used > maxWords)){
                        var tot=0;
                        var inWord=false;
                        var i=0;
                        while(tot<maxWords && i<txt.length){
                            if(txt[i]===" " || txt[i]==="\n" || txt[i]==="\r"){
                                if(inWord){
                                    tot++;
                                    inWord=false;
                                }
                            }
                            else{
                                inWord=true;
                            }
                            i++;
                        }
                        $el.val(txt.substring(0,i));
                        used=tot;
                    }
                    if(wbox){
                        if(wbox.is(':input')) wbox.val(used);
                        else wbox.html(used); 
                    }
                });
                $el.trigger('keyup');
            }
            if($el.hasClass(x+'autogrow')){
                $el.keyup(setHeight);
                setHeight();
            }
        });
    };
    
    $.fn.classPre = function(prefix,all){
        var classes=this.attr('class').split(' ');
        prefix+='-';
        var l=prefix.toString().length;
        var value=(all) ? {} : false;
        $.each(classes,function(i,v){
            if(v.slice(0,l)===prefix){
                if(all){
                    var t = v.slice(l).split('-',2);
                    if(typeof t[1]==='undefined' || t[1]===null) t[1]=1;
                    else if(!isNaN(t[1])) t[1]=parseInt(t[1],10);
                    else if(t[1]==='true') t[1]=true;
                    else if(t[1]==='false') t[1]=false;
                    value[t[0]]=t[1];
                } 
                else{
                    value = v.slice(l);
                    return;
                }
            } 
        });
        return value;
    };
}));