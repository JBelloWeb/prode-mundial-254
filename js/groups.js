import { showToast } from './utils.js';

const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    showToast('Debes iniciar sesión', 'error');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
}

// Candado de seguridad: Verificar en la BD si ya mandó los grupos
async function verificarAccesoGrupos() {
    const { data, error } = await supaClient
        .from('usuarios')
        .select('fecha_envio_grupos')
        .eq('id', usuarioActivo.id)
        .single();

    if (data && data.fecha_envio_grupos) {
        showToast('Ya completaste tus pronósticos de Fase de Grupos. No podés volver a ingresar.', 'warning');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    }
}
verificarAccesoGrupos();

const flagApi = "https://flagcdn.com/16x12/";
const flagCodesApi = "https://flagcdn.com/es/codes.json";

const d = document;

const seccionSeleccion = d.getElementById('seccionSeleccion');
const seccionPronosticos = d.getElementById('seccionPronosticos');
const countries = d.getElementById('countrySelector');
const selections = d.getElementById('elecciones');
const btnGenerar = d.getElementById('btnGenerarFormulario');
const btnGuardar = d.getElementById('btnGuardar');
      btnGuardar.disabled = true;
const contenedorPartidos = d.getElementById('contenedorPartidos');
const formGrupos = d.getElementById('formGrupos');
const codigosBanderas = {};

const grupos = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const paises = [
  ["México", "Sudáfrica", "Corea del Sur", "Chequia"],         // Grupo A
  ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],        // Grupo B
  ["Brasil", "Marruecos", "Haití" ,"Escocia"],                 // Grupo C
  ["Estados Unidos", "Paraguay", "Australia", "Turquía"],      // Grupo D
  ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],       // Grupo E
  ["Países Bajos", "Japón", "Suecia", "Túnez"],                // Grupo F
  ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],              // Grupo G
  ["España","Cabo Verde", "Arabia Saudita", "Uruguay"],        // Grupo H
  ["Francia", "Senegal", "Irak", "Noruega"],                   // Grupo I
  ["Argentina", "Argelia", "Austria", "Jordania"],             // Grupo J
  ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],          // Grupo K
  ["Inglaterra", "Croacia", "Ghana", "Panamá"]                 // Grupo L
];
const paisesASeguir = ["Argentina"];

const minBosnia = (p) =>{
    let n = p === "Bosnia y Herzegovina" ? "Bosnia" : p;
    return n;
}

const actualizarSelecciones = () =>{
    if(selections.firstChild) selections.firstChild.remove();
    let ul = d.createElement('ul');
    for(let p of paisesASeguir){
        let n = minBosnia(p);
        let b = d.getElementById(p.toLowerCase());
        if(b) b.classList.add('selected');
        let li = d.createElement('li');
        switch(paisesASeguir.indexOf(n)){
            case 3:
                li.textContent = n;
                break;

            default:
                li.textContent = `${n} |`;
                break;
        }
        ul.appendChild(li);
    }
    selections.appendChild(ul);
}

actualizarSelecciones();

const elegirPaises = (pais) =>{
    if(paisesASeguir.includes(pais)){
        let i = paisesASeguir.indexOf(pais);
        let b = d.getElementById(pais.toLowerCase());
        if(b) b.classList.remove('selected');
        paisesASeguir.splice(i, 1);
    } else if(paisesASeguir.length == 4){
        let b = d.getElementById(paisesASeguir[1].toLowerCase());
        if(b) b.classList.remove('selected');
        paisesASeguir.splice(1, 1);
        paisesASeguir.push(pais) 
    } else {
        paisesASeguir.push(pais) 
    }
    actualizarSelecciones();
}

const getCodes = async () => {
    try {
        const response = await fetch(flagCodesApi);
        const data = await response.json();

        const excepciones = {
            "Chequia": "cz",
            "Arabia Saudita": "sa",
            "Corea del Sur": "kr",
            "RD Congo": "cd",
            "Países Bajos": "nl",
            "Estados Unidos": "us"
        };

        paises.forEach(grupo => {
            grupo.forEach(pais => {
                let match = Object.entries(data).find(([key, value]) => value.toLowerCase() === pais.toLowerCase());

                if (match) {
                    codigosBanderas[pais] = match[0];
                } else if (excepciones[pais]) {
                    codigosBanderas[pais] = excepciones[pais];
                } else {
                    console.warn(`No encontré el código para: ${pais}`);
                    codigosBanderas[pais] = "un";
                }
            });
        });
        console.log("Códigos de banderas obtenidos:", codigosBanderas);

    } catch (error) {
        console.error("Error al obtener banderas:", error);
    }
    cargameLosPaises();
}
getCodes();

const cargameLosPaises = () =>{
    let index = 0;
    let ol = d.createElement('ol');

    for(let group of paises){
        let gr = d.createElement('li');
        gr.classList = "group";
        let name = d.createElement('h3');
        name.textContent = `GRUPO ${grupos[index]}`;
        index++;
        let integrantes = d.createElement('ul');
        integrantes.classList = "countries-container"
        gr.appendChild(name);
        gr.appendChild(integrantes);

        for(let p of group){
            let li = d.createElement('li');
            p == "Argentina" ? li.classList = "group-participant selected" : li.classList = "group-participant";
            li.id = p.toLowerCase();

            if(p !== "Argentina"){
                li.addEventListener('click', () =>{
                    elegirPaises(p);
                })
            }

            let codigo = codigosBanderas[p];
            let n = minBosnia(p);
            li.innerHTML = `<img src="https://flagcdn.com/16x12/${codigo}.png" alt="${p}">${n}`;
            integrantes.appendChild(li);
        }

        ol.appendChild(gr);
        countries.appendChild(ol);
    }
}

const generarPartidosUnicos = () =>{
    const partidosUnicos = new Map();

    for(let pais of paisesASeguir){
        let indiceGrupo = paises.findIndex(grupo => grupo.includes(pais));
        if (indiceGrupo !== -1) {
            const letraGrupo = grupos[indiceGrupo];
            const equiposDelGrupo = paises[indiceGrupo];

            for(let rival of equiposDelGrupo){
                if (rival !== pais) {
                    const parOrdenado = [pais, rival].sort();
                    const clave = `${parOrdenado[0]}-vs-${parOrdenado[1]}`;

                    if (!partidosUnicos.has(clave)) {
                        partidosUnicos.set(clave, {
                            grupo: letraGrupo,
                            equipoA: parOrdenado[0],
                            equipoB: parOrdenado[1]
                        });
                    }
                }
            }
        }
    }
    return Array.from(partidosUnicos.values());
};

btnGenerar.addEventListener('click', () =>{
    if(paisesASeguir.length < 4) {
        showToast('Por favor, selecciona 4 países en total antes de continuar', 'warning');
        return;
    }

    seccionPronosticos.classList.remove('d-none')
    const partidos = generarPartidosUnicos();
    contenedorPartidos.innerHTML = "";

    partidos.forEach((partido, index) =>{
        let eA = minBosnia(partido.equipoA);
        let eB = minBosnia(partido.equipoB);

        const div = d.createElement('div');
        div.classList = "match-card";
        div.innerHTML = `
            <p><strong>Grupo ${partido.grupo}</strong></p>
            <div class="team-row">
                <div class="team-column-A">
                <span class="team-name">${eA}</span>
                <input type="number" class="score-input" data-equipo="${partido.equipoA}" data-index="${index}" min="0" max="99" required placeholder="0">
                </div>
                <span class="team-name"> vs </span>
                <div class="team-column-B">
                <span class="team-name">${eB}</span>
                <input type="number" class="score-input" data-equipo="${partido.equipoB}" data-index="${index}" min="0" max="99" required placeholder="0">
                </div>
                </div>
                <hr>
            `;
            contenedorPartidos.appendChild(div);
    });
    btnGuardar.disabled = false;
    seccionSeleccion.style.display = 'none';
    seccionPronosticos.style.display = 'block';
});

d.addEventListener('input', (e) => {
    // Si el elemento donde están escribiendo es un input de goles...
    if (e.target.classList.contains('score-input')) {
        
        // 1. Evitamos que ingresen el signo menos o la letra 'e'
        if (e.data === '-' || e.data === 'e') {
            e.target.value = "";
        }
        
        // 2. Si hay un número, lo limpiamos y forzamos los límites
        if (e.target.value !== "") {
            // parseInt(..., 10) limpia los ceros a la izquierda ("05" -> 5)
            let valor = parseInt(e.target.value, 10); 
            
            // Forzamos los límites (0 a 99)
            if (valor < 0) valor = 0;
            if (valor > 99) valor = 99;
            
            // Reasignamos el valor limpio al cajoncito
            e.target.value = valor; 
        }
    }
});

formGrupos.addEventListener('submit', async (e) =>{
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando respuestas...";
    try{
        const { error: errorUsuario } = await supaClient
            .from('usuarios')
            .update({ paises_seguidos: paisesASeguir })
            .eq('id', usuarioActivo.id);
        if(errorUsuario) throw errorUsuario;

        const mapaIdsGrupos = {
            // Grupo A
            "México-vs-Sudáfrica": 33,
            "Chequia-vs-Corea del Sur": 34,
            "Chequia-vs-Sudáfrica": 36,
            "Corea del Sur-vs-México": 35,
            "Chequia-vs-México": 37,
            "Corea del Sur-vs-Sudáfrica": 38,

            // Grupo B
            "Bosnia y Herzegovina-vs-Canadá": 39,
            "Catar-vs-Suiza": 40,
            "Bosnia y Herzegovina-vs-Suiza": 42,
            "Canadá-vs-Catar": 41,
            "Canadá-vs-Suiza": 43,
            "Bosnia y Herzegovina-vs-Catar": 44,

            // Grupo C
            "Brasil-vs-Marruecos": 45,
            "Escocia-vs-Haití": 46,
            "Escocia-vs-Marruecos": 48,
            "Brasil-vs-Haití": 47,
            "Brasil-vs-Escocia": 49,
            "Haití-vs-Marruecos": 50,

            // Grupo D
            "Estados Unidos-vs-Paraguay": 51,
            "Australia-vs-Turquía": 52,
            "Australia-vs-Estados Unidos": 53,
            "Paraguay-vs-Turquía": 54,
            "Estados Unidos-vs-Turquía": 55,
            "Australia-vs-Paraguay": 56,

            // Grupo E
            "Alemania-vs-Curazao": 57,
            "Costa de Marfil-vs-Ecuador": 58,
            "Alemania-vs-Costa de Marfil": 59,
            "Curazao-vs-Ecuador": 60,
            "Costa de Marfil-vs-Curazao": 62,
            "Alemania-vs-Ecuador": 61,

            // Grupo F
            "Japón-vs-Países Bajos": 63,
            "Suecia-vs-Túnez": 64,
            "Países Bajos-vs-Suecia": 65,
            "Japón-vs-Túnez": 66,
            "Japón-vs-Suecia": 68,
            "Países Bajos-vs-Túnez": 67,

            // Grupo G
            "Bélgica-vs-Egipto": 69,
            "Irán-vs-Nueva Zelanda": 70,
            "Bélgica-vs-Irán": 71,
            "Egipto-vs-Nueva Zelanda": 72,
            "Egipto-vs-Irán": 74,
            "Bélgica-vs-Nueva Zelanda": 73,

            // Grupo H
            "Cabo Verde-vs-España": 75,
            "Arabia Saudita-vs-Uruguay": 76,
            "Arabia Saudita-vs-España": 77,
            "Cabo Verde-vs-Uruguay": 78,
            "España-vs-Uruguay": 79,
            "Arabia Saudita-vs-Cabo Verde": 80,

            // Grupo I
            "Francia-vs-Senegal": 81,
            "Irak-vs-Noruega": 82,
            "Francia-vs-Irak": 83,
            "Noruega-vs-Senegal": 84,
            "Irak-vs-Senegal": 86,
            "Francia-vs-Noruega": 85,

            // Grupo J
            "Argelia-vs-Argentina": 87,
            "Austria-vs-Jordania": 88,
            "Argentina-vs-Austria": 89,
            "Argelia-vs-Jordania": 90,
            "Argentina-vs-Jordania": 91,
            "Argelia-vs-Austria": 92,

            // Grupo K
            "Portugal-vs-RD Congo": 93,
            "Colombia-vs-Uzbekistán": 94,
            "Portugal-vs-Uzbekistán": 95,
            "Colombia-vs-RD Congo": 96,
            "Colombia-vs-Portugal": 97,
            "RD Congo-vs-Uzbekistán": 98,

            // Grupo L
            "Croacia-vs-Inglaterra": 99,
            "Ghana-vs-Panamá": 100,
            "Ghana-vs-Inglaterra": 101,
            "Croacia-vs-Panamá": 102,
            "Inglaterra-vs-Panamá": 103,
            "Croacia-vs-Ghana": 104
        };

       const prediccionesParaSubir = [];
        const matchCards = contenedorPartidos.querySelectorAll('.match-card');
        
        for(let card of matchCards){
            const inputs = card.querySelectorAll('.score-input');
            
            // 1. Obtener los equipos de los inputs
            let eqA = inputs[0].dataset.equipo;
            let eqB = inputs[1].dataset.equipo;
            
            // 2. Generar la clave igual a como está en tu mapa (alfabéticamente)
            let parOrdenado = [eqA, eqB].sort();
            let clave = `${parOrdenado[0]}-vs-${parOrdenado[1]}`;
            
            // 3. Buscar el ID en tu mapa
            let idPartidoGrupo = mapaIdsGrupos[clave] || null;

            // 4. Ahora sí, pushear al array
            prediccionesParaSubir.push({
                usuario_id: usuarioActivo.id,
                partido_id: idPartidoGrupo,
                equipo_a_pred: eqA,
                goles_a_pred: parseInt(inputs[0].value),
                equipo_b_pred: eqB,
                goles_b_pred: parseInt(inputs[1].value),
            });
        }
       
        console.log("Datos a enviar:", prediccionesParaSubir);

        // Upsert para evitar duplicados si ya existen predicciones previas
        const { error: errorPredicciones } = await supaClient
            .from('predicciones')
            .upsert(prediccionesParaSubir, { onConflict: 'usuario_id,partido_id' });
        if (errorPredicciones) throw errorPredicciones;

        // Guardamos la marca de tiempo exacta
        await supaClient.from('usuarios').update({ fecha_envio_grupos: new Date().toISOString() }).eq('id', usuarioActivo.id);
        showToast('Predicciones guardadas con éxito', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    } catch (error) {
        console.error("Error: ", error);
        showToast('Hubo un problema al guardar', 'error');
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar Pronósticos";
    }
});