/**
 * Created by cameron on 8/27/15.
 */

var Utils = {};

Utils.elm = function(type, options) {

	var elm = document.createElement(type);

	if(options.css) {
		elm.setAttribute('style', Utils.css(options.css));
	}

	if(options.attrs) {
		for(var key in options.attrs) {
			if(options.attrs.hasOwnProperty(key)) {
				elm.setAttribute(key, options.attrs[key]);
			}
		}
	}

	if(options.class) {
		elm.setAttribute('class', options.class);
	}

	if(options.events) {
		for(var ev in options.events) {
			if(options.events.hasOwnProperty(ev)) {
				elm['on' + ev] = options.events[ev];
			}
		}
	}

	if(options.html) {
		elm.innerHTML = options.html;
	}

	if(options.value) {
		elm.value = options.value;
	}

	return elm;
};

Utils.offset = function(el){
	var el2 = el;
	var curtop = 0;
	var curleft = 0;
	if (document.getElementById || document.all) {
		do  {
			curleft += el.offsetLeft-el.scrollLeft;
			curtop += el.offsetTop-el.scrollTop;
			el = el.offsetParent;
			el2 = el2.parentNode;
			while (el2 != el) {
				curleft -= el2.scrollLeft;
				curtop -= el2.scrollTop;
				el2 = el2.parentNode;
			}
		} while (el.offsetParent);

	} else if (document.layers) {
		curtop += el.y;
		curleft += el.x;
	}
	return {'top': curtop, 'left': curleft};
};

Utils.css = function(obj) {
	var str = "";
	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
			str += key + ':' + obj[key] + ';'
		}
	}
	return str;
};

Utils.each = function(arr, cb) {
	for(var i = 0; i < arr.length; i++) {
		if(cb(arr[i], i) == false) return;
	}
};

var CAMS = {
	highlights: []
};

CAMS.setup = function() {
	var images 	= document.getElementsByClassName('cams-image');
	var videos 	= document.getElementsByClassName('cams-video');
	var texts 	= document.getElementsByClassName('cams-text');
	var links 	= document.getElementsByClassName('cams-link');

	CAMS.editor = Utils.elm('div', {'class': 'cams-editor'});
	CAMS.hierarchy = Utils.elm('div', {'class': 'cams-hierarchy'});
	CAMS.attributes = Utils.elm('div', {'class': 'cams-attributes'});

	Utils.each([['Images', images], ['Videos', videos], ['Texts', texts], ['Links', links]], function(e, i){
		if(e[1].length < 1) return;

		CAMS.hierarchy.appendChild(Utils.elm('div', {'class': (i > 0) ? 'cams-hierarchy-label top-border' : 'cams-hierarchy-label', html: e[0]}));
		Utils.each(e[1], function(element){

			var button_html = "";

			switch(e[0]) {
				case 'Images': {
					button_html = (element.getAttribute('src').length > 24) ? element.getAttribute('src').substr(0, 24) + '...' : element.getAttribute('src');
				} break;
				case 'Videos': {
					button_html = 'Video...';
				} break;
				case 'Texts': case 'Links': {
					button_html = (element.innerHTML.length > 24) ? element.innerHTML.substr(0, 24) + '...' : element.innerHTML;
				} break;
			}

			var highlight = null;
			var button = Utils.elm('a', {
				'class': 'cams-hierarchy-button',
				'html': button_html,
				'events': {
					'click': function() {
						CAMS.select(button, element);
					},
					'mouseenter': function() {
						highlight = CAMS.addHighlight('cams-highlight', element);
					},
					'mouseleave': function() {
						CAMS.removeHighlight(highlight);
					}
				}
			});

			CAMS.hierarchy.appendChild(button);
		});
	});

	CAMS.attributes.appendChild(Utils.elm('div', {
		'class': 'cams-attributes-label', html: 'Attributes'
	}));

	CAMS.editor.appendChild(CAMS.hierarchy);
	CAMS.editor.appendChild(CAMS.attributes);
	document.body.appendChild(CAMS.editor);
};

CAMS.updateHighlights = function() {
	Utils.each(CAMS.highlights, function(h, i){
		var offset = Utils.offset(h.parent);
		var size = h.parent.getBoundingClientRect();
		h.highlight.setAttribute('style', Utils.css({
			'top': offset.top + 'px',
			'left': offset.left + 'px',
			'width': size.width + 'px',
			'height': size.height + 'px',
			'pointer-events': 'none'
		}));
	});
};

CAMS.addHighlight = function(cssClass, element) {
	var offset = Utils.offset(element);
	var size = element.getBoundingClientRect();

	var highlight = Utils.elm('div', {
		'class': cssClass,
		'css': {
			'top': offset.top + 'px',
			'left': offset.left + 'px',
			'width': size.width + 'px',
			'height': size.height + 'px',
			'pointer-events': 'none'
		}
	});

	document.body.appendChild(highlight);

	CAMS.highlights.push({parent: element, highlight: highlight});

	return highlight;
};

CAMS.removeHighlight = function(highlight) {
	if(highlight) {
		Utils.each(CAMS.highlights, function (h, i) {
			if (h.highlight === highlight) {
				document.body.removeChild(h.highlight);
				CAMS.highlights.splice(i, 1);
				return false;
			}
		});
	}
};

CAMS.select = function(button, element) {
	var c = element.getAttribute('class');
	var type = 	(c.indexOf('cams-image') != -1) ? 'image' :
				(c.indexOf('cams-video') != -1) ? 'video' :
				(c.indexOf('cams-text') != -1) ? 'text' :
				(c.indexOf('cams-link') != -1) ? 'link' : null;

	if(type != null) {
		CAMS.attributes.innerHTML = "";

		Utils.each(document.getElementsByClassName('cams-hierarchy-button selected'), function(e){
			e.setAttribute('class', 'cams-hierarchy-button');
		});

		button.setAttribute('class', 'cams-hierarchy-button selected');

		CAMS.removeHighlight(CAMS.selectedHighlight);
		CAMS.selectedHighlight = CAMS.addHighlight('cams-highlight-border', element);

		CAMS.attributes.appendChild(Utils.elm('div', {
			'class': 'cams-attributes-label', html: 'Attributes'
		}));

		switch(type) {
			case 'image': {
				CAMS.attributes.appendChild(Utils.elm('input', {
					'class': 'cams-attributes-input',
					'attrs': {
						'placeholder': 'Source...',
						'type': 'text'
					},
					'value': element.getAttribute('src'),
					'events': {
						'keyup': function(e) {
							element.setAttribute('src', this.value);
							button.innerHTML = (element.getAttribute('src').length > 24) ? element.getAttribute('src').substr(0, 24) + '...' : element.getAttribute('src');
						}
					}
				}));
			} break;
			case 'video': {
				console.log('video!');
			} break;
			case 'text': {
				CAMS.attributes.appendChild(Utils.elm('textarea', {
					'class': 'cams-attributes-textarea',
					'attrs': {
						'placeholder': 'Content...'
					},
					'html': element.innerHTML,
					'events': {
						'keyup': function(e) {
							element.innerHTML = this.value;
							button.innerHTML = (element.innerHTML.length > 24) ? element.innerHTML.substr(0, 24) + '...' : element.innerHTML;
						}
					}
				}));
			} break;
			case 'link': {
				CAMS.attributes.appendChild(Utils.elm('input', {
					'class': 'cams-attributes-input',
					'attrs': {
						'placeholder': 'Name...',
						'type': 'text'
					},
					'value': element.innerHTML,
					'events': {
						'keyup': function(e) {
							element.innerHTML = this.value;
							button.innerHTML = (element.innerHTML.length > 24) ? element.innerHTML.substr(0, 24) + '...' : element.innerHTML;
						}
					}
				}));

				CAMS.attributes.appendChild(Utils.elm('input', {
					'class': 'cams-attributes-input',
					'attrs': {
						'placeholder': 'Source...',
						'type': 'text'
					},
					'value': element.getAttribute('href'),
					'events': {
						'keyup': function(e) {
							element.setAttribute('href', this.value);
						}
					}
				}));
			} break;
		}

	}
};

CAMS.load = function() {

};

CAMS.save = function() {

};

window.onresize = function(){ CAMS.updateHighlights(); };
window.setInterval(function(){ CAMS.updateHighlights(); }, 1000);