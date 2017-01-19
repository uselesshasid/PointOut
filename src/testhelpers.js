
function mirror(e) {

    if (!e.length) {
        console.log("e is not a jquery element"); return;
    }

    if (!window.mirrorWindow) {
        var width = window.getComputedStyle(document.body)["width"];
        var options = "top=200px,left=200px,width=" + width + ",height=300px";
        window.mirrorWindow = window.open(null, null, options);
    }

    e.removeAttr("style");
    applyCleanCssStyleElement(e[0]);
    window.mirrorWindow.document.body.innerHTML = e[0].outerHTML;
}