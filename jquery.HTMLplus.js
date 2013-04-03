/*!
 * jQuery HTMLplus plugin
 * Version 1.1.0
 * @requires jQuery v1.3.2 or later
 *
 * Copyright (c) 2013 Andrea Vallorani, andrea.vallorani@gmail.com
 * Released under the MIT license
 */
(function($) {
    /*jshint debug:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, browser:true, devel:true, jquery:true, indent:4*/
    $.fn.HTMLplus = function(options){
        options = $.extend(true,{
            tags: ['A','CODE','DIV','IFRAME','TEXTAREA'],
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
                var tagOptions={};
                if(typeof options[tag] === 'object'){
                    tagOptions=options[tag];
                }
                var nodes=($root.is(tag)) ? $root : $root.find(tag+'[class]');
                $.fn.HTMLplus[tag](nodes,tagOptions,options.prefix);
            }
        });
    };
    
    $.fn.HTMLplus.A = function(nodes,options,x){
        //console.time('loading');
        var IsAnchor = function(url){
            return (url.toString().charAt(0)==='#') ? true : false;
        };
        options = $.extend(true,{
            win: {width:400,height:400,scrollbars:0,toolbar:0},
            confirm: 'Are you sure you want to open the link?',
            confirmType: false,
            disabledMsg: 'alert',
            scroll: {speed:300,offsetY:0},
            notify: {life:10,type:null},
            dialog: {dialogClass:'htmlplus-dialog'}
        },options);

        nodes.filter('.'+x+'confirm,.'+x+'dialog,.'+x+'disabled').each(function(){
            if($(this).is('[title]')){
                var e=$(this);
                e.data('title',e.attr('title')).removeAttr('title');
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
                else if(confirm(msg)) return a.data('confirmed',true).triggerHandler('click');
                return false;
            }
            if(a.hasClass(x+'dialog')){
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
                var wSett='';
                var aSett=$.extend({},options.win,a.classPre(x+'win',1));
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
                        aSett.left = (wPage/2)-(aSett.width/2);
                        aSett.top = (hPage/2)-(aSett.height/2);
                        delete aSett.center;
                    }
                }
                $.each(aSett,function(i,v){
                    wSett+=','+i+'='+v;
                });
                wSett=wSett.substr(1);
                window.open(url,'win',wSett);
                return false;
            }
            else if(a.hasClass(x+'scroll')){
                if(!IsAnchor(url)) return false;
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

        nodes.unbind('click',$.fn.HTMLplus).click(parser);
        //console.timeEnd('Aplus loading');
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
                    default: var $obj=$('#'+heightas);
                             if($obj.length) newHeight=$obj.eq(0).height();
                }
                
                if($el.height()<newHeight) $el.css('height',newHeight);
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
        options = $.extend({
            autoheightSpeed:600,
            loadingCss:{},
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
                          lineHeight:$el.height()+'px',position:'absolute',top:pos.top,
                          left:pos.left,opacity:0.8,background:'#ddd',textAlign:'center'});
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
    
    $.fn.HTMLplus.TEXTAREA = function(nodes,options,x){
        nodes.each(function(){
            var el=this;
            var $el=$(el);
            if($el.hasClass(x+'autoheight')){
                var rows=$el.attr('rows');
                $el.attr('rows',1);
                var maxH = parseInt($el.css('maxHeight'),10);
                if(maxH && maxH > 0){
                    $el.height(Math.min(el.scrollHeight,maxH));
                }
                else{
                    $el.height(el.scrollHeight);
                }
                $el.attr('rows',rows);
            }
            var maxLength=$el.classPre(x+'maxlength',false);
            var lbox=$el.classPre(x+'lbox',false);
            if(lbox){
                lbox=$('#'+lbox).eq(0);
            } 
            if(maxLength || lbox){
                $el.bind('keyup change',function(){
                    var txt = $el.val();
                    var used = txt.length;
                    if(maxLength && (used > maxLength)) {
                        $el.val(txt.substring(0,maxLength));
                        used = maxLength;
                    }
                    if(lbox){
                        if(lbox.is(':input')) lbox.val(used);
                        else lbox.html(used); 
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
                $el.bind('keyup change',function(){
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
})(jQuery);