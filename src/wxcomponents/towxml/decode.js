const config = require('./config');

Component({
	options: {
		styleIsolation: 'apply-shared'
	},
	properties: {
		nodes: {
			type: Object,
			value: {}
		}
	},
	lifetimes: {
		attached: function () {
			const _ts = this;
			const globalData = getApp().globalData;

			config.events.forEach(item => {
				_ts['_' + item] = function (...arg) {
					if (globalData._events && typeof globalData._events[item] === 'function') {
						globalData._events[item](...arg);
					}
				};
			});
		}
	}
})