<template>
    <div @keydown.ctrl.z="undo"
         @keydown.ctrl.r.prevent="redo">
        <vue-headful title="drawpg" description="drawing rpg platform"/>
        <v-stage tabindex=0 :config="configKonva"
                 @mousedown="startDrawing"
                 @mousemove="keepDrawing"
                 @mouseup="stopDrawing">
            <v-layer>
                <v-circle :config="configCircle"></v-circle>
                <v-path v-for="item in paths" :key="item.id" :config="item"></v-path>
            </v-layer>
        </v-stage>
        <div class="top-right">
            <swatches @input="setLineColor" v-model="lineColor" colors="text-advanced" popover-to="left"></swatches>
            <swatches @input="setFillColor" v-model="fillColor" colors="text-advanced" popover-to="left"></swatches>
        </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            is_drawing: false,
            active_path: undefined,
            paths: [],
            undos: [],
            lineColor: '#000000',
            fillColor: '#ffffff',
            configKonva: {
                width: 200,
                height: 200
            },
            configCircle: {
                x: 100,
                y: 100,
                radius: 10,
                fill: "#ffffff",
                stroke: "#000000",
                strokeWidth: 4
            },
        };
    },
    created() {
        window.addEventListener('resize', this.handleResize)
        this.handleResize();
    },
    methods: {
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
            this.is_drawing=true;
            this.configCircle.x = e.evt.pageX;
            this.configCircle.y = e.evt.pageY;
            this.activePath = {
                x: e.evt.pageX, y: e.evt.pageY,
                data: 'M0,0',
                fill: this.fillColor,
                stroke: this.lineColor,
                __initial__: [e.evt.pageX, e.evt.pageY]
            };
            this.undos = [];
            this.paths.push(this.activePath);
        },
        keepDrawing(e) {
            if(!this.is_drawing)
                return;
            this.configCircle.x = e.evt.pageX;
            this.configCircle.y = e.evt.pageY;
            this.activePath.data += 'L' + (e.evt.pageX - this.activePath.__initial__[0])+ ',' + (e.evt.pageY - this.activePath.__initial__[1])
        },
        stopDrawing(e) {
            this.is_drawing=false;
            this.configCircle.x = e.evt.pageX;
            this.configCircle.y = e.evt.pageY;
            this.activePath.data += 'L' + (e.evt.pageX - this.activePath.__initial__[0])+ ',' + (e.evt.pageY - this.activePath.__initial__[1]) + 'z'
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
