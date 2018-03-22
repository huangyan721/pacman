mui.init();

mui.plusReady(function() {
	
	var self = plus.webview.currentWebview();
	var flag = true;
	document.getElementById("cancel").addEventListener('tap', function() {
		if(flag == true){
			flag = false;
			var reason = '';
			mui.each(document.getElementsByName('reason'), function(index, item) {
				if(item.checked) {
					reason = item.parentNode.getElementsByTagName('label')[0].innerHTML;
				}
			});
			
			Request.post('/order/changeOrderStatus.do', {
				orderNo: self.orderNo,
				status: 6,
				cancelReason: reason,
			}, function() {
				var view = plus.webview.getWebviewById('order/detail');
				mui.fire(view, 'reload', {});
				mui.back();
			});
		}
	});
	

});