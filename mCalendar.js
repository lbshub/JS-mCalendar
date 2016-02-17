/**
 * LBS mCalendar
 * Date: 2015-8-20
 * ====================================================================
 * opts.parent 日历插入到什么地方 默认body
 * opts.input 初始input对象 (实例化后可改变this.input)
 * opts.count 初始显示月份个数 默认1个
 * opts.year 初始年份 默认今年
 * opts.month 初始月份(1-12) 默认本月
 * opts.select 选择日期时执行函数 参数(target)是选择的日期对象 
 				日期对象有date属性 属性值为日期(如 2015-12-25)
 * ====================================================================
 * this.input input对象 要赋值时必须设置(重要) 
 * **this.value 选择的要为this.input赋值的值(重要)
 * ====================================================================
 * this.box 日历容器对象
 * this.count 日历中月份显示的个数
 * this.year 日历年份
 * this.month 日历月份(1-12)
 * this.today 今天日期(如 2015-12-25)
 * this.draw() 方法 日历绘制 根据设置的this.year this.month重新绘制日历
 				(当年/月有改变时调用 更新显示内容)
 				(如果月没有改变直接调用 在当前显示最后月开始 加this.count个月) 
 * this.show() 方法 日历显示
 * this.hide() 方法 日历隐藏
 * ====================================================================
 **/

(function(exports, document) {
	'use strict';

	var LBS = (function() {

		function addEvent(el, types, handler) {
			for (var i = 0, l = types.length; i < l; i++) el.addEventListener(types[i], handler, false);
		}

		function create(el) {
			return document.createElement(el);
		}

		function format(s) {
			return parseInt(s) < 10 ? '0' + s : s;
		}

		return {
			create: create,
			on: addEvent,
			format: format
		}
	}());

	exports.mCalendar = function() {
		this._init.apply(this, arguments);
	};
	mCalendar.prototype = {
		_init: function(opts) {
			opts = opts || {};
			this.parent = opts.parent || document.getElementsByTagName('body')[0];
			this.count = opts.count || 1;

			this.year = parseInt(opts.year) || new Date().getFullYear();
			this.month = parseInt(opts.month) || new Date().getMonth() + 1; // (1-12)
			this.today = new Date().getFullYear() + '-' + LBS.format(new Date().getMonth() + 1) + '-' + LBS.format(new Date().getDate());

			this.selected = '1800-01-01'; //选择的日期
			this.select = opts.select || function() {};

			this.input = opts.input; //需赋值的input
			// this.value = 0; //选择的值
		},
		_create: function() {
			if (!this.box) {
				this.exist = true;

				this.box = LBS.create('div');
				this.box.className = 'M_calendar';

				this.prev = LBS.create('a');
				this.prev.className = 'M_prev';
				this.prev.href = 'javascript:;';
				this.prev.innerHTML = '&lt;';
				this.box.appendChild(this.prev);

				this.next = LBS.create('a');
				this.next.className = 'M_next';
				this.next.href = 'javascript:;';
				this.next.innerHTML = '&gt;';
				this.box.appendChild(this.next);

				this.content = LBS.create('div');
				this.content.className = 'M_content';

				this._draw();

				this.box.appendChild(this.content);
				this.parent.appendChild(this.box);

				this._bind();
			}
			return this;
		},
		_draw: function() {
			for (var i = 0; i < this.count; i++) {
				this.month = this.month + (i ? 1 : 0);
				if (this.month > 12) {
					this.year++;
					this.month -= 12;
				}
				if (this.month < 1) {
					this.year--;
					this.month += 12;
				}
				this.content.appendChild(this._drawMonth(this.year, this.month));
			}
			return this;
		},
		_drawWeek: function() {
			var frag = document.createDocumentFragment(),
				weeks = '日一二三四五六'.split(''),
				week = null,
				i = 0,
				len = weeks.length;
			for (; i < len; i++) {
				week = LBS.create('span');
				week.innerHTML = weeks[i];
				frag.appendChild(week);
			}
			return frag;
		},
		_darwDay: function(year, month) {
			var frag = document.createDocumentFragment(),
				firstDay = new Date(year, month - 1, 1).getDay(),
				lastDay = new Date(year, month, 0).getDate(),
				days = [],
				day = null,
				dayValue = 0,
				i = 0;

			var today_date = parseInt(this.today.replace(/-/g, '')),
				selected_date = parseInt(this.selected.replace(/-/g, '')),
				day_date = today_date,
				total = firstDay + lastDay;

			for (i = 0; i < firstDay; i++) days.push(0);
			for (i = 1; i <= lastDay; i++) days.push(i);
			for (i = 0; i < total; i++) {
				day = LBS.create('a');
				day.href = 'javascript:;';
				dayValue = days.shift();
				if (!dayValue) {
					day.innerHTML = '&nbsp;';
					day.className = 'day_disabled';
				} else {
					day.date = year + '-' + LBS.format(month) + '-' + LBS.format(dayValue);
					day.innerHTML = dayValue;
					day.className = 'day_date';
					day_date = day.date.replace(/-/g, '');
					if (day_date == today_date) day.className += ' day_today';
					if (day_date == selected_date) day.className += ' day_selected';
				}
				frag.appendChild(day);
			}
			return frag;
		},
		_drawMonth: function(year, month) {
			var dl = LBS.create('dl'),
				dt = LBS.create('dt'),
				dd = LBS.create('dd'),
				dt_time = LBS.create('div'),
				dt_week = LBS.create('div');

			dl.className = 'M_dl';
			dt.className = 'M_dt';
			dd.className = 'M_dd';
			dt_time.className = 'M_time';
			dt_week.className = 'M_week';

			dt_time.innerHTML = year + '年' + month + '月';
			dt.appendChild(dt_time);
			dt_week.appendChild(this._drawWeek());
			dt.appendChild(dt_week);

			dd.appendChild(this._darwDay(year, month));
			dl.appendChild(dt);
			dl.appendChild(dd);
			return dl;
		},
		_nextMonth: function() {
			this.month++;
			this.draw();
			return this;
		},
		_prevMonth: function() {
			this.month -= this.count * 2 - 1;
			this.draw();
			return this;
		},
		_bind: function() {
			var _this = this,
				target = null;
			LBS.on(this.box, ['click'], function(e) {
				e.stopPropagation();
				if (!_this.status) return;
				target = e.target;
				if (target.tagName.toUpperCase() === 'A' && target.className.indexOf('M_prev') > -1) {
					_this._prevMonth();
				}
				if (target.tagName.toUpperCase() === 'A' && target.className.indexOf('M_next') > -1) {
					_this._nextMonth();
				}
				if (target.tagName.toUpperCase() === 'A' && target.className.indexOf('day_date') > -1) {
					_this.hide();
					// _this.input.value = target.date;
					// _this.value = target.date;
					_this.selected = target.date;
					_this.select && _this.select(target.date);
				}
			});
			LBS.on(this.box, ['touchend', 'pointerup', 'MSPointerUp'], function(e) {
				e.stopPropagation();
			});
			LBS.on(document, ['touchend', 'pointerup', 'MSPointerUp'], function(e) {
				if (!_this.status) return;
				if (_this.input && e.target !== _this.input) {
					_this.hide();
				}
			});
		},
		draw: function() {
			if (!this.exist) return this._create();
			this.content.innerHTML = '';
			this._draw();
			return this;
		},
		show: function() {
			this.status = true;
			if (!this.exist) this._create();
			this.box.style.display = 'block';
			return this;
		},
		hide: function() {
			this.status = false;
			this.box.style.display = 'none';
			return this;
		}
	};
}(window, document));