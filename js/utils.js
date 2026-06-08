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