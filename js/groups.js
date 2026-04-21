const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    alert("Debes iniciar sesión");
    window.location.href = '../index.html';
}

// Candado de seguridad: Verificar en la BD si ya mandó los grupos
async function verificarAccesoGrupos() {
    const { data, error } = await supaClient
        .from('usuarios')
        .select('fecha_envio_grupos')
        .eq('id', usuarioActivo.id)
        .single();

    if (data && data.fecha_envio_grupos) {
        alert("Ya completaste tus pronósticos de Fase de Grupos. No podés volver a ingresar.");
        window.location.href = 'dashboard.html';
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

const actualizarSelecciones = () =>{
    if(selections.firstChild) selections.firstChild.remove();
    let ul = d.createElement('ul');
    for(let p of paisesASeguir){
        let b = d.getElementById(p.toLowerCase());
        if(b) b.classList.add('selected');
        let li = d.createElement('li');
        li.textContent = p;
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
const codigosBanderas = {};


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
        cargameLosPaises();

    } catch (error) {
        console.error("Error al obtener banderas:", error);
        cargameLosPaises();
    }
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
            li.innerHTML = `<img src="https://flagcdn.com/16x12/${codigo}.png" alt="${p}" style="margin-right: 8px;"> ${p}`;
            integrantes.appendChild(li);
        }
        ol.appendChild(gr);
        countries.appendChild(ol);
    }
}

const generarPartidosUnicos = () =>{
    const partidosUnicos = new Map();

    paisesASeguir.forEach(pais =>{
        let indiceGrupo = paises.findIndex(grupo => grupo.includes(pais));

        if (indiceGrupo !== -1) {
            const letraGrupo = grupos[indiceGrupo];
            const equiposDelGrupo = paises[indiceGrupo];

            // Generamos los 3 partidos de este país
            equiposDelGrupo.forEach(rival => {
                if (rival !== pais) {
                    // Ordenamos alfabéticamente para crear una clave única (Ej: "Argelia-Argentina")
                    // Así evitamos que se duplique si el usuario elige dos del mismo grupo
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
            });
        }
    });
    return Array.from(partidosUnicos.values());
};

btnGenerar.addEventListener('click', () =>{
    if(paisesASeguir.length < 4) {
        alert("Por favor, selecciona 4 países en total antes de continuar");
        return;
    }

    seccionPronosticos.classList.remove('d-none')
    const partidos = generarPartidosUnicos();
    contenedorPartidos.innerHTML = "";

    partidos.forEach((partido, index) =>{
        const div = d.createElement('div');
        div.classList = "match-card";
        div.innerHTML = `
            <p><strong>Grupo ${partido.grupo}</strong></p>
            <div class="team-row">
                <span class="team-name">${partido.equipoA}</span>
                <input type="number" class="score-input" data-equipo="${partido.equipoA}" data-index="${index}" min="0" max="99" required placeholder="0">
                <span class="team-name"> vs </span>
                <input type="number" class="score-input" data-equipo="${partido.equipoB}" data-index="${index}" min="0" max="99" required placeholder="0">
                <span class="team-name">${partido.equipoB}</span>
                </div>
                <hr>
            `;
            contenedorPartidos.appendChild(div);
    });
    btnGuardar.disabled = false;
    seccionSeleccion.style.display = 'none';
    seccionPronosticos.style.display = 'block';
});

// ==========================================
// VALIDACIÓN ESTRICTA DE GOLES (Fase de Grupos)
// ==========================================
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
        const prediccionesParaSubir = [];
        const matchCards = contenedorPartidos.querySelectorAll('.match-card');
        matchCards.forEach(card =>{
            const inputs = card.querySelectorAll('.score-input');
            prediccionesParaSubir.push({
                usuario_id: usuarioActivo.id,
                equipo_a_pred: inputs[0].dataset.equipo,
                goles_a_pred: parseInt(inputs[0].value),
                equipo_b_pred: inputs[1].dataset.equipo,
                goles_b_pred: parseInt(inputs[1].value),
            });
        });
        console.log("Datos a enviar:", prediccionesParaSubir);
        const { error: errorPredicciones } = await supaClient
            .from ('predicciones')
            .insert(prediccionesParaSubir);
        if (errorPredicciones) throw errorPredicciones;
        // Guardamos la marca de tiempo exacta
        await supaClient.from('usuarios').update({ fecha_envio_grupos: new Date().toISOString() }).eq('id', usuarioActivo.id);
        alert("Predicciones guardadas con éxito");
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Error: ", error);
        alert("Hubo un problema al guardar");
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar Pronósticos";
    }
});