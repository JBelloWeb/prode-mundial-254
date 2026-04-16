const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(!usuarioActivo){
    alert("Debes iniciar sesión");
    window.location.href = '../index.html';
}

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
        paisesASeguir.splice(i, 1);
    } else if(paisesASeguir.length == 4){
        paisesASeguir.splice(1, 1);
        paisesASeguir.push(pais) 
    } else {
        paisesASeguir.push(pais) 
    }
    actualizarSelecciones();
}

const cargameLosPaises = () =>{
    let index = 0;
    let ol = d.createElement('ol');
    for(let gruop of paises){
        let gr = d.createElement('li');
        gr.classList = "group";
        let name = d.createElement('h3');
        name.textContent = `GRUPO ${grupos[index]}`;
        index++;
        let integrantes = d.createElement('ul');
        integrantes.classList = "countries-container"
        gr.appendChild(name);
        gr.appendChild(integrantes);
        for(let p of gruop){
            let li = d.createElement('li');
            p === "Argentina" ? li.classList = "group-participant arg" : li.classList = "group-participant";
            if(p !== "Argentina"){
                li.addEventListener('click', () =>{
                elegirPaises(p);
                })
            }
            li.textContent = p;
            integrantes.appendChild(li);
        }
        ol.appendChild(gr);
        countries.appendChild(ol);
    }
}

cargameLosPaises();

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

    const partidos = generarPartidosUnicos();
    contenedorPartidos.innerHTML = "";

    partidos.forEach((partido, index) =>{
        const div = d.createElement('div');
        div.classList = "match-card";
        div.innerHTML = `
            <p><strong>Grupo ${partido.grupo}</strong></p>
            <div class="team-row">
                <span class="team-name">${partido.equipoA}</span>
                <input type="number" class="score-input" data-equipo="${partido.equipoA}" data-index="${index}" min="0" max="99" required placeholdes="0">
                <span class="team-name"> vs </span>
                <input type="number" class="score-input" data-equipo="${partido.equipoB}" data-index="${index}" min="0" max="99" required placeholdes="0">
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

            await supaClient.from('usuarios').update({ya_participo: true}).eq('id', usuarioActivo.id);

            alert("Predicciones guardadas con éxito");
            localStorage.removeItem('usuarioLogueado');
            window.location.href = '../index.html';
        } catch (error) {
            console.error("Error: ", error);
            alert("Hubo un problema al guardar");
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar Pronósticos";
        }
    });