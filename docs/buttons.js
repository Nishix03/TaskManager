/*
    Codigo JS para los botones de la app
    -------------------------------------------------------------------------
    Organización:
    1. Selectores y Variables Globales
    2. Inicialización (Carga de datos)
    3. Event Listeners (Delegación de eventos)
    4. Funciones Lógicas (Añadir, Editar, Borrar)
    5. Persistencia de Datos (LocalStorage & JSON) - EXPLICACIÓN DETALLADA
*/

console.log("App is running...");

// ==========================================================================
// 1. SELECTORES Y VARIABLES GLOBALES
// ==========================================================================
const taskList = document.querySelector(".task__list");     // Contenedor de la lista (ul)
/** @type {HTMLInputElement} */
const addInput = document.querySelector(".add__input");     // Input de texto
const appContent = document.querySelector(".app__content"); // Sección principal
const bodyOfHtml = document.querySelector("body");          // Body para el tema
const AppTitle = document.querySelector(".app__title"); // Titulo de la app
let user = "Nishix_03";
// ==========================================================================
// 2. INICIALIZACIÓN
// ==========================================================================
// Al cargar la página, recuperamos lo que estaba guardado (Tareas y Tema)
loadUser(user);
loadTasks();


// ==========================================================================
// 3. EVENT LISTENERS (Delegación de Eventos)
// ==========================================================================
/* 
   Usamos "Event Delegation" (Delegación de Eventos):
   En lugar de poner un 'onclick' a cada botón (que puede no existir aún),
   escuchamos los clicks en todo el 'body'. Cuando ocurre un click,
   verificamos DÓNDE ocurrió (event.target) y actuamos.
*/
bodyOfHtml.addEventListener("click", (event) => {

    event.preventDefault(); // Detiene comportamientos automáticos (como recargar form)

    // closest() busca hacia arriba el elemento padre más cercano que coincida
    const IndividualTask = event.target.closest("li"); // ¿Click dentro de una tarea?

    // Identificar botón específico
    const isAddBtn = event.target.closest(".task__button--add");
    const isDarkModeBtn = event.target.closest(".darkmode__button");
    const isDeleteBtn = event.target.closest(".task__button--delete");
    const isEditBtn = event.target.closest(".task__button--edit");

    if (isAddBtn) {
        addTask(); // Lógica para añadir
    } else if (IndividualTask && isDeleteBtn) {
        deleteTask(IndividualTask); // Lógica para borrar item específico
    } else if (IndividualTask && isEditBtn) {
        editTask(IndividualTask); // Lógica para editar item específico
    } else if (isDarkModeBtn) {
        toggleDarkMode(); // Lógica para cambiar tema
    }
});


// ==========================================================================
// 4. FUNCIONES LÓGICAS (Core)
// ==========================================================================

//Cargar usuario 
function loadUser(user = null) {
    //Si viene un usuario, lo guardamos en localStorage
    if (user !== null) {
        localStorage.setItem("user", user);
        AppTitle.textContent = `Welcome back, ${user}!`;

    } else {
        //Si no viene un usuario, lo buscamos en localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            AppTitle.textContent = `Welcome back, ${savedUser}!`;
        }
    }
}

// Verifica si la lista está vacía para mostrar el mensaje "No tasks registered"
function checkEmptyList() {
    const tasks = taskList.querySelectorAll(".task__item");
    const defaultItem = document.querySelector(".default__task__item");

    if (tasks.length === 0 && !defaultItem) {
        const defaultMessage = document.createElement("p");
        defaultMessage.className = "default__task__item";
        defaultMessage.textContent = "You have no tasks registered";
        taskList.append(defaultMessage);
        checkEmptyList()
    }
}

/**
 * Función Principal para AÑADIR TAREAS
 * @param {string|null} taskString - (Opcional) Texto proveniente de LocalStorage
 * @param {boolean} save - (Opcional) ¿Debemos guardar en memoria? (Default: true)
 */
function addTask(taskString = null, save = true) {
    let taskText = "";

    if (taskString) {
        // Opción A: Viene de la memoria (Carga automática)
        taskText = taskString;
    } else {
        // Opción B: Viene del usuario (Input manual)
        taskText = addInput.value.trim();
    }

    // Validación 1: Texto vacío
    if (taskText.length === 0) {
        console.log("Error: Input is empty");
        return;
    }

    // Validación 2: Duplicados (Solo si es ingreso manual)
    if (save) {
        const allTaskNames = document.querySelectorAll(".task__name");
        const isDuplicate = Array.from(allTaskNames).some(task => task.textContent === taskText);

        if (isDuplicate) {
            alert("This task already exists.");
            return;
        }
    }

    // --- CREACIÓN DE ELEMENTOS HTML (DOM) ---
    // Limpiamos mensaje empty si existe
    const defaultItem = document.querySelector(".default__task__item");
    if (defaultItem) defaultItem.remove();

    // 1. Crear el nombre
    const newTaskName = document.createElement("p");
    newTaskName.className = "task__name";
    newTaskName.textContent = taskText;

    // 2. Crear botones e iconos
    const newDelBtIcon = document.createElement("i");
    newDelBtIcon.className = "fa-solid fa-x";

    const newEditBtIcon = document.createElement("i");
    newEditBtIcon.className = "fa-solid fa-pen";

    const newTaskBtDelete = document.createElement("button");
    newTaskBtDelete.textContent = "Delete";
    newTaskBtDelete.className = "task__button task__button--delete";
    newTaskBtDelete.append(newDelBtIcon);

    const newTaskBtEdit = document.createElement("button");
    newTaskBtEdit.textContent = "Edit";
    newTaskBtEdit.className = "task__button task__button--edit";
    newTaskBtEdit.append(newEditBtIcon);

    const newTaskBtContainer = document.createElement("div");
    newTaskBtContainer.className = "task__buttons__container";
    newTaskBtContainer.append(newTaskBtDelete, newTaskBtEdit);

    // 3. Crear el Item Padre (li) y ensamblar todo
    const newTaskItem = document.createElement("li");
    newTaskItem.className = "task__item";

    newTaskItem.append(newTaskName);     // Texto primero
    newTaskItem.append(newTaskBtContainer); // Botones después

    // 4. Insertar en la lista visual
    taskList.append(newTaskItem);

    // --- GUARDADO ---
    // Solo guardamos si 'save' es true (evita bucle infinito al cargar)
    if (save) {
        saveTaskOnLocalStorage(taskText);
        addInput.value = ""; // Limpiar input
        console.log("New task added and saved: " + taskText);
    }
}


function editTask(IndividualTask) {
    const taskNameElement = IndividualTask.querySelector(".task__name");
    const oldName = taskNameElement.textContent;
    const editedTaskName = prompt("Edit task name:", oldName);

    if (editedTaskName && editedTaskName.trim().length > 0) {
        taskNameElement.textContent = editedTaskName.trim();
        // IMPORTANTE: Al editar el DOM, debemos actualizar también la memoria
        updateLocalStorage();
        console.log("Item edited.");
    }
}

function deleteTask(IndividualTask) {
    if (confirm("Delete this task?")) {
        IndividualTask.remove();
        checkEmptyList(); // Verificar si quedó vacía
        // IMPORTANTE: Al borrar del DOM, debemos borrar de memoria
        updateLocalStorage();
        console.log("Task deleted.");
    }
}

function toggleDarkMode() {
    const DarkModeBtn = document.querySelector(".darkmode__button");

    if (!bodyOfHtml.hasAttribute("data-theme")) {
        // Activar Dark Mode
        bodyOfHtml.setAttribute("data-theme", "dark");
        DarkModeBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i> Darkmode: On';
        localStorage.setItem("theme", "dark"); // Guardar preferencia
    } else {
        // Activar Light Mode
        bodyOfHtml.removeAttribute("data-theme");
        DarkModeBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i> Darkmode: Off';
        localStorage.setItem("theme", "light"); // Guardar preferencia
    }
}


// ==========================================================================
// 5. PERSISTENCIA DE DATOS (LocalStorage & JSON)
// ==========================================================================
/*
    EXPLICACÍON TÉCNICA:
    LocalStorage es una base de datos simple del navegador que solo guarda Strings (Texto).
    No "entiende" arrays ni objetos. Por eso usamos JSON (JavaScript Object Notation):
    
    array JS: ["Tarea 1", "Tarea 2"]  ---> JSON.stringify ---> texto: "['Tarea 1','Tarea 2']"
    texto: "['Tarea 1','Tarea 2']"  ---> JSON.parse     ---> array JS: ["Tarea 1", "Tarea 2"]
*/

/**
 * Guarda SOLO una nueva tarea al final de la lista existente
 */
function saveTaskOnLocalStorage(taskText) {
    // 1. OBTENER: Traemos lo que hay guardado.
    //    Si "tasks" es null (no hay nada), usamos "[]" (array vacío como string).
    //    JSON.parse() convierte ese texto en Array real.
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    // 2. MODIFICAR: Empujamos el nuevo texto al array.
    tasks.push(taskText);

    // 3. GUARDAR: Convertimos el array modificado a Texto plano y guardamos.
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Actualiza TODA la memoria basándose en lo que se ve en pantalla.
 * Se usa tras Editar o Eliminar items, ya que es difícil modificar 
 * solo un item específico del string guardado.
 */
function updateLocalStorage() {
    const allTasks = document.querySelectorAll(".task__name");
    const tasksArray = [];

    // Leemos todo lo que hay en pantalla actualmente
    allTasks.forEach(task => {
        tasksArray.push(task.textContent);
    });

    // Sobrescribimos el localStorage con la nueva versión completa
    localStorage.setItem("tasks", JSON.stringify(tasksArray));
}

/**
 * Función Maestra de Carga: Restaura el estado de la aplicación
 */
function loadTasks() {
    // A. Cargar Tareas
    const taskArray = JSON.parse(localStorage.getItem("tasks") || "[]"); // Texto -> Array

    // Recorremos el array y por cada texto, creamos la tarea visual.
    // 'false' significa "No vuelvas a guardar esto", para evitar duplicados.
    taskArray.forEach((taskText) => addTask(taskText, false));

    // B. Cargar Tema (Dark/Light)
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
        bodyOfHtml.setAttribute("data-theme", "dark");
        const DarkModeBtn = document.querySelector(".darkmode__button");
        if (DarkModeBtn) DarkModeBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i> Darkmode: On';
    }
}
