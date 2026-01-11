const $ = id => document.getElementById(id);
const CONFIG = {
    apiKey: "AIzaSyC_50qtJ-bbH7vllDFqsxdFjjNGkQ3x8jc",
    authDomain: "fonoaudiologo-33594.firebaseapp.com",
    projectId: "fonoaudiologo-33594",
    storageBucket: "fonoaudiologo-33594.appspot.com",
    messagingSenderId: "33300460786",
    appId: "1:33300460786:web:6f3396e534e0b7fd6c4c6b"
};

let app, db, auth, localUsers = {}, activeU = null, isAdmin = false, currentChatId = 'global', chatUnsub;
let mediaRecorder, audioChunks = [], globalStream, refAudioUrl = null, userAudioUrl = null, refFeedbackAudioUrl = null, isRecording = false;

// URL base das APIs do Vercel (backend seguro)
const VERCEL_API_URL = 'https://articula-ia.vercel.app/api';

let isAppReady = false;

// --- SISTEMA DE ÁUDIO GLOBAL (MAIS ROBUSTO) ---
let currentAudio = null;
let currentAudioUrl = null;

function toggleAudio(url) {
    if (!url) {
        console.warn("URL de áudio não fornecida.");
        return;
    }

    // 1. Se algo está tocando
    if (currentAudio) {
        if (currentAudioUrl === url) {
            if (!currentAudio.paused) {
                currentAudio.pause();
                currentAudio = null;
                currentAudioUrl = null;
                return;
            } else {
                currentAudio.pause();
                currentAudio = null;
                currentAudioUrl = null;
            }
        } else {
            currentAudio.pause();
            currentAudio = null;
            currentAudioUrl = null;
        }
    }

    currentAudio = new Audio(url);
    currentAudioUrl = url;

    currentAudio.play().catch(e => {
        console.error("Erro ao tentar reproduzir áudio:", e);
        currentAudio = null;
        currentAudioUrl = null;
    });

    currentAudio.onended = () => {
        currentAudio = null;
        currentAudioUrl = null;
    };
}

const base64ToArrayBuffer = (base64) => { const binary_string = window.atob(base64); const len = binary_string.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i); return bytes.buffer; };
const pcmToWav = (pcm16Data, sampleRate) => { const numChannels = 1; const bytesPerSample = 2; const buffer = new ArrayBuffer(44 + pcm16Data.length * bytesPerSample); const view = new DataView(buffer); let offset = 0; const writeString = (s) => { for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i)); }; const write32 = (d) => { view.setUint32(offset, d, true); offset += 4; }; const write16 = (d) => { view.setUint16(offset, d, true); offset += 2; }; writeString('RIFF'); write32(36 + pcm16Data.length * bytesPerSample); writeString('WAVE'); writeString('fmt '); write32(16); write16(1); write16(numChannels); write32(sampleRate); write32(sampleRate * numChannels * bytesPerSample); write16(numChannels * bytesPerSample); write16(16); writeString('data'); write32(pcm16Data.length * bytesPerSample); for (let i = 0; i < pcm16Data.length; i++) { view.setInt16(offset, pcm16Data[i], true); offset += 2; } return new Blob([view], { type: 'audio/wav' }); };

// Helper para converter Base64 de volta para Blob
const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

// --- GERAR ÁUDIO VIA VERCEL API (Seguro) ---
async function generateAudio(text, voice) {
    if (!activeU?.email) throw new Error("Usuário não autenticado");

    try {
        const response = await fetch(`${VERCEL_API_URL}/generate-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: activeU.email,
                text: text,
                voice: voice || 'Kore'
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Falha no TTS');

        // Converter Base64 de volta para Blob URL
        const audioBlob = base64ToBlob(data.audio, 'audio/wav');
        return URL.createObjectURL(audioBlob);
    } catch (e) {
        console.error("Erro na geração de áudio (TTS):", e);
        throw new Error("Falha na API TTS: " + (e.message || "Erro desconhecido."));
    }
}

// --- BOTÃO MIC (Blindagem Total e Início da Gravação) ---
$('micButton').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!activeU) return alert("Selecione um aluno.");

    if (!$('targetDisplay')?.innerText.trim() || $('targetDisplay').innerText.includes('Toque no botão') || $('targetDisplay').innerText.includes('Erro')) {
        return alert("Gere um desafio antes de gravar.");
    }

    if (isRecording) {
        if (mediaRecorder) mediaRecorder.stop();
        return false;
    }

    try {
        if (!globalStream) globalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(globalStream, { mimeType: 'audio/webm; codecs=opus' });
        audioChunks = [];
        mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
        mediaRecorder.onstop = processUserAudio;
        mediaRecorder.start();
        isRecording = true;
        $('micButton').classList.add('recording');
        $('micStatus').innerText = "Ouvindo... (Clique para parar)";
        $('resultArea').classList.add('hidden');
    } catch (err) {
        alert("Erro ao acessar microfone. Verifique as permissões.");
        isRecording = false;
        $('micButton').classList.remove('recording');
        $('micStatus').innerText = "Erro no Microfone";
    }

    return false;
});

async function processUserAudio() {
    isRecording = false;
    $('micButton').classList.remove('recording');
    $('micStatus').innerText = "Analisando...";
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    userAudioUrl = URL.createObjectURL(blob);

    let k = activeU?.apiKey?.trim();
    if (!k) { $('micStatus').innerText = "Erro: Chave API."; return alert("Chave API não encontrada."); }

    const reader = new FileReader(); reader.readAsDataURL(blob);
    reader.onloadend = async () => {
        const b64 = reader.result.split(',')[1];
        const targetText = $('targetDisplay')?.innerText || "";
        const prompt = `Aja como fonoaudiólogo. Paciente ${$('tAge').value} anos. Alvo: "${targetText}". Analise áudio. JSON: {"score": 0-100, "feedback": "texto curto"}`;

        try {
            // Chamar API do Vercel para análise de fala
            const response = await fetch(`${VERCEL_API_URL}/analyze-speech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: activeU.email,
                    audioBase64: b64,
                    targetText: targetText,
                    age: $('tAge').value
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Análise falhou');

            const res = { score: data.score, feedback: data.feedback };

            $('resultArea').classList.remove('hidden');
            $('scoreText').innerText = res.score || '--';
            let c = 'text-red-500'; if (res.score >= 80) c = 'text-emerald-500'; else if (res.score >= 50) c = 'text-yellow-500';
            $('scoreText').className = `text-5xl font-display font-black ${c}`;
            $('resultFeedback').innerText = res.feedback || "Tente novamente";

            $('micStatus').innerText = "Criando dica...";
            refFeedbackAudioUrl = await generateAudio(res.feedback, $('tVoice').value).catch(e => {
                console.error("Falha ao gerar áudio da dica:", e);
                return null;
            });

            if (refFeedbackAudioUrl) $('btnTipPlay').disabled = false; else $('btnTipPlay').disabled = true;
            $('micStatus').innerText = "Toque para gravar";

            // Atualizar XP
            if (activeU) {
                db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc(activeU.email).update({ xp: (activeU.xp || 0) + 10 });

                // NOVO: Salvar histórico do exercício
                await db.collection(`artifacts/${CONFIG.projectId}/public/data/exercises_history`).add({
                    userId: activeU.email,
                    userName: activeU.name,
                    targetText: targetText,
                    score: res.score || 0,
                    feedback: res.feedback || '',
                    mode: $('tMode')?.value || 'sentence',
                    age: $('tAge')?.value || 5,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    date: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error(e);
            $('micStatus').innerText = "Erro na análise: " + (e.message || "Verifique a chave API.");
            $('resultArea').classList.add('hidden');
        }
    };
}

function toggleTheme() { document.body.classList.toggle('dark-theme'); lucide.createIcons(); }
function toggleSidebar() { $('sidebar').classList.toggle('open'); }

function finalizeAppLoad() {
    if (isAppReady) return;
    isAppReady = true;
    $('loadingScreen').style.opacity = 0;
    setTimeout(() => { $('loadingScreen').style.display = 'none'; }, 500);
    if (activeU) {
        route('dashboard');
    } else {
        route('progress');
    }
    lucide.createIcons();
}

async function startApp() {
    // FIX V110: Timeout de carregamento
    const loadTimeout = setTimeout(() => {
        if (!isAppReady) {
            console.warn("Timeout de carregamento atingido. Forçando inicialização.");
            finalizeAppLoad();
        }
    }, 5000);

    try {
        // Inicialização do Firebase
        app = firebase.initializeApp(CONFIG); db = firebase.firestore(); auth = firebase.auth();
        await auth.signInAnonymously();

        // Listener de perfis
        db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).orderBy('xp', 'desc').onSnapshot(snap => {
            localUsers = {}; snap.forEach(doc => localUsers[doc.data().email] = doc.data()); renderList();

            clearTimeout(loadTimeout);
            finalizeAppLoad();
        }, error => {
            console.error("Erro no Listener do Firebase:", error);
            clearTimeout(loadTimeout);
            finalizeAppLoad();
        });

        setupChatWidget();
    } catch (e) {
        alert("Erro Crítico de Inicialização: " + e.message);
        console.error("Erro Crítico:", e);
        clearTimeout(loadTimeout);
        finalizeAppLoad();
    }
}

function renderList() {
    const l = $('usersList'); l.innerHTML = '';
    const r = $('rankingList'); r.innerHTML = '';

    let rank = 1;
    const userArray = Object.values(localUsers).sort((a, b) => (b.xp || 0) - (a.xp || 0));

    userArray.forEach(u => {
        // Renderizar Sidebar
        const d = document.createElement('div'); d.className = 'p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-xl mb-1 transition-all';
        d.innerHTML = `<div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm">${u.name[0]}</div><div class="flex-1"><div class="font-bold text-sm text-slate-900 dark:text-slate-200">${u.name}</div><div class="text-xs opacity-60 flex items-center gap-1"><i data-lucide="star" class="w-3 h-3 text-yellow-500 fill-current"></i> ${u.xp || 0} XP</div></div>`;
        d.onclick = () => activate(u); l.appendChild(d);

        // Renderizar Ranking Simplificado
        let rankColor = 'text-slate-500';
        if (rank === 1) rankColor = 'text-yellow-500';
        else if (rank === 2) rankColor = 'text-slate-400';
        else if (rank === 3) rankColor = 'text-amber-600';

        const rItem = document.createElement('div');
        rItem.className = 'p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-700 shadow-lg cursor-pointer hover:shadow-xl transition-shadow';
        rItem.onclick = () => activate(u);

        rItem.innerHTML = `<span class="font-bold text-lg w-8 ${rankColor}">#${rank++}</span>
                           <div class="flex-1 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">${u.name[0]}</div>
                                <span class="font-semibold text-slate-900 dark:text-slate-200">${u.name}</span>
                           </div>
                           <span class="font-bold text-emerald-500 shrink-0">${u.xp || 0} XP</span>`;
        r.appendChild(rItem);
    });
    lucide.createIcons();
}

function activate(user) {
    if (!user) return;
    if (activeU && activeU.email === user.email) {
        route('dashboard');
        $('sidebar').classList.remove('open');
        return;
    }
    activeU = user;
    if ($('dashName')) $('dashName').innerText = user.name;
    if ($('dashAvatar')) $('dashAvatar').innerText = user.name[0];
    if ($('dashXP')) $('dashXP').innerText = user.xp || 0;

    // --- PREENCHIMENTO DO MODAL DE EDIÇÃO ---
    if ($('tAge')) $('tAge').value = user.age || 5;
    const fillModal = (prefix) => {
        if ($(prefix + 'Name')) $(prefix + 'Name').value = user.name || '';
        if ($(prefix + 'Age')) $(prefix + 'Age').value = user.age || 5;
        if ($(prefix + 'Pin')) $(prefix + 'Pin').value = user.pin || '';
        if ($(prefix + 'Key')) $(prefix + 'Key').value = user.apiKey || '';
    };
    fillModal('uE');
    fillModal('admE');
    // --- FIM PREENCHIMENTO ---

    route('dashboard'); $('sidebar').classList.remove('open'); if ($('chatWidget').classList.contains('open')) { backToContacts(); loadContacts(); }
}

window.route = (v) => {
    ['viewEmpty', 'viewDashboard', 'viewTutor', 'viewProgress'].forEach(id => {
        if ($(id)) {
            $(id).classList.add('hidden');
            $(id).classList.remove('active');
        }
    });

    const targetView = $(`view${v.charAt(0).toUpperCase() + v.slice(1)}`);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');

        if (v === 'progress') {
            renderList();
        } else if (v === 'dashboard' && activeU) {
            // NOVO: Carregar histórico e renderizar gráfico
            loadUserHistory();
        }
    } else {
        $('viewEmpty').classList.remove('hidden');
    }
    lucide.createIcons();
}

// NOVO: Função para carregar histórico do usuário
async function loadUserHistory() {
    if (!activeU) return;

    try {
        const snapshot = await db.collection(`artifacts/${CONFIG.projectId}/public/data/exercises_history`)
            .where('userId', '==', activeU.email)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        const history = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            history.push(data);
        });

        renderHistoryChart(history.reverse()); // Reverse para mostrar do mais antigo pro mais recente
    } catch (e) {
        console.error('Erro ao carregar histórico:', e);
    }
}

// NOVO: Renderizar gráfico de evolução
function renderHistoryChart(history) {
    const container = $('historyChartContainer');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-400 py-8">Nenhum exercício realizado ainda</p>';
        return;
    }

    // Preparar dados
    const labels = history.map((ex, i) => `#${i + 1}`);
    const scores = history.map(ex => ex.score || 0);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

    // Estatísticas
    const stats = {
        total: history.length,
        avg: avgScore,
        best: Math.max(...scores),
        worst: Math.min(...scores)
    };

    // Atualizar estatísticas no DOM
    if ($('statTotal')) $('statTotal').innerText = stats.total;
    if ($('statAvg')) $('statAvg').innerText = stats.avg;
    if ($('statBest')) $('statBest').innerText = stats.best;
    if ($('statWorst')) $('statWorst').innerText = stats.worst;

    // Criar gráfico ASCII simples (sem libs externas)
    let chartHTML = '<div class="space-y-2">';

    history.forEach((ex, i) => {
        const percent = ex.score || 0;
        let color = 'bg-red-500';
        if (percent >= 80) color = 'bg-emerald-500';
        else if (percent >= 50) color = 'bg-yellow-500';

        chartHTML += `
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-500 w-8">#${i + 1}</span>
                <div class="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                    <div class="${color} h-full transition-all duration-500" style="width: ${percent}%"></div>
                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">${percent}</span>
                </div>
                <span class="text-xs text-slate-400 w-24 truncate">${ex.targetText || ''}</span>
            </div>
        `;
    });

    chartHTML += '</div>';
    container.innerHTML = chartHTML;
}

// --- BOTÃO GERAR (Com blindagem e salvamento correto) ---
$('btnGen').addEventListener('click', async (e) => {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();

    let k = (activeU && activeU.apiKey) ? activeU.apiKey.trim() : '';
    if (!k || k.length < 20) {
        try {
            if (activeU?.email) {
                const doc = await db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc(activeU.email).get();
                if (doc.exists) k = doc.data().apiKey?.trim() || '';
            }
        } catch (e) { }
    }
    if (!k || k.length < 20) return alert("Chave API inválida. Verifique as configurações do aluno.");

    const btn = $('btnGen');
    const org = btn.innerHTML;
    btn.innerHTML = `<div class="spinner"></div> Criando...`;
    btn.disabled = true;
    $('btnTargetPlay').disabled = true;
    $('btnTipPlay').disabled = true;
    refAudioUrl = null;
    refFeedbackAudioUrl = null;
    $('targetDisplay').innerText = "Gerando texto...";

    try {
        const mode = $('tMode')?.value;
        let currentText = "";

        if (mode === 'free_text') {
            if (!$('tFree')?.value.trim()) throw new Error("Digite o texto no campo 'Seu Texto'.");
            currentText = $('tFree').value.trim();
        }
        else {
            // Chamar API do Vercel para gerar texto
            const response = await fetch(`${VERCEL_API_URL}/generate-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: activeU.email,
                    mode: mode,
                    quantity: $('tQty').value,
                    age: $('tAge').value,
                    phoneme: $('tPho')?.value || ''
                })
            });

            const data = await response.json();
            if (!data.success || !data.texts || data.texts.length === 0) {
                throw new Error(data.error || 'Nenhum texto gerado');
            }
            currentText = data.texts[Math.floor(Math.random() * data.texts.length)];
        }

        if (!currentText) throw new Error("Falha ao obter texto da IA.");

        $('targetDisplay').innerText = currentText;
        btn.innerHTML = `<div class="spinner"></div> Voz IA...`;

        refAudioUrl = await generateAudio(currentText, $('tVoice').value);

        if (refAudioUrl) {
            $('btnTargetPlay').disabled = false;
        } else {
            $('targetDisplay').innerText = currentText + " (Falha no Áudio)";
            alert("Falha ao gerar o áudio da IA. Verifique sua chave ou tente outro texto.");
        }

    } catch (e) {
        alert("Erro ao gerar desafio: " + e.message);
        $('targetDisplay').innerText = "Erro ao gerar. Verifique o console.";
    }

    btn.innerHTML = org;
    btn.disabled = false;
    return false;
});

$('tMode').onchange = () => { const v = $('tMode').value; $('divFreeText').style.display = v === 'free_text' ? 'block' : 'none'; $('divPho').style.display = v === 'phoneme' ? 'block' : 'none'; $('btnGen').innerHTML = v === 'free_text' ? '<i data-lucide="volume-2" class="w-5 h-5"></i> Preparar Áudio' : '<i data-lucide="sparkles" class="w-5 h-5"></i> Gerar Novo Desafio'; lucide.createIcons(); }

// --- CHAT LOGIC (Split View) ---
function setupChatWidget() {
    const w = $('chatWidget'), h = $('chatHeader'); let isD = false, off = { x: 0, y: 0 }; h.addEventListener('mousedown', s); h.addEventListener('touchstart', e => s(e.touches[0]), { passive: false }); function s(e) { if (!w.classList.contains('open')) return; isD = true; h.style.cursor = 'grabbing'; const r = w.getBoundingClientRect(); off.x = e.clientX - r.left; off.y = e.clientY - r.top; if (e.preventDefault) e.preventDefault(); } document.addEventListener('mousemove', d); document.addEventListener('touchmove', e => d(e.touches[0]), { passive: false }); function d(e) { if (!isD) return; if (e.preventDefault) e.preventDefault(); w.style.left = (e.clientX - off.x) + 'px'; w.style.top = (e.clientY - off.y) + 'px'; w.style.bottom = 'auto'; w.style.right = 'auto'; } document.addEventListener('mouseup', () => isD = false); document.addEventListener('touchend', () => isD = false);
    document.querySelectorAll('.resizer').forEach(r => { r.addEventListener('mousedown', i); r.addEventListener('touchstart', e => i(e.touches[0], e), { passive: false }); });
    function i(e, o) { if (o && o.preventDefault) o.preventDefault(); const cls = e.target.className, r = w.getBoundingClientRect(), sX = e.clientX, sY = e.clientY, sW = r.width, sH = r.height, sL = r.left, sT = r.top; const dr = (m) => { if (m.preventDefault) m.preventDefault(); const cX = m.clientX || m.touches?.[0].clientX, cY = m.clientY || m.touches?.[0].clientY; let nW = sW, nH = sH, nL = sL, nT = sT; if (cls.includes('se')) { nW = sW + (cX - sX); nH = sH + (cY - sY); } else if (cls.includes('sw')) { nW = sW - (cX - sX); nH = sH + (cY - sY); nL = sL + (cX - sX); } else if (cls.includes('ne')) { nW = sW + (cX - sX); nH = sH - (cY - sY); nT = sT + (cY - sY); } else if (cls.includes('nw')) { nW = sW - (cX - sX); nH = sH - (cY - sY); nL = sL + (cX - sX); nT = sT + (cY - sY); } if (nW > 300) { w.style.width = nW + 'px'; w.style.left = nL + 'px'; } if (nH > 400) { w.style.height = nH + 'px'; w.style.top = nT + 'px'; } w.style.bottom = 'auto'; w.style.right = 'auto'; }; const st = () => { window.removeEventListener('mousemove', dr); window.removeEventListener('touchmove', dr); window.removeEventListener('mouseup', st); window.removeEventListener('touchend', st); }; window.addEventListener('mousemove', dr); window.addEventListener('touchmove', e => dr(e.touches[0]), { passive: false }); window.removeEventListener('mouseup', st); window.removeEventListener('touchend', st); }
}
window.toggleChat = (e) => { if (e) e.stopPropagation(); const w = $('chatWidget'); if (w.classList.contains('open')) w.classList.remove('open'); else { w.classList.add('open'); $('chatBadge').classList.add('hidden'); loadContacts(); } }
function loadContacts() {
    const c = $('contactsContainer'); c.innerHTML = ''; const a = (n, id, ico) => {
        const d = document.createElement('div'); d.className = `contact-item ${currentChatId.includes(id) ? 'active' : ''}`;
        d.innerHTML = ico ? `<div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><i data-lucide="users" class="w-4 h-4"></i></div><span class="font-bold text-sm text-slate-900 dark:text-slate-200">${n}</span>` : `<div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-900 dark:text-slate-500">${n[0]}</div><span class="font-bold text-sm text-slate-900 dark:text-slate-200">${n}</span>`; d.onclick = () => openChat(id, n); c.appendChild(d);
    }; a('Turma', 'global', true); Object.values(localUsers).forEach(u => { if (u.email !== activeU?.email) a(u.name, u.email); }); lucide.createIcons();
}
function openChat(id, n) {
    if (!activeU) return alert("Selecione um aluno!");
    $('roomName').innerText = n; $('roomAvatar').innerText = n[0];
    $('chatWidget').classList.add('mobile-view-room');
    $('roomEmpty').classList.add('hidden');
    $('roomHeader').classList.remove('hidden');
    $('msgList').classList.remove('hidden');
    $('roomInput').classList.remove('hidden');
    currentChatId = id === 'global' ? 'global' : [activeU.email, id].sort().join('_');
    loadContacts();
    if (chatUnsub) chatUnsub();
    chatUnsub = db.collection(`artifacts/${CONFIG.projectId}/public/data/messages_v3`).where('chatId', '==', currentChatId).orderBy('timestamp', 'asc').limit(50).onSnapshot(s => {
        if (!$('chatWidget').classList.contains('open') && !s.metadata.hasPendingWrites && s.docChanges().some(c => c.type === 'added')) $('chatBadge').classList.remove('hidden'); const l = $('msgList'); l.innerHTML = ''; s.forEach(d => {
            const m = d.data(); const me = m.senderId === activeU.email; const div = document.createElement('div'); div.className = `msg-bubble ${me ? 'msg-mine' : 'msg-other'}`;
            if (!me && currentChatId === 'global') div.innerHTML = `<span class="text-[10px] font-bold text-slate-900 opacity-80 block mb-1">${m.senderName}</span>${m.text}`; else div.innerText = m.text; l.appendChild(div);
        }); l.scrollTop = l.scrollHeight;
    });
}
window.backToContacts = () => {
    $('chatWidget').classList.remove('mobile-view-room');
    if (window.innerWidth < 768) { currentChatId = ''; }
}
window.closeRoom = () => { $('chatWidget').classList.remove('in-room'); }
const sendMsg = async () => { const t = $('msgIn').value; if (!t || !activeU) return; $('msgIn').value = ''; await db.collection(`artifacts/${CONFIG.projectId}/public/data/messages_v3`).add({ text: t, senderId: activeU.email, senderName: activeU.name, chatId: currentChatId, timestamp: firebase.firestore.FieldValue.serverTimestamp() }); }; $('msgSend').onclick = sendMsg; $('msgIn').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg() });

// --- FUNÇÕES DOS MODAIS ---
$('btnSaveReg').onclick = async () => { let k = $('rKey').value.trim(); await db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc($('rEmail').value).set({ name: $('rName').value, email: $('rEmail').value, age: $('rAge').value, pin: $('rPin').value, apiKey: k, xp: 0 }); $('modalReg').style.display = 'none'; }
$('btnSaveSelf').onclick = async () => { let k = $('uEKey').value.trim(); await db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc(activeU.email).update({ name: $('uEName').value, age: $('uEAge').value, pin: $('uEPin').value, apiKey: k }); $('modalEdit').style.display = 'none'; }
$('btnSaveAdm').onclick = async () => { let k = $('admEKey').value.trim(); await db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc(activeU.email).update({ name: $('admEName').value, age: $('admEAge').value, pin: $('admEPin').value, apiKey: k }); $('modalEditAdm').style.display = 'none'; }
window.deleteUser = async (e) => { if (confirm("Tem certeza que deseja excluir esta conta?")) await db.collection(`artifacts/${CONFIG.projectId}/public/data/profiles_v2`).doc(e).delete(); }
$('adOk').onclick = async () => { try { await auth.signInWithEmailAndPassword($('adE').value, $('adP').value); isAdmin = true; $('modalAdm').style.display = 'none'; activate(activeU); } catch (e) { alert("Erro de autenticação."); } }

// --- GRÁFICO / RANKING (Simplificado) ---
function loadChart() {
    renderList();
}

startApp();
