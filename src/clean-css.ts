interface style {
    name:string,
    style:CSSStyleDeclaration
}

interface diff {
    name:string,
    value:string,
    inherited:false
}

class CleanCss {    

    static  iframe:HTMLIFrameElement;
    static initialize(){
        this.iframe = document.createElement("ifram") as HTMLIFrameElement;
        this.iframe.style.display = 'none';
        document.body.appendChild(this.iframe);                
    }

    constructor(){

    }

    inheritedCssList:Array<string> = new Array("azimuth", "border-collapse", "border-spacing", "caption-side", "color", "cursor", "direction", "elevation", "empty-cells", "font-family", "font-size", "font-style", "font-variant", "font-weight", "font", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type", "list-style", "orphans", "pitch-range", "pitch", "quotes", "richness", "speak-header", "speak-numeral", "speak-punctuation", "speak", "speech-rate", "stress", "text-align", "text-decoration", "text-indent", "text-,ransform", "visibility", "voice-family", "volume", "white-space", "widows", "word-spacing");

    computedAsColorList:Array<string> = new Array("border-bottom-color", "border-left-color", "border-right-color", "border-top-color", "outline-color", "-webkit-column-rule-color", "-webkit-text-fill-color", "-webkit-text-stroke-color", "-webkit-text-emphasis-color");

    defaultStyleList:Array<style> = new Array();    


    public findColorOfAncestor(element) {
        var styles = window.getComputedStyle(element);
        if (styles.backgroundColor != "rgba(0, 0, 0, 0)") {
            return styles.backgroundColor;
        }
        else {
            if (element.tagName == "BODY") {
                return "rgba(0, 0, 0, 0)"
            }
            else {
                return this.findColorOfAncestor(element.parentElement);
            }
        }
    }

    public applyCleanCssStyleElement(element) {
        var defaultStyle = this.getElementDefaultStyle(element.nodeName); 
        var computedStyle = window.getComputedStyle(element);
        var cleanStyle = this.getStyleDifference(defaultStyle, computedStyle);

        if (element.parentElement.absoluteStyle) { // this is not the top root
            this.flagInheritedProperties(cleanStyle, element.parentElement.absoluteStyle);
        }
        else { // this is the root element
            // Remove and add certain layout css
            this.normalizeRootCss(cleanStyle);

            // Add background color            
            var background = cleanStyle.find(function (style) {
                return style.name == 'background-color';
            })
            if ((background == undefined || background.value == "rgba(0, 0, 0, 0)") && element.tagName != "BODY") {
                var color = this.findColorOfAncestor(element.parentElement);
                if (color && color != "rgba(0, 0, 0, 0)") {
                    if (!background) {
                        background = { name: 'background-color', value:null, inherited:false };
                        cleanStyle.push(background);
                    }
                    background.value = color;
                }
            }
                
        }

        element.absoluteStyle = cleanStyle;
        
        var cssString = this.getCssString(cleanStyle);
        element.setAttribute('style', cssString);
        if (element.children.length > 0) {
            for (var i = 0; i < element.children.length; i++) {
                this.applyCleanCssStyleElement(element.children[i]);
            }
        }
    }

    private normalizeRootCss(style) {

        var additionList = new Array();
        var removalList = new Array();

        for (var i = 0; i < style.length;i++) {
            
            var name = style[i].name;
            var value = style[i].value;

            // Remove margins
            if (name == 'margin-top' || name == 'margin-bottom' || name == 'margin-left' || name == 'margin-right') {
                style.splice(i, 1);
                i--;
            }

            // Add float right for rtl, otherwise remove float 
            if (name == 'direction')
            {
                if(value == 'rtl') {
                    additionList.push({ name: 'float', value: 'right' });
                }
                else {
                    removalList.push('float');
                }
            }
        }
        additionList.push({ name: "margin-left", value: 'auto' })
        additionList.push({ name: "margin-right", value: 'auto' })

        // Add additions
        Array.prototype.push.apply(style, additionList);

        // Remove deletions
        for (var item in removalList) {
            var name = removalList[item];
            for (var sItem in style) {
                if (style.name = item) {
                    style.splice(sItem, 1);
                    break;
                }
            }
        }
    }

    private flagInheritedProperties(list, parentStyle) {
        // for each property in list
        for (var property in list) {
            if (this.isInInheritenceList(list[property].name)) { // if this property is in the inheritence list
                for (var parentPropertyName in parentStyle) {
                    var parentProperty = parentStyle[parentPropertyName];
                    if (parentProperty.inherited || parentProperty.value === list[property].value) {
                        list[property].inherited = true;
                    }
                }
            }
        }
    }   


    private getComputedProperty(element, propertyName) {
        var style = null;
        // find in absoluteList
        if (element.absoluteStyle) {
            var property = element.absoluteStyle.find(function (property) {
                return property.name == propertyName;
            });
            if (!property) {
                
            }
        }
        // if doesnt exists get computer style
    }

    private isInInheritenceList(name) {
        for (var item in this.inheritedCssList) {
            if (this.inheritedCssList[item] == name) {
                return true;
            }
        }
        return false;
    }

    private getCssString(styles) {
        var cssString = "";
        for (var i = 0; i < styles.length; i++) {
            var style = styles[i];
            if (!style.inherited) {
                cssString += style.name + ":" + style.value + ";";
            }        
        }
        return cssString;
    }

    /// Returns an array of the styles name values without the default styles
    private getStyleDifference(defaultStyle, computedStyle):Array<diff> {
        var diff = new Array<diff>();

        for (var style in computedStyle) {
            var name = computedStyle[style];
            var computedValue = computedStyle.getPropertyValue(name);
            var defaultValue = defaultStyle.getPropertyValue(name);        
            if (computedValue != defaultValue) {
                if (!this.ignoreProperty(name, computedStyle)) {
                    diff.push({ name: name, value: computedValue, inherited: false});
                }            
            }
        }
        return diff;
    }

    private ignoreProperty(name, style) {
        if (this.isComputedAsColor(name)) {
            var colorValue = style.getPropertyValue('color');
            if (colorValue && style.getPropertyValue(name) == colorValue) {
                return true;
            }
        }

        if (name == 'perspective-origin' || name == '-webkit-perspective-origin') {
            var perspectiveValue = style.getPropertyValue('perspective');
            var perspectiveValue = style.getPropertyValue('-webkit-perspective');
            if (perspectiveValue == 'none') {
                return true;
            }
        }

        if (name == 'transform-origin' || name == '-webkit-transform-origin') {
            var transformValue = style.getPropertyValue('transform');
            var transformValue = style.getPropertyValue('-webkit-transform');
            if (transformValue == 'none') {
                return true;
            }
        }

        return false;

    }

    private isComputedAsColor(name) {
        for (var item in this.computedAsColorList) {
            if (this.computedAsColorList[item] == name) {
                return true;
            }
        }
        return false;
    }

    /// Returns the default style of an element
    private getElementDefaultStyle(elementName) {
        var style = this.findExistingDefaultStyle(elementName);
        if (style == null) {
            // create element;
            var s = this.createDefaultStyle(elementName);
            style = { name: elementName, style: s };
            this.defaultStyleList.push(style);
        }
        return style.style;
    }

    private createDefaultStyle(elementName) {
        var e = CleanCss.iframe.contentDocument.createElement(elementName);
        CleanCss.iframe.contentDocument.body.appendChild(e);
        var style = CleanCss.iframe.contentWindow.getComputedStyle(e);
        return style;
    }

    private findExistingDefaultStyle(elementName) {
        var style = null;
        for (var i = 0; i < this.defaultStyleList.length; i++) {
            var s = this.defaultStyleList[i];
            if (s.name == elementName) {
                style = s;
                break;
            }
        }
        return style;
    }
}