var _is_ie = true;
var _360Buy_layer;
var _ErrorNum;
var _intervalProcess;
var _isStarted = false;
var _isError = false;
var _isLoad = false;
var _xmlhttp;
var _imgData = -1;
var _oldPrice = 0;
var _id;

function _360BuyInit()
{
    document.domain = "360buy.com";
    var agt = navigator.userAgent.toLowerCase();
    _is_ie = (agt.indexOf("msie") != -1 && document.all);
    var h = '';
    h += '<div id="_Crack360Buy">V3.1.1';
    h += '<div>';
    h += ' <form id="_book" onsubmit="return false;">';
    h += '    时间间隔（ms）：<input id="_txtInt" type="text" size="4" value="200" />';
    h += '    <br />';
    h += '    <canvas id="_imgPrice" width="55" height="12"></canvas>';
    h += '    <br />';
    h += '    <input id="_btnAutoBook" onclick="_AutoBook();" type="submit" value="开始查询" />';
    h += '    <input id="_btnStop" onclick="_StopAutoBook();" type="button" value="停止" />';
    h += '    <br />';
    h += '    <input id="_btnBuy" onclick="_Buy();" type="button" value="购买" />';
    h += ' </form>';
    h += '</div>';
    h += '<div id="_autoBook">';
    h += '</div>';
    h += '<div id="_errorMsg">';
    h += ' ';
    h += '</div>';
    h += '</div>';
    try
    {
        var el = document.createElement('div');
        el.id = '_360Buy_layer';
        el.style.position = 'absolute';
        el.style.left = document.documentElement.scrollLeft + 3 + 'px';
        el.style.top = document.documentElement.scrollTop + 30 + 'px';
        el.style.zIndex = 9000;
        el.style.border = '1px solid #808080';
        el.style.backgroundColor = '#F8F0E5';

        document.body.appendChild(el);
        _TaobaoSet(el, h);
        window.onscroll = function ()
        {
            document.getElementById("_360Buy_layer").style.left = document.documentElement.scrollLeft + 3 + 'px';
            document.getElementById("_360Buy_layer").style.top = document.documentElement.scrollTop + 30 + 'px';
        };
    }
    catch (x)
    {
        alert("Crack Tabobao can not support this page.\n" + x);
        _360Buy_layer = true;
        return;
    }

    _360Buy_layer = document.getElementById('_360Buy_layer');
}

function _ShowError(str)
{
    document.getElementById("_errorMsg").innerHTML = str;
}

function _createXmlHttp()
{
    var _xmlhttp = false;
    if (window.XMLHttpRequest)
    {
        _xmlhttp = new XMLHttpRequest();
    }
    else
    {
        try
        {
            _xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e)
        {
            try
            {
                _xmlhttp = new ActiveXObject("MSXML2.XMLHTTP.3.0");
            }
            catch (E)
            {
                try
                {
                    _xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (err)
                {
                    _xmlhttp = false;
                }
            }
        }
    }
    return _xmlhttp;
}

function _checkXmlHttp()
{
    if (typeof (_xmlhttp) == "undefined")
    {
        _xmlhttp = _createXmlHttp();
    }
    if (!_xmlhttp || _xmlhttp.readyState == 1 || _xmlhttp.readyState == 2 || _xmlhttp.readyState == 3)
    {
        return false;
    }
    return true;
}

function _getXmlHttp(url, para, callback)
{
    var time = new Date();
    if (!_checkXmlHttp())
    {
        return;
    }
    if (para != "")
    {
        para += "&timeStamp=" + time.getTime();
    }
    else
    {
        para = "timeStamp=" + time.getTime();
    }
    if (url.indexOf("#") > 0)
    {
        url = url.substring(0, url.indexOf("#"));
    }
    _xmlhttp.open("POST", url, true);

    _xmlhttp.onreadystatechange = function ()
    {
        if (_xmlhttp.readyState == 4 && (_xmlhttp.status == 200 || _xmlhttp.status == 0))
        {
            callback(_xmlhttp.responseText);
        }
    }

    _xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    _xmlhttp.send(para);

    document.getElementById("_autoBook").innerHTML = "正在查询：<br />" + time.toLocaleString();
}

function _BookCheck()
{
    var time = new Date();
    var canvas = $('#_imgPrice')[0];
    var context = canvas.getContext('2d');
    var oImg = new Image();
    oImg.onload = function ()
    {
        var iWidth = this.width;
        var iHeight = this.height;
        context.drawImage(oImg, 0, 0);
        try
        {
        	var oData = context.getImageData(0, 0, iWidth, iHeight).data;
        	var data = 0;
        	var len = oData.length;
        	for (var i = 0; i < len; i += 4)
        	{
            	data += oData[i];
        	}
        	if (_imgData < 0)
        	{
            	_imgData = data;
        	}
        	else
        	{
            	if (_imgData != data)
            	{
	                //秒杀开始
    	            _Buy();
        	        _StopAutoBook();
            	    _ShowError("秒杀开始");
            	}
        	}
    	}
    	catch(e)
    	{
    		alert("浏览器不允许跨域，请重新修改设置");
    	}
	}
    oImg.src = 'http://jprice.360buyimg.com/price/gp' + _id + '-1-1-1.png?' + time.getTime();

    document.getElementById("_autoBook").innerHTML = "正在查询：<br />" + time.toLocaleString();
}

function _Buy()
{
	_Init();
    if ($('#easybuy')[0])
    {
        $('#easybuy').click();
    }
    else
    {
        $.ajax(
        {
            type: "POST",
            dataType: "json",
            url: "http://cart.360buy.com/cart/addSkuToCart.action?rd=" + Math.random(),
            data: "pid=" + _id + "&pcount=" + $("#pamount").val() + "&ptype=1&ybId=",
            success: function (result)
            {
                if (result != null && result.success)
                {
                    //购物车添加完成
                    window.location.href = "http://cart.360buy.com/cart/splitCart/splitCart.action?rd=" + Math.random();
                }
                else
                {
                    //服务端返回的错误信息
                }
            },
            error: function (XMLHttpResponse)
            {

                }
        });
        //window.location.href = 'http://gate.360buy.com/InitCart.aspx?pid=' + _id + '&pcount=' + $("#pamount").val() + '&ptype=1';
    }
}

function _InitPage(str, div)
{
    var start = str.indexOf('"valItemInfo"');
    var strItemInfo = str.substring(start, str.indexOf('\n', start));
    var lis = div.getElementsByTagName("li");
    for (li in lis)
    {
        lis[li].onclick = function ()
        {
            this.style.fontWeight = "bold";
        }
    }
}

function _StopAutoBook()
{
    clearInterval(_intervalProcess);
    _isStarted = false;
    _isLoad = false;
    _ShowError("已停止");
}

function _AutoBook()
{
	_Init();
    var intTime = document.getElementById("_txtInt").value;
    _isStarted = true;
    _isLoad = true;
    _ShowError("");
    clearInterval(_intervalProcess);
    _intervalProcess = setInterval(_BookCheck, intTime);
}

function _Init()
{
    var url = location.href;
    var arr = url.split('/');
    var page = arr[arr.length - 1];
    _id = page.split('.')[0];
}

function _TaobaoSet(el, htmlCode)
{
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('msie') >= 0 && ua.indexOf('opera') < 0)
    {
        el.innerHTML = '<div style="display:none">for IE</div>' + htmlCode;
        el.removeChild(el.firstChild);
    }
    else
    {
        var el_next = el.nextSibling;
        var el_parent = el.parentNode;
        el_parent.removeChild(el);
        el.innerHTML = htmlCode;
        if (el_next)
        {
            el_parent.insertBefore(el, el_next)
        }
        else
        {
            el_parent.appendChild(el);
        }
    }
}

if (!document.getElementById('_Crack360Buy'))
{
    _360BuyInit();
}
else
{
    document.body.removeChild(document.getElementById('_Crack360Buy'));
    _360BuyInit();
}

//javascript:void((function(){var%20element=document.createElement('script');element.setAttribute('src','http://crack-360buy.googlecode.com/svn/trunk/Crack360Buy.js');document.body.appendChild(element);})())

//javascript:void((function(){alert(document.cookie);})())

//http://gate.360buy.com/InitCart.aspx?pid=543278&pcount=1&ptype=1
//location.href = "http://cart.360buy.com/splitCart/splitCart.action?rd="+Math.random();