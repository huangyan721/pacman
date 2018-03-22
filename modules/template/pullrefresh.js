mui.init();
mui.ready(function() {
	mui.pullrefresh('#pullrefresh', {
		pullup: true,
		pulldown: true,
		callback: function(page, end) {
			setTimeout(() => {
				end(page == 3); // 
			}, 2000);
		}
	})

});