// Copyright 2012 - Reed Arvin <reedlarvin@gmail.com>

(function($) {

	$.fn.gallery = function(objOpts) {

		var SELECTOR = this.selector;

		var PRELOAD_COUNT = 0;
		var PRELOAD_TOTAL = 2;

		var SETTINGS = $.extend({
			scriptLocation    : "js/gallery",
			imagesLocation    : "images",
			thumbWidth        : 200,
			thumbSpacing      : 20,
			thumbBorderSize   : 10,
			thumbBorderColor  : "#FFFFFF",
			thumbLoadImage    : "loading.gif",
			photoBorderSize   : 20,
			photoBorderColor  : "#FFFFFF",
			photoDefaultImage : "pixel.gif",
			photoOverlayColor : "#000000"
		}, objOpts);

		var UTILS = {
			init: function(objOpts) {
				$(SELECTOR).hide();

				SETTINGS = $.extend(SETTINGS, objOpts);

				SETTINGS.thumbLoadImage = SETTINGS.scriptLocation + "/" + SETTINGS.imagesLocation + "/" + SETTINGS.thumbLoadImage;
				SETTINGS.photoDefaultImage = SETTINGS.scriptLocation + "/" + SETTINGS.imagesLocation + "/" + SETTINGS.photoDefaultImage;

				UTILS.startImagePreload();
			},
			startImagePreload: function() {
				var objImage;

				objImage = new Image();

				$(objImage).load(function() {
					UTILS.imageLoaded();
				});

				objImage.src = SETTINGS.thumbLoadImage;

				objImage = new Image();

				$(objImage).load(function() {
					UTILS.imageLoaded();
				});

				objImage.src = SETTINGS.photoDefaultImage;
			},
			imageLoaded: function() {
				PRELOAD_COUNT++;

				if (PRELOAD_COUNT == PRELOAD_TOTAL) {
					UTILS.initGallery();
				}
			},
			initGallery: function() {
				UTILS.setupGallery();
				UTILS.setupGalleryFrameOverlay();
				UTILS.setupGalleryFrame();
				UTILS.setupGalleryEvents();
				UTILS.loadGalleryImages();
			},
			setupGallery: function() {
				var intContainerOffsetTop  = $(SELECTOR).parent().offset().top;
				var intContainerOffsetLeft = $(SELECTOR).parent().offset().left;
				var intContainerHeight     = $(SELECTOR).parent().offset().top;
				var intContainerWidth      = $(SELECTOR).parent().width();
				var intGalleryWidth        = 0;

				var intTotalThumbWidth = SETTINGS.thumbWidth + (SETTINGS.thumbBorderSize * 2);

				var intColumns = parseInt(intContainerWidth / intTotalThumbWidth);
				var intColumn  = 0;

				var arrColumns = new Array();

				// Setup image spacing
				if (intContainerWidth - ((intTotalThumbWidth * intColumns) + (SETTINGS.thumbSpacing * (intColumns - 1))) < 0) {
					intColumns--;
				}

				intGalleryWidth = (intTotalThumbWidth * intColumns) + (SETTINGS.thumbSpacing * (intColumns - 1));

				// Center gallery in container
				intContainerOffsetLeft = intContainerOffsetLeft + parseInt((intContainerWidth - intGalleryWidth) / 2);

				// Set initial column top value
				for (i = 0; i < intColumns; i++)
				{
					arrColumns[i] = intContainerOffsetTop;
				}

				$(SELECTOR + " img").each(function() {
					if ($(this).attr("alt") != "") {
						$(this).attr("src", SETTINGS.photoDefaultImage);
					}

					$(this).css("position", "absolute");
					$(this).css("top", arrColumns[intColumn] + "px");
					$(this).css("left", intContainerOffsetLeft + (intColumn * (intTotalThumbWidth + SETTINGS.thumbSpacing)) + "px");

					arrColumns[intColumn] = arrColumns[intColumn] + (($(this).height() + (SETTINGS.thumbBorderSize * 2)) + SETTINGS.thumbSpacing);

					// Use shortest column next
					for (i = 0; i < intColumns; i++)
					{
						if (arrColumns[i] < arrColumns[intColumn]) {
							intColumn = i;
						}
					}
				});

				// Find tallest column
				for (i = 0; i < intColumns; i++)
				{
					if (intContainerHeight < arrColumns[i]) {
						intContainerHeight = arrColumns[i];
					}
				}

				$(SELECTOR).css("height", (intContainerHeight - intContainerOffsetTop) + "px");
				$(SELECTOR).css("width", intContainerWidth + "px");

				$(SELECTOR + " img").css("background", SETTINGS.thumbBorderColor + " url(" + SETTINGS.thumbLoadImage + ") no-repeat center center");
				$(SELECTOR + " img").css("border", SETTINGS.thumbBorderSize + "px solid " + SETTINGS.thumbBorderColor);

				$(SELECTOR).show();

				$(SELECTOR + " img").fadeTo(0, .75);
			},
			setupGalleryFrameOverlay: function() {
				$(SELECTOR).after('<div id="' + SELECTOR.replace("#", "") + '-frame-overlay"></div>');

				$(SELECTOR + "-frame-overlay").hide();

				$(SELECTOR + "-frame-overlay").css("position", "absolute");
				$(SELECTOR + "-frame-overlay").css("top", "0");
				$(SELECTOR + "-frame-overlay").css("left", "0");
				$(SELECTOR + "-frame-overlay").css("background", SETTINGS.photoOverlayColor);
				$(SELECTOR + "-frame-overlay").css("z-index", "998");
			},
			setupGalleryFrame: function() {
				$(SELECTOR).after('<div id="' + SELECTOR.replace("#", "") + '-frame"><img src="' + SETTINGS.photoDefaultImage + '" /></div>');

				$(SELECTOR + "-frame").hide();

				$(SELECTOR + "-frame").css("position", "absolute");
				$(SELECTOR + "-frame").css("z-index", "999");

				$(SELECTOR + "-frame img").css("border", SETTINGS.photoBorderSize + "px solid " + SETTINGS.photoBorderColor);
			},
			setupGalleryEvents: function() {
				$(window).resize(function() {
					UTILS.setupGallery();
					UTILS.loadGalleryImages();
				});

				$(window).scroll(function() {
					UTILS.loadGalleryImages();
				});

				$(SELECTOR + " img").hover(
					function () {
						$(this).fadeTo(500, 1);
					},
					function () {
						$(this).fadeTo(500, .75);
					}
				);

				$(SELECTOR + " img").click(function() {
					if ($(this).attr("src") == SETTINGS.photoDefaultImage) {
						return false;
					}

					var intDocHeight = $(document).height();
					var intDocWidth  = $(document).width();
					var intWinHeight = $(window).height();
					var intWinWidth  = $(window).width();

					// Set overlay height according to document/window height
					if (intDocHeight > intWinHeight) {
						$(SELECTOR + "-frame-overlay").css("height", intDocHeight);
					}
					else {
						$(SELECTOR + "-frame-overlay").css("height", intWinHeight);
					}

					// Set overlay width according to document/window width
					if (intDocWidth > intWinWidth) {
						$(SELECTOR + "-frame-overlay").css("width", intDocWidth);
					}
					else {
						$(SELECTOR + "-frame-overlay").css("width", intWinWidth);
					}

					$(SELECTOR + "-frame-overlay").css("width", intWinWidth);
					$(SELECTOR + "-frame-overlay").fadeTo(0, .5);

					$(SELECTOR + "-frame img").attr("src", $(this).attr("src"));

					// Wait until the image height is not 0 (silly)
					do {
						$(SELECTOR + "-frame").fadeTo(0, .1);
					} while ($(SELECTOR + "-frame img").height() == 0);

					var intImageHeight = $(SELECTOR + "-frame img").height();
					var intImageWidth  = $(SELECTOR + "-frame img").width();

					var intTotalImageHeight = intImageHeight + (SETTINGS.photoBorderSize * 2);
					var intTotalImageWidth  = intImageWidth + (SETTINGS.photoBorderSize * 2);

					// Set css height/width defaults
					$(SELECTOR + "-frame img").css("height", "auto");
					$(SELECTOR + "-frame img").css("width", "auto");

					// Resize image height to fit window if necessary
					if (intTotalImageHeight > (intWinHeight - 40)) {
						intImageHeight = intWinHeight - 40 - (SETTINGS.photoBorderSize * 2);

						intImageWidth = parseInt(intImageWidth * (intImageHeight / $(SELECTOR + "-frame img").height()));

						intTotalImageHeight = intImageHeight + (SETTINGS.photoBorderSize * 2);
						intTotalImageWidth  = intImageWidth + (SETTINGS.photoBorderSize * 2);

						$(SELECTOR + "-frame img").css("height", intImageHeight);
						$(SELECTOR + "-frame img").css("width", intImageWidth);
					}

					// Resize image width to fit window if necessary
					if (intTotalImageWidth > (intWinWidth - 40)) {
						intImageWidth = intWinWidth - 40 - (SETTINGS.photoBorderSize * 2);

						intImageHeight = parseInt(intImageHeight * (intImageWidth / $(SELECTOR + "-frame img").width()));

						intTotalImageHeight = intImageHeight + (SETTINGS.photoBorderSize * 2);
						intTotalImageWidth  = intImageWidth + (SETTINGS.photoBorderSize * 2);

						$(SELECTOR + "-frame img").css("height", intImageHeight);
						$(SELECTOR + "-frame img").css("width", intImageWidth);
					}

					$(SELECTOR + "-frame").css("top", ((intWinHeight / 2) - (intTotalImageHeight / 2)) + $(window).scrollTop() + "px");
					$(SELECTOR + "-frame").css("left", ((intWinWidth / 2) - (intTotalImageWidth / 2)) + "px");

					$(SELECTOR + "-frame").fadeTo(500, 1);
				});

				$(SELECTOR + "-frame img").click(function() {
					$(SELECTOR + "-frame").hide();
					$(SELECTOR + "-frame-overlay").hide();

					$(SELECTOR + "-frame img").attr("src", SETTINGS.photoDefaultImage);

					// Set css height/width defaults
					$(SELECTOR + "-frame img").css("height", "auto");
					$(SELECTOR + "-frame img").css("width", "auto");
				});

				$(SELECTOR + "-frame-overlay").click(function() {
					$(SELECTOR + "-frame").hide();
					$(SELECTOR + "-frame-overlay").hide();

					$(SELECTOR + "-frame img").attr("src", SETTINGS.photoDefaultImage);

					// Set css height/width defaults
					$(SELECTOR + "-frame img").css("height", "auto");
					$(SELECTOR + "-frame img").css("width", "auto");
				});
			},
			loadGalleryImages: function() {
				$(SELECTOR + " img").each(function() {
					var objImageContainer = $(this);
					var strRealImageSrc   = $(this).attr("alt");

					if (objImageContainer.offset().top < ($(window).height() + $(window).scrollTop()) && objImageContainer.attr("src") == SETTINGS.photoDefaultImage) {
						objImageContainer.attr("alt", "");

						var objImage = new Image();

						$(objImage).load(function() {
							objImageContainer.attr("src", strRealImageSrc).fadeTo(0, .1).fadeTo(1000, .75);

							// Ensure the gallery width is equal to the parent container (silly)
							if ($(SELECTOR).width() != $(SELECTOR).parent().width()) {
								$(SELECTOR).css("width", $(SELECTOR).parent().width() + "px");

								UTILS.setupGallery();
								UTILS.loadGalleryImages();
							}
						});

						objImage.src = strRealImageSrc;
					}
				});
			}
		};

		return this.each(function() {
			UTILS.init(objOpts);
		});

	};

})(jQuery);