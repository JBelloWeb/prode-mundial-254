const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

// Si ya hay una sesión activa, lo mandamos directo a su panel
const usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado'));
if(usuarioActivo){
    window.location.href = 'pages/dashboard.html'; 
}

const d = document;
const reglas = d.getElementById('reglas');
const formulario = d.getElementById('loginForm');
const mensaje = d.getElementById('mensaje');
const btnIngresar = d.getElementById('btnIngresar');
const btnReglas = d.getElementById('btnReglas');
const clave = d.getElementById('clave');
const icon = d.getElementById('claveIcon');
const marado = d.getElementById('maradonaOk');

formulario.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const emailTry = d.getElementById('email').value.trim();
    const claveTry = clave.value.trim();

    btnIngresar.disabled = true;
    mensaje.classList.remove("d-none");
    mensaje.textContent = "Verficando credenciales...";

    try{
        const { data: usuarioEncontrado, error } = await supaClient
            .from('usuarios')
            .select('*')
            .eq('email', emailTry)
            .eq('clave', claveTry)
            .maybeSingle();

        if(error) throw error;

        if(!usuarioEncontrado){
            mensaje.classList.remove("d-none");
            mensaje.textContent = "❗ Email o Clave incorrectos";
            btnIngresar.disabled = false;
            return;
        }

        // ¡Ingreso Exitoso para TODOS!
        marado.classList.remove('d-none');
        mensaje.textContent = "✔ ¡Bienvenido/a! Redirigiendo a tu panel..."; 

        localStorage.setItem('usuarioLogueado', JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre
        }));

        setTimeout(() => {
            window.location.href = 'pages/dashboard.html'; 
        }, 3000);

    } catch (error){
        console.error("Error: ", error);
        mensaje.classList.remove("d-none");
        mensaje.textContent = "Hubo un error al conectar con la base de datos";
        btnIngresar.disabled = false;
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

icon.addEventListener('click', () =>{
    if(clave.type === "password"){
        clave.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else{
        clave.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
});