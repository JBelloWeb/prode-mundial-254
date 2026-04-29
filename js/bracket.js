const matches = d.querySelectorAll('.match-card');
const miniMap = d.getElementById('bracket');
const url = '../media/brackets/';

let selected = null;
let p = d.createElement('p');
p.style = 'color: white;' 
miniMap.appendChild(p);

const updateMiniMap = (match) =>{
    p.textContent = match.id.replace('match-', 'Partido '); 
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

// 2. NUEVA LÓGICA: INTERSECTION OBSERVER (Scroll)
// Configuramos el área de observación
const observerOptions = {
    root: null, // Null significa que usa el viewport (la ventana del navegador)
    
    // rootMargin: crea márgenes imaginarios. 
    // "-40% 0px -40% 0px" significa que solo considerará que la tarjeta está 
    // "en pantalla" cuando cruce por el 20% central de la pantalla.
    rootMargin: '-40% 0px -40% 0px', 
    
    threshold: 0 // Se dispara apenas el elemento toca ese margen central
};

const matchObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Si la tarjeta entra en nuestra zona central definida...
        if (entry.isIntersecting) {
            let currentMatch = entry.target;
            
            // Evitamos hacer el proceso si ya está seleccionada
            if (selected === currentMatch) return;

            // Removemos la clase de la tarjeta anterior
            let deselect = d.querySelector('.focus-match');
            if(deselect) deselect.classList.remove('focus-match');
            
            // Asignamos a la nueva
            selected = currentMatch;
            currentMatch.classList.add('focus-match');
            
            // Actualizamos el minimapa
            updateMiniMap(currentMatch);
        }
    });
}, observerOptions);

// Ponemos a observar a todas las tarjetas de partido
matches.forEach(m => {
    matchObserver.observe(m);
});