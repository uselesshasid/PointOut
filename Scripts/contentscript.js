function PointOut(config) {
    var self = this;
    self.config = config;
    self.Predict = new DomPredictionHelper();
    self.selectionMode = false;
    self.apiUrl = self.config.host + '/api/pointout';
    self.cssSelecter = '';
    self.selectedElement = null;
    self.content = '';
    self.adaptiveParent = null;
  
    self.init = function(){

        // Toggle selection mode
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                if (request.toggleSelectionMode) {
                    toggleSelectionMode();
                }
            })

        $(function () {           
            // Watch for pointout parameter
            var pointOutParam = getParameterByName("pointout");
            if (pointOutParam) {
                // Request the selector
                var url = self.apiUrl + '/' + pointOutParam;
                $.getJSON(url)
                .done(function (selector) {
                    var height = $('body').height();
                    console.log("Body Height: " + height)
                    window.setTimeout(function () {
                        self.HighlightAndScrollTo(selector);
                        $(document).bind('DOMSubtreeModified', function () {
                            console.log('Document modified');
                            var newHeight = $('body').height();
                            if (newHeight != height) {
                                height = newHeight;
                                console.log("Body Height: " + height)
                                self.HighlightAndScrollTo(selector);
                            }
                        });

                    }, 1000)
                    
                })
                .fail(function (jqxhr, textStatus, error) {
                    toastr.error(jqxhr.responseJSON.Message, '', { "positionClass": "toast-top-center" });
                })

            }   

        }) // end jquery.ready
    } // end init

    ///Not in use
    this.showMessage = function (msg) {
        var dialog = $('#pointout-dialog');
        if (!dialog.length) {
            var html = '<div id="pointOut-dialog" class="pointout-dialog-outer"><div class="pointout-dialog-inner"></div></div>';
            dialog = $(html).appendTo($('body'))
            $("#pointOut-dialog").dialog({
                autoOpen: false,
                width: 400,
                buttons: [
                    {
                        text: "Ok",
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
        }
        dialog.find('.pointout-dialog-inner').html(msg);
        dialog.dialog('open');
    }

    this.showLoading = function(){
        var loading = $('#pointout-loading');
        if (!loading.length) {
            var loadingDialog = "<div id='pointout-loading' class='pointout-loading-outer'><div class='pointout-loading-inner'>Loading...</div></div>";
            loading = $(loadingDialog).appendTo($('body'));
        }
        loading.fill($(self.cssSelecter));
        //loading.show();
    }   

    function hideLoading() {
        $('#pointout-loading').hide();
    }

    function createPointOut() {

        self.showLoading();
        turnSelectionModeOff();

        var pointOut = {
            CSSSelector: decodeURIComponent(self.cssSelecter),
            Url: window.location.href,
            Content: self.content
        };

        var postSettings = {
            type: 'POST',
            dataType: 'json',
            url: self.apiUrl,
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(pointOut),
            success: function (link) {
                hideLoading();
                clearSelection();
                toastr.info('<a id="pointOutLink" href="' + link + '">' + link + '</a>', 'This sharable link has been copied to your clipboard', { "positionClass": "toast-top-center", "closeButton": true, "timeOut": "9000"})

                // Copy link
                window.getSelection().removeAllRanges();
                var range = document.createRange();
                range.selectNodeContents(document.getElementById('pointOutLink'));
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();
            },
            error: function () {
                hideLoading();
                clearSelection();
            }
        };
        $.ajax(postSettings);
    }

    function toggleSelectionMode() {
        if (!self.selectionMode) {
            turnSelectionModeOn();
        }
        else {
            turnSelectionModeOff();
        }
    };
    
    function removeOutline() {
        $('.pointOut-outline').removeClass('pointOut-outline');
    }

    function removeHighlight() {
        $('.yellow-fade').removeClass('yellow-fade');
    }
    function clearSelection() {
        removeOutline();
        removeHighlight();
        self.cssSelecter = '';
        self.selectedElement = null;
        self.content = '';
    };

    function turnSelectionModeOff() {
        $('body').off('mouseover mouseout', body_hover);
        $('body').off('click', element_click);
        selectionMode = false;
    };

    function turnSelectionModeOn() {
        $('body').on('mouseover mouseout', body_hover);
        $('body').on('click', element_click);
        selectionMode = true;
    }
   

    function body_hover(e) {
        $(e.target).toggleClass('pointOut-outline');
    }

    function getBase64Image(img) {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to guess the
        // original format, but be aware the using "image/jpg" will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");

        return dataURL;
    }

    function replaceImagesWithDataUrl(element) {
        if (element.tagName == "IMG") {
            element.src = getBase64Image(element)
            return;
        }

        $('img', element).each(function () {
            this.src = getBase64Image(this);
        })
    }
    function element_click(e) {
        removeHighlight();
        removeOutline();
        self.selectedElement = document.elementFromPoint(e.clientX, e.clientY);
        self.cssSelecter = self.Predict.getPathsFor([self.selectedElement])[0];
        replaceImagesWithDataUrl(self.selectedElement);
        applyCleanCssStyleElement(self.selectedElement);
        var adaptiveParent = null;
        if (self.selectedElement.tagName == "TD" || self.selectedElement.tagName == "TR") {
            var table = document.createElement("table");
            table.style.marginLeft = "auto";
            table.style.marginRight = "auto";
            if (self.selectedElement.tagNa == "TD") {
                adaptiveParent = document.createElement("tr");
                table.appendChild(tr);
            }
            else {
                adaptiveParent = table;
            }
        }
        if (adaptiveParent) {
            
            adaptiveParent.innerHTML = self.selectedElement.outerHTML;
            self.content = adaptiveParent.outerHTML;
        }
        else {
            self.content = self.selectedElement.outerHTML;
        }        
        createPointOut();
        e.preventDefault();
    }   

    // SEE: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
 
}

// Public Functions
PointOut.prototype.HighlightAndScrollTo = function (cssSelector) {
    $(window).scrollTop(0);

    console.log(cssSelector)
    var element = $(cssSelector);
    // get total fixed elements that the top = 0
    var fixed = $('*').filter(function () {
        return $(this).css("position") === 'fixed' && $(this).css("top") == '0px';
    });
    var totalHeight = 0;
    $.each(fixed, function (index, element) {
        totalHeight += $(element).height();
    })

    console.log('Fixed element height: ' + totalHeight);

    var elementPosition = $(element).offset().top;

    console.log("Element position: " + elementPosition);

    window.scrollTo(0, elementPosition - totalHeight);

    this.Highlight(element);

    console.log("Done scrolling to");
}

PointOut.prototype.Highlight = function (jqueryElement) {
    jqueryElement.removeClass('yellow-fade');
    console.log("Removed class yellow-fade from: " + jqueryElement);
    window.setTimeout(function () {
        jqueryElement.addClass('yellow-fade');
        console.log("Add class yellow-fade from: " + jqueryElement);
    }, 500)
}

var pointOut = new PointOut(config);

pointOut.init();