﻿var _is_ie = true;
var _360Buy_layer;
var _ErrorNum;
var _intervalProcess;
var _isStarted = false;
var _isError = false;
var _xmlhttp;
var _itemInfo;
var _oldPrice = 0;
var _id;
var _skus = new Array();

function _360BuyInit()
{
    var agt = navigator.userAgent.toLowerCase();
    _is_ie = (agt.indexOf("msie")!=-1 && document.all);
    var h = '';
    h += '<div id="_Crack360Buy">V1.0.2';
    h += '<div>';
    h += ' <form id="_book" onsubmit="return false;">';
    h += '    时间间隔（ms）：<input id="_txtInt" type="text" size="4" value="200">';
    h += '    <br />';
    h += '    <input id="_btnAutoBook" onclick="_AutoBook();" type="submit" value="开始查询">';
    h += '    <input id="_btnStop" onclick="_StopAutoBook();" type="button" value="停止">';
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
        el.id='_360Buy_layer';
        el.style.position='absolute';
        el.style.left = document.documentElement.scrollLeft + 3 + 'px';
        el.style.top = document.documentElement.scrollTop + 30 + 'px';
        el.style.zIndex=9000;
        el.style.border = '1px solid #808080';
        el.style.backgroundColor='#F8F0E5';

        document.body.appendChild(el);
        _TaobaoSet(el, h);
        window.onscroll = function()
        {
            document.getElementById("_360Buy_layer").style.left = document.documentElement.scrollLeft + 3 + 'px';
            document.getElementById("_360Buy_layer").style.top = document.documentElement.scrollTop + 30 + 'px';
        };
    }
    catch(x)
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
    if(window.XMLHttpRequest)
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
    if ( typeof(_xmlhttp) == "undefined")
    {
        _xmlhttp = _createXmlHttp();
    }
    if (
        ! _xmlhttp
        || _xmlhttp.readyState == 1
        || _xmlhttp.readyState == 2
        || _xmlhttp.readyState == 3
        )
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
    if(para != "")
    {
		para += "&timeStamp=" + time.getTime();
	}
	else
	{
		para = "timeStamp=" + time.getTime();
	}
	if(url.indexOf("#") > 0)
	{
		url = url.substring(0, url.indexOf("#"));
	}
    _xmlhttp.open("POST", url, true);

    _xmlhttp.onreadystatechange = function ()
    {
        if (_xmlhttp.readyState == 4 && ( _xmlhttp.status == 200 || _xmlhttp.status == 0 ))
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
	//秒杀未开始
	if(_isStated != true)
	{
		_getXmlHttp('http://simigoods.360buy.com/ThreeCCombineBuying/CombineBuying.aspx?wids=' + _id + '&callback=ThreeCCombineBuyingCallback', "", _CheckResult);
	}
}

function _CheckResult(str)
{
	if(_oldPrice == 0)
	{
		_oldPrice = _GetPrice(str);
	}
	else
	{
		var price = _GetPrice(str);
		if(price < _oldPrice && _isStarted == false)
		{
			_isStarted = true;
        	clearInterval(_intervalProcess);
        	$.ajax(
            {
            	url: "http://buy.360buy.com/purchase/flows/easybuy/FlowService.ashx",
                type: "get",
                data: {
                	action: "SubmitOrderByDefaultTemplate",
                    skuId: _id,
                    num: $("#pamount").val()
                },
                dataType: "jsonp",
                success: function (r)
                {
                	if (r.Flag)
                    {
                    	window.location = r.Obj;
                    }
                    else
                 	{
                     	$(".btn-easy").show();
                     	if (r.Message != null)
                     	{
                         	alert(r.Message);
                     	}
                     	else
                     	{
                         	alert("暂时无法提交,请您稍后重试!");
                     	}
                 	}
             	}
        	});
		}
	}

}

function _GetPrice(str)
{
	var startString = '[{';
	var endString = '}]';
	var startPos = str.indexOf(startString);
	var endPos = str.indexOf(endString, startPos);
	var prices = eval('('+str.substring(startPos, endPos + 2)+')');
	var price = 0;
	for(i in prices)
	{
		if(prices[i].Wid == _id)
		{
			price = prices[i].WMeprice;
			break;
		}
	}
	return price;
}

function _Book(str)
{
	var start;
	var end;
	var html;
	var form;
	var dls;
	_ShowError("请设置购买信息");
	start = str.indexOf('<div class="key');
	end = str.indexOf('<ul class="other');
	html = str.substring(start, end);
	if(html != "")
	{
		//要回答问题的秒杀
		document.getElementById("_autoBook").innerHTML = html;
		document.getElementById("_btnBuy").style.display = "inline";
		dls = document.getElementById("_autoBook").getElementsByTagName("dl");
		//start = str.indexOf('<form id="J_FrmBid');
		//end = str.indexOf('detail-other end');
		//form = str.substring(start, end);
		//start = form.indexOf('<input');
		//end = form.indexOf('</form>');
		//form = form.substring(start, end);
		//问题：“问君能有几多愁”诗句的下句是：恰似一江春水向东流
		var question = '<input type="hidden" name="82cbc720f1cd8e8b3bd5982bf368de58" value="cf7cdf247800a0ba51337b340aa2632d" />';
		document.getElementById("J_FrmBid").innerHTML += question;
		//如果只有数量则直接提交
		if(dls.length > 1)
		{
			_InitPage(str, document.getElementById("_autoBook"));
		}
		else
		{
			_Buy();
		}
	}
	else
	{
		//不要回答问题的秒杀
		start = str.indexOf('<div class="tb-key');
		end = str.indexOf('<ul class="tb-other');
		html = str.substring(start, end);
		if (html != "")
		{
			document.getElementById("_autoBook").innerHTML = html;
			document.getElementById("_btnBuy").style.display = "inline";
			dls = document.getElementById("_autoBook").getElementsByTagName("dl");
			//如果只有数量则直接提交
			if(dls.length > 1)
			{
				_InitPage(str, document.getElementById("_autoBook"));
			}
			else
			{
				_Buy();
			}
		}
		else
		{
			document.getElementById("_autoBook").innerText = str;
		}
	}
	//window.location.reload();
}

function _InitPage(str, div)
{
	var start = str.indexOf('"valItemInfo"');
	var strItemInfo = str.substring(start, str.indexOf('\n', start));
	_itemInfo = eval("\({" + strItemInfo + "}\)");
	var lis = div.getElementsByTagName("li");
	for(li in lis)
	{
		lis[li].onclick = function()
		{
			_skus.push(this.getAttribute("data-value"));
			this.style.fontWeight = "bold";
		}
	}
}

function _StopAutoBook()
{
    clearInterval(_intervalProcess);
    _isStarted = false;
    _ShowError("已停止");
}

function _AutoBook()
{
	var url = location.href;
	var arr = url.split('/');
	var page = arr[arr.length - 1];
	_id = page.split('.')[0];
	var intTime = document.getElementById("_txtInt").value;
	_isStated = false;
    clearInterval(_intervalProcess);
	_intervalProcess = setInterval(_BookCheck, intTime);
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

if(!document.getElementById('_Crack360Buy'))
{
    _360BuyInit();
}
else
{
    document.body.removeChild(document.getElementById('_Crack360Buy'));
    _360BuyInit();
}

//javascript:void((function(){var%20element=document.createElement('script');element.setAttribute('src','http://crack-360buy.googlecode.com/svn/trunk/Crack360Buy.js');document.body.appendChild(element);})())

