mui.init();
mui.ready(function() {
	mui.pullrefresh('#pullrefresh', {
		pullup: true,
		pulldown: true,
		callback: function(page, end) {
			var ul = document.getElementById("list");
			setTimeout(function() {
				if(page == 1) {
					ul.innerHTML = "";
				}
				for(var i = 0; i < 10; i++) {
					var item = {
						title: '标题' + i,
						imgurl: '../../public/images/banner-1.png'
					}
					var li = document.createElement("li");

					li.innerHTML = `<div class="mui-card border">
							<div class="mui-card-header">
								<div class="mui-media-body">
									<span class="color-text" style="font-size: 14px;">发表于 2016-06-30 15:30</span>
								</div>
							</div>
							<div class="mui-card-content">
								<img src="../../public/images/banner-1.png" style="vertical-align: top;" width="100%" />
							</div>
						</div>`;
					ul.appendChild(li);
				}

				end(page == 2);
			}, 2000);
		}
	})

});