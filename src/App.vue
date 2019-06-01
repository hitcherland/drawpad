<template>
    <div @keydown.ctrl.z="undo"
         @keydown.ctrl.r.prevent="redo">
        <vue-headful title="drawpg" description="drawing rpg platform"/>
        <fullscreen ref="fullscreen" @change="fullscreenChange">
            <v-stage ref="canvas" tabindex=0 :config="configKonva"
                     @mousedown="onPointerDown"
                     @mousemove="onPointerDrag"
                     @mouseup="onPointerUp"
                     @touchstart="onPointerDown"
                     @touchmove="onPointerDrag"
                     @touchend="onPointerUp">
                <v-layer>
                    <v-path v-for="item in paths" :key="item.id" :config="item"></v-path>
                </v-layer>
            </v-stage>
            <div class="top-right">
                <swatches @input="setStrokeColor" v-model="configPalette.stroke" colors="text-advanced" popover-to="left"></swatches>
                <swatches @input="setFillColor" v-model="configPalette.fill" colors="text-advanced" popover-to="left"></swatches>
            </div>
            <button class="bottom-right" type="button" @click="toggleFullscreen">Fullscreen</button>
        </fullscreen>
    </div>
</template>

<script>
import { sendData, setOnMessageCallback } from './rtc.js'
import { changeTool, onStartTool, onDragTool, onStopTool, setStroke, setFill, setScale } from './tools.js'

export default {
    data() {
        return {
            fullscreen: false,
            paths: [],
            configKonva: {
                width: 1024,
                height: 600,
                scaleX: 1,
                scaleY: 1,
            },
            resolution: {
                x: 1024,
                y: 600,
            },
            configPalette: {
                stroke: "#000000",
                fill: null,
            }
        };
    },
    created() {
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
        setOnMessageCallback(this.onMessage);
        setStroke(this.configPalette.stroke);
        setFill(this.configPalette.fill);
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
        onMessage(message) {
            if(message.action == 'create') {
                this.paths.push(message.path);
            } else if( message.action == 'replace data') {
                this.paths.filter(path =>
                    path.uuid == message.uuid
                ).forEach(path => path.data = message.data);
            }
        },
        handleResize() {
            var aspectRatio = this.resolution.y / this.resolution.x;
            var X = window.innerWidth
            var Y = window.innerHeight

            var scaleX = X / this.resolution.x;
            var scaleY = Y / this.resolution.y;
            var minScale = Math.min(scaleX, scaleY);
            setScale(minScale, minScale);
            this.configKonva.width = this.resolution.x * minScale;
            this.configKonva.height = this.resolution.y * minScale;
            this.configKonva.scaleX = minScale;
            this.configKonva.scaleY = minScale;
        },
        setStrokeColor(color) {
            setStroke(color);
        },
        setFillColor(color) {
            setStroke(color);
        },
        onPointerDown(e) {
            console.log("down")
            var command = onStartTool(e);
            console.log("command", command)
            if(command !== undefined) {
                this.onMessage(command);
                sendData(command);
            }
        },
        onPointerDrag(e) {
            var command = onDragTool(e);
            if(command !== undefined) {
                this.onMessage(command);
                sendData(command);
            }
        },
        onPointerUp(e) {
            var command = onStopTool(e);
            if(command !== undefined) {
                this.onMessage(command);
                sendData(command);
            }
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
    margin: 0;
    background: black;
}

.top-right {
    position:absolute;
    top: 0;
    right: 0;
    background: rgba(127, 127, 127, 0.8);
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
    background: white !important;
    width: 100%;
    height: 100%;
}

</style>
