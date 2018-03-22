var map = L.map('map', {}).setView([26.074475, 119.296632], 14);

function onMoveEnd(e) {
	var latlng = map.getCenter();
	L.Location.address(latlng.lat, latlng.lng, function(result) {
		if(result.success) {
			setAddress(result);
			result.lat = latlng.lat;
			result.lng = latlng.lng;
			console.log(JSON.stringify(result));
			window.result = result;
		}
	});
}

map.on('moveend', onMoveEnd);

function setAddress(data) {
	document.getElementById("address-prov").innerHTML = data.prov + data.city;
	document.getElementById("address-name").innerHTML = '[当前]' + data.name;
}

if(localStorage.getItem('location')) {
	var loc = JSON.parse(localStorage.getItem('location'));
	window.city = loc.city || loc.prov;
	
	document.getElementById("city-spinner").innerHTML = window.city.replace('市', '');

	map.panTo([loc.lat, loc.lng]);
	L.circleMarker([loc.lat, loc.lng], {
		radius: 20,
		weight: 1
	}).addTo(map);

	L.circleMarker([loc.lat, loc.lng], {
		radius: 5,
		fillColor: 'blue',
		fillOpacity: 0.7,
		color: 'white',
		weight: 1
	}).addTo(map);
}

L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
	maxZoom: 18,
	continuousWorld: false,
	subdomains: ['1', '2', '3', '4'],
	minZoom: 3
}).addTo(map);

// 初始化地址自动完成
mui.ready(function() {
	var cityPicker = new mui.PopPicker();
		cityPicker.setData([{
			text: '福州'
		}, {
			text: '厦门'
		}, {
			text: '泉州'
		}, {
			text: '三明'
		}, {
			text: '莆田'
		}, {
			text: '泉州'
		}, {
			text: '漳州'
		}, {
			text: '龙岩'
		}, {
			text: '宁德'	
		}]);
		
		document.getElementById("city-spinner").addEventListener('tap', function(event) {
			cityPicker.show(function(items) {
				console.log(JSON.stringify(items));
				document.getElementById("city-spinner").innerText = items[0].text;
			});
		}, false);
	
	L.Location.complete('address', document.getElementById("city-spinner"), function(item) {
		var latlng = item.location.split(',');
		latlng.reverse();
		var district = item.district;
		
		var prov = district.split('省')[0] + '省';
		var city = district.split('省')[1].split('市')[0] + '市';
		district = district.split('市')[1];
		
		window.result = {
			"prov": prov,
			"city": city,
			"district": district,
			"name": item.name,
			"lat": latlng[0],
			"lng": latlng[1]
		}
		
		setAddress(result);
		map.off('moveend', onMoveEnd);
		map.panTo(latlng);
		map.on('moveend', onMoveEnd);
	});
	

	document.getElementById("select-point").addEventListener('tap', function() {
		var web = plus.webview.currentWebview();
		var view = plus.webview.getWebviewById(web.page_id);
		mui.fire(view, 'address', {
			type: web.type,
			result: window.result
		});

		mui.back();
	});
});