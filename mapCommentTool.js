(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.MapCommentTool = factory(L);
    }
}(function (L) {
    var MapCommentTool = {
        options: {

        },

        getMessage: function() {
            return 'Map Comment Tool';
        },

        addTo: function(map) {
            var self = this;
            self.currentMode = 'map';
            var customControl = L.Control.extend({

                options: {
                position: 'topleft' 
                //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
                },

                onAdd: function (map) {
                    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

                    container.style.backgroundColor = 'white';
                    container.style.width = '40px';
                    container.style.height = '40px';
                    container.style.cursor = 'pointer';
                    container.innerHTML = '<img src=pencil.png class="panel-control-icon">'; // this is temporary...
                    container.onclick = function(){
                        self.ControlBar.toggle();
                    };

                    return container;
                },
            });
            map.addControl(new customControl());

            var visibileClass = (self.ControlBar.isVisible()) ? 'visible' : '';

            // decide control bar position

            self.ControlBar.options.position = (window.innerHeight < window.innerWidth) ? 'right' : 'bottom';

            // Create sidebar container
            var container = self.ControlBar._container =
                L.DomUtil.create('div', 'leaflet-control-bar-'+self.ControlBar.options.position+' leaflet-control-bar ' + visibileClass);
            var content = self.ControlBar._contentContainer;

            L.DomEvent
                .on(container, 'transitionend',
                self.ControlBar._handleTransitionEvent, self)
                .on(container, 'webkitTransitionEnd',
                self.ControlBar._handleTransitionEvent, self);

            var controlContainer = map._controlContainer;
            controlContainer.insertBefore(container, controlContainer.firstChild);

            self._map = map;

            map.MapCommentTool = MapCommentTool;           
        },

        startDrawingMode: function(comment) {
            var self = this;
            // spawn a drawing canvas
            self.drawingCanvas = L.canvas({padding: 0});
            self.drawingCanvas.addTo(map);

            // set canvas class
            self.drawingCanvas._container.className += " drawing-canvas";

            // set mode to "drawing"
            self.currentMode = 'drawing';
            // set toolbar view to "drawing"
            self.ControlBar.currentView = self.ControlBar.displayControl('drawing', comment.id);

            // Remove all comment layer groups from map
            window.map.MapCommentTool.Comments.list.forEach(function(comment){
                comment.removeFrom(map);
            });

            // turn on all drawing tools
            self.Tools.on();

        },

        stopDrawingMode: function() {
            var self = this;
            self.drawingCanvas.removeFrom(map);
            delete self.drawingCanvas;

            // set mode to "drawing"
            self.currentMode = 'controlBarHome';
            // set toolbar view to "drawing"
            self.ControlBar.currentView = self.ControlBar.displayControl('home');

            // turn off all drawing tools
            self.Tools.off();

            // Add all comment layer groups to map
            window.map.MapCommentTool.Comments.list.forEach(function(comment){
                comment.addTo(map);
            });
        }
    };


    MapCommentTool.ControlBar = {

        options: {
            position: 'right',
        },
        
        visible: false,
        currentView: '',

        isVisible: function() {
            var self = this;
            return self.visible;
        },
        show: function() {
            var self = this;

            window.map.MapCommentTool.currentMode = 'controlBarHome';

            self.visible = true;

            L.DomUtil.addClass(self._container, 'visible');

            var controls = document.getElementsByClassName("leaflet-control leaflet-bar");
            for (var i = 0; i < controls.length; i++) {
                controls[i].style.visibility='hidden';
            }

            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            if (map.tap) {
                map.tap.disable();
            }
            document.getElementById('map').style.cursor='default';

            self.currentView = self.displayControl('home');

            // on success, should return true
            return true;
        },
        hide: function(e) {
            var self = this;

            window.map.MapCommentTool.currentMode = 'map';

            self.visible = false;

            L.DomUtil.removeClass(self._container, 'visible');
            var controls = document.getElementsByClassName("leaflet-control leaflet-bar");
            for (var i = 0; i < controls.length; i++) {
                controls[i].style.visibility='visible';
            }
            if(e) {
                L.DomEvent.stopPropagation(e);
            }
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            if (map.tap) {
                map.tap.enable();
            }
            document.getElementById('map').style.cursor='grab';
            // on success, should return true
            return true;
        },
        toggle: function() {
            var self = this;

            var toggleSuccess = self.isVisible() ? self.hide() : self.show();

            return toggleSuccess;
        },

        _handleTransitionEvent: function (e) {
            var self = this;
            //if (e.propertyName == 'left' || e.propertyName == 'right' ||e.propertyName == 'bottom' || e.propertyName == 'top')
                //self.fire(self.ControlBar.isVisible() ? 'shown' : 'hidden');
        },

        displayControl: function(mode, commentId) {
            var self = this;
            // clear the display
            L.DomUtil.empty(self._container);

            switch (mode) {
                case 'home':
                    self.homeView();
                    break;
                case 'drawing':
                    self.drawingView(commentId);
                    break;
                default:

            }

            return mode;
            //
        },

        homeView: function() {
            var self = this;

            var homeView = L.DomUtil.create('div', 'controlbar-view controlbar-home', self._container);
            var closeButton = L.DomUtil.create('button', 'controlbar-button controlbar-close', homeView);
            closeButton.onclick = function() {
                self.hide();
            };
            var br = L.DomUtil.create('br', '', homeView);
            var newCommentButton = L.DomUtil.create('button', 'controlbar-button controlbar-new', homeView);
            newCommentButton.innerHTML = "New Comment";
            newCommentButton.onclick = function() {
                return self.startNewComment(); 
            };

            var commentListDiv = L.DomUtil.create('div', 'comment-list-div', homeView);
            var commentList = L.DomUtil.create('ul', 'comment-list-ul', commentListDiv);
            window.map.MapCommentTool.Comments.list.forEach(function(comment) {
                var commentLi = L.DomUtil.create('li', 'comment-list-li', commentList);
                commentLi.innerHTML = comment.id;
            });

        },

        drawingView: function(commentId) {
            var self = this;
            var drawingView = L.DomUtil.create('div', 'controlbar-view controlbar-home', self._container);
            var br = L.DomUtil.create('br', '', drawingView);
            var saveDrawingButton = L.DomUtil.create('button', 'controlbar-button controlbar-save', drawingView);
            saveDrawingButton.innerHTML = "Save";
            saveDrawingButton.onclick = function() {
                self.saveDrawing(commentId); 
            };
            var cancelDrawingButton = L.DomUtil.create('button', 'controlbar-button controlbar-cancel', drawingView);
            cancelDrawingButton.innerHTML = "Cancel";
            cancelDrawingButton.onclick = function() {
                self.cancelDrawing(commentId); 
            };

        },

        startNewComment: function() {
            var self = this;

            // create new comment
            var newComment = window.map.MapCommentTool.Comments.newComment();

            // trigger drawing mode
            window.map.MapCommentTool.startDrawingMode(newComment);

            return newComment;
        },

        saveDrawing: function(commentId) {
            var commentIndex = window.map.MapCommentTool.Comments.list.findIndex(function (comment) {
                        return comment.id === commentId;
            });
            
            var comment = window.map.MapCommentTool.Comments.list[commentIndex];

            comment.saveState = true;

            // SAVING LOGIC
            var context = window.map.MapCommentTool.drawingCanvas._ctx;
            var canvas = context.canvas;

            var canvasDrawing = canvas.toDataURL("data:image/png");

            var mapBounds = window.map.getBounds();
            var imageBounds = [[mapBounds._northEast.lat,mapBounds._northEast.lng], [mapBounds._southWest.lat,mapBounds._southWest.lng]];
            var drawing = L.imageOverlay(canvasDrawing, imageBounds);
            comment.addLayer(drawing);

            window.map.MapCommentTool.stopDrawingMode();
            return true;
        },

        cancelDrawing: function(commentId) {
            var commentIndex = window.map.MapCommentTool.Comments.list.findIndex(function (comment) {
                        return comment.id === commentId;
            });
            var comment = window.map.MapCommentTool.Comments.list[commentIndex];
            if (!comment.saveState) {
                window.map.MapCommentTool.Comments.list.pop();
            }
            else {
                // throw out changes...
            }
            window.map.MapCommentTool.stopDrawingMode();
            return true;
        }

    };

    
    MapCommentTool.Comments = { 
        
        list: [],

        saved: function(comment) {
            var self = this;
            return comment.saveState;
        },

        newComment: function() {
            var self = this;
            var comment = L.layerGroup();
            comment.saveState = false;

            comment.id = window.map.MapCommentTool.Util.generateGUID();

            self.list.push(comment);
            return comment;
        }

    };

    MapCommentTool.Util = {

        generateGUID: function() {            
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },

        getMousePos: function(canvas, x, y) {
            // this parses stuff like "translate3d(-1257px, -57px, 0px)" and turns it into an array like...
            // [ "translate3d", "-1257", "", "", "-57", "", "", "0", "", "" ]
            var canvasTransformArray = canvas.style.transform.split(/,|\(|\)|px| /);
            var x_true = x + (parseFloat(canvasTransformArray[1]));
            var y_true = y + (parseFloat(canvasTransformArray[4]));
            return {
                x: x_true,
                y: y_true,
            };

        },

    };

    MapCommentTool.Tools = {
        currentTool: '',
        toolList: ['pen', 'eraser', 'text'],
        defaultTool: 'pen',

        on: function() {
            var self = this;
            self.toolList.forEach(function(tool) {
                self[tool].setListeners();
                self.currentTool = self.defaultTool;
            });
            // initialize tools
        },

        off: function() {
            // turn tools off
        },

        pen: {
            name: 'pen',
            color: '',
            strokeWidth: '',
            stroke: false,
            mouseX: 0,
            mouseY: 0,
            lastX: -1,
            lastY: -1,
            drawLine: function(ctx,x,y,size) {
                var self = this;
                //operation properties
                ctx.globalCompositeOperation = "source-over";

                // If lastX is not set, set lastX and lastY to the current position 
                if (self.lastX==-1) {
                    self.lastX=x;
                    self.lastY=y;
                }

                r=250; g=0; b=0; a=255;
                ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(self.lastX,self.lastY);
                ctx.lineTo(x,y);
                ctx.lineWidth = size;
                ctx.stroke();
                ctx.closePath();
                // Update the last position to reference the current position
                self.lastX=x;
                self.lastY=y;
            },

            // don't have to remove listeners because the canvas gets removed anyways...
            setListeners: function() {
                var self = this;
                var canvas = window.map.MapCommentTool.drawingCanvas._container;
                var context = canvas.getContext('2d');
                canvas.addEventListener('mousedown', function() {
                    if(window.map.MapCommentTool.Tools.currentTool == 'pen') {
                        self.stroke = true;
                    }
                });

                canvas.addEventListener('mousemove', function(e) {
                    if (self.stroke && window.map.MapCommentTool.Tools.currentTool == 'pen') {
                        var pos = window.map.MapCommentTool.Util.getMousePos(canvas, e.clientX, e.clientY);
                        self.mouseX = pos.x;
                        self.mouseY = pos.y;
                        self.drawLine(context , self.mouseX, self.mouseY, 3);
                    }
                }, false);

                window.addEventListener('mouseup', function(e) {
                    if (self.stroke && window.map.MapCommentTool.Tools.currentTool == 'pen') {
                        self.stroke = false;
                        // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
                        self.lastX=-1;
                        self.lastY=-1;
                    }

                }, false);

            }

        },

        eraser: {
            name: 'eraser',
            setListeners: function(){

            },

        },

        text: {
            name: 'text',
            setListeners: function(){

            },
        }

    };

    // return your plugin when you are done
    return MapCommentTool;
}, window));