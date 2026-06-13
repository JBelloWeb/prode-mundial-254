import { showToast } from './utils.js';

const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

if (!supaClient) {
    showToast('Error de conexión. Recargá la página.', 'error');
    setTimeout(() => { window.location.href = '../index.html'; }, 2000);
}

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    showToast('Debes iniciar sesión', 'error');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
}

async function verificarAccesoMataMata() {
    const CORTE_MATA_MATA = new Date('2026-06-24T00:00:00Z');

    // Antes del corte: acceso libre siempre
    if (new Date() <= CORTE_MATA_MATA) return;

    // Después del corte: solo bloqueamos si ya había enviado
    const { data, error } = await supaClient
        .from('usuarios')
        .select('fecha_envio_mata_mata')
        .eq('id', usuarioActivo.id)
        .single();

    if (data && data.fecha_envio_mata_mata) {
        showToast('Pasó la fecha límite para pronosticar el Mata-Mata.', 'warning');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    }
}
verificarAccesoMataMata();

const d = document;

// 1. DICCIONARIOS Y CONFIGURACIONES (Con Bosnia corregido para las banderas)
const gruposMundial = {
    "A": ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
    "B": ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
    "C": ["Brasil", "Marruecos", "Haití" ,"Escocia"],
    "D": ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
    "E": ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
    "F": ["Países Bajos", "Japón", "Suecia", "Túnez"],
    "G": ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
    "H": ["España","Cabo Verde", "Arabia Saudita", "Uruguay"],
    "I": ["Francia", "Senegal", "Irak", "Noruega"],
    "J": ["Argentina", "Argelia", "Austria", "Jordania"],
    "K": ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
    "L": ["Inglaterra", "Croacia", "Ghana", "Panamá"]
};

const dieciseisavos = [
    { id: 'P74', label: '1E vs 3A/B/C/D/F', a_groups: ['E'], b_groups: ['A','B','C','D','F'] },
    { id: 'P77', label: '1I vs 3C/D/F/G/H', a_groups: ['I'], b_groups: ['C','D','F','G','H'] },
    { id: 'P73', label: '2A vs 2B', a_groups: ['A'], b_groups: ['B'] },
    { id: 'P75', label: '1F vs 2C', a_groups: ['F'], b_groups: ['C'] },
    { id: 'P83', label: '2K vs 2L', a_groups: ['K'], b_groups: ['L'] },
    { id: 'P84', label: '1H vs 2J', a_groups: ['H'], b_groups: ['J'] },
    { id: 'P81', label: '1D vs 3B/E/F/I/J', a_groups: ['D'], b_groups: ['B','E','F','I','J'] },
    { id: 'P82', label: '1G vs 3A/E/H/I/J', a_groups: ['G'], b_groups: ['A','E','H','I','J'] },
    { id: 'P76', label: '1C vs 2F', a_groups: ['C'], b_groups: ['F'] },
    { id: 'P78', label: '2E vs 2I', a_groups: ['E'], b_groups: ['I'] },
    { id: 'P79', label: '1A vs 3C/E/F/H/I', a_groups: ['A'], b_groups: ['C','E','F','H','I'] },
    { id: 'P80', label: '1L vs 3E/H/I/J/K', a_groups: ['L'], b_groups: ['E','H','I','J','K'] },
    { id: 'P86', label: '1J vs 2H', a_groups: ['J'], b_groups: ['H'] },
    { id: 'P88', label: '2D vs 2G', a_groups: ['D'], b_groups: ['G'] },
    { id: 'P85', label: '1B vs 3E/F/G/I/J', a_groups: ['B'], b_groups: ['E','F','G','I','J'] },
    { id: 'P87', label: '1K vs 3D/E/I/J/L', a_groups: ['K'], b_groups: ['D','E','I','J','L'] }
];

const progresion = {
    'P74': { next: 'P89', slot: 'A' }, 'P77': { next: 'P89', slot: 'B' },
    'P73': { next: 'P90', slot: 'A' }, 'P75': { next: 'P90', slot: 'B' },
    'P83': { next: 'P93', slot: 'A' }, 'P84': { next: 'P93', slot: 'B' },
    'P81': { next: 'P94', slot: 'A' }, 'P82': { next: 'P94', slot: 'B' },
    'P76': { next: 'P91', slot: 'A' }, 'P78': { next: 'P91', slot: 'B' },
    'P79': { next: 'P92', slot: 'A' }, 'P80': { next: 'P92', slot: 'B' },
    'P86': { next: 'P95', slot: 'A' }, 'P88': { next: 'P95', slot: 'B' },
    'P85': { next: 'P96', slot: 'A' }, 'P87': { next: 'P96', slot: 'B' },
    'P89': { next: 'P97', slot: 'A' }, 'P90': { next: 'P97', slot: 'B' },
    'P93': { next: 'P98', slot: 'A' }, 'P94': { next: 'P98', slot: 'B' },
    'P91': { next: 'P99', slot: 'A' }, 'P92': { next: 'P99', slot: 'B' },
    'P95': { next: 'P100', slot: 'A' }, 'P96': { next: 'P100', slot: 'B' },
    'P97': { next: 'P101', slot: 'A' }, 'P98': { next: 'P101', slot: 'B' },
    'P99': { next: 'P102', slot: 'A' }, 'P100': { next: 'P102', slot: 'B' },
    'P101': { next: 'P104', slot: 'A', loserNext: 'P103', loserSlot: 'A' },
    'P102': { next: 'P104', slot: 'B', loserNext: 'P103', loserSlot: 'B' }
};

const fases = [
    { id: 'octavos', titulo: 'Octavos de Final', partidos: ['P89','P90','P91','P92','P93','P94','P95','P96'] },
    { id: 'cuartos', titulo: 'Cuartos de Final', partidos: ['P97','P98','P99','P100'] },
    { id: 'semis', titulo: 'Semifinales', partidos: ['P101','P102'] },
    { id: 'tercer', titulo: 'Tercer Puesto', partidos: ['P103'] },
    { id: 'final', titulo: 'Gran Final', partidos: ['P104'] }
];

const nav = d.getElementById('faseNav');
const bracketContainer = d.getElementById('bracketContainer');

// ==========================================
// API DE BANDERAS (Misma lógica de groups.js)
// ==========================================
const flagCodesApi = "https://flagcdn.com/es/codes.json";
const codigosBanderas = {};

const minBosnia = (p) =>{
    return p === "Bosnia y Herzegovina" ? "Bosnia" : p;
}

const getCodes = async () => {
    try {
        const response = await fetch(flagCodesApi);
        const data = await response.json();

        const excepciones = {
            "Chequia": "cz", "Arabia Saudita": "sa", "Corea del Sur": "kr",
            "RD Congo": "cd", "Países Bajos": "nl", "Estados Unidos": "us"
        };

        Object.keys(gruposMundial).forEach(letra => {
            gruposMundial[letra].forEach(pais => {
                let match = Object.entries(data).find(([key, value]) => value.toLowerCase() === pais.toLowerCase());

                if (match) {
                    codigosBanderas[pais] = match[0];
                } else if (excepciones[pais]) {
                    codigosBanderas[pais] = excepciones[pais];
                } else {
                    codigosBanderas[pais] = "un";
                }
            });
        });
    } catch (error) {
        console.error("Error al obtener banderas:", error);
    }
    
    // Una vez que tenemos las banderas, dibujamos los grupos
    dibujarClasificacionGrupos();
    restaurarClasificadosGuardados();
}


// ==========================================
// LÓGICA DE CLASIFICACIONES
// ==========================================
let clasificados = {};
Object.keys(gruposMundial).forEach(g => clasificados[g] = {1: null, 2: null, 3: null});

function contarTerceros() {
    let total = 0;
    Object.values(clasificados).forEach(grupo => {
        if (grupo[3]) total++;
    });
    return total;
}

function dibujarClasificacionGrupos() {
    const container = d.getElementById('gridGruposClasificacion');
    container.innerHTML = '';

    let ol = d.createElement('ol');
    ol.className = 'clasificacion-grid';

    Object.keys(gruposMundial).forEach(letra => {
        let gr = d.createElement('li');
        gr.className = 'group';
        
        let name = d.createElement('h3');
        name.textContent = `GRUPO ${letra}`;
        name.className = 'clasificacion-group-title';
        
        let integrantes = d.createElement('ul');
        integrantes.className = "countries-container";

        gruposMundial[letra].forEach(pais => {
            let li = d.createElement('li');
            li.className = 'group-participant clasificacion-item';
            
            let codigo = codigosBanderas[pais];
            let n = minBosnia(pais);
            
            li.innerHTML = `<img src="https://flagcdn.com/16x12/${codigo}.png" alt="${pais}">${n}`;
            
            li.onclick = () => seleccionarClasificado(letra, pais, li);
            integrantes.appendChild(li);
        });

        gr.appendChild(name);
        gr.appendChild(integrantes);
        ol.appendChild(gr);
    });
    
    container.appendChild(ol);
}

function seleccionarClasificado(grupo, pais, elementoHtml) {
    const grupoObj = clasificados[grupo];
    
    let posActual = Object.keys(grupoObj).find(key => grupoObj[key] === pais);
    if (posActual) {
        grupoObj[posActual] = null;
        let badge = elementoHtml.querySelector('.badge-posicion');
        if (badge) badge.remove();
        elementoHtml.classList.remove('selected');
    } else {
        if (!grupoObj[1]) {
            grupoObj[1] = pais;
            agregarBadge(elementoHtml, 1);
        } else if (!grupoObj[2]) {
            grupoObj[2] = pais;
            agregarBadge(elementoHtml, 2);
        } else if (!grupoObj[3]) {
            if (contarTerceros() >= 8) {
                showToast('⚠️ Ya seleccionaste a los 8 mejores terceros. Si querés elegir otro, primero deseleccioná a uno de los actuales.', 'warning');
                return;
            }
            grupoObj[3] = pais;
            agregarBadge(elementoHtml, 3);
        } else {
            showToast('Ya elegiste 1°, 2° y 3° para este grupo. Tocá uno para deseleccionarlo.', 'warning');
            return;
        }
    }
    
    localStorage.setItem('clasificados_mata_mata', JSON.stringify(clasificados));
    armarBracketAutomatico();
}

function agregarBadge(elementoHtml, pos) {
    elementoHtml.classList.add('selected');
    let badge = d.createElement('div');
    badge.className = `badge-posicion pos-${pos}`;
    badge.textContent = `${pos}°`;
    elementoHtml.appendChild(badge);
}

function restaurarClasificadosGuardados() {
    const guardado = localStorage.getItem('clasificados_mata_mata');
    if (!guardado) return;
    try {
        const datos = JSON.parse(guardado);
        Object.keys(datos).forEach(g => {
            Object.keys(datos[g]).forEach(pos => {
                const pais = datos[g][pos];
                if (pais) {
                    clasificados[g][pos] = pais;
                    const items = d.querySelectorAll('#gridGruposClasificacion .group-participant');
                    items.forEach(li => {
                        const nombreLi = li.lastChild.textContent.trim();
                        if (nombreLi === pais) {
                            li.classList.add('selected');
                            let badge = d.createElement('div');
                            badge.className = `badge-posicion pos-${pos}`;
                            badge.textContent = `${pos}°`;
                            li.appendChild(badge);
                        }
                    });
                }
            });
        });
        armarBracketAutomatico();
    } catch(e) {
        console.error("Error al restaurar clasificados:", e);
    }
}

// ==========================================
// EL MOTOR QUE ARMA EL FIXTURE SOLO
// ==========================================
function armarBracketAutomatico() {
    let tercerosUsados = []; 

    dieciseisavos.forEach(p => {
        let reqs = p.label.split(' vs '); 
        
        let teamA = obtenerEquipoParaReq(reqs[0], p.a_groups, tercerosUsados);
        let teamB = obtenerEquipoParaReq(reqs[1], p.b_groups, tercerosUsados);

        actualizarSlotEnBracket(p.id, 'A', teamA, reqs[0]);
        actualizarSlotEnBracket(p.id, 'B', teamB, reqs[1]);
        
        actualizarDropdownPenales(p.id);
        evaluarGanador(p.id);
    });
}

function obtenerEquipoParaReq(req, gruposPermitidos, tercerosUsados) {
    let posRequerida = parseInt(req.charAt(0)); 

    if (posRequerida === 1 || posRequerida === 2) {
        return clasificados[gruposPermitidos[0]][posRequerida];
    } else if (posRequerida === 3) {
        // Plan A: Intento oficial (busca en los grupos que dice la regla)
        for (let g of gruposPermitidos) {
            let equipoTercero = clasificados[g][3];
            if (equipoTercero && !tercerosUsados.includes(equipoTercero)) {
                tercerosUsados.push(equipoTercero);
                return equipoTercero;
            }
        }
        
        // Plan B: Fallback de rescate. Si por orden de asignación se quedó sin opciones, 
        // agarra cualquier 3ro que el usuario haya seleccionado y esté libre.
        for (let g in clasificados) {
            let equipoTercero = clasificados[g][3];
            if (equipoTercero && !tercerosUsados.includes(equipoTercero)) {
                tercerosUsados.push(equipoTercero);
                return equipoTercero;
            }
        }
    }
    return null;
}

function actualizarSlotEnBracket(matchId, slot, teamName, labelOriginal) {
    let span = d.getElementById(`team${slot}-${matchId}`);
    if (teamName) {
        span.textContent = minBosnia(teamName);
        span.classList.add('filled');
    } else {
        span.textContent = labelOriginal; 
        span.classList.remove('filled');
    }
}

// ==========================================
// RENDERIZADO DE INTERFAZ DEL BRACKET
// ==========================================

function crearBotonGuardarFase() {
    let btn = d.createElement('button');
    btn.className = 'btn-guardar-progreso button button-outline';
    btn.style.maxWidth = '250px';
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Progreso Parcial';
    return btn;
}
function dibujarDieciseisavos() {
    let section = d.createElement('section');
    section.className = 'fase-container';
    section.id = 'fase-dieciseisavos';
    section.innerHTML = `<h2>Dieciseisavos de Final</h2>`;

    dieciseisavos.forEach(p => {
        let reqs = p.label.split(' vs ');
        let card = d.createElement('div');
        card.className = 'match-card';
        card.id = `match-${p.id}`;
        card.innerHTML = `
            <p><strong>Partido ${p.id}</strong></p>
            <div class="team-row">
                <div class="team-column-A">
                    <span class="auto-team team-A" id="teamA-${p.id}">${reqs[0]}</span>
                    <input type="number" class="score-input input-A" min="0" placeholder="0">
                </div>
                <span class="vs-separator"> vs </span>
                <div class="team-column-B">
                    <span class="auto-team team-B" id="teamB-${p.id}">${reqs[1]}</span>
                    <input type="number" class="score-input input-B" min="0" placeholder="0">
                </div>
            </div>
            
            <div class="penal-box">
                <input type="checkbox" id="penales-${p.id}" class="chk-penales">
                <label for="penales-${p.id}">Definición por Penales</label>
            </div>
            <div class="penales-box d-none" id="box-penales-${p.id}">
                <label>Ganador de los penales:</label>
                <select class="penales-winner">
                    <option value="">Seleccionar ganador...</option>
                </select>
            </div>
        `;
        section.appendChild(card);
    });
    section.appendChild(crearBotonGuardarFase());
    bracketContainer.appendChild(section);
}

function dibujarSiguientesFases() {
    fases.forEach(fase => {
        let section = d.createElement('section');
        section.className = 'fase-container';
        section.id = `fase-${fase.id}`;
        section.innerHTML = `<h2>${fase.titulo}</h2>`;

        fase.partidos.forEach(idPartido => {
            let card = d.createElement('div');
            card.className = 'match-card';
            card.id = `match-${idPartido}`;
            card.innerHTML = `
                <p><strong>Partido ${idPartido}</strong></p>
                <div class="team-row">
                    <div class="team-column-A">
                        <span class="auto-team team-A" id="teamA-${idPartido}">Por definirse...</span>
                        <input type="number" class="score-input input-A" min="0" placeholder="0">
                    </div>
                    <span class="vs-separator"> vs </span>
                    <div class="team-column-B">
                        <span class="auto-team team-B" id="teamB-${idPartido}">Por definirse...</span>
                        <input type="number" class="score-input input-B" min="0" placeholder="0">
                    </div>
                </div>
                
                <div class="penal-box">
                    <input type="checkbox" id="penales-${idPartido}" class="chk-penales">
                    <label for="penales-${idPartido}">Definición por Penales</label>
                </div>
                <div class="penales-box d-none" id="box-penales-${idPartido}">
                    <label>Ganador de los penales:</label>
                    <select class="penales-winner">
                        <option value="">Seleccionar ganador...</option>
                    </select>
                </div>
            `;
            section.appendChild(card);
        });
        section.appendChild(crearBotonGuardarFase());
        bracketContainer.appendChild(section);
    });
}

// ==========================================
// FUNCIONES AUXILIARES DE PROGRESIÓN
// ==========================================
function actualizarDropdownPenales(matchId) {
    let card = d.getElementById(`match-${matchId}`);
    let spanA = card.querySelector('.team-A');
    let spanB = card.querySelector('.team-B');
    
    let selectPenales = card.querySelector('.penales-winner');
    
    // Guardamos lo que el usuario tenga seleccionado antes de reescribir
    let valorActual = selectPenales.value; 
    
    selectPenales.innerHTML = `<option value="">Seleccionar ganador...</option>`;
    
    if (spanA.classList.contains('filled')) selectPenales.innerHTML += `<option value="${spanA.textContent}">${spanA.textContent}</option>`;
    if (spanB.classList.contains('filled')) selectPenales.innerHTML += `<option value="${spanB.textContent}">${spanB.textContent}</option>`;
    
    // Restauramos su selección si todavía es válida
    if (valorActual) selectPenales.value = valorActual; 
}

function limpiarFuturo(matchId) {
    if (progresion[matchId]) {
        let nextMatch = progresion[matchId].next;
        let slot = progresion[matchId].slot;
        
        let targetSpan = d.getElementById(`team${slot}-${nextMatch}`);
        if(targetSpan){
            targetSpan.textContent = "Por definirse...";
            targetSpan.classList.remove('filled');
            actualizarDropdownPenales(nextMatch);
            d.querySelector(`#match-${nextMatch} .input-A`).value = "";
            d.querySelector(`#match-${nextMatch} .input-B`).value = "";
            evaluarGanador(nextMatch); 
        }

        if (progresion[matchId].loserNext) {
            let loserMatch = progresion[matchId].loserNext;
            let loserSlot = progresion[matchId].loserSlot;
            let targetLoserSpan = d.getElementById(`team${loserSlot}-${loserMatch}`);
            if(targetLoserSpan){
                targetLoserSpan.textContent = "Por definirse...";
                targetLoserSpan.classList.remove('filled');
                actualizarDropdownPenales(loserMatch);
                d.querySelector(`#match-${loserMatch} .input-A`).value = "";
                d.querySelector(`#match-${loserMatch} .input-B`).value = "";
                evaluarGanador(loserMatch);
            }
        }
    }
}

function evaluarGanador(matchId) {
    let card = d.getElementById(`match-${matchId}`);
    let spanA = card.querySelector('.team-A');
    let spanB = card.querySelector('.team-B');
    
    let golesA = card.querySelector('.input-A').value;
    let golesB = card.querySelector('.input-B').value;
    
    let chkPenales = card.querySelector('.chk-penales').checked;
    let ganadorPenales = card.querySelector('.penales-winner').value;

    let ganador = null;
    let perdedor = null;

    if (!spanA.classList.contains('filled') || !spanB.classList.contains('filled') || golesA === "" || golesB === "") {
        limpiarFuturo(matchId);
        return;
    }

    if (parseInt(golesA) > parseInt(golesB)) {
        ganador = spanA.textContent; perdedor = spanB.textContent;
    } else if (parseInt(golesB) > parseInt(golesA)) {
        ganador = spanB.textContent; perdedor = spanA.textContent;
    } else if (chkPenales && ganadorPenales !== "") {
        ganador = ganadorPenales;
        perdedor = (ganador === spanA.textContent) ? spanB.textContent : spanA.textContent;
    }

    if (ganador && progresion[matchId]) {
        let nextMatch = progresion[matchId].next;
        let slot = progresion[matchId].slot; 
        
        let targetSpan = d.getElementById(`team${slot}-${nextMatch}`);
        if(targetSpan){
            targetSpan.textContent = ganador;
            targetSpan.classList.add('filled');
            actualizarDropdownPenales(nextMatch); 
            evaluarGanador(nextMatch); 
        }

        if (progresion[matchId].loserNext) {
            let loserMatch = progresion[matchId].loserNext;
            let loserSlot = progresion[matchId].loserSlot;
            let targetLoserSpan = d.getElementById(`team${loserSlot}-${loserMatch}`);
            if(targetLoserSpan){
                targetLoserSpan.textContent = perdedor;
                targetLoserSpan.classList.add('filled');
                actualizarDropdownPenales(loserMatch);
            }
        }
    }
}

// ==========================================
// INICIALIZACIÓN Y EVENTOS
// ==========================================
dibujarDieciseisavos();
dibujarSiguientesFases();

d.querySelectorAll('.chk-penales').forEach(chk => {
    chk.addEventListener('change', (e) => {
        let matchId = e.target.id.split('-')[1];
        let penalesBox = d.getElementById(`box-penales-${matchId}`);
        penalesBox.style.display = e.target.checked ? 'block' : 'none';
        evaluarGanador(matchId);
    });
});

d.addEventListener('input', (e) => {
    if (e.target.classList.contains('score-input')) {
        if (e.data === '-' || e.data === 'e') e.target.value = "";
        
        if (e.target.value !== "") {
            let valor = parseInt(e.target.value, 10);
            if (isNaN(valor)) { e.target.value = ""; return; }
            if (valor < 0) valor = 0;
            if (valor > 99) valor = 99;
            e.target.value = valor; 
        }
    }

    if (e.target.classList.contains('score-input') || e.target.classList.contains('penales-winner')) {
        let card = e.target.closest('.match-card');
        let matchId = card.id.split('-')[1];
        
        let golesA = card.querySelector('.input-A').value;
        let golesB = card.querySelector('.input-B').value;
        let chkPenales = card.querySelector('.chk-penales');
        let boxPenales = card.querySelector('.penales-box');
        
        if(golesA !== "" && golesB !== "" && golesA === golesB) {
            chkPenales.checked = true;
            boxPenales.style.display = 'block';
        } else {
            chkPenales.checked = false;
            boxPenales.style.display = 'none';
        }

        evaluarGanador(matchId);
    }
});

async function initMataMata() {
    await getCodes();
    await cargarProgresoMataMata();
}
initMataMata();

// ==========================================
// LÓGICA DE GUARDADO Y CARGA (Borrador / Definitivo)
// ==========================================

// Restauramos tu diccionario que era PERFECTO
const mapaIdsBaseDatos = {
    'P73': 1, 'P76': 2, 'P74': 3, 'P75': 4, 'P78': 5, 'P77': 6, 'P79': 7, 'P80': 8,
    'P82': 9, 'P81': 10, 'P84': 11, 'P83': 12, 'P85': 13, 'P88': 14, 'P86': 15, 'P87': 16,
    'P90': 17, 'P89': 18, 'P91': 19, 'P92': 20, 'P93': 21, 'P94': 22, 'P95': 23, 'P96': 24,
    'P97': 25, 'P98': 26, 'P99': 27, 'P100': 28, 'P101': 29, 'P102': 30, 'P103': 31, 'P104': 32
};

const mapaIdsHTML = Object.fromEntries(Object.entries(mapaIdsBaseDatos).map(([k, v]) => [v, k]));

async function cargarProgresoMataMata() {
    try {
        const { data: predicciones, error } = await supaClient
            .from('predicciones')
            .select('*')
            .eq('usuario_id', usuarioActivo.id)
            .lte('partido_id', 32); // MAGIA: Solo trae los partidos del 1 al 32

        if (error) throw error;

        if (predicciones && predicciones.length > 0) {
            predicciones.forEach(p => {
                const matchIdStr = mapaIdsHTML[p.partido_id];
                if (!matchIdStr) return; 

                const card = d.getElementById(`match-${matchIdStr}`);
                if (!card) return;

                const spanA = card.querySelector('.team-A');
                const spanB = card.querySelector('.team-B');
                if (p.equipo_a_pred) { spanA.textContent = p.equipo_a_pred; spanA.classList.add('filled'); }
                if (p.equipo_b_pred) { spanB.textContent = p.equipo_b_pred; spanB.classList.add('filled'); }

                actualizarDropdownPenales(matchIdStr);

                const inputA = card.querySelector('.input-A');
                const inputB = card.querySelector('.input-B');
                if (p.goles_a_pred !== null) inputA.value = p.goles_a_pred;
                if (p.goles_b_pred !== null) inputB.value = p.goles_b_pred;

                if (p.ganador_penales_pred) {
                    card.querySelector('.chk-penales').checked = true;
                    const boxPenales = card.querySelector('.penales-box');
                    boxPenales.style.display = 'block';
                    
                    const selectPenales = card.querySelector('.penales-winner');
                    selectPenales.value = p.ganador_penales_pred;
                }
            });
        }
    } catch (err) {
        console.error("Error al cargar progreso:", err);
    }
}

function recopilarDatosMataMata(exigirCompletos) {
    let todasCompletas = true;
    const prediccionesParaSubir = [];
    const matchCards = d.querySelectorAll('.match-card');

    matchCards.forEach(card => {
        let matchIdStr = card.id.replace('match-', '');
        let idBaseDatos = mapaIdsBaseDatos[matchIdStr];

        if (!idBaseDatos) return;

        let spanA = card.querySelector('.team-A');
        let spanB = card.querySelector('.team-B');
        let golesA = card.querySelector('.input-A').value;
        let golesB = card.querySelector('.input-B').value;
        let chkPenales = card.querySelector('.chk-penales').checked;
        let ganadorPenales = card.querySelector('.penales-winner').value;

        let equipoCompleto = spanA.classList.contains('filled') && spanB.classList.contains('filled');

        if (exigirCompletos) {
            if (!equipoCompleto || golesA === "" || golesB === "") {
                todasCompletas = false;
            }
            if (golesA === golesB && (!chkPenales || ganadorPenales === "")) {
                todasCompletas = false;
            } else if (chkPenales && ganadorPenales === "") {
                todasCompletas = false;
            }
        }

        // Siempre incluimos los 32 partidos (con o sin datos)
        prediccionesParaSubir.push({
            usuario_id: usuarioActivo.id,
            partido_id: idBaseDatos,
            equipo_a_pred: equipoCompleto ? spanA.textContent : null,
            equipo_b_pred: equipoCompleto ? spanB.textContent : null,
            goles_a_pred: golesA !== "" ? parseInt(golesA) : null,
            goles_b_pred: golesB !== "" ? parseInt(golesB) : null,
            ganador_penales_pred: (chkPenales && ganadorPenales !== "") ? ganadorPenales : null
        });
    });

    if (exigirCompletos && !todasCompletas) return null;
    return prediccionesParaSubir;
}

// --- FUNCIÓN DE GUARDADO (Reemplaza todas las predicciones limpiamente) ---
async function guardarPrediccionesSinBorrar(arrayPredicciones) {
    // Borramos todas las predicciones previas de mata-mata del usuario
    const { error: errDelete } = await supaClient
        .from('predicciones')
        .delete()
        .eq('usuario_id', usuarioActivo.id)
        .lte('partido_id', 32);

    if (errDelete) throw errDelete;

    // Insertamos las actuales (con o sin datos)
    if (arrayPredicciones.length > 0) {
        const { error: errInsert } = await supaClient
            .from('predicciones')
            .insert(arrayPredicciones);

        if (errInsert) throw errInsert;
    }
}

// --- BOTÓN: GUARDAR BORRADOR ---

d.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-guardar-progreso');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    const arrayPredicciones = recopilarDatosMataMata(false); // false = no exigir completitud

    if (!arrayPredicciones || arrayPredicciones.length === 0) {
        showToast("No hay datos nuevos para guardar.", "info");
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Progreso Parcial';
        return;
    }

    try {
        await guardarPrediccionesSinBorrar(arrayPredicciones);

        // Actualizamos timestamp de último guardado
        await supaClient.from('usuarios')
            .update({ fecha_envio_mata_mata: new Date().toISOString() })
            .eq('id', usuarioActivo.id);

        showToast("Progreso guardado correctamente. Podés continuar luego.", "success");
    } catch (err) {
        console.error("Error al guardar borrador:", err);
        showToast("Error al guardar progreso", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Progreso Parcial';
    }
});

// --- BOTÓN: ENVÍO DEFINITIVO ---
const btnEnviarDefinitivo = d.getElementById('btnEnviarDefinitivo');

btnEnviarDefinitivo.addEventListener('click', async () => {
    
    const arrayPredicciones = recopilarDatosMataMata(true); // true = Exigir todo completo

    if (!arrayPredicciones) {
        showToast('⚠️ Faltan datos. Asegurate de haber llenado todos los goles, penales y equipos de cada llave.', 'warning');
        return;
    }

    const confirmacion = confirm("¿Estás seguro? Vas a guardar todos tus pronósticos del Mata-Mata.");
    if (!confirmacion) return;

    btnEnviarDefinitivo.disabled = true;
    btnEnviarDefinitivo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    try {
        await guardarPrediccionesSinBorrar(arrayPredicciones);

        await supaClient.from('usuarios')
            .update({ fecha_envio_mata_mata: new Date().toISOString() })
            .eq('id', usuarioActivo.id);

        showToast("¡Mundial pronosticado con éxito! Podés seguir editando hasta el 24/06. 🏆", "success");

    } catch (err) {
        console.error("Error definitivo:", err);
        showToast("Error al enviar el formulario final", "error");
    } finally {
        btnEnviarDefinitivo.disabled = false;
        btnEnviarDefinitivo.innerHTML = 'Envío Definitivo 🏆';
    }
});

// --- CREACIÓN DEL NAV ---
const createBracketNav = () =>{
    const navItems = [
        {id: 'fase-dieciseisavos', label:'16vos'},
        {id: 'fase-octavos', label:'8vos'},
        {id: 'fase-cuartos', label:'4tos'},
        {id: 'fase-semis', label:'Semis'},
        {id: 'fase-tercer', label:'Tercero'},
        {id: 'fase-final', label:'Final'}
    ];
    nav.innerHTML = `<ul class="nav-fases">${navItems.map(item => `<li><a href="#${item.id}" class="nav-fase-link">${item.label}</a></li>`).join('')}</ul>`;
}
createBracketNav();