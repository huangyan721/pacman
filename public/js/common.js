var LOAD_GIM_BASE64="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wCZ/8Lm/kKz/gCZ/2K//oLM/pLT/iH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==";
/**
 * 时间对象的格式化
 */
Date.prototype.format = function(format) {
	format=format||"yyyy-MM-dd hh:mm:ss";
	var o = {
		"M+" : this.getMonth() + 1,
		"d+" : this.getDate(),
		"h+" : this.getHours(),
		"m+" : this.getMinutes(),
		"s+" : this.getSeconds(),
		"q+" : Math.floor((this.getMonth() + 3) / 3),
		"S" : this.getMilliseconds()
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	}

	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
(function() {
	mui.on = function(action, callback, context) {
		window.addEventListener(action, function(event) {
			callback.call(context, event.detail);
		});
	};
	mui.open = function(module, subpage, extras, createNew) {
		subpage = subpage || 'index';
		mui.openWindow({
			url: '../'+module+'/'+subpage+'.html',
			id: module+'/'+subpage,
			extras: extras,
			createNew: !!createNew
		});
	};
	mui.pullrefresh = function(el, options) {
		options = mui.extend({
			pulldown: true, pullup: true
		}, options);
		var page = 0; var ispulldown = false;
		var context = mui(el).pullRefresh({
			container: el,
			down: !options.pulldown ? null : {
				callback: function() {
					ispulldown = true;
					options.callback(1, end);
				}
			},
			up: !options.pullup ? null : {
				contentrefresh: '正在加载...',
				auto: true,
				callback: function() {
					ispulldown = false;
					options.callback(page + 1, end);
				}
			}
		});
		function end(reachend) {
			page = ispulldown ? 1 : (page + 1);
			ispulldown && context.endPulldownToRefresh();
			if(!ispulldown) {
				context.endPullupToRefresh(false);
			}
			context[reachend ? 'disablePullupToRefresh' : 'enablePullupToRefresh']();
		}
	};
})();
var Util={
	APP_DEBUG:true,
	APP_TYPE:3,//货主端
	checkAttr:function(attr, val){
		return (attr & val) == val;
	},
	checkExpire:function(user){//检测session是否过期
		if(!window.Cache || !Cache.LOGIN_TOKEN)return false;
		user = user||Cache.getUser();
		var token = Cache.getToken();
		if(user && user.exTime > 0 && user.type==Util.APP_TYPE){
			var sysTime = new Date().getTime() / 1000;
			if(token && sysTime - user.exTime < 63072000){//两年不用登录
				return false;
			}
		}
		return true;
	},
	toLoginPage:function(){
		Cache && Cache.loginOut();
		var href = window.location.href;
		href = href.substr(0, href.indexOf("/www/")+5);
		if(window.location.href.lastIndexOf("/login.html") > 10) return;
		mui.open('account', 'login');
	},
	toMainPage:function(){
		plus.webview.getWebviewById(plus.runtime.appid);
	}
}

var MSG={
	confirm:function(msg, callback, btnArr, title){
		btnArr = btnArr||['取消', '确定'];
		if(typeof btnArr === 'string') title = btnArr;
		window.plus && (btnArr = [btnArr[1],btnArr[0]]);
        mui.confirm(msg, title||"信息确认", btnArr, callback);
	},
	_mainMask:null,
	showWaiting:function(info, options){	
		if(!window.plus && this._mainMask==null){
			var html = '<div id="main-waiting-box" style="position: fixed; width: 100%;'
				+' height: 100%; z-index: 9999; text-align: center; padding-top: 60%; '
				+ 'background: transparent;"><div><img src="'+LOAD_GIM_BASE64
				+'" style=" border: 0; vertical-align: middle; margin: 0; width: 30px; '
				+'height: 30px;" /><label sytle="margin-left: 5px; font-size: 14px; color: white;">'
				+(info||"") + '</label></div></div>';
			var callback = (!options || (typeof options) ==="function") ? options:options.callback;
			this._mainMask = mui.createMask(callback);//callback为用户点击蒙版时自动执行的回调；
			this._mainMask[0].innerHTML = html;
		}
		if(this._mainMask){
			mui("#main-waiting-box label").innerText = info;
			this._mainMask.show();//显示遮罩
			return this._mainMask;
		}
		options = options||{}; options.padlock = options.padlock||false;
		return plus.nativeUI.showWaiting(info, options);
	},
	closeWaiting:function(){
		this._mainMask && this._mainMask.close();
		window.plus && plus.nativeUI.closeWaiting();
	}
};

var Request={
//	base_url:"http://192.168.31.246:8080",
//	base_url:"http://192.168.31.107:8080",
//	base_url:"http://youxi.xicp.cn",
//	base_url:"http://119.23.53.246:8081",
	base_url:"http://17788h3z50.51mypc.cn:31100",
//	base_url:"http://www.suyunxia.com",
	ATTR_LOAD_MODEL:1,//模式加载
	ATTR_LOAD_FORCE:2,//强制加载，未登录不会跳过到登录面
	ajax:function(options){
		options.attr = options.attr || 0;
		if(!Util.checkAttr(options.attr, Requert.ATTR_LOAD_FORCE) && !Cache.getToken()){
			mui.toast("尚未登录或登录超时"); Util.toLoginPage(); return;
		}
		Util.checkAttr(options.attr,Requert.ATTR_LOAD_MODEL) && MSG.showWaiting();
		options.url = this.base_url+options.url;
		options.type = options.type||'post';
		options.headers={}||options.headers;
		options.headers[Cache.TOKEN_UUID]=Cache.getUUID();
		options.headers[Cache.LOGIN_TOKEN]=Cache.getToken();
		options.headers['userType']=3;
		options.headers['_REQUEST_AJAX_KEY_']=true;
		options.timeout=options.timeout||15000;//超时时间设置为10秒；
		options.success=function(data, state, xhr){
			//console.info("返回信息："+JSON.stringify(data));//TODO:开发测试
			try{
				if(typeof data === "string") data = JSON.parse(data);
			}catch(e){
				data = {"success":false, "message":(e.message||"解析成json数据失败"), "code":-1};
			}
			var LOGIN_TOKEN = xhr.getResponseHeader("LOGIN_TOKEN");
			if(LOGIN_TOKEN && LOGIN_TOKEN !== ""){
				if(window.Cache && Cache.TOKEN_UUID){
					var user = Cache.getUser();
					if(user){
						user.exTime = new Date().getTime() / 1000;
						Cache.setUser(user); Cache.setToken(LOGIN_TOKEN);
					}
				}
			}
			var REQUEST_ERROR = xhr.getResponseHeader("REQUEST_ERROR_KEY");
			if(REQUEST_ERROR === "true" || data.success === false){
				options.error(xhr, data); return;
			}
			Util.checkAttr(options.attr, Requert.ATTR_LOAD_MODEL) && MSG.closeWaiting();
			var isStopRun = true;
			if(options.callback){
				if(data)
					isStopRun = options.callback(data, xhr);
				else{
					isStopRun = options.callback(data, xhr);
				}
			}
			if(data && !isStopRun && data.success===false){
				mui.toast(data.message);
			}
		};
		options.error=function(xhr, type, e){
			var data = (typeof type === 'object')?type:{"success":false, code:-1, "message":"请求提示："+type};
			Util.checkAttr(options.attr, Requert.ATTR_LOAD_MODEL) && MSG.closeWaiting();
			var isStopRun = options.callback ? options.callback(data, xhr) : false;
			if(data.message == "abort") data.message = "当前网络不可用";
			!isStopRun && mui.toast(data.message||"尚未登录或登录超时"); 
			if(data.code === 401 && !Util.checkAttr(options.attr, Requert.ATTR_LOAD_FORCE))
				Util.toLoginPage();
		};
		//console.info("请求信息："+JSON.stringify(options));//TODO:开发测试
		mui.ajax(options);
	},
	post:function(url, data, callback, attr){
		if(!callback) callback = data;
		this.ajax({url:url, data:data, callback:callback, attr:attr});
	},
	checkPost:function(options, msg){
		var confirm = options.confirm;
		if(!confirm){
			confirm = function(e){
				options.confirm = null;
				window.plus && (e.index = e.index==0?1:0);
				if(e.index == 1)
					Requert.ajax(options);
			}
		}
		MSG.confirm(msg, confirm);
	}
};
function plusReady(){
	if(window.checkSession!=false){
		if(Util.checkExpire()){
			if(window.checkSession===false){
				window.checkSession=true; return true;
			} 
			Util.toLoginPage(); return false;
		}	
	}
	return true;
}
var Requert = Request;
if(window.plus){
	plusReady();
}else{
	document.addEventListener('plusready',plusReady, false);
}
