const supaUrl = "https://juuwwrzrxensvjjzlpha.supabase.co";
const supaKey = "sb_publishable_v38rCE76Ze5wCobL1uBT9Q_Vs_xxUmU";
const supaClient = window.supaClient || (window.supabase ? window.supabase.createClient(supaUrl, supaKey) : null);
window.supaClient = supaClient;

const formulario = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');
const btnIngresar = document.getElementById('btnIngresar');

formulario.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const emailTry = document.getElementById('email').value.trim();
    const claveTry = document.getElementById('clave').value.trim();

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

        mensaje.textContent = "¡Ingreso exitoso! Redirigiendo...";
        mensaje.className = "exito"; //--------------------------> Vincular clase 🟢  

        localStorage.setItem('usuarioLogueado', JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre    
            }));

        setTimeout(() => {
            window.location.href = 'prode.html';
        }, 1000);
    } catch (error){
        console.error("Error: ", error);
        mensaje.textContent = "Hubo un error al conectar con la base de datos";
        mensaje.className = "error"; //--------------------------> Vincular clase 🟢  
        btnIngresar.disabled = false;
    }
});