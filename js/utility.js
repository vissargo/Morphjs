//entry
$(function () {
    $("#files").on('change', handleFileSelect);
    createNewAnimField(false);
});

var count = 0,
    currentAnimationId = 0,
    isAddMarkerState = true,
    clone = {},
    selectedImgCount = 0,
    currentWidth = 0,
    currentHeigth = 0,
    scale = 1,
    $content = $('#content'),
    canvas = document.getElementById("canvas");


function ShowAnimation() {
    var params = {
        "w": currentWidth,
        "h": currentHeigth,
        "flexible": $("#flexiblebox").is(':checked'),
        "loop": $("#loopbox").is(':checked'),
        "yoyo": $("#yoyobox").is(':checked')
    };

    var children = $content.children(),
        n = children.length,
        mp,
        images = [],
        vertices = [],
        verticesString = [],
        states = [],
        statesString = [],
        animation = [],
        item,
        index,
        state,
        anim,
        forPause = 0,
        isMaster;
    for (var i = 0; i < n; i++) {
        mp = children[i].morphPanel;
        anim = [];
        if (mp.isPause) {
            anim.push(forPause);
            anim.push(forPause);
        } else {
            for (var j = 1; ~j; j--) {

                isMaster = j == 1;
                state = [];
                item = mp.getImgName(isMaster);
                if (item) {
                    index = images.indexOf(item);
                    !~index && (index = images.push(item) - 1);

                    vi.ImgCache.addImgFromBase64(item, mp.getImgBase64(isMaster));

                } else {
                    showErrorAndReturn();
                    return;
                }

                state[0] = index;

                item = mp.getAllMarkers(isMaster, true);
                if (item.length) {
                    index = verticesString.indexOf(item.toString());
                    !~index && (index = verticesString.push(item.toString()) - 1);
                    vertices[index] = item;
                } else {
                    showErrorAndReturn();
                    return;
                }

                state[1] = index;

                index = statesString.indexOf(state.toString());
                !~index && (index = statesString.push(state.toString()) - 1);

                states[index] = state;

                anim.push(index);
            }
        }
        anim.push(mp.getTime());
        animation.push(anim);
        forPause = anim[1];
    }
    params.vertices = vertices;
    params.images = images;
    params.states = states;
    params.animation = animation;


    canvas.width = currentWidth;
    canvas.height = currentHeigth;
    morphing = new vi.Morphing(canvas, params);


    $('#myModalShow #params').text(JSON.stringify(params).replace(/[\w"']+?\s*?:/g, function (s) {
        return "\n\t" + s;
    }));
    $('#myModalShow').modal('show');

    function showErrorAndReturn() {
        $('#myModalErrorParams').modal('show');
    }


}


function closeAnimation() {
    $('#myModalShow').modal('hide');
    morphing.remove();
    morphing = null;
}

function delCurrentAnimation() {
    $('#morphPanelId' + currentAnimationId).remove();
    $('#myModal').modal('hide');
    formatAnimPanels();
}

function clearImgFunc(id, isMaster) {
    var morphPanelId = 'morphPanelId' + id,
        mp = document.getElementById(morphPanelId).morphPanel;

    mp.clearImg(isMaster);
}

function clearMarkersFunc(id) {
    var morphPanelId = 'morphPanelId' + id,
        mp = document.getElementById(morphPanelId).morphPanel;

    mp.removeAllMarkers();
}

function copyFunc(id, isMaster) {
    var morphPanelId = 'morphPanelId' + id,
        mp = document.getElementById(morphPanelId).morphPanel;

    clone.imgBase64 = mp.getImgBase64(isMaster);
    clone.imgName = mp.getImgName(isMaster);
    clone.markers = mp.getAllMarkers(isMaster);
}

function pasteFunc(id) {
    if (clone.imgBase64) {
        var morphPanelId = 'morphPanelId' + id,
            mp = document.getElementById(morphPanelId).morphPanel;

        mp.setImgName(clone.imgName, true);
        mp.setImgBase64(clone.imgBase64, true);

        mp.removeAllMarkers();
        for (var i = 0, m; m = clone.markers[i]; i++)
            mp.addMarker(m[0], m[1]);
    }
}

function setCurrentAnimFunc(id) {
    currentAnimationId = id;
    $('#myModal').modal('show');
}

function moveDownFunc(id) {
    var $div = $('#morphPanelId' + id);
    $div.insertAfter($div.next());
    formatAnimPanels();
}

function moveUpFunc(id) {
    var $div = $('#morphPanelId' + id);
    $div.insertBefore($div.prev());
    formatAnimPanels();
}

function createNewAnimField(isPause, afterCount) {
    count++;
    var morphPanelId = "morphPanelId" + count,
        data = {
            morphPanelId: morphPanelId,
            addNewAnimFunc: "createNewAnimField(false," + count + ");",
            addNewPauseFunc: "createNewAnimField(true," + count + ");",
            setCurrentAnimFunc: "setCurrentAnimFunc(" + count + ");",
            clearMarkersFunc: "clearMarkersFunc(" + count + ")",
            clearImgFuncL: "clearImgFunc(" + count + ", true)",
            clearImgFuncR: "clearImgFunc(" + count + ")",
            copyFuncL: "copyFunc(" + count + ", true)",
            copyFuncR: "copyFunc(" + count + ")",
            pasteFuncL: "pasteFunc(" + count + ")",
            moveDownFunc: "moveDownFunc(" + count + ")",
            moveUpFunc: "moveUpFunc(" + count + ")",
            isPause: String(isPause)
        };


    var tmpl = doT.template($('#morphAnimation').text())(data);


    afterCount
        ? $(tmpl).insertAfter($('#morphPanelId' + afterCount))
        : $content.append(tmpl);

    document.getElementById(morphPanelId).morphPanel = new MorphPanel(count, isPause);

    formatAnimPanels();
}

function formatAnimPanels() {
    var children = $content.children(),
        n = children.length;

    $content.find("#delBtn").attr("style", "display:" + (n < 2 ? "none" : "block"));

    for (var i = 0; i < n; i++) {
        var $c = $(children[i]);
        $c.find("#upBtn").attr("style", "display:" + (!i ? "none" : "block"));
        $c.find("#downBtn").attr("style", "display:" + (i == n - 1 ? "none" : "block"));
    }
}


var Marker = (function () {

    function createBody(x, y, parent, self, isMaster) {
        var div = document.createElement('div');
        div.className = "marker";
        div.style.left = x;
        div.style.top = y;
        var $c = $("#morphPanelId" + parent.id + " #imgCont" + (isMaster ? 1 : 2));
        $(div).draggable({ containment: $c });
        if (isMaster) {
            $(div).click(function (e) {
                if (!isAddMarkerState) {
                    parent.removeMarker(self);
                }
            });
        }
        return div;
    }

    var Marker = function (x, y, parent) {
        typeof(x) == "number" && (x = x + "px");
        typeof(y) == "number" && (y = y + "px");

        this.masterDiv = createBody(x, y, parent, this, true);
        this.slaveDiv = createBody(x, y, parent, this);

        parent.$markerMasterCont.append(this.masterDiv);
        parent.$markerSlaveCont.append(this.slaveDiv);
        parent.renumber();
    };

    var p = Marker.prototype;

    p.getBody = function (isMaster) {
        return isMaster ? this.masterDiv : this.slaveDiv;
    };

    p.getPosition = function (isMaster, scaleble) {
        var div = isMaster ? this.masterDiv : this.slaveDiv,
            re = /[^0-9,.]/g,
            x = Number(div.style.left.replace(re, '')),
            y = Number(div.style.top.replace(re, ''));

        if (scaleble) {
            x = Math.round(x / scale);
            y = Math.round(y / scale);
        }
        return [x, y];
    };

    return Marker;
})();

var MorphPanel = (function () {
    /*
     function getBounds(element) {
     var x = element.offsetLeft;
     var y = element.offsetTop;
     for (var parent = element.offsetParent; parent; parent = parent.offsetParent) {
     x += parent.offsetLeft - parent.scrollLeft;
     y += parent.offsetTop - parent.scrollTop
     }
     return [x, y, element.offsetWidth, element.offsetHeight];
     }
     */

    function initDrop(id, self, isMaster) {
        $("#morphPanelId" + id + " #imgCont" + (isMaster ? 1 : 2)).droppable({
            drop: function (e, ui) {
                var $img = $(ui.draggable).find("img"),
                    imgBase64 = $img.attr("src");
                if (!imgBase64)return;

                self.setImgBase64(imgBase64, isMaster);
                self.setImgName($img.attr("title"), isMaster)
            }
        });
    }

    var MorphPanel = function (id, isPause) {
        this.id = id;
        this.isPause = isPause;
        this.markerList = [];
        this.imgNameMaster = "";
        this.imgNameSlave = "";
        this.$imgMaster = $("#morphPanelId" + this.id + " #imgCont1 img");
        this.$imgSlave = $("#morphPanelId" + this.id + " #imgCont2 img");

        (function (self) {
            self.$imgMaster.click(function (e) {
                var o = $(this).offset();
                self.addMarker(e.pageX - o.left, e.pageY - o.top);
            });
        })(this);


        this.$markerMasterCont = $("#morphPanelId" + this.id + " #imgCont1 .mCont");
        this.$markerSlaveCont = $("#morphPanelId" + this.id + " #imgCont2 .mCont");

        initDrop(id, this, true);
        initDrop(id, this);
    };

    var p = MorphPanel.prototype;

    p.renumber = function () {
        var self = this;
        r("$markerMasterCont");
        r("$markerSlaveCont");

        function r(markerCont) {
            var arr = $(self[markerCont]).find(".marker");
            for (var i = 0, d; d = arr[i]; i++) {
                d.innerHTML = (i + 1) + "";
            }
        }
    };

    p.clearImg = function (isMaster) {
        var img = isMaster ? this.$imgMaster : this.$imgSlave,
            src = img.attr("src");

        if (src)
            selectedImgCount--;

        img.attr("src", "");
        img.attr("data-src", "holder.js/100%x180");
        img.attr("style", "height: 400px; width: 100%; display: block;");

        this.setImgName("", isMaster);
    };

    p.addMarker = function (x, y) {
        var m = new Marker(x, y, this);
        this.markerList.push(m);
    };

    p.removeMarker = function (m) {
        var i = this.markerList.indexOf(m);
        if (~i) {
            this.markerList.splice(i, 1);
            $(m.getBody(true)).remove();
            $(m.getBody()).remove();
            this.renumber();
        }
    };

    p.removeAllMarkers = function () {
        for (var i = 0, m; m = this.markerList[i]; i++) {
            $(m.getBody(true)).remove();
            $(m.getBody()).remove();
        }
        this.markerList.length = 0;
    };

    p.getAllMarkers = function (isMaster, scaleble) {
        var hw = Math.round(currentWidth / 2),
            hh = Math.round(currentHeigth / 2);

        var arr = scaleble ? [
            [ 0, 0 ],
            [ hw, 0 ],
            [ currentWidth, 0 ],
            [ 0, hh ],
            [ currentWidth, hh ],
            [ 0, currentHeigth ],
            [ hw, currentHeigth ],
            [ currentWidth, currentHeigth ]
        ] : [];
        for (var i = 0, m; m = this.markerList[i]; i++) {
            arr.push(m.getPosition(isMaster, scaleble));
        }
        return arr;
    };

    p.getImgBase64 = function (isMaster) {
        return this[isMaster ? "$imgMaster" : "$imgSlave"].attr("src");
    };

    p.setImgName = function (name, isMaster) {
        this[isMaster ? "imgNameMaster" : "imgNameSlave"] = name;
    };

    p.getImgName = function (isMaster) {
        return this[isMaster ? "imgNameMaster" : "imgNameSlave"];
    };

    p.getTime = function () {
        var $input = $("#morphPanelId" + this.id + " #inputSuccess"),
            val = Number($input.val());
        isNaN(val) && (val = 1);
        $input.val(val);
        return val;
    };

    p.setImgBase64 = function (imgBase64, isMaster) {
        var img = isMaster ? this.$imgMaster : this.$imgSlave,
            src, style;

        src = img.attr("src");
        style = img.attr("style");

        img.attr("src", imgBase64);
        img.attr("style", "");

        var w = img.width(),
            h = img.height(),
            s = Math.min(600 / w, 400 / h);

        if (selectedImgCount && (w != currentWidth || h != currentHeigth)) {
            $('#selected_image_width').html(w + "px");
            $('#selected_image_heigth').html(h + "px");
            $('#current_images_width').html(currentWidth + "px");
            $('#current_images_heigth').html(currentHeigth + "px");

            this.clearImg(isMaster);

            if (src) {
                img.attr("src", src);
                img.attr("style", style);
            }
            selectedImgCount++;

            $('#myModalErrorSize').modal('show');
        } else {
            img.attr("style", "height: " + (h * s) + "px; width: " + (w * s) + "px; display: block;");
            if (!selectedImgCount)
                setCurrentImageSize(w, h, s);

            if (!src) {
                selectedImgCount++;
            }
        }

    };

    return MorphPanel;
})();


function setCurrentImageSize(w, h, s) {
    currentWidth = w;
    currentHeigth = h;
    scale = s;
}

function setMarkerState(value) {
    isAddMarkerState = value;
}


function handleFileSelect(e) {
    var files = e.target.files;

    for (var i = 0, f; f = files[i]; i++) {

        if (!f.type.match('image.*'))
            continue;

        var reader = new FileReader();

        reader.onload = (function (theFile) {
            return function (e) {
                var li = document.createElement('li');
                li.innerHTML = ['<img class="thumb" src="', e.target.result, '" title="', escape(theFile.name), '"/>'].join('');
                document.getElementById('scrollbox').insertBefore(li, null);

                $(li).draggable({ cursor: "move", revert: true, opacity: 0.7, helper: "clone" });
            };
        })(f);

        reader.readAsDataURL(f);
    }
}

