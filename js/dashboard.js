const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioString = localStorage.getItem('usuarioLogueado');

if(!usuarioString){
    alert("Debes iniciar sesión para ver tu panel");
    window.location.href = '../index.html';
}

const usuarioActivo = JSON.parse(usuarioString);

const d = document;
const bienvenida = d.getElementById('bienvenidaDashboard');
const spanTotales = d.getElementById('puntosTotales');
const spanPlenos = d.getElementById('puntosPlenos');
const spanParciales = d.getElementById('puntosParciales');
const listaEquipos = d.getElementById('listaEquipos');
const tablaPronosticos = d.getElementById('tablaPronosticos');
const btnCerrarSesion = d.getElementById('btnCerrarSesion');
const btnIrGrupos = d.getElementById('btnIrGrupos');
const btnIrMataMata = d.getElementById('btnIrMataMata');

// Referencias al DOM (Ranking y Pestañas)
const btnTabPerfil = d.getElementById('btnTabPerfil');
const btnTabRanking = d.getElementById('btnTabRanking');
const vistaPerfil = d.getElementById('vistaPerfil');
const vistaRanking = d.getElementById('vistaRanking');
const cuerpoTablaRanking = d.getElementById('cuerpoTablaRanking');

bienvenida.textContent = `¡Hola, ${usuarioActivo.nombre}! Este es tu resumen.`;

// 2. LÓGICA DE PESTAÑAS (Mostrar/Ocultar)
btnTabPerfil.addEventListener('click', () => {
    vistaPerfil.style.display = 'block';
    vistaRanking.style.display = 'none';
    btnTabPerfil.style.fontWeight = 'bold';
    btnTabRanking.style.fontWeight = 'normal';
    btnTabRanking.style.backgroundColor = '';
});

btnTabRanking.addEventListener('click', () => {
    vistaPerfil.style.display = 'none';
    vistaRanking.style.display = 'block';
    btnTabRanking.style.fontWeight = 'bold';
    btnTabPerfil.style.fontWeight = 'normal';
    btnTabPerfil.style.backgroundColor = '';
    
    cargarRanking(); 
});


async function cargarPerfil() {
    try {
        // 1. Traemos los equipos seguidos y LAS DOS FECHAS DE ENVÍO
        const { data: usuarioData, error: errorUser } = await supaClient
            .from('usuarios')
            .select('paises_seguidos, fecha_envio_grupos, fecha_envio_mata_mata')
            .eq('id', usuarioActivo.id)
            .single();
            
        if (errorUser) throw errorUser;

        // 2. LÓGICA DE BOTONES: Grupos
        if (usuarioData.fecha_envio_grupos) {
            btnIrGrupos.disabled = true;
            btnIrGrupos.textContent = "Grupos Enviado ✅";
            btnIrGrupos.style.backgroundColor = "#2d2d2d"; // Un gris oscuro estilo completado
            btnIrGrupos.style.color = "var(--text-muted)";
            btnIrGrupos.style.border = "1px solid var(--text-muted)";
        } else {
            btnIrGrupos.addEventListener('click', () => window.location.href = 'prode.html');
        }

        // 3. LÓGICA DE BOTONES: Mata-Mata
        if (usuarioData.fecha_envio_mata_mata) {
            btnIrMataMata.disabled = true;
            btnIrMataMata.textContent = "Mata-Mata Enviado ✅";
            btnIrMataMata.style.backgroundColor = "#2d2d2d"; 
            btnIrMataMata.style.color = "var(--text-muted)";
            btnIrMataMata.style.border = "1px solid var(--text-muted)";
        } else {
            btnIrMataMata.addEventListener('click', () => window.location.href = 'mata-mata.html');
        }

        // 4. Cargamos la lista de equipos seguidos (Lo que ya tenías)
        if (usuarioData.paises_seguidos && usuarioData.paises_seguidos.length > 0) {
            usuarioData.paises_seguidos.forEach(pais => {
                const li = d.createElement('li');
                li.textContent = pais;
                listaEquipos.appendChild(li);
            });
        }

        const { data: rankingData, error: errorRanking } = await supaClient
            .from('ranking_prode')
            .select('*')
            .eq('usuario_id', usuarioActivo.id)
            .maybeSingle();
        if (errorRanking) throw errorRanking;

        if (rankingData) {
            spanTotales.textContent = rankingData.puntos_totales || 0;
            spanPlenos.textContent = rankingData.aciertos_plenos || 0;
            spanParciales.textContent = rankingData.aciertos_parciales || 0;
        }

        const { data: prediccionesData, error: errorPredicciones } = await supaClient
            .from('vista_historial_predicciones')
            .select('*')
            .eq('usuario_id', usuarioActivo.id);
        if (errorPredicciones) throw errorPredicciones;

        dibujarTablaPronosticos(prediccionesData);

    } catch (error) {
        console.error("Error cargando perfil:", error);
    }
}

function dibujarTablaPronosticos(predicciones) {
    if (!predicciones || predicciones.length === 0) {
        tablaPronosticos.innerHTML = "<p>Aún no has guardado ningún pronóstico.</p>";
        return;
    }
    let html = `
        <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr><th style="padding: 10px;">Tu Pronóstico</th><th style="padding: 10px;">Resultado Real</th></tr>
            </thead>
            <tbody>
    `;
    predicciones.forEach(p => {
        let realA = p.goles_a_real !== null ? p.goles_a_real : "-";
        let realB = p.goles_b_real !== null ? p.goles_b_real : "-";
        const textoPronostico = `${p.equipo_a_pred} <strong>${p.goles_a_pred} - ${p.goles_b_pred}</strong> ${p.equipo_b_pred}`;
        const textoReal = p.goles_a_real !== null 
            ? `${p.equipo_a_pred} <strong>${realA} - ${realB}</strong> ${p.equipo_b_pred}`
            : `<span style="color: gray;">Pendiente</span>`;
        html += `<tr><td style="padding: 10px;">${textoPronostico}</td><td style="padding: 10px;">${textoReal}</td></tr>`;
    });
    html += `</tbody></table>`;
    tablaPronosticos.innerHTML = html;
}

async function cargarRanking() {
    try {
        const { data: rankingData, error } = await supaClient
            .from('ranking_prode')
            .select('*')
            .order('puntos_totales', { ascending: false })
            .order('aciertos_plenos', { ascending: false });

        if (error) throw error;
        dibujarTablaRanking(rankingData);

    } catch (error) {
        console.error("Error al cargar el ranking:", error);
        cuerpoTablaRanking.innerHTML = `<tr><td colspan="4" style="color:red;">Error al cargar.</td></tr>`;
    }
}

function dibujarTablaRanking(ranking) {
    cuerpoTablaRanking.innerHTML = ""; 
    if (!ranking || ranking.length === 0) return cuerpoTablaRanking.innerHTML = `<tr><td colspan="4">Aún no hay jugadores.</td></tr>`;

    let html = "";
    ranking.forEach((jugador, index) => {
        const posicion = index + 1;
        let medalla = posicion === 1 ? "🥇 " : posicion === 2 ? "🥈 " : posicion === 3 ? "🥉 " : "";
        
        const estiloFila = jugador.usuario_id === usuarioActivo.id ? 'font-weight: bold;' : '';
        const nombreMostrar = jugador.usuario_id === usuarioActivo.id ? `${jugador.nombre} (Tú)` : jugador.nombre;

        html += `
            <tr style="${estiloFila}">
                <td style="padding: 10px;">${medalla}${posicion}</td>
                <td style="padding: 10px; text-align: left;">${nombreMostrar}</td>
                <td style="padding: 10px;"><strong>${jugador.puntos_totales || 0}</strong></td>
                <td style="padding: 10px;">${jugador.aciertos_plenos || 0}</td>
            </tr>
        `;
    });
    cuerpoTablaRanking.innerHTML = html;
}

btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = 'index.html';
});

cargarPerfil();