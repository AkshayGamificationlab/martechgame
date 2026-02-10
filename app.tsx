<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mine Quest - Grid Quiz</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    
    <!-- External Libraries for Config Parsing -->
    <script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>

    <style>
        body {
            font-family: 'Press Start 2P', cursive;
            background-color: #65C6FF;
            overflow: hidden;
            margin: 0;
            padding: 0;
            user-select: none;
        }

        /* Animations */
        @keyframes legWalk { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes slideIn { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0% { transform: translateY(0px); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(100vh); opacity: 0; } }

        .animate-legWalk { animation: legWalk 0.4s infinite alternate; }
        .animate-legWalk-reverse { animation: legWalk 0.4s infinite alternate-reverse; }
        .animate-bounce-custom { animation: bounce 1s infinite; }
        .animate-pulse-custom { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-ping-custom { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }

        /* Custom Scrollbar for Settings */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #777; }

        /* Utility */
        .pixel-text-shadow { text-shadow: 2px 2px 0 #000; }
        .title-shadow { text-shadow: 0px 4px #7b7b7b, 0px 8px #585858, 4px 14px 10px rgba(0,0,0,0.5); -webkit-text-stroke: 2px #222; }
    </style>
</head>
<body class="flex flex-col h-screen w-screen text-white">

    <!-- VISUAL EFFECTS LAYER -->
    <div class="pointer-events-none fixed inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
    <div class="pointer-events-none fixed inset-0 z-20 opacity-10" style="background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%;"></div>
    <div id="particles-container" class="fixed inset-0 pointer-events-none z-0"></div>

    <!-- HUD LAYER -->
    <div class="absolute top-0 left-0 p-2 flex gap-2 items-center z-50">
        <!-- SFX Button -->
        <button id="btn-sfx" class="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-lg bg-gradient-to-b from-gray-200 to-gray-400 border-2 border-gray-500 active:scale-95 transition-transform" style="box-shadow: inset 1px 1px 0px #fff, inset -1px -1px 0px #000, 0 4px 6px rgba(0,0,0,0.3)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-800"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            <div id="led-sfx" class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_4px_#00ff00]"></div>
        </button>
        <!-- BGM Button -->
        <button id="btn-bgm" class="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-lg bg-gradient-to-b from-gray-200 to-gray-400 border-2 border-gray-500 active:scale-95 transition-transform" style="box-shadow: inset 1px 1px 0px #fff, inset -1px -1px 0px #000, 0 4px 6px rgba(0,0,0,0.3)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-800"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            <div id="led-bgm" class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_4px_#00ff00]"></div>
        </button>
    </div>

    <div class="absolute top-0 right-0 p-2 z-50">
        <!-- Settings Button -->
        <button id="btn-settings" class="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-lg bg-gradient-to-b from-gray-200 to-gray-400 border-2 border-gray-500 active:scale-95 transition-transform" style="box-shadow: inset 1px 1px 0px #fff, inset -1px -1px 0px #000, 0 4px 6px rgba(0,0,0,0.3)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-800"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
    </div>

    <!-- MAIN GAME AREA -->
    <div id="game-container" class="flex-1 flex flex-col items-center justify-center relative z-30 pt-16 pb-4">
        
        <!-- Question Bar (Dynamic) -->
        <div id="question-bar" class="w-full max-w-3xl px-4 mb-2 z-40 hidden animate-slideIn">
            <div class="bg-[#c6c6c6] border-4 border-white border-b-[#555] border-r-[#555] text-black p-3 w-full shadow-2xl relative rounded-lg">
                <h3 id="question-text" class="text-center text-sm md:text-lg leading-snug font-bold tracking-wide"></h3>
                <div class="w-full h-2 bg-gray-700 mt-2 border-2 border-white rounded-full overflow-hidden">
                    <div id="timer-bar" class="h-full bg-gradient-to-r from-green-500 to-green-300 w-full transition-all duration-1000 ease-linear origin-left"></div>
                </div>
            </div>
        </div>

        <!-- Screens -->
        <div id="screen-menu" class="text-center space-y-12 relative z-50 scale-125">
             <div class="bg-black/40 p-12 border-8 border-white/40 inline-block backdrop-blur-md rounded-2xl shadow-2xl relative">
                <div class="mb-10">
                   <h1 class="text-6xl md:text-8xl text-[#dcdcdc] tracking-tighter title-shadow">Mine Quest</h1>
                   <p class="text-yellow-300 text-sm md:text-xl mt-6 font-bold tracking-[0.2em] uppercase drop-shadow-md">Learning through adventure</p>
                </div>
                <input type="text" id="player-name-input" value="Akshay..." class="bg-black/60 border-4 border-white text-center text-white text-2xl p-4 w-80 focus:border-green-400 outline-none mb-8 font-bold rounded" />
                <button id="btn-play" class="block w-full bg-[#70ce3c] hover:bg-[#59ac2f] text-white text-2xl py-6 border-b-8 border-[#3e5a32] active:border-b-0 active:translate-y-2 transition-all shadow-xl rounded font-black tracking-widest">PLAY</button>
             </div>
        </div>

        <div id="screen-game" class="flex-1 w-full max-w-[95vw] min-h-0 flex items-center justify-center p-2 hidden">
             <div id="grid-wrapper" class="relative w-full h-full max-h-full bg-black/40 p-2 rounded-xl border-4 border-[#333] shadow-2xl backdrop-blur-sm">
                <!-- Grid will be injected here -->
             </div>
        </div>
    </div>

    <!-- MODALS -->

    <!-- Result Modal -->
    <div id="modal-result" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 hidden">
        <div class="bg-[#1e1e1e] border-[12px] border-[#333] border-t-[#555] border-l-[#555] w-full max-w-5xl min-h-[60vh] p-12 relative shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center overflow-hidden rounded-3xl" style="min-width: 600px;">
            <div class="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-white/30"></div>
            <div class="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-white/30"></div>
            <div class="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-white/30"></div>
            <div class="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-white/30"></div>

            <div id="result-content" class="flex flex-col items-center z-10 w-full"></div>

            <div class="w-full h-1 bg-white/10 my-10"></div>
            <button id="btn-main-menu" class="w-96 max-w-lg bg-gray-600 hover:bg-gray-500 text-white px-10 py-5 border-b-[10px] border-gray-800 active:border-b-0 active:mt-2 text-2xl font-black shadow-2xl uppercase tracking-[0.2em] transform transition-transform hover:scale-105 rounded-xl">Main Menu</button>
        </div>
    </div>

    <!-- Settings Modal -->
    <div id="modal-settings" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-[#3b3b3b] border-4 border-white w-full max-w-2xl p-4 relative shadow-[0_0_0_4px_black] flex flex-col scale-100 origin-center">
            <div class="flex justify-between items-center mb-2 border-b-2 border-white/20 pb-2">
                <h2 class="text-lg text-yellow-400 tracking-widest uppercase drop-shadow-md">Settings</h2>
                <button id="btn-close-settings" class="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            
            <div class="space-y-3">
                <section class="bg-black/20 p-2 rounded border-2 border-white/10">
                    <div class="grid grid-cols-4 gap-2">
                        <div><label class="block text-[10px] text-gray-400 mb-0.5 uppercase text-center">Rows</label><input type="number" id="inp-rows" class="w-full bg-black/50 border border-gray-600 p-1 text-white text-center text-sm focus:border-green-500 outline-none font-bold" /></div>
                        <div><label class="block text-[10px] text-gray-400 mb-0.5 uppercase text-center">Cols</label><input type="number" id="inp-cols" class="w-full bg-black/50 border border-gray-600 p-1 text-white text-center text-sm focus:border-green-500 outline-none font-bold" /></div>
                        <div><label class="block text-[10px] text-gray-400 mb-0.5 uppercase text-center">Timer</label><input type="number" id="inp-timer" class="w-full bg-black/50 border border-gray-600 p-1 text-white text-center text-sm focus:border-green-500 outline-none font-bold" /></div>
                        <div><label class="block text-[10px] text-gray-400 mb-0.5 uppercase text-center">Count</label><input type="number" id="inp-count" class="w-full bg-black/50 border border-gray-600 p-1 text-white text-center text-sm focus:border-green-500 outline-none font-bold" /></div>
                    </div>
                </section>
                <section class="bg-black/20 p-2 rounded border-2 border-white/10">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-black/10 p-2 rounded border border-white/5 flex flex-col gap-2">
                            <div class="flex justify-between items-center"><span class="text-[10px] text-gray-300 font-bold">Questions (.csv)</span><button onclick="downloadTemplate('questions')" class="text-blue-400 hover:text-blue-300"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button></div>
                            <input type="file" id="file-questions" accept=".xlsx,.csv" class="hidden" />
                            <button onclick="document.getElementById('file-questions').click()" class="w-full bg-blue-600 py-1.5 px-2 border-b-2 active:border-b-0 active:mt-0.5 font-bold shadow-sm uppercase text-[10px] text-white hover:bg-blue-500">Upload</button>
                        </div>
                        <div class="bg-black/10 p-2 rounded border border-white/5 flex flex-col gap-2">
                            <div class="flex justify-between items-center"><span class="text-[10px] text-gray-300 font-bold">Config (.txt/.yaml)</span><button onclick="downloadTemplate('config')" class="text-blue-400 hover:text-blue-300"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button></div>
                            <input type="file" id="file-config" accept=".txt,.yaml" class="hidden" />
                            <button onclick="document.getElementById('file-config').click()" class="w-full bg-gray-600 py-1.5 px-2 border-b-2 active:border-b-0 active:mt-0.5 font-bold shadow-sm uppercase text-[10px] text-white hover:bg-gray-500">Upload</button>
                        </div>
                    </div>
                </section>
            </div>
            <div class="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                <button id="btn-reset-config" class="p-2 rounded border-b-4 bg-red-600 border-red-800 active:border-b-0 active:mt-1 hover:brightness-110"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg></button>
                <div class="flex gap-2">
                     <button onclick="closeSettings()" class="p-2 rounded border-b-4 bg-gray-600 border-gray-800 active:border-b-0 active:mt-1 hover:brightness-110"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                     <button id="btn-save-config" class="p-2 rounded border-b-4 bg-[#70ce3c] border-[#3e5a32] active:border-b-0 active:mt-1 hover:brightness-110"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                </div>
            </div>
        </div>
    </div>

    <!-- SCRIPT LOGIC -->
    <script>
        // --- ASSETS & SVGs ---
        const SVGs = {
            angryDuck: `<svg viewBox="0 0 200 200" class="w-64 h-64 drop-shadow-xl"><g transform="translate(0, 10)"><line x1="85" y1="145" x2="85" y2="180" stroke="orange" stroke-width="8" stroke-linecap="round" class="animate-legWalk" /><line x1="115" y1="145" x2="115" y2="180" stroke="orange" stroke-width="8" stroke-linecap="round" class="animate-legWalk-reverse" /><path d="M75,180 L95,180 L85,170 Z" fill="orange" class="animate-legWalk" style="transform-box: fill-box;" /><path d="M105,180 L125,180 L115,170 Z" fill="orange" class="animate-legWalk-reverse" style="transform-box: fill-box;" /><ellipse cx="100" cy="115" rx="55" ry="45" fill="white" stroke="black" stroke-width="3" transform="rotate(-15 100 110)" /><path d="M60,95 Q100,135 140,95 L140,115 Q100,155 60,115 Z" fill="#0077BE" stroke="black" stroke-width="2" transform="rotate(-15 100 110)" /><path d="M65,100 Q100,140 135,100" fill="none" stroke="gold" stroke-width="3" transform="rotate(-15 100 110)" /><circle cx="95" cy="65" r="38" fill="white" stroke="black" stroke-width="3" /><path d="M65,35 Q95,15 125,35 L125,30 Q95,5 65,30 Z" fill="#0077BE" stroke="black" stroke-width="2" /><rect x="120" y="30" width="15" height="5" fill="black" /><path d="M130,32 L150,30 L150,38 L130,38 Z" fill="black" /><path d="M80,50 L100,60" stroke="black" stroke-width="4" stroke-linecap="round" /><path d="M110,60 L130,50" stroke="black" stroke-width="4" stroke-linecap="round" /><ellipse cx="90" cy="65" rx="4" ry="7" fill="black" /><ellipse cx="120" cy="65" rx="4" ry="7" fill="black" /><path d="M80,75 Q105,95 130,75 Q105,65 80,75 Z" fill="#FFA500" stroke="black" stroke-width="2" /><path d="M80,75 Q105,85 130,75" fill="none" stroke="black" stroke-width="1" /><g transform="translate(100, 105) rotate(-15)"><path d="M-15,-5 L-5,5 L-15,15 Z" fill="red" stroke="black" stroke-width="1" /><path d="M15,-5 L5,5 L15,15 Z" fill="red" stroke="black" stroke-width="1" /><circle cx="0" cy="5" r="5" fill="red" stroke="black" stroke-width="1" /></g><ellipse cx="135" cy="110" rx="18" ry="15" fill="white" stroke="black" stroke-width="3" transform="rotate(-15 100 110)" /><path d="M75,20 Q65,0 75,-10" stroke="#ccc" stroke-width="3" fill="none" class="animate-pulse-custom" /><path d="M115,20 Q125,0 115,-10" stroke="#ccc" stroke-width="3" fill="none" class="animate-pulse-custom" /></g></svg>`,
            chocolateDuck: `<svg viewBox="0 0 200 200" class="w-64 h-64 drop-shadow-xl"><ellipse cx="100" cy="130" rx="55" ry="45" fill="#FFD700" stroke="black" stroke-width="3" /><circle cx="100" cy="70" r="40" fill="#FFD700" stroke="black" stroke-width="3" /><circle cx="90" cy="60" r="4" fill="black" /><circle cx="110" cy="60" r="4" fill="black" /><path d="M90,80 Q100,90 110,80" fill="orange" stroke="black" stroke-width="2" /><rect x="60" y="100" width="80" height="60" rx="4" fill="#5D4037" stroke="black" stroke-width="2" transform="rotate(-10 100 130)" /><text x="80" y="140" fill="#FFD700" font-size="12" font-weight="bold" transform="rotate(-10 100 130)">CHOCO</text></svg>`,
            trophyDuck: `<svg viewBox="0 0 200 200" class="w-64 h-64 drop-shadow-[0_0_25px_rgba(255,215,0,0.8)]"><defs><linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD700" /><stop offset="30%" stop-color="#FFFACD" /><stop offset="60%" stop-color="#FFD700" /><stop offset="100%" stop-color="#DAA520" /></linearGradient></defs><g transform="translate(0, 10)"><rect x="60" y="160" width="80" height="15" fill="#5D4037" stroke="black" stroke-width="2" /><path d="M50,175 L150,175 L155,190 L45,190 Z" fill="#3E2723" stroke="black" stroke-width="2" /><path d="M90,130 Q100,160 110,130" fill="url(#trophyGold)" stroke="black" stroke-width="2" /><rect x="85" y="140" width="30" height="20" rx="5" fill="url(#trophyGold)" stroke="black" stroke-width="2" /><path d="M45,40 L155,40 L135,110 Q100,150 65,110 Z" fill="url(#trophyGold)" stroke="black" stroke-width="3" /><path d="M45,50 C10,50 10,90 48,100" fill="none" stroke="#DAA520" stroke-width="10" stroke-linecap="round" /><path d="M45,50 C10,50 10,90 48,100" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round" /><path d="M155,50 C190,50 190,90 152,100" fill="none" stroke="#DAA520" stroke-width="10" stroke-linecap="round" /><path d="M155,50 C190,50 190,90 152,100" fill="none" stroke="#FFD700" stroke-width="4" stroke-linecap="round" /><ellipse cx="100" cy="40" rx="55" ry="10" fill="#FFD700" stroke="black" stroke-width="2" /><ellipse cx="100" cy="40" rx="45" ry="5" fill="#B8860B" opacity="0.4" /><path d="M100,60 L105,75 L120,75 L108,85 L112,100 L100,90 L88,100 L92,85 L80,75 L95,75 Z" fill="#FFF" stroke="#DAA520" stroke-width="2" class="animate-pulse-custom" /><path d="M70,50 L85,100" stroke="white" stroke-width="5" opacity="0.3" stroke-linecap="round" /><circle cx="60" cy="45" r="3" fill="white" class="animate-ping-custom" /><circle cx="140" cy="45" r="4" fill="white" class="animate-ping-custom" style="animation-delay: 0.5s;" /><circle cx="100" cy="120" r="5" fill="white" class="animate-ping-custom" style="animation-delay: 1s;" /></g></svg>`
        };

        const NoiseURL = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

        // --- STATE & CONFIG ---
        const DEFAULT_QUESTIONS = [
            { id: '1', text: "What is the capital of Maharashtra?", answers: ["Pune", "Mumbai", "Nagpur", "Nashik"], correctIndex: 1 },
            { id: '2', text: "What is the capital of Karnataka?", answers: ["Mysore", "Mangalore", "Bengaluru", "Hubli"], correctIndex: 2 },
            { id: '3', text: "What is the capital of Tamil Nadu?", answers: ["Chennai", "Madurai", "Coimbatore", "Salem"], correctIndex: 0 },
            { id: '4', text: "What is the capital of West Bengal?", answers: ["Darjeeling", "Siliguri", "Asansol", "Kolkata"], correctIndex: 3 },
            { id: '5', text: "What is the capital of Rajasthan?", answers: ["Udaipur", "Jaipur", "Jodhpur", "Ajmer"], correctIndex: 1 }
        ];

        let state = {
            gameState: 'MENU', // MENU, PLAYING, GAME_OVER, VICTORY
            config: { rows: 8, cols: 12, timerSeconds: 10, questionCount: 5 },
            allQuestions: [...DEFAULT_QUESTIONS],
            questions: [],
            grid: [],
            score: 0,
            questionsSolved: 0,
            playerName: "Akshay...",
            timeLeft: 10,
            activeQuestion: null,
            sfxEnabled: true,
            bgmEnabled: true,
            isProcessing: false
        };

        // --- SOUND ENGINE ---
        const soundEngine = {
            ctx: null,
            bgmInterval: null,
            init: function() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
            playTone: function(freq, type, duration, vol, startTime = 0, slideTo) {
                if (!state.sfxEnabled || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
                if(slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + startTime + duration);
                gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + startTime);
                osc.stop(this.ctx.currentTime + startTime + duration);
            },
            playClick: function() { this.playTone(600, 'sine', 0.1, 0.1, 0, 800); },
            playDig: function() { this.playTone(300, 'triangle', 0.1, 0.1, 0, 100); },
            playTicking: function() { this.playTone(1200, 'square', 0.02, 0.03); },
            playCorrect: function() { this.playTone(523.25, 'sine', 0.1, 0.1, 0); this.playTone(659.25, 'sine', 0.1, 0.1, 0.1); this.playTone(783.99, 'sine', 0.3, 0.1, 0.2); },
            playWrong: function() { this.playTone(400, 'sawtooth', 0.3, 0.1, 0, 200); setTimeout(() => this.playTone(200, 'sawtooth', 0.4, 0.1, 0, 50), 300); },
            playExplode: function() {
                if (!state.sfxEnabled || !this.ctx) return;
                const bufferSize = this.ctx.sampleRate * 0.5;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for(let i=0; i<bufferSize; i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 500;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start();
            },
            playDuckLaugh: function() { if(!state.sfxEnabled || !this.ctx) return; const now = 0; this.playTone(300, 'square', 0.1, 0.1, now); this.playTone(300, 'square', 0.1, 0.1, now + 0.15); this.playTone(400, 'square', 0.2, 0.1, now + 0.4); },
            playFanfare: function() { if(!state.sfxEnabled || !this.ctx) return; const now = 0; this.playTone(523.25, 'triangle', 0.1, 0.1, now); this.playTone(523.25, 'triangle', 0.1, 0.1, now + 0.15); this.playTone(523.25, 'triangle', 0.1, 0.1, now + 0.30); this.playTone(659.25, 'triangle', 0.6, 0.1, now + 0.50); },
            startBGM: function(mode) {
                this.stopBGM();
                if (!state.bgmEnabled || !this.ctx) return;
                const tempo = mode === 'MENU' ? 1.0 : 0.25; 
                const melody = mode === 'MENU' ? [261.63, 329.63, 392.00, 329.63] : [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 196.00];
                let noteIdx = 0;
                this.bgmInterval = setInterval(() => {
                    if(this.ctx && state.bgmEnabled) {
                        const freq = melody[noteIdx % melody.length];
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = mode === 'MENU' ? 'sine' : (noteIdx % 2 === 0 ? 'square' : 'sawtooth');
                        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                        const duration = mode === 'MENU' ? tempo * 0.9 : tempo * 0.5;
                        const volume = mode === 'MENU' ? 0.03 : 0.04;
                        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start();
                        osc.stop(this.ctx.currentTime + duration);
                        noteIdx++;
                    }
                }, tempo * 1000);
            },
            stopBGM: function() { if(this.bgmInterval) clearInterval(this.bgmInterval); this.bgmInterval = null; }
        };

        // --- DOM ELEMENTS ---
        const els = {
            screens: { menu: document.getElementById('screen-menu'), game: document.getElementById('screen-game') },
            modals: { result: document.getElementById('modal-result'), settings: document.getElementById('modal-settings') },
            buttons: { 
                play: document.getElementById('btn-play'), sfx: document.getElementById('btn-sfx'), bgm: document.getElementById('btn-bgm'),
                settings: document.getElementById('btn-settings'), closeSettings: document.getElementById('btn-close-settings'),
                saveConfig: document.getElementById('btn-save-config'), resetConfig: document.getElementById('btn-reset-config'),
                mainMenu: document.getElementById('btn-main-menu')
            },
            inputs: {
                rows: document.getElementById('inp-rows'), cols: document.getElementById('inp-cols'),
                timer: document.getElementById('inp-timer'), count: document.getElementById('inp-count'),
                player: document.getElementById('player-name-input'), fileQ: document.getElementById('file-questions'), fileC: document.getElementById('file-config')
            },
            leds: { sfx: document.getElementById('led-sfx'), bgm: document.getElementById('led-bgm') },
            grid: document.getElementById('grid-wrapper'),
            questionBar: document.getElementById('question-bar'),
            questionText: document.getElementById('question-text'),
            timerBar: document.getElementById('timer-bar'),
            resultContent: document.getElementById('result-content'),
            particles: document.getElementById('particles-container')
        };

        // --- INITIALIZATION ---
        function init() {
            createParticles();
            setupEventListeners();
            loadConfigToInputs();
            soundEngine.init();
            soundEngine.startBGM('MENU');
        }

        function createParticles() {
            for(let i=0; i<10; i++) {
                const p = document.createElement('div');
                p.className = "absolute w-1 h-1 bg-white opacity-40 rounded-full";
                p.style.left = Math.random() * 100 + 'vw';
                p.style.top = Math.random() * 100 + 'vh';
                p.style.animation = `float ${10 + Math.random() * 20}s infinite linear`;
                els.particles.appendChild(p);
            }
        }

        // --- GAME LOGIC ---

        function startGame() {
            const name = els.inputs.player.value.trim();
            if(!name) { alert("Please enter a name!"); return; }
            state.playerName = name;
            state.questions = [...state.allQuestions].sort(() => 0.5 - Math.random()).slice(0, state.config.questionCount);
            if(state.questions.length === 0) { alert("No questions loaded!"); return; }
            state.score = 0;
            state.questionsSolved = 0;
            state.activeQuestion = null;
            state.isProcessing = false;
            state.grid = createGridData(state.config.rows, state.config.cols);
            switchState('PLAYING');
            renderGrid();
            soundEngine.playDig();
        }

        function switchState(newState) {
            state.gameState = newState;
            els.screens.menu.classList.add('hidden');
            els.screens.game.classList.add('hidden');
            els.modals.result.classList.add('hidden');
            els.questionBar.classList.add('hidden');

            if(newState === 'MENU') {
                els.screens.menu.classList.remove('hidden');
                soundEngine.startBGM('MENU');
            } else if (newState === 'PLAYING') {
                els.screens.game.classList.remove('hidden');
                soundEngine.startBGM('PLAYING');
            } else {
                els.screens.game.classList.remove('hidden'); // Keep grid visible
                els.modals.result.classList.remove('hidden');
                renderResult();
                soundEngine.stopBGM();
            }
        }

        function createGridData(rows, cols) {
            const arr = [];
            for(let r=0; r<rows; r++) {
                for(let c=0; c<cols; c++) {
                    arr.push({ r, c, state: 'HIDDEN' });
                }
            }
            return arr;
        }

        function renderGrid() {
            els.grid.innerHTML = `<div class="grid gap-2 w-full h-full" style="grid-template-columns: repeat(${state.config.cols}, 1fr); grid-template-rows: repeat(${state.config.rows}, 1fr);">
                ${state.grid.map(cell => getCellHTML(cell)).join('')}
            </div>`;
            document.querySelectorAll('.grid-cell').forEach(el => {
                el.addEventListener('click', (e) => {
                    const r = parseInt(el.dataset.r);
                    const c = parseInt(el.dataset.c);
                    const cell = state.grid.find(x => x.r === r && x.c === c);
                    if(cell.state === 'ANSWER') handleAnswer(cell);
                    else handleBlockClick(cell);
                });
            });
        }

        function getCellHTML(cell) {
            let content = '';
            let classes = 'relative cursor-pointer transition-transform duration-200 hover:scale-[1.05] hover:z-20 h-full w-full grid-cell';
            const colors = { grass: '#5ba346', dirt: '#8f563b', gold: '#FFD700', diamond: '#7D7D7D', tnt: '#db3636', stone: '#757575' };

            const getTexture = (type) => {
                let inner = `<div class="absolute inset-0 opacity-10" style="background-image: url('${NoiseURL}')"></div><div class="absolute inset-x-0 bottom-0 h-1 bg-black/30"></div><div class="absolute inset-y-0 right-0 w-1 bg-black/30"></div><div class="absolute inset-x-0 top-0 h-1 bg-white/30"></div><div class="absolute inset-y-0 left-0 w-1 bg-white/30"></div><div class="absolute inset-0 border-b-4 border-black/30 shadow-inner pointer-events-none"></div>`;
                if (type === 'grass') {
                    inner += `<div class="absolute top-0 w-full h-[50%] bg-[#5BB356]"></div><div class="absolute bottom-0 w-full h-[50%] bg-[#79553A]"></div><div class="absolute top-[50%] left-[10%] w-[15%] h-[15%] bg-[#5BB356]"></div><div class="absolute top-[50%] right-[35%] w-[10%] h-[20%] bg-[#5BB356]"></div>`;
                } else if (type === 'tnt') {
                    inner += `<div class="absolute inset-0 flex items-center justify-center"><div class="w-full h-[33%] bg-white flex items-center justify-center relative shadow-[0_4px_0_#d1d1d1]"><span class="text-[8px] md:text-[10px] font-black text-black tracking-widest font-minecraft scale-y-150">TNT</span></div><div class="absolute top-0 w-full h-[20%] bg-black/10 flex gap-1 justify-center"><div class="w-1/4 h-full bg-[#B7352D]"></div><div class="w-1/4 h-full bg-[#B7352D]"></div></div><div class="absolute bottom-0 w-full h-[20%] bg-black/10 flex gap-1 justify-center"><div class="w-1/4 h-full bg-[#B7352D]"></div><div class="w-1/4 h-full bg-[#B7352D]"></div></div></div>`;
                } else if (type === 'diamond') {
                    inner += `<div class="absolute inset-0 bg-[#7D7D7D]"></div><div class="absolute top-[20%] left-[20%] w-[12%] h-[12%] bg-[#4AEDD9] shadow-[0_0_2px_#fff]"></div><div class="absolute top-[60%] right-[20%] w-[15%] h-[15%] bg-[#4AEDD9] shadow-[0_0_2px_#fff]"></div>`;
                } else if (type === 'gold') {
                     inner += `<div class="absolute inset-0 bg-[#757575]"></div><div class="absolute top-[20%] left-[20%] w-[15%] h-[15%] bg-[#FCEE4B] shadow-[0_0_2px_#fff]"></div><div class="absolute top-[60%] right-[20%] w-[15%] h-[15%] bg-[#FCEE4B] shadow-[0_0_2px_#fff]"></div>`;
                }
                return `<div class="w-full h-full relative overflow-hidden" style="background:${colors[type]}">${inner}</div>`;
            };

            if (cell.state === 'HIDDEN') content = getTexture('grass');
            else if (cell.state === 'CLEARED') content = getTexture('dirt');
            else if (cell.state === 'GOLD') content = getTexture('gold');
            else if (cell.state === 'DIAMOND') content = getTexture('diamond');
            else if (cell.state === 'EXPLODED') content = `<div class="w-full h-full bg-red-600 animate-pulse">${getTexture('tnt')}</div>`;
            else if (cell.state === 'QUESTION') {
                content = `<div class="w-full h-full bg-[#E0AA3E] border-4 border-[#B88A2D] flex items-center justify-center shadow-inner relative"><span class="text-xl md:text-4xl font-bold text-[#5C4516] drop-shadow-md">?</span><div class="absolute inset-0 border-2 border-white animate-ping opacity-50"></div></div>`;
            } else if (cell.state === 'ANSWER') {
                // Apply green/red only if confirmed correct/incorrect, otherwise grey
                let colorClass = 'bg-gray-200 border-gray-400 text-black';
                if (cell.isCorrect === true) colorClass = 'bg-green-500 border-green-700 text-white';
                else if (cell.isCorrect === false) colorClass = 'bg-red-500 border-red-700 text-white';
                
                content = `<div class="w-full h-full border-4 p-1 flex items-center justify-center text-[10px] md:text-sm text-center font-bold leading-tight shadow-inner break-words ${colorClass}">${cell.content}</div>`;
            }
            return `<div class="${classes}" data-r="${cell.r}" data-c="${cell.c}">${content}</div>`;
        }
        
        let timerInterval;

        function startQuestionTimer() {
            if(timerInterval) clearInterval(timerInterval);
            els.questionBar.classList.remove('hidden');
            els.questionText.textContent = state.activeQuestion.text;
            state.timeLeft = state.config.timerSeconds;
            updateTimerBar();

            timerInterval = setInterval(() => {
                state.timeLeft--;
                updateTimerBar();
                if(state.timeLeft > 0) soundEngine.playTicking();
                if(state.timeLeft <= 0) {
                    clearInterval(timerInterval);
                    soundEngine.playExplode();
                    endGame('GAME_OVER');
                }
            }, 1000);
        }

        function updateTimerBar() {
            const pct = (state.timeLeft / state.config.timerSeconds) * 100;
            els.timerBar.style.width = `${pct}%`;
        }

        function handleBlockClick(cell) {
            if (state.activeQuestion || cell.state !== 'HIDDEN' || state.isProcessing) return;
            soundEngine.playClick();
            
            const qIndex = state.questionsSolved % state.questions.length;
            const q = state.questions[qIndex];
            state.activeQuestion = q;

            // SMART NEIGHBOR LOGIC (BFS)
            const slots = findAnswerSlots(cell.r, cell.c);
            
            let answerIndices = [0, 1, 2, 3];
            if (slots.length < 4) {
                const correct = q.correctIndex;
                const others = answerIndices.filter(i => i !== q.correctIndex).sort(() => 0.5 - Math.random()).slice(0, slots.length - 1);
                answerIndices = [q.correctIndex, ...others];
            }
            answerIndices.sort(() => 0.5 - Math.random());
            state.timeLeft = state.config.timerSeconds;
            
            const qCell = state.grid.find(x => x.r === cell.r && x.c === cell.c);
            qCell.state = 'QUESTION';
            
            slots.forEach((slot, i) => {
                if (i < answerIndices.length) {
                    const sCell = state.grid.find(x => x.r === slot.r && x.c === slot.c);
                    sCell.state = 'ANSWER';
                    sCell.content = q.answers[answerIndices[i]];
                    sCell.answerIndex = answerIndices[i];
                    sCell.isCorrect = undefined; // Reset validity visual
                }
            });

            renderGrid();
            startQuestionTimer();
        }

        function findAnswerSlots(or, oc) {
            const found = [];
            const visited = new Set();
            const queue = [{ r: or, c: oc }];
            visited.add(`${or},${oc}`);
            const dirs = [[-1,0], [0,1], [1,0], [0,-1], [-1,-1], [-1,1], [1,1], [1,-1]];

            while (queue.length && found.length < 4) {
                const curr = queue.shift();
                const shuffledDirs = [...dirs].sort(() => 0.5 - Math.random());
                for(let d of shuffledDirs) {
                    const nr = curr.r + d[0];
                    const nc = curr.c + d[1];
                    const key = `${nr},${nc}`;
                    if(nr >= 0 && nr < state.config.rows && nc >= 0 && nc < state.config.cols && !visited.has(key)) {
                        visited.add(key);
                        const cell = state.grid.find(x => x.r === nr && x.c === nc);
                        if(cell) {
                            if(cell.state === 'HIDDEN') {
                                found.push(cell);
                                if(found.length === 4) break;
                            }
                            queue.push({r:nr, c:nc});
                        }
                    }
                }
            }
            return found;
        }

        function handleAnswer(cell) {
            if (!state.activeQuestion || state.isProcessing) return;
            state.isProcessing = true;
            clearInterval(timerInterval);

            const currentQ = state.activeQuestion;
            const isCorrect = cell.answerIndex === currentQ.correctIndex;
            
            // Visual Update Immediate
            cell.isCorrect = isCorrect;
            renderGrid();

            if (isCorrect) {
                soundEngine.playCorrect();
                state.score += 100;
                
                // Find Next Target using neighbor logic
                const currentCells = state.grid.filter(c => c.state === 'QUESTION' || c.state === 'ANSWER');
                const candidates = [];
                const candidateCoords = new Set();
                currentCells.forEach(curr => {
                    [[-1,0],[0,1],[1,0],[0,-1]].forEach(d => {
                        const nr = curr.r + d[0], nc = curr.c + d[1];
                        const key = `${nr},${nc}`;
                        if(!candidateCoords.has(key) && nr >=0 && nr < state.config.rows && nc >=0 && nc < state.config.cols) {
                            candidateCoords.add(key);
                            const n = state.grid.find(g => g.r === nr && g.c === nc);
                            if(n && n.state === 'HIDDEN') candidates.push(n);
                        }
                    });
                });

                // Prioritize spots with space
                const getScore = (t) => {
                    let c = 0;
                    [[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[-1,1],[1,1],[1,-1]].forEach(d => {
                         const n = state.grid.find(g => g.r === t.r+d[0] && g.c === t.c+d[1]);
                         if(n && n.state === 'HIDDEN') c++;
                    });
                    return c;
                };
                
                let nextTarget;
                const scored = candidates.map(c => ({cell: c, score: getScore(c)}));
                const tier1 = scored.filter(x => x.score >= 4);
                const tier2 = scored.filter(x => x.score >= 3);
                
                if(tier1.length) nextTarget = tier1[Math.floor(Math.random()*tier1.length)].cell;
                else if(tier2.length) nextTarget = tier2[Math.floor(Math.random()*tier2.length)].cell;
                else if(candidates.length) nextTarget = candidates[Math.floor(Math.random()*candidates.length)].cell;
                else nextTarget = state.grid.find(c => c.state === 'HIDDEN'); // Fallback

                setTimeout(() => {
                    state.questionsSolved++;
                    els.questionBar.classList.add('hidden');
                    updateGridToSuccessState(currentQ);
                    
                    // Unlock processing BEFORE calling next action
                    state.isProcessing = false; 

                    if(state.questionsSolved >= state.questions.length) {
                        endGame('VICTORY');
                    } else if(nextTarget) {
                        handleBlockClick(nextTarget);
                    } else {
                        endGame('VICTORY');
                    }
                }, 1000);

            } else {
                soundEngine.playExplode();
                // Visual explosion delay? No, immediate fail.
                setTimeout(() => {
                    endGame('GAME_OVER');
                    state.isProcessing = false;
                }, 500); 
            }
        }

        function updateGridToSuccessState(currentQ) {
            state.grid.forEach(c => {
                if (c.state === 'QUESTION') c.state = 'GOLD';
                else if (c.state === 'ANSWER') {
                    if (c.answerIndex === currentQ.correctIndex) c.state = 'DIAMOND';
                    else c.state = 'CLEARED';
                }
            });
            state.activeQuestion = null;
        }

        function endGame(result) {
            clearInterval(timerInterval);
            els.questionBar.classList.add('hidden');
            if(result === 'GAME_OVER') {
                // Clear any remaining Q/A blocks
                state.grid.forEach(c => {
                    if(c.state === 'QUESTION' || c.state === 'ANSWER') c.state = 'CLEARED';
                });
                renderGrid();
                if(state.questionsSolved / state.questions.length < 0.5) setTimeout(() => soundEngine.playDuckLaugh(), 500);
            } else {
                soundEngine.playFanfare();
            }
            switchState(result);
        }

        function renderResult() {
            const pct = state.questionsSolved / state.questions.length;
            let html = '';
            
            if (state.gameState === 'GAME_OVER') {
                if (pct < 0.5) {
                    // Angry Duck
                    html = `<div class="flex flex-col items-center">
                                <div class="transform scale-125 transition-transform duration-1000 slide-in-anim">${SVGs.angryDuck}</div>
                                <div class="mt-10 text-xl md:text-3xl text-[#ff5555] font-black tracking-widest uppercase text-center drop-shadow-md leading-tight w-full whitespace-nowrap">Better luck next time!!!</div>
                            </div>`;
                } else {
                    // Chocolate
                    html = `<div class="flex flex-col items-center"><div class="transform scale-125">${SVGs.chocolateDuck}</div><div class="mt-6 text-xl text-yellow-200 font-bold uppercase tracking-widest text-center">Great Effort! Have some chocolate!</div></div>`;
                }
            } else {
                // Victory
                html = `<div class="flex flex-col items-center z-10"><div class="transform scale-125">${SVGs.trophyDuck}</div><div class="mt-10 text-4xl md:text-6xl text-yellow-400 font-black tracking-widest animate-pulse drop-shadow-md">CHAMPION!</div></div>`;
            }
            els.resultContent.innerHTML = html;
        }

        // --- SETTINGS LOGIC ---
        function loadConfigToInputs() {
            els.inputs.rows.value = state.config.rows;
            els.inputs.cols.value = state.config.cols;
            els.inputs.timer.value = state.config.timerSeconds;
            els.inputs.count.value = state.config.questionCount;
        }

        function saveSettings() {
            state.config.rows = parseInt(els.inputs.rows.value) || 8;
            state.config.cols = parseInt(els.inputs.cols.value) || 12;
            state.config.timerSeconds = parseInt(els.inputs.timer.value) || 10;
            state.config.questionCount = parseInt(els.inputs.count.value) || 5;
            closeSettings();
        }

        function openSettings() { els.modals.settings.classList.remove('hidden'); }
        function closeSettings() { els.modals.settings.classList.add('hidden'); }

        function downloadTemplate(type) {
            let content = "", filename = "";
            if(type === 'questions') {
                content = "Question,Answer1,Answer2,Answer3,Answer4,CorrectAnswer\nCapital of India?,Mumbai,New Delhi,Kolkata,Chennai,1";
                filename = "questions_sample.csv";
            } else {
                content = "rows: 8\ncols: 12\ntimer: 10\nquestionCount: 5";
                filename = "config_sample.yaml";
            }
            const blob = new Blob([content], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            a.click();
        }

        // --- EVENT LISTENERS ---
        function setupEventListeners() {
            els.buttons.play.onclick = startGame;
            els.buttons.sfx.onclick = () => { 
                state.sfxEnabled = !state.sfxEnabled; 
                els.leds.sfx.className = `absolute top-1 right-1 w-2 h-2 rounded-full ${state.sfxEnabled ? 'bg-green-500 shadow-[0_0_4px_#00ff00]' : 'bg-red-900'}`;
            };
            els.buttons.bgm.onclick = () => { 
                state.bgmEnabled = !state.bgmEnabled; 
                els.leds.bgm.className = `absolute top-1 right-1 w-2 h-2 rounded-full ${state.bgmEnabled ? 'bg-green-500 shadow-[0_0_4px_#00ff00]' : 'bg-red-900'}`;
                soundEngine.startBGM(state.gameState === 'PLAYING' ? 'PLAYING' : 'MENU');
            };
            els.buttons.settings.onclick = openSettings;
            els.buttons.closeSettings.onclick = closeSettings;
            els.buttons.saveConfig.onclick = saveSettings;
            els.buttons.resetConfig.onclick = () => { 
                state.config = { rows: 8, cols: 12, timerSeconds: 10, questionCount: 5 }; 
                loadConfigToInputs(); 
            };
            els.buttons.mainMenu.onclick = () => { switchState('MENU'); };

            // File Uploads
            els.inputs.fileQ.onchange = (e) => handleFile(e.target.files[0], 'questions');
            els.inputs.fileC.onchange = (e) => handleFile(e.target.files[0], 'config');
        }

        function handleFile(file, type) {
            if(!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const txt = e.target.result;
                if(type === 'questions') {
                    // Simple CSV parser for demo
                    const lines = txt.split('\n');
                    const q = [];
                    for(let i=1; i<lines.length; i++) {
                        const cols = lines[i].split(',');
                        if(cols.length >= 6) {
                            q.push({ id: `q${i}`, text: cols[0], answers: [cols[1], cols[2], cols[3], cols[4]], correctIndex: parseInt(cols[5]) });
                        }
                    }
                    if(q.length > 0) { state.allQuestions = q; alert("Questions Loaded!"); }
                } else {
                    // Simple Config Parser
                    const lines = txt.split('\n');
                    lines.forEach(l => {
                        const [k, v] = l.split(':');
                        if(k && v) {
                            const key = k.trim(); const val = parseInt(v);
                            if(key === 'rows') state.config.rows = val;
                            if(key === 'cols') state.config.cols = val;
                            if(key === 'timer') state.config.timerSeconds = val;
                            if(key === 'questionCount') state.config.questionCount = val;
                        }
                    });
                    loadConfigToInputs();
                    alert("Config Loaded!");
                }
            };
            reader.readAsText(file);
        }

        // Start
        init();

    </script>
</body>
</html>