jQuery.fn.center = function (target) {
    var loc = target.offset();
    this.css("top", (target.outerHeight() - this.outerHeight()) / 2 + loc.top + 'px');
    this.css("left", (target.outerWidth() - this.outerWidth()) / 2 + loc.left + 'px');
    return this;
}

jQuery.fn.fill = function (target) {
    var loc = target.offset();
    this.css({
        "top": loc.top + 'px',
        "left": loc.left + 'px',
        "height": target.height(),
        "width": target.width()
    });
    return this;
}