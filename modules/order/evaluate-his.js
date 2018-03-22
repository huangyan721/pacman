mui.init();
mui.plusReady(function() {
	
	var web = plus.webview.currentWebview();
	var driverId = web.driverId;
	
	var rows = 8;
	mui.pullrefresh('#scroll1', {
		pullup: true,
		callback: function(page, end) {
			var ul = document.getElementById("list1");
			setTimeout(function() {
				if(page == 1) {
					ul.innerHTML = "";
				}
				Request.post('/driver/queryEvaluateHis.do', {
					rows: rows, page: page,
					driverId: driverId
				}, function(json) {
					if(!json.success) return;
					for(var i = 0; i < json.rows.length; i++) {
						var li = createLi(json.rows[i]);
						ul.appendChild(li);
					}
					end(rows*page >= json.total);
				});
			}, 200);
		}
	});

	function createLi(item) {
		var li = document.createElement("li");
		var html = '<div class="mui-card">'
				+ '<div class="mui-card-content" style="padding: 10px;">'
				+ '	 <div>'
				+ '		 <span>';
				for (var i = 0; i < 5; i++) {
					html += '<i>' + (i < item.evaluate ? '★' : '☆ ') +'</i>';
				}
			html +=	'</span>'
				 + ' <span class="mui-pull-right" style="color:gray">' + item.evaluateTime + '</span>' 
				 + ' </div>'
				 + '	<div style="color:gray;font-size:12px">'
				 + 			(item.evaluateRemark||'未写评价内容')
				 + '	</div>'
				 + '<div>'
				 + '</div>';
		li.innerHTML = html;
		return li;
	}
});