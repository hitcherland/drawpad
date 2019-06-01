<template>
    <div @keydown.ctrl.z="undo"
         @keydown.ctrl.r.prevent="redo">
        <vue-headful title="drawpg" description="drawing rpg platform"/>
        <fullscreen ref="fullscreen" @change="fullscreenChange">
            <v-stage tabindex=0 :config="configKonva"
                     @mousedown="startDrawing"
                     @mousemove="keepDrawing"
                     @mouseup="stopDrawing"
                     @touchstart="startDrawing"
                     @touchmove="keepDrawing"
                     @touchend="stopDrawing">
                <v-layer>
                    <v-path v-for="item in paths" :key="item.id" :config="item"></v-path>
                    <v-circle :config="configCircle"></v-circle>
                </v-layer>
            </v-stage>
            <div class="top-right">
                <swatches @input="setLineColor" v-model="pen.lineColor" colors="text-advanced" popover-to="left"></swatches>
                <swatches @input="setFillColor" v-model="pen.fillColor" colors="text-advanced" popover-to="left"></swatches>
            </div>
            <button class="bottom-right" type="button" @click="toggleFullscreen">Fullscreen</button>
        </fullscreen>
    </div>
</template>

<script>
import { sendData, setOnMessageCallback } from './rtc.js'
export default {
    data() {
        return {
            fullscreen: false,
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
                x: -10,
                y: -10,
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
        fullscreenChange(fullscreen) {
            this.fullscreen = fullscreen;
            this.handleResize();
        },
        toggleFullscreen() {
            this.$refs['fullscreen'].toggle()
        },
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
        getPointerPos(ev) {
            var E = ev;
            if(E.touches !== undefined) {
                E = E.touches[0];
            }
            var x = E.pageX;
            var y = E.pageY;
            return {x: x, y: y}
        },
        startDrawing(e) {
            this.pen.is_drawing=true;
            var pos = this.getPointerPos(e.evt);
            this.activePath = {
                x: pos.x, y: pos.y,
                data: 'M0,0',
                fill: this.pen.fillColor,
                stroke: this.pen.lineColor,
                __initial__: pos, 
            };
            this.undos = [];
            this.paths.push(this.activePath);
            sendData({"start": this.activePath});
        },
        keepDrawing(e) {
            var pos = this.getPointerPos(e.evt);
            this.configCircle.x = pos.x;
            this.configCircle.y = pos.y;
            if(!this.pen.is_drawing)
                return;
            var addition = 'L' + (pos.x - this.activePath.__initial__.x)+ ',' + (pos.y - this.activePath.__initial__.y)
            this.activePath.data += addition
            sendData({"move": addition});
        },
        stopDrawing(e) {
            this.pen.is_drawing=false;
            var pos = this.getPointerPos(e.evt);
            console.log("stop", pos);
            var addition = 'L' + (pos.x - this.activePath.__initial__.x)+ ',' + (pos.y - this.activePath.__initial__.y) + 'z'
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

.bottom-right {
    position:absolute;
    bottom: 0;
    right: 0;
}

canvas {
    background: white;
}
</style>
