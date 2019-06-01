import { uuid } from 'vue-uuid'

var stroke = null;
var fill = null;
var scaleX = 1.0;
var scaleY = 1.0;

var tools = {
    pencil: {
        name: "pencil",
        __active__: null,
        start(x, y) {
            var path = {
                uuid: uuid.v4(),
                x: x,
                y: y,
                data: 'M0,0',
                fill: null,
                stroke: stroke,
                __origin__: {x: x, y: y},
            };

            this.__active__ = path;

            return {
                action: "create",
                path: path,
            }
        },
        drag(x, y) {
            var X = x - this.__active__.__origin__.x;
            var Y = y - this.__active__.__origin__.y;
            var data = this.__active__.data + `L${X},${Y}`

            return {
                action: "replace data",
                uuid: this.__active__.uuid,
                data: data
            }
        },
        stop(x, y) {
            var X = x - this.__active__.__origin__.x;
            var Y = y - this.__active__.__origin__.y;
            var data = this.__active__.data + `L${X},${Y}`
            var my_uuid = this.__active__.uuid
            this.__active__ = undefined;

            return {
                action: "replace data",
                uuid: my_uuid,
                data: data
            }
        }
    },

    loop: {
        name: "loop",
        __active__: null,
        start(x, y) {
            var path = {
                uuid: uuid.v4(),
                x: x,
                y: y,
                data: 'M0,0',
                fill: fill,
                stroke: stroke,
                __origin__: {x: x, y: y},
            };

            this.__active__ = path;

            return {
                action: "create",
                path: path,
            }
        },
        drag(x, y) {
            var X = x - this.__active__.__origin__.x;
            var Y = y - this.__active__.__origin__.y;
            var data = this.__active__.data + `L${X},${Y}`

            return {
                action: "replace data",
                uuid: this.__active__.uuid,
                data: data
            }
        },
        stop(x, y) {
            var X = x - this.__active__.__origin__.x;
            var Y = y - this.__active__.__origin__.y;
            var data = this.__active__.data + `L${X},${Y}`
            var my_uuid = this.__active__.uuid
            this.__active__ = undefined;

            return {
                action: "replace data",
                uuid: my_uuid,
                data: data
            }
        }
    },
}

var activeTool = tools.pencil;
var is_drawing = false;

function changeTool(toolName) {
    activeTool = tools[toolName]
}

function getPointerPos(ev) {
    var E = ev;
    if(E.changedTouches !== undefined && E.changedTouches.length > 0) {
        E = E.changedTouches[0];
    }
    var x = E.pageX / scaleX;
    var y = E.pageY / scaleY;
    return {x: x, y: y}
}

function onStartTool(e) {
    is_drawing=true;
    var pos = getPointerPos(e.evt);
    var command = activeTool.start.call(activeTool, pos.x, pos.y);
    command.tool = activeTool.name;
    return command;
}

function onDragTool(e) {
    if(!is_drawing)
        return;

    var pos = getPointerPos(e.evt);
    var command = activeTool.drag.call(activeTool, pos.x, pos.y);
    command.tool = activeTool.name;
    return command;
}

function onStopTool(e) {
    is_drawing = false;
    var pos = getPointerPos(e.evt);
    var command = activeTool.stop.call(activeTool, pos.x, pos.y);
    command.tool = activeTool.name;
    return command;
}

function setStroke(col) {
    stroke = col
}

function setFill(col) {
    fill = col
}

function setScale(x, y) {
    scaleX = x;
    scaleY = y;
}

export { tools, changeTool, onStartTool, onDragTool, onStopTool, setStroke, setFill, setScale }
