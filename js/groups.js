const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const d = document;

const countries = d.getElementById('countrySelector');
const selections = d.getElementById('elecciones');

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
    selections.firstChild.remove();
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