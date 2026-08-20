// Orden de las pestañas
const tabs = ['inicio', 'proyectos', 'trayectoria'];

// Configuración inicial de la altura al cargar la página
window.onload = () => {
    adjustHeight('inicio');
};

function switchTab(tabId) {
    const index = tabs.indexOf(tabId);
    const wrapper = document.getElementById('slider-wrapper');
    
    // 1. Mover la "cinta" a los lados usando translateX
    wrapper.style.transform = `translateX(-${index * 100}%)`;
    
    // 2. Cambiar opacidad de las secciones
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // 3. Actualizar menú visualmente
    document.querySelectorAll('.tab-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('data-target') === tabId) {
            link.classList.add('active');
        }
    });

    // 4. Ajustar la altura al contenido actual
    adjustHeight(tabId);

    // 5. Hacer un scroll suave hacia arriba (ideal para móviles)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para adaptar la altura del contenedor principal
function adjustHeight(tabId) {
    const wrapper = document.getElementById('slider-wrapper');
    const activeSection = document.getElementById(tabId);
    wrapper.style.height = activeSection.scrollHeight + 'px';
}

// Lógica de los filtros de proyectos (ya la tenías)
function filterProjects(event, category) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const projects = document.querySelectorAll('.project-card');
    projects.forEach(project => {
        if (category === 'todos' || project.classList.contains(category)) {
            project.style.display = 'block';
        } else {
            project.style.display = 'none';
        }
    });

    setTimeout(() => adjustHeight('proyectos'), 100);
}

