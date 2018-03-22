var map = L.map('map', {}).setView([25.77666, 119.602089], 8);

/*L.tileLayer('http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}', {
	maxZoom: 18,
	continuousWorld: false,
	subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
	minZoom: 3
}).addTo(map);

L.tileLayer('http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}', {
	maxZoom: 18,
	continuousWorld: false,
	subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
	minZoom: 3
}).addTo(map);*/
L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
	maxZoom: 18,
	continuousWorld: false,
	subdomains: ['1', '2', '3', '4'],
	minZoom: 3
}).addTo(map);
//L.marker([25.77666, 119.602089], {
//	icon: L.divIcon({
//		className: 'div-icon',
//		iconSize: [60, 40],
//		iconAnchor: [30, 40],
//		html: '<span>' + ['起点', '途经点', '终点'][0] + '</span>'
//	})
//}).addTo(map);

mui.plusReady(function() {
	var web = plus.webview.currentWebview();

	var routes = web.params.routes;
	console.log(JSON.stringify(routes));

	var layer = L.featureGroup().addTo(map);

	mui.each(routes, function(index, route) {
		L.marker([route.lat, route.lng], {
			icon: L.divIcon({
				className: 'div-icon',
				iconSize: [60, 40],
				iconAnchor: [30, 40],
				html: '<span>' + ['起点', '途经点', '终点'][route.type] + '</span>'
			})
		}).addTo(layer).bindPopup(route.addr);
	});

	map.fitBounds(layer.getBounds());
	
	var first = true;

	function pos() {
		Request.post('/order/getOrderCurPos.do?orderNo=' + routes[0].orderNo, {}, function(result) {
			if(result.success && result.data) {
				var latlng = L.latLng(result.data.lat, result.data.lng);
				layer.driverMarker = layer.driverMarker || L.marker(latlng, {
					icon: L.divIcon({
						className: 'div-icon',
						iconSize: [60, 40],
						iconAnchor: [30, 40],
						html: '<span>司机</span>'
					})
				}).addTo(layer);
				
				layer.driverMarker.setLatLng(latlng);
				
				if(first) {
					map.fitBounds(layer.getBounds(), {
						padding: [40, 40]
					});
				}
			}
		});
	}

	setTimeout(pos, 15000);

	pos();

});