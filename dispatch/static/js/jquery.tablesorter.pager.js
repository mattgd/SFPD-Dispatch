(function($) {
	$.extend({
		tablesorterPager: new function() {
			
			function updatePagerControls(c) {
				if (c.page == 0) {
					$(c.cssFirst, pager).addClass(c.cssDisabled);
					$(c.cssPrev, pager).addClass(c.cssDisabled);
				} else {
					$(c.cssFirst, pager).removeClass(c.cssDisabled);
					$(c.cssPrev, pager).removeClass(c.cssDisabled);
				}

				if (c.page == c.totalPages - 1) {
					$(c.cssLast, pager).addClass(c.cssDisabled);
					$(c.cssNext, pager).addClass(c.cssDisabled);
				} else {
					$(c.cssLast, pager).removeClass(c.cssDisabled);
					$(c.cssNext, pager).removeClass(c.cssDisabled);
				}
			}

			function updatePageDisplay(c) {
				// Fix for showing page numbers on text based elements
				$(c.cssPageDisplay).text('Page ' + (c.page + 1) + c.separator + c.totalPages);
				var s = $(c.cssPageDisplay,c.container).val((c.page + 1) + c.separator + c.totalPages);	
			}
			
			function setPageSize(table, size) {
				var c = table.config;

				c.size = size == 'all' ? c.totalRows : size;
				c.totalPages = Math.ceil(c.totalRows / c.size);
				c.pagerPositionSet = false;
				
				moveToPage(table);
				fixPosition(table);
			}
			
			function fixPosition(table) {
				var c = table.config;
				if(!c.pagerPositionSet && c.positionFixed) {
					var c = table.config, o = $(table);
					c.pagerPositionSet = true;
				}
			}
			
			function moveToFirstPage(table) {
				var c = table.config;
				c.page = 0;
				moveToPage(table);
			}
			
			function moveToLastPage(table) {
				var c = table.config;
				c.page = (c.totalPages-1);
				moveToPage(table);
			}
			
			function moveToNextPage(table) {
				var c = table.config;
				c.page++;
				if(c.page >= (c.totalPages-1)) {
					c.page = (c.totalPages-1);
				}
				moveToPage(table);
			}
			
			function moveToPrevPage(table) {
				var c = table.config;
				c.page--;
				if(c.page <= 0) {
					c.page = 0;
				}
				moveToPage(table);
			}
						
			
			function moveToPage(table) {
				var c = table.config;
				if (c.page < 0 || c.page > (c.totalPages-1)) {
					c.page = 0;
				}

				updatePagerControls(c);
				renderTable(table,c.rowsCopy);
			}
			
			function renderTable(table,rows) {
				var c = table.config;
				var l = rows.length;
				var s = (c.page * c.size);
				var e = (s + c.size);

				if (e > rows.length) {
					e = rows.length;
				}
				
				var tableBody = $(table.tBodies[0]);
				
				// Clear the table body
				$.tablesorter.clearTableBody(table);
				
				for (var i = s; i < e; i++) {
					var o = rows[i];
					var l = o.length;

					for (var j = 0; j < l; j++) {
						tableBody[0].appendChild(o[j]);
					}
				}
				
				fixPosition(table,tableBody);
				
				$(table).trigger("applyWidgets");
				
				if( c.page >= c.totalPages ) {
        			moveToLastPage(table);
				}
				
				updatePageDisplay(c);
			}
			
			this.appender = function(table,rows) {
				var c = table.config;
				
				c.rowsCopy = rows;
				c.totalRows = rows.length;
				c.totalPages = Math.ceil(c.totalRows / c.size);

				updatePagerControls(c);
				renderTable(table, rows);
			};
			
			this.defaults = {
				size: 15,
				offset: 0,
				page: 0,
				totalRows: 0,
				totalPages: 0,
				container: null,
				cssNext: '.next',
				cssPrev: '.prev',
				cssFirst: '.first',
				cssLast: '.last',
				cssPageDisplay: '.page-display',
				cssPageSize: '.page-size',
				cssDisabled: 'disabled',
				separator: " of ",
				positionFixed: true,
				appender: this.appender
			};
			
			this.construct = function(settings) {
				return this.each(function() {
					config = $.extend(this.config, $.tablesorterPager.defaults, settings);
					var table = this, pager = config.container;
				
					$(this).trigger("appendCache");
					
					config.size = parseInt($(config.cssPageSize, pager).val());
					
					// Controls click/change events
					$(config.cssFirst, pager).click(function() {
						moveToFirstPage(table);
						return false;
					});
					$(config.cssNext,pager).click(function() {
						moveToNextPage(table);
						return false;
					});
					$(config.cssPrev,pager).click(function() {
						moveToPrevPage(table);
						return false;
					});
					$(config.cssLast,pager).click(function() {
						moveToLastPage(table);
						return false;
					});
					$(config.cssPageSize,pager).change(function() {
						setPageSize(table, $(this).val());
						return false;
					});
				});
			};
			
		}
	});
	// Extend plugin scope
	$.fn.extend({
        tablesorterPager: $.tablesorterPager.construct
	});
	
})(jQuery);				