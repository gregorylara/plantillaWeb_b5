// ===== PORTFOLIO FUNCTIONS =====

// Función para hacer zoom del iframe
function zoomIframe(button) {
    const iframe = button.closest('.iframe-container').querySelector('iframe');
    const modal = document.getElementById('zoomModal');
    const zoomedIframe = document.getElementById('zoomedIframe');
    
    zoomedIframe.src = iframe.src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el zoom
function closeZoom() {
    const modal = document.getElementById('zoomModal');
    const zoomedIframe = document.getElementById('zoomedIframe');
    
    modal.style.display = 'none';
    zoomedIframe.src = '';
    document.body.style.overflow = 'auto';
}

// Función para abrir proyecto en nueva pestaña
function openProject(url) {
    window.open(url, '_blank');
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeZoom();
    }
});
