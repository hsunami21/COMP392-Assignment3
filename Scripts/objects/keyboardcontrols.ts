module objects {
    // KeyboardControls Class +++++++++++++++
    export class KeyboardControls {
        // PUBLIC INSTANCE VARIABLES ++++++++++++
        public moveForward: boolean;
        public moveBackward: boolean;
        public moveLeft: boolean;
        public moveRight: boolean;
        public jump: boolean;
        public enabled: boolean;
        
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        constructor() {
            this.enabled = false;
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }

        // PUBLIC METHODS  
        public onKeyDown(event: KeyboardEvent): void {
            switch (event.keyCode) {
                case 38: // Up arrow
                case 87: // W key
                    this.moveForward = true;
                    break;
                case 37: // Left arrow
                case 65: // A key
                    this.moveLeft = true;
                    break;
                case 40: // Down arrow
                case 83: // S key
                    this.moveBackward = true;
                    break;
                case 39: // Right arrow
                case 68: // D key
                    this.moveRight = true;
                    break;
                case 32: // Spacebar
                    this.jump = true;
                    break;
            }
        }

        public onKeyUp(event: KeyboardEvent): void {
            switch (event.keyCode) {
                 case 38: // Up arrow
                case 87: // W key
                    this.moveForward = false;
                    break;
                case 37: // Left arrow
                case 65: // A key
                    this.moveLeft = false;
                    break;
                case 40: // Down arrow
                case 83: // S key
                    this.moveBackward = false;
                    break;
                case 39: // Right arrow
                case 68: // D key
                    this.moveRight = false;
                    break;
                case 32: // Spacebar
                    this.jump = false;
                    break;
            }
        }
        
        
    }
}