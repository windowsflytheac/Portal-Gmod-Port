<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Aperture Sandbox - Menu Patch</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: 'Courier New', monospace; }
        canvas { position: absolute; top: 0; left: 0; z-index: 1; }

        /* Start Menu Styling */
        #menu-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 100;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #00ffff;
        }

        .menu-btn {
            background: transparent; border: 2px solid #00ffff; color: #00ffff;
            padding: 15px 40px; margin: 10px; cursor: pointer; font-size: 20px;
            transition: 0.3s;
        }
        .menu-btn:hover { background: #00ffff; color: #000; box-shadow: 0 0 20px #00ffff; }

        .warning { color: #ff0000; font-size: 12px; margin-top: 5px; visibility: hidden; }

        #ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; display: none; }
        #original-game-view { position: absolute; top: 20px; right: 20px; width: 280px; height: 160px; border: 2px solid #00ffff; background: #000; }
        #hud { position: absolute; bottom: 30px; left: 30px; color: #00ffff; }
    </style>
</head>
<body>
    <div id="menu-overlay">
        <h1>APERTURE SCIENCE SANDBOX</h1>
        <button class="menu-btn" id="start-btn">START EXPERIMENT</button>
        <button class="menu-btn" id="fucked-btn">FUCKED PHYSICS ENGINE: OFF</button>
        <p id="fucked-warning" class="warning">WARNING: You are about to fuck up the physics engine.<br>Disable in settings (restart required).</p>
    </div>

    <div id="ui-layer">
        <div id="original-game-view"><div style="color: #00ffff; font-size: 10px; padding: 5px;">CAM_01: LIVE</div></div>
        <div id="hud">HP: 100 | [Q] SPAWN | [LMB] GRAB</div>
    </div>

    <script type="importmap">
        { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js", "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/", "cannon": "https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js" } }
    </script>
    <script type="module" src="main.js"></script>
</body>
</html>
