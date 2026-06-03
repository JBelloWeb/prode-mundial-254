const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    alert("Debes iniciar sesión");
    window.location.href = '../index.html';
}

async function verificarAccesoMataMata() {
    const { data, error } = await supaClient
        .from('usuarios')
        .select('fecha_envio_mata_mata')
        .eq('id', usuarioActivo.id)
        .single();

    if (data && data.fecha_envio_mata_mata) {
        alert("Ya completaste tus pronósticos del Mata-Mata. No podés volver a ingresar.");
        window.location.href = 'dashboard.html';
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
    ol.style.display = 'flex';
    ol.style.flexDirection = 'row';
    ol.style.flexWrap = 'wrap';
    ol.style.gap = '20px';
    ol.style.justifyContent = 'center';
    ol.style.width = '100%';
    ol.style.padding = '0';
    ol.style.listStyle = 'none';

    Object.keys(gruposMundial).forEach(letra => {
        let gr = d.createElement('li');
        gr.className = 'group';
        
        let name = d.createElement('h3');
        name.textContent = `GRUPO ${letra}`;
        name.style.width = '100%';
        name.style.marginBottom = '10px';
        
        let integrantes = d.createElement('ul');
        integrantes.className = "countries-container";
        
        // Refuerzo de contenedor
        integrantes.style.width = '100%';
        integrantes.style.padding = '0';
        integrantes.style.margin = '0';
        integrantes.style.gap = '10px'; // Forzamos el gap exacto

        gruposMundial[letra].forEach(pais => {
            let li = d.createElement('li');
            li.className = 'group-participant clasificacion-item';
            
            // LA MAGIA MATEMÁTICA
            li.style.flex = '0 0 calc(50% - 5px)';
            li.style.maxWidth = 'calc(50% - 5px)'; 
            li.style.boxSizing = 'border-box';
            li.style.margin = '0'; // <--- ESTO MATA AL MARGEN INFILTRADO QUE ROMPÍA LA FILA
            
            let codigo = codigosBanderas[pais];
            let n = minBosnia(pais);
            
            li.innerHTML = `<img src="https://flagcdn.com/16x12/${codigo}.png" alt="${pais}" style="margin-right: 8px;">${n}`;
            
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
                alert("⚠️ Ya seleccionaste a los 8 mejores terceros. Si querés elegir otro, primero deseleccioná a uno de los actuales.");
                return;
            }
            grupoObj[3] = pais;
            agregarBadge(elementoHtml, 3);
        } else {
            alert("Ya elegiste 1°, 2° y 3° para este grupo. Tocá uno para deseleccionarlo.");
            return;
        }
    }
    
    armarBracketAutomatico();
}

function agregarBadge(elementoHtml, pos) {
    elementoHtml.classList.add('selected');
    let badge = d.createElement('div');
    badge.className = `badge-posicion pos-${pos}`;
    badge.textContent = `${pos}°`;
    elementoHtml.appendChild(badge);
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
            <div class="team-row" style="justify-content: center;">
                <div class="team-column-A">
                    <span class="auto-team team-A" id="teamA-${p.id}" style="padding: 2px; font-weight: 500; font-size: 0.95rem; min-height: 30px;">${reqs[0]}</span>
                    <input type="number" class="score-input input-A" min="0" placeholder="0">
                </div>
                <span style="color:var(--text-muted); display:flex; align-items:center; padding: 0 10px;"> vs </span>
                <div class="team-column-B">
                    <span class="auto-team team-B" id="teamB-${p.id}" style="padding: 2px; font-weight: 500; font-size: 0.95rem; min-height: 30px;">${reqs[1]}</span>
                    <input type="number" class="score-input input-B" min="0" placeholder="0">
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <input type="checkbox" id="penales-${p.id}" class="chk-penales">
                <label for="penales-${p.id}" style="font-size:0.85rem; color: var(--text-muted);">Definición por Penales</label>
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
                <div class="team-row" style="justify-content: center;">
                    <div class="team-column-A">
                        <span class="auto-team team-A" id="teamA-${idPartido}" style="padding: 2px; font-weight: 500; font-size: 0.95rem; min-height: 30px;">Por definirse...</span>
                        <input type="number" class="score-input input-A" min="0" placeholder="0">
                    </div>
                    <span style="color:var(--text-muted); display:flex; align-items:center; padding: 0 10px;"> vs </span>
                    <div class="team-column-B">
                        <span class="auto-team team-B" id="teamB-${idPartido}" style="padding: 2px; font-weight: 500; font-size: 0.95rem; min-height: 30px;">Por definirse...</span>
                        <input type="number" class="score-input input-B" min="0" placeholder="0">
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <input type="checkbox" id="penales-${idPartido}" class="chk-penales">
                    <label for="penales-${idPartido}" style="font-size:0.85rem; color: var(--text-muted);">Definición por Penales</label>
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
    selectPenales.innerHTML = `<option value="">Seleccionar ganador...</option>`;
    
    if (spanA.classList.contains('filled')) selectPenales.innerHTML += `<option value="${spanA.textContent}">${spanA.textContent}</option>`;
    if (spanB.classList.contains('filled')) selectPenales.innerHTML += `<option value="${spanB.textContent}">${spanB.textContent}</option>`;
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
getCodes(); // Esto carga las banderas y luego llama a dibujarClasificacionGrupos()
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

// ==========================================
// LÓGICA DE GUARDADO
// ==========================================
const btnGuardarMataMata = d.getElementById('btnGuardarMataMata');

btnGuardarMataMata.addEventListener('click', async () => {
    btnGuardarMataMata.disabled = true;
    btnGuardarMataMata.textContent = "Validando partidos...";

    let todasCompletas = true;
    const prediccionesParaSubir = [];
    const matchCards = d.querySelectorAll('.match-card');

    matchCards.forEach(card => {
        let spanA = card.querySelector('.team-A');
        let spanB = card.querySelector('.team-B');
        let golesA = card.querySelector('.input-A').value;
        let golesB = card.querySelector('.input-B').value;
        let chkPenales = card.querySelector('.chk-penales').checked;
        let ganadorPenales = card.querySelector('.penales-winner').value;

        if (!spanA.classList.contains('filled') || !spanB.classList.contains('filled') || golesA === "" || golesB === "") {
            todasCompletas = false;
        }

        if (golesA === golesB && (!chkPenales || ganadorPenales === "")) {
            todasCompletas = false;
        } else if (chkPenales && ganadorPenales === "") {
            todasCompletas = false;
        }

        prediccionesParaSubir.push({
            usuario_id: usuarioActivo.id,
            equipo_a_pred: spanA.textContent,
            equipo_b_pred: spanB.textContent,
            goles_a_pred: parseInt(golesA),
            goles_b_pred: parseInt(golesB),
            ganador_penales_pred: (chkPenales && ganadorPenales !== "") ? ganadorPenales : null
        });
    });

    if (!todasCompletas) {
        alert("⚠️ Faltan datos. Asegurate de haber elegido los clasificados de los grupos y haber llenado todos los goles y penales del cuadro.");
        btnGuardarMataMata.disabled = false;
        btnGuardarMataMata.textContent = "Guardar Fase Final 🏆";
        return;
    }

    btnGuardarMataMata.textContent = "Subiendo a la nube...";

    try {
        const { error: errorPredicciones } = await supaClient.from('predicciones').insert(prediccionesParaSubir);
        await supaClient.from('usuarios').update({ fecha_envio_mata_mata: new Date().toISOString() }).eq('id', usuarioActivo.id);

        if (errorPredicciones) throw errorPredicciones;

        alert("¡Mundial pronosticado con éxito! Que ruede la pelota.");
        window.location.href = 'dashboard.html'; 
    } catch (error) {
        console.error("Error al guardar Mata-Mata:", error);
        alert("Hubo un problema al guardar tus pronósticos. Revisa tu conexión.");
        btnGuardarMataMata.disabled = false;
        btnGuardarMataMata.textContent = "Guardar Fase Final 🏆";
    }
});

const createBracketNav = () =>{
    const navItems = [
        {id: 'fase-dieciseisavos', label:'16vos'},
        {id: 'fase-octavos', label:'8vos'},
        {id: 'fase-cuartos', label:'4tos'},
        {id: 'fase-semis', label:'Semis'},
        {id: 'fase-final', label:'Final'}
    ];
    nav.innerHTML = `<ul class="nav-fases">${navItems.map(item => `<li><a href="#${item.id}" class="nav-fase-link">${item.label}</a></li>`).join('')}</ul>`;
}
createBracketNav();