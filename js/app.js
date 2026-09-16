// Estado para salvar progresso na sessão atual
let sessionProgress = JSON.parse(sessionStorage.getItem('workoutProgress')) || {};

// Estado dos timers
let activeTimers = {};

// Função para extrair apenas os segundos do texto (ex: "90-120s" vira 90)
function parseRestTime(restStr) {
    const match = restStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 60; 
}

// Formata os segundos em MM:SS
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function renderWorkout(type) {
    const container = document.getElementById('workout-container');
    container.innerHTML = '';
    container.classList.remove('fade-in');
    
    // Força o reflow para reiniciar a animação
    void container.offsetWidth; 
    container.classList.add('fade-in');

    const exercises = workoutData[type];
    
    exercises.forEach((ex, index) => {
        // Criação dos botões de série (bolinhas)
        let setsHTML = '';
        for(let i = 1; i <= ex.sets; i++) {
            const setId = `${ex.id}-set-${i}`;
            const isActive = sessionProgress[setId] ? 'active' : '';
            setsHTML += `
                <button onclick="toggleSet('${setId}', '${ex.id}', '${ex.rest}')" id="${setId}" 
                        class="set-circle ${isActive} w-10 h-10 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center focus:outline-none touch-manipulation">
                    <span class="text-sm font-bold opacity-80">${i}</span>
                </button>
            `;
        }

        // Destaca técnicas especiais
        let noteClass = 'text-slate-400';
        if(ex.note.includes('Drop-set')) noteClass = 'text-emerald-400 font-medium';
        if(ex.note.includes('Rest-Pause')) noteClass = 'text-blue-400 font-medium';
        if(ex.note.includes('Falha')) noteClass = 'text-red-400 font-medium';

        const cardHTML = `
            <div class="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-[17px] font-bold text-slate-100 pr-2 leading-tight">${index + 1}. ${ex.name}</h3>
                </div>
                
                <div class="flex items-center space-x-3 mb-4 text-xs font-medium">
                    <span class="flex items-center text-slate-300 bg-slate-900/50 px-2 py-1 rounded-md">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        ${ex.reps}
                    </span>
                    <span class="flex items-center text-slate-300 bg-slate-900/50 px-2 py-1 rounded-md">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ${ex.rest}
                    </span>
                </div>
                
                <div class="mb-4 text-[13px] ${noteClass}">
                    <span class="opacity-70 mr-1">Técnica/Dica:</span> ${ex.note}
                </div>

                <div class="flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase hidden sm:inline-block">Séries</span>
                        <button id="timer-container-${ex.id}" onclick="toggleTimer('${ex.id}', ${parseRestTime(ex.rest)})" class="flex items-center space-x-1.5 bg-slate-800/80 text-slate-400 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95 touch-manipulation">
                            <svg id="timer-icon-${ex.id}" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span id="timer-display-${ex.id}" class="font-mono text-[13px]">${formatTime(parseRestTime(ex.rest))}</span>
                        </button>
                        <button onclick="resetTimer('${ex.id}', ${parseRestTime(ex.rest)})" title="Resetar Timer" class="p-1.5 bg-slate-800/80 text-slate-400 rounded-lg border border-slate-700 hover:text-slate-200 active:scale-95 transition-all focus:outline-none touch-manipulation">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="flex space-x-2">
                        ${setsHTML}
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Sincroniza estado visual dos timers ao renderizar a aba caso você troque de aba com ele rodando
    exercises.forEach(ex => {
        if (activeTimers[ex.id]) {
            const isRunning = activeTimers[ex.id].interval !== null;
            updateTimerUI(ex.id, activeTimers[ex.id].timeLeft, isRunning);
        }
    });
}

function switchTab(type) {
    // Atualiza UI das Tabs
    ['A', 'B', 'C'].forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        if (tab === type) {
            btn.classList.remove('text-slate-500');
            btn.classList.add('text-blue-400');
        } else {
            btn.classList.add('text-slate-500');
            btn.classList.remove('text-blue-400');
        }
    });
    // Renderiza conteúdo
    renderWorkout(type);
    // Scroll para o topo
    document.getElementById('workout-container').scrollTop = 0;
}

function toggleTimer(exId, restSeconds) {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
    
    if (activeTimers[exId] && activeTimers[exId].interval) {
        // Pausar
        clearInterval(activeTimers[exId].interval);
        activeTimers[exId].interval = null;
        updateTimerUI(exId, activeTimers[exId].timeLeft, false);
    } else {
        // Iniciar ou Retomar
        if (!activeTimers[exId] || activeTimers[exId].timeLeft <= 0) {
            activeTimers[exId] = { timeLeft: restSeconds, totalTime: restSeconds, interval: null };
        }
        
        updateTimerUI(exId, activeTimers[exId].timeLeft, true);
        
        activeTimers[exId].interval = setInterval(() => {
            activeTimers[exId].timeLeft--;
            updateTimerUI(exId, activeTimers[exId].timeLeft, true);
            
            if (activeTimers[exId].timeLeft <= 0) {
                clearInterval(activeTimers[exId].interval);
                activeTimers[exId].interval = null;
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate([200, 100, 200, 100, 400]); // Vibração de conclusão
                }
            }
        }, 1000);
    }
}

function resetTimer(exId, restSeconds) {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
    
    if (activeTimers[exId] && activeTimers[exId].interval) {
        clearInterval(activeTimers[exId].interval);
        activeTimers[exId].interval = null;
    }
    
    activeTimers[exId] = { timeLeft: restSeconds, totalTime: restSeconds, interval: null };
    updateTimerUI(exId, restSeconds, false);
}

function updateTimerUI(exId, timeLeft, isRunning) {
    const display = document.getElementById(`timer-display-${exId}`);
    const icon = document.getElementById(`timer-icon-${exId}`);
    const container = document.getElementById(`timer-container-${exId}`);
    
    if (!display || !icon || !container) return; // Proteção se a aba não estiver ativa na tela

    display.innerText = formatTime(timeLeft);
    
    if (timeLeft <= 0) {
        // Finalizado
        container.classList.remove('bg-emerald-900/30', 'text-emerald-400', 'border-emerald-700/50', 'bg-slate-800/80', 'text-slate-400');
        container.classList.add('bg-red-900/30', 'text-red-400', 'border-red-700/50');
        display.innerText = '00:00';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>`;
    } else if (isRunning) {
        // Rodando
        container.classList.add('bg-emerald-900/30', 'text-emerald-400', 'border-emerald-700/50');
        container.classList.remove('bg-slate-800/80', 'text-slate-400', 'bg-red-900/30', 'text-red-400', 'border-red-700/50', 'border-slate-700');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    } else {
        // Pausado / Inicial
        container.classList.remove('bg-emerald-900/30', 'text-emerald-400', 'border-emerald-700/50', 'bg-red-900/30', 'text-red-400', 'border-red-700/50');
        container.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
}

function toggleSet(setId, exId, restTimeStr) {
    const btn = document.getElementById(setId);
    
    // Fornece um feedback tátil (vibração)
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
    }

    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        sessionProgress[setId] = false;
    } else {
        btn.classList.add('active');
        sessionProgress[setId] = true;
        
        // Reinicia e inicia o timer automaticamente ao concluir a série
        const restSeconds = parseRestTime(restTimeStr);
        if (restSeconds > 0) {
            if (activeTimers[exId] && activeTimers[exId].interval) {
                clearInterval(activeTimers[exId].interval);
            }
            activeTimers[exId] = { timeLeft: restSeconds, totalTime: restSeconds, interval: null };
            toggleTimer(exId, restSeconds);
        }
    }
    
    // Salva na sessão
    sessionStorage.setItem('workoutProgress', JSON.stringify(sessionProgress));
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    const content = document.getElementById(modalId + 'Content');
    
    if (modal.classList.contains('hidden')) {
        // Abrir
        modal.classList.remove('hidden');
        // Pequeno delay para a transição de opacidade funcionar
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    } else {
        // Fechar
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // tempo bate com o duration-300 do tailwind
    }
}

// Inicia o App no Treino A
window.onload = () => {
    switchTab('A');
};
