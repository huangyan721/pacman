window.params = {};
//var startA = '';
//var endA = '';

function getLocation() {
	var container = document.getElementById("location-container");
	var children = container.children;
	var location = [];
	for(var i = 0; i < children.length; i++) {
		var value = children[i].children[3].value;
		if(value != null && !/^\s*$/.test(value)) {
			location.push(JSON.parse(value));
		}
	}

	return location;
}

function calculatePrice() {
	var location = getLocation();
	if(location.length >= 2) {
		var url = 'http://restapi.amap.com/v3/direction/driving?';
		var p = [
			"key=3e8c80ba41135292f6abf81c23c5c59c"
		];
		var item = location.shift();
		p.push("origin=" + item.lng + "," + item.lat);
		item = location.pop();
		p.push("destination=" + item.lng + "," + item.lat);

		if(location.length > 0) {
			for(var i = 0; i < location.length; i++) {
//				location[i] = location[i].lng.toFixed(6) + ',' + location[i].lat.toFixed(6);
				location[i] = location[i].lng + ',' + location[i].lat;
			}
			p.push("waypoints=" + location.join(';'));
		}

		url = url + p.join('&');
		document.getElementById("price").innerHTML = '计算中...';

		mui.ajax(url, {
			success: function(data) {
				if(data && data.status == 1) {
					var dist = parseInt(data.route.paths[0].distance);

					localStorage.setItem("dist", dist)
					//价格修改
					if(((params.busiId) - 1) == 0) {
						if(dist / 1000.0 <= 24) {
							params.orderPrice = 120;
						} else if(dist / 1000.0 > 24 && dist / 1000.0 <= 100) {
							params.orderPrice = 120 + (dist / 1000.0 - 24) * 5;
						} else {
							params.orderPrice = 120 + (dist / 1000.0 - 100) * 4.5 + (dist / 1000.0 - (dist / 1000.0 - 100) - 24) * 5;
						}
					} else {
						params.orderPrice = (dist / 1000.0 * [5, 3.6, 0.6, 0.3, 3.6][params.busiId - 1]);
						params.orderPrice = Math.max(params.orderPrice, [120, 60, 20, 10, 60][params.busiId - 1]);
					}

					// 保险费用
					params.orderPrice += [5, 5, 0.5, 0.5, 5][params.busiId - 1];

					//价格上限修改
					if(((params.busiId) - 1) == 0) {
						params.orderPrice = params.orderPrice > 3000 ? 3000 : params.orderPrice;
					}
					if(((params.busiId) - 1) == 1) {
						params.orderPrice = params.orderPrice > 5000 ? 5000 : params.orderPrice;
					}
					if(((params.busiId) - 1) == 4) {
						params.orderPrice = params.orderPrice > 5000 ? 5000 : params.orderPrice;
					}
					params.orderPrice = params.orderPrice.toFixed(2);
					params.kilometer = (dist / 1000.0).toFixed(2);
					document.getElementById("price").innerHTML = params.orderPrice;
				}
			}
		});
	} else {
		var doms = document.querySelectorAll('#sliderSegmentedControl a');

		for(var i = 0; i < doms.length; i++) {
			if(doms[i].classList.contains('mui-active')) {
				var price = [120, 60, 20, 10, 60][i];
				params.orderPrice = price;
				params.kilometer = 0;
				document.getElementById("price").innerHTML = price + '<span style="font-size: 14px;">起</span>';
				break;
			}
		}
	}
}

mui.ready(function() {
	mui('#scroll1').scroll();
	var _first = 0;
	mui.back = function() {
		if(_first == 0) {
			_first = new Date().getTime();
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				first = 0;
			}, 2000);
			return;
		}
		if(new Date().getTime() - _first < 2000)
			plus.runtime.quit();
	}
	if(Util.checkExpire()) {
		Util.toLoginPage();
		return;
	}
	calculatePrice();

	window.params = {
		busiId: 1
	};

	document.getElementById("notify").addEventListener('tap', function() {
		mui.open('notify');
	});

	document.getElementById("stored-position").addEventListener('tap', function() {
		mui.open('map', 'address', {
			type: 'all',
			page_id: 'main/index'
		});
	});

	//同城修改
	document.getElementById("commit-now").addEventListener('tap', function() {
//		if(params.busiId - 1 == 2 || params.busiId - 1 == 3) {
//			if(startA !== endA) {
//				mui.toast("起点与终点不属于同一个省份");
//			} else {
//				verify(true);
//			}
//
//		} else {
			verify(true);
//		}
	});

	document.getElementById("commit-appoint").addEventListener('tap', function() {
//		if(params.busiId - 1 == 2 || params.busiId - 1 == 3) {
//			if(startA != endA) {
//				mui.toast("起点与终点不属于同一个省份");
//			} else {
//				verify(false);
//			}
//
//		} else {
			verify(false);
//		}
	});

	document.querySelector('.mui-slider').addEventListener('slide', function(event) {
		calculatePrice();
		params.busiId = event.detail.slideNumber + 1;
	});

	document.getElementById("start-position-text").addEventListener('tap', function() {
		selectPosition(document.getElementById("start-position-text"));	
	}, false);
	
	//获取起点index
//	var start = document.getElementById('start-position-text').dataset.index;
//	localStorage.setItem("flag", start);

	document.getElementById("end-position-text").addEventListener('tap', function() {
		selectPosition(document.getElementById("end-position-text"));
	}, false);
	
	//获取终点index
//	var end = document.getElementById('end-position-text').dataset.index;
//	localStorage.setItem("flag", end);

	function verify(now) {
		params.orderPrice = document.getElementById("price").innerHTML;

		var start = document.getElementById("start-position").value;
		if(/^\s*$/.test(start)) {
			mui.toast('请选择出发地');
			return;
		}

		var location = getLocation();

		if(location.length < 2) {
			mui.toast('请至少选择一个目的地');
			return;
		}

		params.routes = location;

		params.now = now;

		if(!now) {
			var beginDate = new Date();

			//			var options = {
			//				beginDate: beginDate,
			//				endDate: new Date(beginDate.getTime() + 7 * 24 * 60 * 60 * 1000) 
			//			};
			//			
			//			var picker = new mui.DtPicker(options);
			//修改时间  2017年07月20日14:42:50   
			var picker = new mui.DtPicker({
				"type": "mydatetime",
				beginDate: beginDate,
				endDate: new Date(beginDate.getTime() + 7 * 24 * 60 * 60 * 1000)
			});

			picker.show(function(rs) {
				params.appointTime = rs.text;
				picker.dispose();

				mui.open('order', 'confirm', {
					params: params
				});
			});
		} else {
			mui.open('order', 'confirm', {
				params: params
			});
		}
	}

	mui.on('address', function(result) {

		if(result.type == 'all') {
			var location = result.location;

			var parent = document.getElementById("location-container");
			var offset = location.length - parent.children.length;

			for(var i = 0; i < offset; i++) {
				addPosition(parent.children[1]);
			}

			for(var i = 0; i < -offset; i++) {
				parent.removeChild(parent.children[parent.children.length - 1]);
			}

			for(var i = 0; i < location.length; i++) {
				parent.children[i].children[2].value = location[i].name;
				parent.children[i].children[3].value = JSON.stringify(location[i]);

				//同省判断
//				if(parent.children[i].children[2].dataset.index == '0') {
//					startA = location[i].prov;
//					//				alert(startA)
//				} else {
//					endA = location[i].prov;
//					//				alert(endA)
//				}

			}

		} else {
			selectEl.value = result.result.name;
			selectEl.parentElement.children[3].value = JSON.stringify(result.result);
			
			//同省判断
//			if(localStorage.getItem("flag") == '0') {
//				startA = result.result.prov;
////								alert(startA)
//			} else {
//				endA = result.result.prov;
////								alert(endA)
//			}
		}

		calculatePrice();
	});

	mui.plusReady(function() {
		//		var webView = plus.webview.currentWebview();
		//		var launch = plus.webview.getLaunchWebview();
		//		var viewArr = plus.webview.all();
		//		for(var i = 0; i < viewArr.length; i++) {
		//			if(webView.id != viewArr[i].id && launch.id != viewArr[i].id){
		//				viewArr[i] && viewArr[i].close();
		//			}
		//		}

		L.Location.position(function(result) {
			//			console.log(L.Location.position)
			if(result.success) {
				var parent = document.getElementById('location-container');
				parent.children[0].children[2].value = result.name;
				parent.children[0].children[3].value = JSON.stringify(result);
				localStorage.setItem('location', JSON.stringify(result));
				//获取省份
//				if(parent.children[0].children[2].dataset.index == 0){
//					startA = result.prov;
//				}
			}
		});
	});
});

function removePosition(el) {
	var div = el.parentElement;
	div.parentElement.removeChild(div);
}

function selectPosition(el) {
	window.selectEl = el;
	var params = el.parentNode.getElementsByTagName('input')[1].value;
	mui.open('map', 'location', {
		type: 'to',
		page_id: 'main/index',
		params: params
	});
}

mui.ready(function() {

	document.getElementById("price-detail").addEventListener('tap', function() {
		mui.open('order', 'price-detail', params);
	}, false);
	document.getElementById("add-position").addEventListener('tap', window.addPosition = function() {
		var container = document.getElementById("location-container");

		if(container.children.length == 9) {
			mui.toast('最多添加8个目的地');
			return;
		}

		var dom = document.createElement('div');
		dom.className = 'mui-input-row';
		dom.innerHTML = '<span class="icon-dot yello"></span>' +
			'<span class="icon-right icon-remove"></span>' +
			'<input type="text" class="color-text" placeholder="按此输入目的地" readonly="readonly" style="padding-right: 40px;" />' +
			'<input type="hidden" />';

		var input = dom.children[2];
		input.addEventListener('tap', function() {
			selectPosition(input);
		}, false);

		dom.children[1].addEventListener('tap', function() {
			container.removeChild(dom);
			calculatePrice();
		}, false);

		container.appendChild(dom);
	}, false);

});