const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    alert("Debes iniciar sesión");
    window.location.href = '../index.html';
}

// Candado de seguridad: Verificar en la BD si ya mandó el Mata-Mata
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

// 1. DICCIONARIO DE GRUPOS (Para saber qué países van en los selects)
const gruposMundial = {
    "A": ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
    "B": ["Canadá", "Bosnia", "Catar", "Suiza"],
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

// Función auxiliar para unir varios grupos en una sola lista de países
const getPaisesDeGrupos = (letras) => {
    let paises = [];
    letras.forEach(letra => paises = paises.concat(gruposMundial[letra]));
    return paises;
};

// 2. CONFIGURACIÓN DE DIECISEISAVOS (Basado en tu imagen)
// a_groups = grupos posibles para el equipo A / b_groups = grupos para el equipo B
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

// 3. MAPA DE PROGRESIÓN (Hacia dónde va el ganador de cada partido)
const progresion = {
    'P74': { next: 'P89', slot: 'A' }, 'P77': { next: 'P89', slot: 'B' },
    'P73': { next: 'P90', slot: 'A' }, 'P75': { next: 'P90', slot: 'B' },
    'P83': { next: 'P93', slot: 'A' }, 'P84': { next: 'P93', slot: 'B' },
    'P81': { next: 'P94', slot: 'A' }, 'P82': { next: 'P94', slot: 'B' },
    'P76': { next: 'P91', slot: 'A' }, 'P78': { next: 'P91', slot: 'B' },
    'P79': { next: 'P92', slot: 'A' }, 'P80': { next: 'P92', slot: 'B' },
    'P86': { next: 'P95', slot: 'A' }, 'P88': { next: 'P95', slot: 'B' },
    'P85': { next: 'P96', slot: 'A' }, 'P87': { next: 'P96', slot: 'B' },
    // Octavos a Cuartos
    'P89': { next: 'P97', slot: 'A' }, 'P90': { next: 'P97', slot: 'B' },
    'P93': { next: 'P98', slot: 'A' }, 'P94': { next: 'P98', slot: 'B' },
    'P91': { next: 'P99', slot: 'A' }, 'P92': { next: 'P99', slot: 'B' },
    'P95': { next: 'P100', slot: 'A' }, 'P96': { next: 'P100', slot: 'B' },
    // Cuartos a Semis
    'P97': { next: 'P101', slot: 'A' }, 'P98': { next: 'P101', slot: 'B' },
    'P99': { next: 'P102', slot: 'A' }, 'P100': { next: 'P102', slot: 'B' },
    // Semis a Final y Tercer Puesto
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

const bracketContainer = d.getElementById('bracketContainer');

// ==========================================
// RENDERIZADO DE INTERFAZ
// ==========================================

function dibujarDieciseisavos() {
    let section = d.createElement('section');
    section.className = 'fase-container';
    section.innerHTML = `<h2>Dieciseisavos de Final</h2>`;

    dieciseisavos.forEach(p => {
        let optionsA = getPaisesDeGrupos(p.a_groups).map(pais => `<option value="${pais}">${pais}</option>`).join('');
        let optionsB = getPaisesDeGrupos(p.b_groups).map(pais => `<option value="${pais}">${pais}</option>`).join('');

        let card = d.createElement('div');
        card.className = 'match-card';
        card.id = `match-${p.id}`;
        card.innerHTML = `
            <p><strong>Partido ${p.id} - ${p.label}</strong></p>
            <div class="team-row">
                <div class="team-column-A">
                    <select class="team-select select-A" data-match="${p.id}">
                        <option value="">Equipo A</option>
                        ${optionsA}
                    </select>
                    <input type="number" class="score-input input-A" min="0" placeholder="0">
                </div>
                <span style="color:var(--text-muted)"> vs </span>
                <div class="team-column-B">
                    <select class="team-select select-B" data-match="${p.id}">
                        <option value="">Equipo B</option>
                        ${optionsB}
                    </select>
                    <input type="number" class="score-input input-B" min="0" placeholder="0">
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <input type="checkbox" id="penales-${p.id}" class="chk-penales">
                <label for="penales-${p.id}" style="font-size:0.85rem; color: var(--text-muted);">Definición por Penales</label>
            </div>

            <div class="penales-box" id="box-penales-${p.id}">
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
        section.innerHTML = `<h2>${fase.titulo}</h2>`;

        fase.partidos.forEach(idPartido => {
            let card = d.createElement('div');
            card.className = 'match-card';
            card.id = `match-${idPartido}`;
            card.innerHTML = `
                <p><strong>Partido ${idPartido}</strong></p>
                <div class="team-row">
                    <span class="auto-team team-A" id="teamA-${idPartido}">Por definirse...</span>
                    <input type="number" class="score-input input-A" min="0" placeholder="0">
                    <span style="color:var(--text-muted)"> vs </span>
                    <input type="number" class="score-input input-B" min="0" placeholder="0">
                    <span class="auto-team team-B" id="teamB-${idPartido}">Por definirse...</span>
                </div>
                
                <div style="margin-top: 15px;">
                    <input type="checkbox" id="penales-${idPartido}" class="chk-penales">
                    <label for="penales-${idPartido}" style="font-size:0.85rem; color: var(--text-muted);">Definición por Penales</label>
                </div>

                <div class="penales-box" id="box-penales-${idPartido}">
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
// MOTOR LÓGICO
// ==========================================

// REGLA 1: Exclusión de países (Un país no puede jugar 2 partidos en Dieciseisavos)
function actualizarSelectsUnicos() {
    let todosLosSelects = d.querySelectorAll('.team-select');
    let paisesSeleccionados = [];

    // Recolectamos todo lo que el usuario ya eligió
    todosLosSelects.forEach(sel => {
        if (sel.value !== "") paisesSeleccionados.push(sel.value);
    });

    // Deshabilitamos esas opciones en los demás selects
    todosLosSelects.forEach(sel => {
        let opciones = sel.querySelectorAll('option');
        opciones.forEach(opt => {
            if (opt.value === "") return;
            // Si el país está en la lista de seleccionados, Y NO es el que tengo seleccionado actualmente en este dropdown...
            if (paisesSeleccionados.includes(opt.value) && sel.value !== opt.value) {
                opt.disabled = true;
                opt.style.color = "red"; // Un detalle visual opcional
            } else {
                opt.disabled = false;
                opt.style.color = "";
            }
        });
    });
}

// REGLA 2: Actualizar el dropdown de penales cuando se elige un país
function actualizarDropdownPenales(matchId) {
    let card = d.getElementById(`match-${matchId}`);
    let nombreA = card.querySelector('.select-A') ? card.querySelector('.select-A').value : card.querySelector('.team-A').textContent;
    let nombreB = card.querySelector('.select-B') ? card.querySelector('.select-B').value : card.querySelector('.team-B').textContent;
    
    let selectPenales = card.querySelector('.penales-winner');
    selectPenales.innerHTML = `<option value="">Seleccionar ganador...</option>`;
    
    if (nombreA && nombreA !== "Por definirse...") selectPenales.innerHTML += `<option value="${nombreA}">${nombreA}</option>`;
    if (nombreB && nombreB !== "Por definirse...") selectPenales.innerHTML += `<option value="${nombreB}">${nombreB}</option>`;
}

// REGLA 3: Evaluar quién ganó y empujarlo a la siguiente fase
function evaluarGanador(matchId) {
    let card = d.getElementById(`match-${matchId}`);
    let equipoA = card.querySelector('.select-A') ? card.querySelector('.select-A').value : card.querySelector('.team-A').textContent;
    let equipoB = card.querySelector('.select-B') ? card.querySelector('.select-B').value : card.querySelector('.team-B').textContent;
    
    let golesA = card.querySelector('.input-A').value;
    let golesB = card.querySelector('.input-B').value;
    
    let chkPenales = card.querySelector('.chk-penales').checked;
    let ganadorPenales = card.querySelector('.penales-winner').value;

    let ganador = null;
    let perdedor = null;

    // Solo calculamos si ambos equipos existen y pusieron goles
    if (!equipoA || equipoA === "Por definirse..." || !equipoB || equipoB === "Por definirse...") return;
    if (golesA === "" || golesB === "") return;

    if (parseInt(golesA) > parseInt(golesB)) {
        ganador = equipoA; perdedor = equipoB;
    } else if (parseInt(golesB) > parseInt(golesA)) {
        ganador = equipoB; perdedor = equipoA;
    } else if (chkPenales && ganadorPenales !== "") {
        ganador = ganadorPenales;
        perdedor = (ganador === equipoA) ? equipoB : equipoA;
    }

    // Si hay un ganador, lo mandamos a su próximo partido
    if (ganador && progresion[matchId]) {
        let nextMatch = progresion[matchId].next;
        let slot = progresion[matchId].slot; // 'A' o 'B'
        
        let targetSpan = d.getElementById(`team${slot}-${nextMatch}`);
        if(targetSpan){
            targetSpan.textContent = ganador;
            targetSpan.classList.add('filled');
            actualizarDropdownPenales(nextMatch); // Actualizamos el select de penales del próximo partido
            evaluarGanador(nextMatch); // Re-evaluamos en cadena por si cambiaste algo del pasado
        }

        // Si es la semi, mandamos al perdedor al partido por el tercer puesto
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

// Escuchar cambios en los SELECTS de equipos (Dieciseisavos)
d.querySelectorAll('.team-select').forEach(select => {
    select.addEventListener('change', (e) => {
        actualizarSelectsUnicos();
        let matchId = e.target.dataset.match;
        actualizarDropdownPenales(matchId);
        evaluarGanador(matchId);
    });
});

// Escuchar checkboxes de penales en TODAS las tarjetas
d.querySelectorAll('.chk-penales').forEach(chk => {
    chk.addEventListener('change', (e) => {
        let matchId = e.target.id.split('-')[1];
        let penalesBox = d.getElementById(`box-penales-${matchId}`);
        penalesBox.style.display = e.target.checked ? 'block' : 'none';
        evaluarGanador(matchId);
    });
});

// Escuchar inputs de goles y selects de penales
d.addEventListener('input', (e) => {
    // 1. NUEVO CÓDIGO: Validación estricta de goles y limpieza de ceros a la izquierda
    if (e.target.classList.contains('score-input')) {
        // Evitamos que ingresen el signo menos o la letra 'e'
        if (e.data === '-' || e.data === 'e') {
            e.target.value = "";
        }
        
        // Si hay un número, lo limpiamos y forzamos los límites
        if (e.target.value !== "") {
            // parseInt(..., 10) convierte "03" en el número matemático 3 real
            let valor = parseInt(e.target.value, 10); 
            
            if (valor < 0) valor = 0;
            if (valor > 99) valor = 99;
            
            // Al devolverlo al input, se dibuja como "3" limpio
            e.target.value = valor; 
        }
    }

    // 2. LÓGICA EXISTENTE: Penales y progreso
    if (e.target.classList.contains('score-input') || e.target.classList.contains('penales-winner')) {
        let card = e.target.closest('.match-card');
        let matchId = card.id.split('-')[1];
        
        // Auto-activar checkbox si los goles son iguales
        let golesA = card.querySelector('.input-A').value;
        let golesB = card.querySelector('.input-B').value;
        let chkPenales = card.querySelector('.chk-penales');
        let boxPenales = card.querySelector('.penales-box');
        
        // Como ahora limpiamos los ceros arriba, la comparación de textos será perfecta (Ej: "3" === "3")
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
// LÓGICA DE GUARDADO EN SUPABASE
// ==========================================
const btnGuardarMataMata = d.getElementById('btnGuardarMataMata');

btnGuardarMataMata.addEventListener('click', async () => {
    btnGuardarMataMata.disabled = true;
    btnGuardarMataMata.textContent = "Validando partidos...";

    let todasCompletas = true;
    const prediccionesParaSubir = [];
    const matchCards = d.querySelectorAll('.match-card');

    matchCards.forEach(card => {
        // Obtenemos los nombres (ya sea de los selects de 16avos o de los spans automáticos)
        let equipoA = card.querySelector('.select-A') ? card.querySelector('.select-A').value : card.querySelector('.team-A').textContent;
        let equipoB = card.querySelector('.select-B') ? card.querySelector('.select-B').value : card.querySelector('.team-B').textContent;
        
        let golesA = card.querySelector('.input-A').value;
        let golesB = card.querySelector('.input-B').value;
        
        let chkPenales = card.querySelector('.chk-penales').checked;
        let ganadorPenales = card.querySelector('.penales-winner').value;

        // Validaciones estrictas:
        // 1. Que no haya equipos vacíos o "Por definirse"
        if (!equipoA || equipoA === "Por definirse..." || !equipoB || equipoB === "Por definirse...") {
            todasCompletas = false;
        }
        // 2. Que hayan puesto los goles
        if (golesA === "" || golesB === "") {
            todasCompletas = false;
        }
        // 3. Que si hay penales, hayan elegido al ganador
        if (chkPenales && ganadorPenales === "") {
            todasCompletas = false;
        }

        // Armamos el objeto tal cual lo espera la base de datos
        prediccionesParaSubir.push({
            usuario_id: usuarioActivo.id,
            equipo_a_pred: equipoA,
            equipo_b_pred: equipoB,
            goles_a_pred: parseInt(golesA),
            goles_b_pred: parseInt(golesB),
            ganador_penales_pred: (chkPenales && ganadorPenales !== "") ? ganadorPenales : null
        });
    });

    // Si falta algo, frenamos todo
    if (!todasCompletas) {
        alert("⚠️ Por favor, completa todos los partidos (incluyendo los goles y los ganadores por penales) antes de guardar.");
        btnGuardarMataMata.disabled = false;
        btnGuardarMataMata.textContent = "Guardar Fase Final 🏆";
        return;
    }

    btnGuardarMataMata.textContent = "Subiendo a la nube...";

    try {
        // Mandamos todo el array de predicciones de un solo golpe
        const { error: errorPredicciones } = await supaClient
            .from('predicciones')
            .insert(prediccionesParaSubir);

            // Guardamos la marca de tiempo exacta para el Mata-Mata (La que usaremos para desempatar)
            await supaClient.from('usuarios').update({ fecha_envio_mata_mata: new Date().toISOString() }).eq('id', usuarioActivo.id);

        if (errorPredicciones) throw errorPredicciones;

        // Opcional: Podrías actualizar algo en la tabla 'usuarios' aquí si lo deseas (ej: ya_participo_fase_final = true)

        alert("¡Mundial pronosticado con éxito! Que ruede la pelota.");
        window.location.href = 'dashboard.html'; // Lo mandamos de vuelta a su panel

    } catch (error) {
        console.error("Error al guardar Mata-Mata:", error);
        alert("Hubo un problema al guardar tus pronósticos. Revisa tu conexión.");
        btnGuardarMataMata.disabled = false;
        btnGuardarMataMata.textContent = "Guardar Fase Final 🏆";
    }
});