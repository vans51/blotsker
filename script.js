/* ==========================================
   CONEXIÓN CON SUPABASE
========================================== */

const SUPABASE_URL = "https://adjsrdwgdfrfmaqsurvj.supabase.co";

const SUPABASE_CLAVE = "sb_publishable_Osiz28TUKWf-BGQDfXYJqg_I20hy7zb";

// Verificar biblioteca
if (!window.supabase) {
  throw new Error("No se encontró la biblioteca de Supabase.");
}

// Crear cliente
const clienteSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_CLAVE,
);

// Hacer accesible el cliente
window.clienteSupabase = clienteSupabase;

console.log(" Cliente Supabase inicializado.");

/* ==========================================
   FUNCIÓN DE PRUEBA DE CONEXIÓN
========================================== */

window.probarConexionSupabase = async function () {
  console.log("================================");
  console.log("PROBANDO CONEXIÓN CON SUPABASE");
  console.log("================================");

  try {
    const { data, error } = await clienteSupabase
      .from("categoria")
      .select("id, nombre_categoria")
      .limit(10);

    if (error) {
      console.error(" ERROR EN LA CONSULTA");
      console.error("Código:", error.code);
      console.error("Mensaje:", error.message);
      console.error("Detalles:", error.details);

      return false;
    }

    console.log("✅ CONEXIÓN EXITOSA");
    console.log("Categorías encontradas:", data.length);
    console.table(data);

    return true;
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:", error);

    return false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // ELEMENTOS PRINCIPALES
  // =========================================

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  const categoriesContainer = document.getElementById("categories-container");

  const servicesContainer = document.getElementById("services-container");

  const bookingModal = document.getElementById("booking-modal");

  const bookingForm = document.getElementById("booking-form");

  const serviceSelect = document.getElementById("service-select");

  const modalCloseBtn = document.getElementById("modal-close");

  const modalOverlay = document.querySelector(".modal-overlay");

  let serviciosGuardados = [];
  let categoriasGuardadas = [];

  // =========================================
  // FUNCIONES AUXILIARES
  // =========================================

  function escaparHTML(valor) {
    return String(valor ?? "").replace(
      /[&<>"']/g,
      (caracter) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[caracter],
    );
  }

  // =========================================
  // 1. MENÚ RESPONSIVO
  // =========================================

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }

  // =========================================
  // 2. CARGAR CATEGORÍAS Y SERVICIOS
  // =========================================

  async function cargarDatos() {
    try {
      const { data: categorias, error: errorCategorias } = await clienteSupabase
        .from("categoria")
        .select("id, nombre_categoria, imagenes_de_la_categoria")
        .order("id");

      if (errorCategorias) throw errorCategorias;

      const { data: servicios, error: errorServicios } = await clienteSupabase
        .from("servicios")
        .select(
          `
                        id_servicio,
                        nombre_servicio,
                        descripcion,
                        precio_bs,
                        categoria_id,
                        imagenes
                    `,
        )
        .order("id_servicio");

      if (errorServicios) throw errorServicios;

      categoriasGuardadas = categorias || [];
      serviciosGuardados = servicios || [];

      mostrarCategorias();
      mostrarServicios();

      llenarSelectorServicios();
    } catch (error) {
      console.error("Error cargando datos:", error);

      categoriesContainer.innerHTML =
        '<p class="empty-message">No se pudieron cargar las categorías.</p>';

      servicesContainer.innerHTML =
        '<p class="empty-message">No se pudieron cargar los servicios.</p>';
    }
  }

  // =========================================
  // 3. MOSTRAR CATEGORÍAS
  // =========================================

  function mostrarCategorias() {
    categoriesContainer.innerHTML = "";

    const botonTodos = document.createElement("button");

    botonTodos.className = "category-card active";

    botonTodos.innerHTML = `
            <span>Todos los servicios</span>
        `;

    botonTodos.addEventListener("click", () => {
      document
        .querySelectorAll(".category-card")
        .forEach((card) => card.classList.remove("active"));

      botonTodos.classList.add("active");

      mostrarServicios();
    });

    categoriesContainer.appendChild(botonTodos);

    categoriasGuardadas.forEach((categoria) => {
      const tarjeta = document.createElement("button");

      tarjeta.className = "category-card";

      // Como las imágenes están en tu carpeta local, las buscamos ahí
      const imagen = `categoria/${categoria.id}.png`;

      tarjeta.innerHTML = `
                <img src="${escaparHTML(imagen)}"
                     alt="${escaparHTML(categoria.nombre_categoria)}"
                     onerror="this.style.display='none'">

                <span>${escaparHTML(categoria.nombre_categoria)}</span>
            `;

      tarjeta.addEventListener("click", () => {
        document
          .querySelectorAll(".category-card")
          .forEach((card) => card.classList.remove("active"));

        tarjeta.classList.add("active");

        mostrarServicios(categoria.id);
      });

      categoriesContainer.appendChild(tarjeta);
    });
  }

  // =========================================
  // 4. MOSTRAR SERVICIOS
  // =========================================

  function mostrarServicios(categoriaId = null) {
    if (!servicesContainer) {
      console.error("No existe el elemento #services-container en tu HTML.");
      return;
    }

    servicesContainer.innerHTML = "";

    const serviciosFiltrados =
      categoriaId === null
        ? serviciosGuardados
        : serviciosGuardados.filter(
            (servicio) => Number(servicio.categoria_id) === Number(categoriaId),
          );

    if (serviciosFiltrados.length === 0) {
      servicesContainer.innerHTML = `
            <p class="empty-message">
                No hay servicios disponibles en esta categoría.
            </p>
        `;
      return;
    }

    serviciosFiltrados.forEach((servicio) => {
      const categoria = categoriasGuardadas.find(
        (cat) => Number(cat.id) === Number(servicio.categoria_id),
      );

      const tarjeta = document.createElement("div");
      tarjeta.className = "service-card";

      tarjeta.innerHTML = `
            ${
              servicio.imagenes
                ? `
                    <img
                        class="service-image"
                        src="${escaparHTML(servicio.imagenes)}"
                        alt="${escaparHTML(servicio.nombre_servicio)}"
                        onerror="this.style.display='none'"
                    >
                    `
                : ""
            }

            <div class="service-category">
                ${escaparHTML(categoria?.nombre_categoria || "Servicio")}
            </div>

            <h3>${escaparHTML(servicio.nombre_servicio)}</h3>

            <p>
                ${escaparHTML(servicio.descripcion || "Servicio disponible.")}
            </p>

            <div class="service-footer">
                <span class="price">
                    Bs ${Number(servicio.precio_bs).toFixed(2)}
                </span>

                <button
                    class="btn-select"
                    data-service-id="${Number(servicio.id_servicio)}">
                    Reservar
                </button>
            </div>
        `;

      tarjeta.querySelector(".btn-select").addEventListener("click", () => {
        abrirModal(servicio.id_servicio);
      });

      servicesContainer.appendChild(tarjeta);
    });
  }

  // =========================================
  // 5. SELECTOR DE SERVICIOS EN RESERVAS
  // =========================================

  function llenarSelectorServicios() {
    serviceSelect.innerHTML = `
            <option value="">-- Selecciona un servicio --</option>
        `;

    serviciosGuardados.forEach((servicio) => {
      const opcion = document.createElement("option");

      opcion.value = servicio.id_servicio;

      opcion.textContent = `${servicio.nombre_servicio} - Bs ${servicio.precio_bs}`;

      serviceSelect.appendChild(opcion);
    });
  }

  // =========================================
  // 6. MODAL DE RESERVACIONES
  // =========================================

  function abrirModal(idServicio = null) {
    bookingModal.classList.add("active");

    if (idServicio !== null) {
      serviceSelect.value = String(idServicio);
    }
  }

  document.querySelectorAll(".modal-open-btn").forEach((boton) => {
    boton.addEventListener("click", () => {
      abrirModal();
    });
  });

  function cerrarModal() {
    bookingModal.classList.remove("active");
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", cerrarModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", cerrarModal);
  }

  // =========================================
  // 7. GUARDAR RESERVACIÓN EN SUPABASE
  // =========================================

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botonEnviar = bookingForm.querySelector('[type="submit"]');

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Guardando reservación...";

    try {
      const nombre = document.getElementById("client-name").value.trim();

      const celular = document.getElementById("client-phone").value.trim();

      const fecha = document.getElementById("booking-date").value;

      const horario = document.getElementById("booking-time").value;

      const idServicio = Number(serviceSelect.value);

      const barbero = document.getElementById("barber-select").value;

      const servicio = serviciosGuardados.find(
        (item) => Number(item.id_servicio) === idServicio,
      );

      if (!servicio) {
        throw new Error("Selecciona un servicio válido.");
      }

      const nuevaReservacion = {
        nombre: nombre,
        celular: celular,
        horario: horario,
        dia_fecha: fecha,
        id_servicio: idServicio,
        barbero: barbero,
      };

      const { error } = await clienteSupabase
        .from("reservaciones")
        .insert([nuevaReservacion]);

      if (error) throw error;

      // Enviar confirmación por WhatsApp

      const telefonoBarberia = "59172795105";

      const mensaje =
        `¡Hola Vanguard Barber Studio! 👋\n\n` +
        `Deseo agendar una cita:\n\n` +
        `💈 Servicio: ${servicio.nombre_servicio}\n` +
        `✂️ Barbero: ${barbero}\n` +
        `📅 Fecha: ${fecha}\n` +
        `⏰ Hora: ${horario}\n\n` +
        `👤 Cliente: ${nombre}\n` +
        `📱 Teléfono: ${celular}`;

      const urlWhatsApp = `https://wa.me/${telefonoBarberia}?text=${encodeURIComponent(mensaje)}`;

      alert("¡Reservación guardada correctamente!");

      bookingForm.reset();

      cerrarModal();

      window.location.href = urlWhatsApp;
    } catch (error) {
      console.error("Error al guardar reservación:", error);

      alert("No se pudo guardar la reservación: " + error.message);
    } finally {
      botonEnviar.disabled = false;

      botonEnviar.innerHTML =
        'Confirmar y Enviar a WhatsApp <i class="fa-brands fa-whatsapp"></i>';
    }
  });

  // =========================================
  // 8. FILTROS DE GALERÍA EXISTENTE
  // =========================================

  const filterButtons = document.querySelectorAll(".filter-btn");

  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      const filtro = button.getAttribute("data-filter");

      galleryItems.forEach((item) => {
        item.style.display =
          filtro === "all" || item.getAttribute("data-category") === filtro
            ? "block"
            : "none";
      });
    });
  });

  // =========================================
  // 9. INICIAR SISTEMA
  // =========================================

  cargarDatos();
});
