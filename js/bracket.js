const d = document;


const matches = d.querySelectorAll('.match-card');
const miniMap = d.getElementById('bracket');

let selected = null;

// 1. Creamos el contenedor del minimapa
let figure = d.createElement('figure');
figure.className = 'figure-container';

// 2. ESTADO INICIAL: Placeholder de texto en lugar de una imagen rota
figure.innerHTML = `
    <div id="minimap-placeholder">
        <i class="fa-solid fa-ranking-star"></i><br>
        Definí las posiciones de los grupos para ver el mapa
    </div>
`;
miniMap.appendChild(figure);

// 3. Función para actualizar el minimapa cuando se scrollea/clickea un partido
const updateMiniMap = (match) => {
    // Buscamos si la imagen ya existe
    let img = figure.querySelector('img');
    
    // Si no existe (es decir, todavía está el texto), borramos el texto y creamos la etiqueta <img>
    if (!img) {
        figure.innerHTML = ''; 
        img = d.createElement('img');
        figure.appendChild(img);
    }
    
    // Actualizamos la ruta de la imagen (Asegurate de que esta carpeta sea la correcta)
    img.src = `../assets/bracket/${match.id.replace('match-', '')}.png`; 
}

for(let m of matches){
    m.addEventListener('click', () =>{
        let deselect = d.querySelector('.focus-match');
        if(deselect) deselect.classList.remove('focus-match');
        selected = m;
        m.classList.add('focus-match');
        updateMiniMap(m);

        m.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    })
}

const faseObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -75% 0px',
    threshold: 0
};

const faseObserver = new IntersectionObserver((entries) =>{
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            d.querySelectorAll('.nav-fase-link').forEach(link => {
               link.classList.remove('active'); 
            });

            const activeLink = d.querySelector(`.nav-fase-link[href="#${entry.target.id}"]`);
            if(activeLink) activeLink.classList.add('active');
        }
    });
}, faseObserverOptions);

d.querySelectorAll('.fase-container').forEach(fase => {
    faseObserver.observe(fase);
});

// INTERSECTION OBSERVER (Scroll)
const observerOptions = {
    root: null, 
    rootMargin: '-40% 0px -40% 0px', 
    threshold: 0 
};

const matchObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let currentMatch = entry.target;
            
            if (selected === currentMatch) return;

            let deselect = d.querySelector('.focus-match');
            if(deselect) deselect.classList.remove('focus-match');
            
            selected = currentMatch;
            currentMatch.classList.add('focus-match');
            
            updateMiniMap(currentMatch);
        }
    });
}, observerOptions);

matches.forEach(m => {
    matchObserver.observe(m);
});