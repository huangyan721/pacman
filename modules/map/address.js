mui.init();
mui.ready(function() {
	mui('#stored-position-container').scroll();
	Request.post('/position/load.do', {}, function(json) {
		if(json.success &&json.data && json.data.length > 0) {
			loadPositions(json.data);
		}
	});
	
	mui.on('address', function(result) {
		selectEl.value = result.result.name;
		selectEl.parentElement.children[3].value = JSON.stringify(result.result);
	});
	
	document.getElementById("create-position").addEventListener('tap', function() {
		// TODO 清空地点
		document.getElementById("new-position-name").value = '';
		document.getElementById('modal2').classList.add('mui-active');
	});
	
	document.getElementById("create-position-commit").addEventListener('tap', function() {
		
		var params = {};
		
		var name = document.getElementById("new-position-name").value;
		if(/^\s*$/.test(name)) {
			mui.toast('请输入线路名称');
			return;
		}
		params.name = name;
		
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
		
		params.location = location;
		Request.post('/position/add.do', {
				position: JSON.stringify(params)
			}, function(json) {
				if(json.success &&json.data && json.data.length > 0) {
					document.getElementById("modal2").classList.remove('mui-active');
					loadPositions(json.data);
				}
			}
		);
	});
});

function loadPositions(positions) {
	var ul = document.getElementById("stored-position");
	ul.innerHTML = '';
	
	mui.each(positions, function(index, item) {
		var li = document.createElement("li");
		li.className = 'mui-card';
		var position = JSON.parse(item.position);
		var location = position.location;
		var els = ['<div class="mui-input-group">'];
		els.push('<div class="mui-input-row"><input type="text" class="color-text" readonly="readonly" value="' + position.name + '" /></div>')
		
		for(var i = 0; i < location.length; i++) {
			els.push('<div class="mui-input-row">');
			els.push('<span class="icon-dot ' + (i == 0 ? 'green' : 'yello') + '"></span>');
			els.push('<input type="text" class="color-text"  readonly="readonly" value="' + location[i].name + '" />');
			els.push('</div>');
		}
		
		els.push('</div>');
		els.push('<div class="item-action"><span class="select">选择</span><span class="remove">删除</span></div>');
		
		li.innerHTML = els.join('');
		
		ul.appendChild(li);
		li.getElementsByClassName('remove')[0].addEventListener('tap', function() {
			removePosition(item.id);
		}, false);
		
		li.getElementsByClassName('select')[0].addEventListener('tap', function() {
			var web = plus.webview.currentWebview();
			var view = plus.webview.getWebviewById(web.page_id);
			mui.fire(view, 'address', {
				type: 'all',
				location: location 
			});
			mui.back();
			
		}, false);
		
	});
}

function removePosition(id) {
	Request.post('/position/remove.do', {
		id: id
	}, function(json) {
		if(json.success &&json.data) {
			loadPositions(json.data);
		}
	});
}

function selectPosition(el) {
	window.selectEl = el;
	var params = el.parentNode.getElementsByTagName('input')[1].value;
	console.log(params);
	mui.open('map', 'location', {
		type: 'to',
		page_id: 'map/address',
		params: params
	});
}


mui.ready(function() {
	document.getElementById("add-position").addEventListener('tap', function() {
		var container = document.getElementById("location-container");
		
		if(container.children.length == 9) {
			mui.toast('最多添加8个目的地');
			return;
		}
	
		var dom = document.createElement('div');
		dom.className = 'mui-input-row';
		dom.innerHTML = '<span class="icon-dot yello"></span>' +
					'<span class="icon-right icon-remove"></span>' +
					'<input type="text" class="color-text" onclick="selectPosition(this)" placeholder="按此输入目的地" readonly="readonly" style="padding-right: 40px;" />' +
					'<input type="hidden" />';
		
		dom.children[1].addEventListener('tap', function() {
			container.removeChild(dom);
		}, false);
	
		if(container.children.length == 2) {
			container.appendChild(dom);
		} else {
			container.insertBefore(dom, container.children[2]);
		}
	}, false);
	
});

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