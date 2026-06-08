import { showToast } from './utils.js';

const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(usuarioActivo){
    window.location.href = 'pages/dashboard.html'; 
}

const d = document;
const reglas = d.getElementById('reglas');
const formulario = d.getElementById('loginForm');
const mensaje = d.getElementById('mensaje');
const btnIngresar = d.getElementById('btnIngresar');
const btnDeAcuerdo = d.getElementById('btnDeAcuerdo');
const btnReglas = d.getElementById('btnReglas');
const clave = d.getElementById('clave');
const icon = d.getElementById('claveIcon');
const marado = d.getElementById('maradonaOk');

formulario.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const emailTry = d.getElementById('email').value.trim();
    const claveTry = clave.value.trim();

    btnIngresar.disabled = true;
    showToast('Verificando credenciales...', 'info');

    try{
        const { data: usuarioEncontrado, error } = await supaClient
            .from('usuarios')
            .select('*')
            .eq('email', emailTry)
            .eq('clave', claveTry)
            .maybeSingle();

        if(error) throw error;

        if(!usuarioEncontrado){
            btnIngresar.disabled = false;
            showToast('Email o Clave incorrectos', 'error');
            return;
        }

        marado.classList.remove('d-none');
        showToast('¡Bienvenido/a! Redirigiendo a tu panel', 'success');

        localStorage.setItem('usuarioLogueado', JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre
        }));

        setTimeout(() => {
            window.location.href = 'pages/dashboard.html'; 
        }, 2500);

    } catch (error){
        console.error("Error: ", error);
        btnIngresar.disabled = false;
        showToast('Hubo un error al conectar con la base de datos', 'error');
    }
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

