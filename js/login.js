import { showToast } from './utils.js';

const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

/*
=== MODO DEMO: VERIFICACIÓN DE SESIÓN ===
Originalmente esto redirigía al dashboard si ya había un usuario logueado en localStorage.
En modo demo, ese comportamiento se mantiene (por si alguien ya tenía sesión),
pero también se permite el acceso sin login.
*/
const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(usuarioActivo){
    window.location.href = 'pages/dashboard.html';
}

const d = document;
const reglas = d.getElementById('reglas');
const formulario = d.getElementById('loginForm');
const mensaje = d.getElementById('mensaje');
const btnIngresar = d.getElementById('btnIngresar');
const btnVisitante = d.getElementById('btnVisitante');
const btnDeAcuerdo = d.getElementById('btnDeAcuerdo');
const btnReglas = d.getElementById('btnReglas');
const clave = d.getElementById('clave');
const icon = d.getElementById('claveIcon');
const marado = d.getElementById('maradonaOk');

/*
=== MODO DEMO: ACCESO SIN LOGIN ===
Botón "Ingresar como Visitante" — guarda un usuario demo en localStorage
y redirige al dashboard. Permite explorar todo el prode sin autenticación.
En modo demo las escrituras a DB están deshabilitadas (solo se simulan).
*/
btnVisitante.addEventListener('click', () => {
    localStorage.setItem('usuarioLogueado', JSON.stringify({
        id: 1,
        nombre: "Visitante"
    }));
    marado.classList.remove('d-none');
    showToast('🔓 Bienvenido al Modo Demo. Podés explorar pero nada se guarda.', 'info');
    setTimeout(() => {
        window.location.href = 'pages/dashboard.html';
    }, 2000);
});

/*
=== FORMULARIO DE LOGIN (producción) ===
En producción esto consultaba la tabla `usuarios` de Supabase
con email + clave para autenticar al usuario.
En modo demo, si alguien completa el formulario, se simula el acceso
con un usuario genérico sin validar contra la base de datos.
*/
formulario.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const emailTry = d.getElementById('email').value.trim();
    const claveTry = clave.value.trim();

    btnIngresar.disabled = true;
    showToast('🔓 Modo Demo: Accediendo sin validación de credenciales...', 'info');

    /*
    === CONSULTA A SUPABASE (deshabilitada en demo) ===
    Originalmente:
    const { data: usuarioEncontrado, error } = await supaClient
        .from('usuarios')
        .select('*')
        .eq('email', emailTry)
        .eq('clave', claveTry)
        .maybeSingle();
    if(error) throw error;
    if(!usuarioEncontrado){ ... error ... return; }
    */

    // En demo, simulamos un ingreso exitoso sin importar las credenciales
    setTimeout(() => {
        marado.classList.remove('d-none');
        showToast('🔓 Demo: Acceso simulado. Redirigiendo al panel', 'success');

        /*
        === GUARDADO EN LOCALSTORAGE ===
        Originalmente guardaba id y nombre real del usuario encontrado en DB.
        En demo se guarda un usuario genérico.
        */
        localStorage.setItem('usuarioLogueado', JSON.stringify({
            id: 1,
            nombre: "Visitante"
        }));

        setTimeout(() => {
            window.location.href = 'pages/dashboard.html';
        }, 2000);
    }, 500);
});

const viewRules = (abierto) =>{
    if(abierto){
        reglas.classList.add("d-none");
        btnReglas.classList= 'd-flex';
    } else{
        reglas.classList.remove("d-none");
        btnReglas.classList= 'd-none';
    }
}

const iconManager = (see) =>{
    see ? icon.classList.add("fa-eye-slash") : icon.classList.add("fa-eye");
    see ? icon.classList.remove("fa-eye") : icon.classList.remove("fa-eye-slash");
    clave.type = see ? "text" : "password";
}

icon.addEventListener('click', () =>{
    iconManager(clave.type === "password" ? true : false);
});

btnDeAcuerdo.addEventListener('click', () => {
    viewRules(true);
});

btnReglas.addEventListener('click', () => {
    viewRules(false);
});

