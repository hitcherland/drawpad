<template>
    <div @keydown.ctrl.z="undo"
         @keydown.ctrl.r.prevent="redo">
        <div id="msgs"></div>
        <vue-headful title="drawpg" description="drawing rpg platform"/>
        <v-stage tabindex=0 :config="configKonva"
                 @mousedown="startDrawing"
                 @touchdown="startDrawing"
                 @mousemove="keepDrawing"
                 @touchmove="keepDrawing"
                 @mouseup="stopDrawing">
                 @touchup="stopDrawing">
            <v-layer>
                <v-path v-for="item in paths" :key="item.id" :config="item"></v-path>
                <v-circle :config="configCircle"></v-circle>
            </v-layer>
        </v-stage>
        <div class="top-right">
            <swatches @input="setLineColor" v-model="pen.lineColor" colors="text-advanced" popover-to="left"></swatches>
            <swatches @input="setFillColor" v-model="pen.fillColor" colors="text-advanced" popover-to="left"></swatches>
        </div>
    </div>
</template>

<script>
import { sendData, setOnMessageCallback } from './rtc.js'
export default {

    data() {
        return {
            message: '',
            rtc: null,
            activePath: undefined,
            remoteActivePaths: [],
            paths: [],
            undos: [],
            pen: {
                is_drawing: false,
                lineColor: '#000000',
                fillColor: '#ffffff',
            },
            configKonva: {
                width: 200,
                height: 200
            },
            configCircle: {
                x: 100,
                y: 100,
                radius: 5,
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 1
            },
        };
    },
    created() {
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
        setOnMessageCallback(this.onMessage);
    },
    mounted() {
    },
    methods: {
        onMessage( message) {
            if(message.start) {
                var path = message.start
                this.remoteActivePaths[0] = path;
                this.paths.push(path);
            } else if(message.move) {
                this.remoteActivePaths[0].data += message.move;
            } else if(message.stop) {
                this.remoteActivePaths[0].data += message.stop;
            }
        },
        handleResize() {
            this.configKonva.width = window.innerWidth;
            this.configKonva.height = window.innerHeight;
        },
        setLineColor(color) {
            this.configCircle.stroke = color;
        },
        setFillColor(color) {
            this.configCircle.fill = color;
        },
        startDrawing(e) {
            this.pen.is_drawing=true;
            this.activePath = {
                x: e.evt.pageX, y: e.evt.pageY,
                data: 'M0,0',
                fill: this.pen.fillColor,
                stroke: this.pen.lineColor,
                __initial__: [e.evt.pageX, e.evt.pageY]
            };
            this.undos = [];
            this.paths.push(this.activePath);
            sendData({"start": this.activePath});
        },
        keepDrawing(e) {
            this.configCircle.x = e.evt.pageX;
            this.configCircle.y = e.evt.pageY;
            if(!this.pen.is_drawing)
                return;
            var addition = 'L' + (e.evt.pageX - this.activePath.__initial__[0])+ ',' + (e.evt.pageY - this.activePath.__initial__[1])
            this.activePath.data += addition

            sendData({"move": addition});
        },
        stopDrawing(e) {
            this.pen.is_drawing=false;
            var addition = 'L' + (e.evt.pageX - this.activePath.__initial__[0])+ ',' + (e.evt.pageY - this.activePath.__initial__[1]) + 'z'
            this.activePath.data += addition
            sendData({"stop": addition});
        },
        undo() {
            if(this.paths.length > 0) {
                this.undos.push(this.paths.pop())
            }
        },
        redo() {
            if(this.undos.length > 0) {
                this.paths.push(this.undos.pop())
            }
        }
    }
};

</script>

<style>
body {
    margin: 0
}

.top-right {
    position:absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.5rem;
    border-radius: 0 0 0 0.5rem;
}

.top-right > * {
    display: inline-block;
    margin: 0.25rem;
}
</style>
