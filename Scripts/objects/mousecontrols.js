var objects;
(function (objects) {
    // MouseControls Class +++++++++++++++
    var MouseControls = (function () {
        // CONSTRUCTOR +++++++++++++++++++++++
        function MouseControls() {
            this.enabled = false;
            this.sensitivity = 0.1;
            this.yaw = 0;
            this.pitch = 0;
            document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        }
        // PUBLIC METHODS
        MouseControls.prototype.onMouseMove = function (event) {
            this.yaw = -event.movementX * this.sensitivity;
            this.pitch = -event.movementY * this.sensitivity * 0.01;
        };
        return MouseControls;
    })();
    objects.MouseControls = MouseControls;
})(objects || (objects = {}));
//# sourceMappingURL=mousecontrols.js.map