mui.init();
//mui.plusReady(function() {
mui.ready(function() {
	var rows = 6;
	mui.each([1, 2, 3, 4], function(index, item) {
		mui.pullrefresh('#scroll' + item, {
			pullup: true, pulldown: true,
			callback: function(page,end) {
				var ul = document.getElementById("list" + item);
				setTimeout(function() {
					if(page == 1) {
						ul.innerHTML = "";
					}
					Request.post('/order/queryOwnerOrderPage.do', {
						rows: rows, 
						page: page,
						orderStatus: item == 1 ? 3 : (item == 2 ? 4 : (item == 3 ? 5 : 6))
					}, function(json) {
//						console.log(JSON.stringify(json.rows))
						if(!json.success) return;
						for(var i = 0; i < json.rows.length; i++) {
							var li = createLi(json.rows[i]);
							ul.appendChild(li);
						}
						mui(ul).on('tap', 'label', function(evt){
//							evt.stopPropagation();
							//mui.alert(this.querySelector('div').innerHTML, '价格明细');
							this.innerHTML='<font color=\'gray\'>'+this.querySelector('div').innerHTML+'</font>';
						});
						mui(ul).on('tap', 'li', function(evt){
							if (evt.target.tagName != 'LABEL')
								mui.open('order', 'detail', {orderNo: this.name});
						});
						end(rows*page >= json.total);
					});
				}, 200);
			}
		});
	});

	function createLi(item) {
		var li = document.createElement("li");
		li.name = item.orderNo;
		var addr = item.addr.split(',');
		
		var addressStr="从<span class='color-href'>"+addr[0]+"</span>";
		if(addr.length>2){
			for (i=1;i<=addr.length - 2;i++) {
				addressStr+="经<span class='color-href'>"+addr[i]+"</span>";
			}
		}
		addressStr+="到<span class='color-href'>"+addr[addr.length - 1]+"</span>";
		
		li.innerHTML = '<div class="mui-card">'
					+ '<div class="mui-card-content" style="padding: 8px 16px;">'
					+ '	<div style="float: right;">'
					+ '		<span style="color:red">' + item.orderStatusStr + '</span>'
					+ '		</div>'
					+ '			<div>'
					+ '				<div>' + item.createTime + '</div>'
					+ '				<div id="addrs" style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;">' + addressStr + '</div>'
					+ '				<div>'
					+ '					金额:<span>￥' + item.orderPrice + '</span>'
					+ '				</div>'
					+ '			</div>'
					+ '		</div>'
					+ '	</div>';
		return li;
	}
});