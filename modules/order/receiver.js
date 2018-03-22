mui.init();
mui.ready(function() {
	var rows = 10;
	var ul = document.getElementById("list");
	
	mui('.mui-scroll-wrapper').scroll();

	Request.post('/common/queryTop.do', {}, function(json) {
		if (!json.success) return;
		mui.each(json.data, function(index, item) {
			var li = document.createElement("li");
			li.className = 'mui-table-view-cell';
			li.innerHTML = '<a class="mui-navigate-right">' +
							'<span class="name">' + item.name + '</span>' +
							'<span class="phone color-hint">' + item.phone + '</span>' +
							'</a>' +
							'</li>';
					ul.appendChild(li);
			
			li.addEventListener('tap', function() {
				var view = plus.webview.getWebviewById('order/confirm');
				mui.fire(view, 'receiver', item);
				mui.back();	
			});
			
		});
	});
});
