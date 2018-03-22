function finishedShare() {
	plus.share.getServices(function(s) {
		shares = {};
		for(var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
	}, function(e) {
		outLine("获取分享服务列表失败：" + e.message);
	});
}
function shareAction(id, ex) {
	var s = null;
	if(!id || !(s = shares[id])) {
//		outLine("无效的分享服务！");
		return;
	}
	if(s.authenticated) {
//		outLine("---已授权---");
		shareMessage(s, ex);
	} else {
//		outLine("---未授权---");
		s.authorize(function() {
			shareMessage(s, ex);
		}, function(e) {
//			outLine("认证授权失败");
		});
	}
}
function shareMessage(s, ex) {
	var msg = {
		content: '分享-详情',
		href: 'http://www.suyunxia.com/share/fenxiang.html',
		title: '货主大人',
		content: '一个无论大小物件都可以送达的app',
		thumbs: ['../../public/images/driver.png'],
		pictures: ['../../public/images/driver.png'],
		extra: {
			scene: ex
		}
	};
	s.send(msg, function() {
		outLine("分享成功!");
	}, function(e) {
		outLine("分享失败!");
	});
}
function shareHref() {
	var ids = [{
			id: "qq" /*QQ好友*/
		},
		{
			id: "weixin",
			ex: "WXSceneSession"  /*微信好友*/
		},
		{
			id: "weixin",
			ex: "WXSceneTimeline" /*微信朋友圈*/
		}],
		bts = [{
			title: "分享到QQ"
		},
		{
			title: "分享到微信好友"
		},
		{
			title: "分享到微信朋友圈"
		}];
	plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: bts
		},
		function(e) {
			var i = e.index;
			if(i > 0) {
				shareAction(ids[i - 1].id, ids[i - 1].ex);
			}
		}
	);
}
function outLine(msg) {
	mui.toast(msg);
}

mui.init();
var main = null;
mui.ready(function() {
	divLoginout.addEventListener("tap", function() {
		Request.ajax({
			url: "/open/loginOut.do",
			attr: (Request.ATTR_LOAD_MODEL | Request.ATTR_LOAD_FORCE),
			callback: function(rs) {
				return true;
			}
		}, 150);
		Cache.loginOut();
		Util.toLoginPage();
	});
});

mui.plusReady(function() {
	main = plus.webview.getWebviewById("main/index"); //  .currentWebview().opener();
	main && mui.fire(main, "menu:swipeleft");
	
	plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo){
	    document.getElementById('banben').innerText = wgtinfo.version;
	});
});

agreement.addEventListener('tap', function() {
	mui.open('options', 'agreements')
})
standard.addEventListener('tap', function() {
	mui.open('options', 'charge')
})
declare.addEventListener('tap', function() {
	mui.open('options', 'declare')
})
deal.addEventListener('tap', function() {
	mui.open('options', 'deal')
})
share.addEventListener('tap', function() {
	shareHref()
	finishedShare();
})
refresh.addEventListener('tap', function() {
	mui.toast("已是最新版本，不需要更新")
})
jieshao.addEventListener('tap', function() {
	mui.open('options', 'JieShao')
})