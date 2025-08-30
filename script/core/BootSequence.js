export class BootSequence {
    constructor() {
        this.bootMessages = [
            { text: '[BOOT INIT] Initializing kernel modules...', delay: 150, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '[SYS-CHECK] Verifying hardware integrity...', delay: 200, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '[CPU] Detected 8 cores, turbo mode enabled.', delay: 150, type: 'info' },
            { text: '[RAM] 32768 MB registered. Allocating cache buffers...', delay: 180, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '[GPU] Driver handshake complete. Enabling neko shaders...', delay: 200, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[BOOT] Loading neko kernel extensions...', delay: 200, type: 'info' },
            { text: '   → Catgirl Support v3.14.15 initialized.', delay: 120, type: 'indent' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '   → Tail Physics Engine... synchronized.', delay: 150, type: 'indent' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '   → Ear Flick Sensitivity Module... enabled.', delay: 180, type: 'indent' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[SECURITY] Running integrity checks...', delay: 180, type: 'info' },
            { text: '   - Verifying litter integrity... done.', delay: 120, type: 'indent' },
            { text: '[No mess detected]', delay: 50, type: 'ok' },
            { text: '   - Checking yarn buffer overflow...', delay: 150, type: 'indent' },
            { text: '[SAFE]', delay: 50, type: 'ok' },
            { text: '   - Confirming no unauthorized scratching posts...', delay: 180, type: 'indent' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[NETWORK] Acquiring DHCP lease...', delay: 200, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '[WIRELESS] Enabling purr-to-purr protocol... handshake complete.', delay: 180, type: 'info' },
            { text: '[SYNC] Updating catnip canisters... 73%... 91%...', delay: 150, type: 'info' },
            { text: '[DONE]', delay: 50, type: 'ok' },
            { text: '[SYS] Loading cozy mode parameters...', delay: 150, type: 'info' },
            { text: '[Snuggle factor: MAX]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[BOOT] Initializing personality core...', delay: 200, type: 'info' },
            { text: '   → Mode: "Playful Neko"', delay: 120, type: 'indent' },
            { text: '   → Aggression threshold: 12% (default)', delay: 150, type: 'indent' },
            { text: '   → Purring engine warm-up...', delay: 180, type: 'indent' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '   → Deploying neko claws (sheathed)...', delay: 200, type: 'indent' },
            { text: '[READY]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[DRIVERS] Installing whisker detection drivers...', delay: 200, type: 'info' },
            { text: '[OK]', delay: 50, type: 'ok' },
            { text: '[FSCK] Scanning scratching disk for bad sectors...', delay: 180, type: 'info' },
            { text: '[NO CLAW MARKS FOUND]', delay: 50, type: 'ok' },
            { text: '[HARDWARE] Checking tail servo alignment...', delay: 150, type: 'info' },
            { text: '[PERFECTLY CURLY]', delay: 50, type: 'ok' },
            { text: '', delay: 100, type: 'info' },
            { text: '[SERVICE] Spawning processes:', delay: 180, type: 'info' },
            { text: '   → nyan_service... running', delay: 120, type: 'indent' },
            { text: '   → headpat_daemon... running', delay: 150, type: 'indent' },
            { text: '   → milk_request_handler... listening on port 8932', delay: 180, type: 'indent' },
            { text: '', delay: 150, type: 'info' },
            { text: '[FINAL] System boot completed at 0.32s (fast as a cat pounce)', delay: 200, type: 'ok' },
            { text: 'Welcome to NekoOS 5.0 (meow@localhost)', delay: 150, type: 'info' },
            { text: 'Type `nya --help` for available commands.', delay: 100, type: 'info' }
        ];
    }

    start() {
        const bootLog = document.getElementById('boot-log');
        if (!bootLog) return;
        
        let currentDelay = 0;
        
        this.bootMessages.forEach((message, index) => {
            currentDelay += message.delay;
            
            setTimeout(() => {
                const messageElement = document.createElement('div');
                messageElement.className = `boot-message ${message.type}`;
                if (message.type === 'indent') {
                    messageElement.classList.add('indent');
                }
                messageElement.textContent = message.text;
                
                bootLog.appendChild(messageElement);
                bootLog.scrollTop = bootLog.scrollHeight;
                
                // Effet de frappe pour certains messages
                if (message.text.includes('...') || message.text.includes('→')) {
                    this.typewriterEffect(messageElement, message.text);
                }
            }, currentDelay);
        });
    }

    typewriterEffect(element, text, speed = 15) {
        element.textContent = '';
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }
}
