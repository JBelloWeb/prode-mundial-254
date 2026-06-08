import { showToast } from './utils.js';

const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioString = localStorage.getItem('usuarioLogueado');

if(!usuarioString){
    showToast("Debes iniciar sesión para ver tu panel", "error");
    setTimeout(() => window.location.href = '../index.html', 2000);
    throw new Error('No autenticado');
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

bienvenida.textContent = `¡Hola, ${usuarioActivo.nombre}! Este es tu panel`;

const tabs = [btnTabPerfil, btnTabRanking];

const FASES = [
    { id: 'grupos', label: 'Fase de Grupos', minId: 33, maxId: 999 },
    { id: 'dieciseisavos', label: 'Dieciseisavos de Final', minId: 1, maxId: 16 },
    { id: 'octavos', label: 'Octavos de Final', minId: 17, maxId: 24 },
    { id: 'cuartos', label: 'Cuartos de Final', minId: 25, maxId: 28 },
    { id: 'semis', label: 'Semifinales', minId: 29, maxId: 30 },
    { id: 'tercer', label: 'Tercer Puesto', minId: 31, maxId: 31 },
    { id: 'final', label: 'Gran Final', minId: 32, maxId: 32 }
];

const LISTA_PROXIMOS_PARTIDOS = d.getElementById('listaProximosPartidos');

function determinarFase(partidoId) {
    for (const fase of FASES) {
        if (partidoId >= fase.minId && partidoId <= fase.maxId) return fase;
    }
    return null;
}

function activarTab(activo, inactivo) {
    activo.classList.add('tab-active');
    activo.classList.remove('tab-inactive');
    inactivo.classList.remove('tab-active');
    inactivo.classList.add('tab-inactive');
}

btnTabPerfil.addEventListener('click', () => {
    vistaPerfil.style.display = 'block';
    vistaRanking.style.display = 'none';
    activarTab(btnTabPerfil, btnTabRanking);
});

btnTabRanking.addEventListener('click', () => {
    vistaPerfil.style.display = 'none';
    vistaRanking.style.display = 'block';
    activarTab(btnTabRanking, btnTabPerfil);
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
            btnIrGrupos.classList.add('btn-completado');
        } else {
            btnIrGrupos.addEventListener('click', () => window.location.href = 'prode.html');
        }

        // 3. LÓGICA DE BOTONES: Mata-Mata
        if (usuarioData.fecha_envio_mata_mata) {
            btnIrMataMata.disabled = true;
            btnIrMataMata.textContent = "Mata-Mata Enviado ✅";
            btnIrMataMata.classList.add('btn-completado');
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

        const { data: rawPredicciones, error: errorRaw } = await supaClient
            .from('predicciones')
            .select('partido_id, equipo_a_pred, goles_a_pred, equipo_b_pred, goles_b_pred')
            .eq('usuario_id', usuarioActivo.id);
        if (errorRaw) throw errorRaw;

        const mapaPartidoId = new Map();
        if (rawPredicciones) {
            rawPredicciones.forEach(r => {
                const key = `${r.equipo_a_pred}|${r.goles_a_pred}|${r.equipo_b_pred}|${r.goles_b_pred}`;
                mapaPartidoId.set(key, r.partido_id);
            });
        }

        dibujarTablaPronosticos(prediccionesData, mapaPartidoId);

    } catch (error) {
        console.error("Error cargando perfil:", error);
    }
}

async function cargarProximosPartidos() {
    const FECHA_INICIO_MUNDIAL = '2026-06-11';
    const hoy = new Date();
    
    // Si hoy es anterior al 11 de junio, mostramos el 11. Si no, mostramos la fecha local de hoy.
    // Le agregamos la zona horaria de Argentina (-03:00) para evitar desfasajes al comparar.
    const fechaBusqueda = hoy < new Date(FECHA_INICIO_MUNDIAL + 'T00:00:00-03:00') 
        ? FECHA_INICIO_MUNDIAL 
        : hoy.toLocaleDateString('en-CA'); // 'en-CA' devuelve formato YYYY-MM-DD limpio

    try {
        // Armamos el rango para abarcar todo el día en la base de datos
        const inicioDelDia = `${fechaBusqueda} 00:00:00+00`;
        const finDelDia = `${fechaBusqueda} 23:59:59+00`;

        const { data: partidos, error } = await supaClient
            .from('partidos')
            .select('*')
            // Filtramos los que estén dentro de este rango de 24 horas
            .gte('fecha_partido', inicioDelDia)
            .lte('fecha_partido', finDelDia)
            .order('fecha_partido', { ascending: true });

        if (error) throw error;

        if (!partidos || partidos.length === 0) {
            LISTA_PROXIMOS_PARTIDOS.innerHTML = `<p class="cargando">No hay actividad programada para el ${fechaBusqueda}.</p>`;
            return;
        }

        let html = `<div class="fecha-grupo"><span class="fecha-grupo-titulo">Partidos del ${fechaBusqueda === FECHA_INICIO_MUNDIAL ? '11 de junio (Inicio Mundial)' : 'día'}</span></div>`;

        partidos.forEach(p => {
            // Al pasarle la fecha con "+00", JavaScript automáticamente la convierte a tu hora local (Argentina)
            const fechaPartido = new Date(p.fecha_partido); 
            const diffMs = fechaPartido.getTime() - Date.now();
            const diffMinutos = diffMs / 60000;

            let tagClass, tagText, resultado;
            const tieneResultado = p.goles_a_real !== null && p.goles_b_real !== null;

            // Extraemos la hora para mostrarla en la UI
            const horaLocalFormateada = fechaPartido.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

            if (tieneResultado) {
                tagClass = 'tag-finalizado'; tagText = 'Finalizado';
                resultado = `<strong>${p.goles_a_real} - ${p.goles_b_real}</strong>`;
            } else if (diffMinutos <= 0 && diffMinutos >= -105) {
                tagClass = 'tag-en-vivo'; tagText = 'En Vivo';
                resultado = `<span class="partido-vs">vs</span>`;
            } else {
                tagClass = 'tag-pendiente'; tagText = horaLocalFormateada; // En vez de decir "Pendiente", mostramos la hora del partido!
                resultado = `<span class="partido-vs">vs</span>`;
            }

            html += `
                <div class="partido-card">
                    <div class="partido-equipos">
                        ${p.equipo_a} ${resultado} ${p.equipo_b}
                    </div>
                    <span class="tag-estado ${tagClass}">${tagText}</span>
                </div>
            `;
        });

        LISTA_PROXIMOS_PARTIDOS.innerHTML = html;
    } catch (error) {
        console.error('Error cargando partidos:', error);
        LISTA_PROXIMOS_PARTIDOS.innerHTML = '<p class="cargando">Error al cargar la actividad.</p>';
    }
}

function dibujarTablaPronosticos(predicciones, mapaPartidoId) {
    if (!predicciones || predicciones.length === 0) {
        tablaPronosticos.innerHTML = "<p>Aún no has guardado ningún pronóstico.</p>";
        return;
    }

    const prediccionesConFase = predicciones.map(p => {
        const key = `${p.equipo_a_pred}|${p.goles_a_pred}|${p.equipo_b_pred}|${p.goles_b_pred}`;
        const partidoId = mapaPartidoId ? mapaPartidoId.get(key) : null;
        const fase = partidoId ? determinarFase(partidoId) : null;
        return { ...p, partidoId, fase };
    });

    const agrupadas = new Map();
    FASES.forEach(f => agrupadas.set(f.id, []));

    prediccionesConFase.forEach(p => {
        const faseId = p.fase ? p.fase.id : 'grupos';
        if (!agrupadas.has(faseId)) agrupadas.set(faseId, []);
        agrupadas.get(faseId).push(p);
    });

    const fasesConDatos = FASES.filter(f => (agrupadas.get(f.id) || []).length > 0);
    if (fasesConDatos.length === 0) {
        tablaPronosticos.innerHTML = "<p>Aún no has guardado ningún pronóstico.</p>";
        return;
    }

    let primerPendiente = null;
    for (const fase of fasesConDatos) {
        const items = agrupadas.get(fase.id);
        const tienePendientes = items.some(p => p.goles_a_real === null);
        if (tienePendientes) {
            primerPendiente = fase.id;
            break;
        }
    }
    if (!primerPendiente) primerPendiente = fasesConDatos[0].id;

    let html = '';
    fasesConDatos.forEach(fase => {
        const items = agrupadas.get(fase.id);
        const abierto = fase.id === primerPendiente;

        html += `
            <details class="acordeon-fase" ${abierto ? 'open' : ''}>
                <summary>${fase.label} <span class="col-pts">(${items.length} partidos)</span></summary>
                <div class="acordeon-contenido">
                    <table>
                        <thead>
                            <tr>
                                <th>Tu Pronóstico</th>
                                <th>Resultado Real</th>
                                <th class="col-pts">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        items.forEach(p => {
            const realA = p.goles_a_real !== null ? p.goles_a_real : '-';
            const realB = p.goles_b_real !== null ? p.goles_b_real : '-';

            const textoPronostico = `${p.equipo_a_pred} <strong>${p.goles_a_pred} - ${p.goles_b_pred}</strong> ${p.equipo_b_pred}`;

            let textoReal = '';
            let textoPuntos = '-';
            let claseFila = 'res-pendiente';

            if (p.goles_a_real !== null) {
                textoReal = `${p.equipo_a_pred} <strong>${realA} - ${realB}</strong> ${p.equipo_b_pred}`;
                textoPuntos = `+${p.puntos || 0}`;

                if (p.puntos === 5) claseFila = 'res-acierto-pleno';
                else if (p.puntos === 3) claseFila = 'res-acierto-diferencia';
                else if (p.puntos === 2) claseFila = 'res-acierto-parcial';
                else if (p.puntos === 0) claseFila = 'res-fallo';
            } else {
                textoReal = `<span style="color: gray;">Pendiente</span>`;
            }

            html += `
                            <tr class="${claseFila}">
                                <td>${textoPronostico}</td>
                                <td>${textoReal}</td>
                                <td class="col-pts">${textoPuntos}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </details>
        `;
    });

    tablaPronosticos.innerHTML = html;
}

async function cargarRanking() {
    try {
        const { data: rankingData, error } = await supaClient
            .from('ranking_prode')
            .select('*')
            .order('puntos_totales', { ascending: false }) // 1ro: Más puntos
            .order('aciertos_plenos', { ascending: false }) // 2do: Más plenos
            .order('fecha_desempate', { ascending: true, nullsFirst: false }); // 3ro: El más rápido gana

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
        
        const filaDestacada = jugador.usuario_id === usuarioActivo.id ? 'fila-destacada' : '';
        const nombreMostrar = jugador.usuario_id === usuarioActivo.id ? `${jugador.nombre} (Tú)` : jugador.nombre;

        const puntosMostrar = Number(jugador.puntos_totales).toFixed(1).replace('.0', ''); 

        html += `
            <tr class="${filaDestacada}">
                <td>${medalla}${posicion}</td>
                <td>${nombreMostrar}</td>
                <td><strong>${puntosMostrar}</strong></td>
                <td>${jugador.aciertos_plenos || 0}</td>
            </tr>
        `;
    });
    cuerpoTablaRanking.innerHTML = html;
}

btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '../index.html';
});

cargarPerfil();
cargarProximosPartidos();