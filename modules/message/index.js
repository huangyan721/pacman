mui.init();
mui.ready(function() {
	var rows = 10;
	var ul = document.getElementById("list");
//	mui("#pullrefresh").pullRefresh({
//		down : {
//	      	callback :function(){
//	      		setTimeout(function(){
//	      			
//	      		mui('#pullrefresh').endPulldownToRefresh();
//	      		},1000);
//	      	}
//	    }
//	});
//	return;
	mui.pullrefresh('#pullrefresh', {
		pullup: true,
		pulldown: true,
		callback: function(page, end) {
			if(page == 1) {
				ul.innerHTML = "";
			}
			Request.post('/message/queryPage.do', {
				rows: rows,
				page: page
			}, function(json){
				if (!json.success) return; 
				for(var i = 0; i < json.rows.length; i++) {
					var li = document.createElement("li");
					li.innerHTML = '<div class="mui-card border" name="' + json.rows[i].messageId + '">' 
							+ '<div class="mui-card-content" style="padding: 8px 16px;">'
							+ '	<span class="color-text" style="display: block; font-size: 14px; text-align: center;">发表于' + json.rows[i].createTime + '</span>'
							+ '	<span>'
							+ json.rows[i].messageContent
							+ '	</span>'
							+ '<div style="text-align: right;" class="del">'
							+ '		<span style="display: inline-block; width: 20px; height: 20px; background-image: url(../../public/images/icon-del.png); background-size: 100% 100%;"></span>'
							+ '	</div>'
							+ '</div>'
							+ '</div>';
					ul.appendChild(li);
				}
				mui(ul).on('tap', '.del', function(){
					var topNode = this.parentNode.parentNode;
					Request.checkPost({
						url: '/message/delMsg.do',
						data: {messageId: topNode.getAttribute('name')},
						callback: function(json){
							if (json.success) {
								mui.toast('删除成功'); ul.removeChild(topNode.parentNode);
							}
						}
					}, '确定删除吗');
				});
				end(rows*page >= json.total);
			});
		}
	});
	
	mui('.mui-bar .icon-del')[0].addEventListener('tap', function(){
		if(ul.childNodes.length > 0) {
			Request.checkPost({
			url: '/message/clearMsg.do',
				callback: function(json){
					if (json.success) {
						mui.toast('操作成功');
						ul.innerHTML = '';
					}
				}
			}, '确定清空所有消息吗');
		} else {
			mui.toast('无消息可清空');
		}
	});

});
