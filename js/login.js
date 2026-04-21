const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const d = document;
const reglas = d.getElementById('reglas');
const formulario = d.getElementById('loginForm');
const mensaje = d.getElementById('mensaje');
const btnIngresar = d.getElementById('btnIngresar');
const clave = d.getElementById('clave');
const icon = d.getElementById('claveIcon');
const marado = d.getElementById('maradonaOk');

formulario.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const emailTry = d.getElementById('email').value.trim();
    const claveTry = clave.value.trim();

    btnIngresar.disabled = true;
    mensaje.textContent = "Verficando credenciales...";
    mensaje.className = "";

    try{
        const { data: usuarioEncontrado, error } = await supaClient
            .from('usuarios')
            .select('*')
            .eq('email', emailTry)
            .eq('clave', claveTry)
            .maybeSingle();

        if(error) throw error;

        if(!usuarioEncontrado){
            mensaje.textContent = "Email o Clave incorrectos";
            mensaje.className = "error"; //--------------------------> Vincular clase 🟢  
            btnIngresar.disabled = false;
            return;
        }

        // if(usuarioEncontrado.ya_participo === true) {
        //     mensaje.textContent = "Acceso denegado: Ya enviaste tu pronóstico previamente.";
        //     mensaje.className = "error"; //--------------------------> Vincular clase 🟢  
        //     btnIngresar.disabled = false;
        //     return;
        // }

        if(usuarioEncontrado.ya_participo === true) {
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre
            }));

            mensaje.textContent = "¡Bienvenido/a de vuelta! Redirigiendo a tu panel...";
            mensaje.className = "exito"; //--------------------------> Vincular clase 🟢
            
            setTimeout(() =>{
                window.location.href = '../pages/dashboard.html';
            }, 1000);
            return;
        }
        marado.classList.remove('d-none');
        mensaje.textContent = "¡Ingreso exitoso! Redirigiendo...";
        mensaje.className = "exito"; //--------------------------> Vincular clase 🟢  

        localStorage.setItem('usuarioLogueado', JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre    
            }));

        setTimeout(() => {
            window.location.href = 'pages/prode.html';
        }, 3000);
    } catch (error){
        console.error("Error: ", error);
        mensaje.textContent = "Hubo un error al conectar con la base de datos";
        mensaje.className = "error"; //--------------------------> Vincular clase 🟢  
        btnIngresar.disabled = false;
    }
});

const viewRules = (abierto) =>{
    abierto ? reglas.classList.add("d-none") : reglas.classList.remove("d-none");
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