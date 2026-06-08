export const Toast = (mensaje, color) =>{
    let container = document.getElementById('toastContainer');
    let toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;    
    toast.style = `--context-color: ${color}`; 

    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

const COLORES_TOAST = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
};

window.showToast = (mensaje, tipo) => {
    Toast(mensaje, COLORES_TOAST[tipo] || COLORES_TOAST.info);
};