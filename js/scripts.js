// Estado de la aplicación
let trainings = JSON.parse(localStorage.getItem('trainings')) || [];

// Array con los tipos de entrenamiento y sus colores
const trainingTypes = [
    { value: 'cardio', text: 'Cardio', backgroundColor: '#e8f3ff', textColor: '#0066cc' },
    { value: 'fuerza', text: 'Fuerza', backgroundColor: '#ffeef0', textColor: '#c00d27' },
    { value: 'flexibilidad', text: 'Flexibilidad', backgroundColor: '#e8f7ef', textColor: '#248a3d' },
    { value: 'mixto', text: 'Mixto', backgroundColor: '#f2e8ff', textColor: '#5856d6' }
];

// Función para guardar los entrenamientos en localStorage
function saveTrainings() {
    localStorage.setItem('trainings', JSON.stringify(trainings));
}

// Función para añadir un nuevo entrenamiento
function addTraining(newTraining) {
    trainings.push(newTraining);
    saveTrainings();
}

// Función para actualizar un entrenamiento existente
function updateTraining(updatedTraining) {
    trainings = trainings.map(training => training.id === updatedTraining.id ? updatedTraining : training);
    saveTrainings();
}

// Función para generar las opciones del select
function populateTrainingTypes() {
    const trainingTypeSelect = document.getElementById('trainingType');
    trainingTypeSelect.innerHTML = ''; // Limpiar opciones existentes

    trainingTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.text;
        trainingTypeSelect.appendChild(option);
    });
}

// Llamar a la función para generar las opciones al cargar la página
document.addEventListener('DOMContentLoaded', populateTrainingTypes);

// Función para obtener los colores de un tipo de entrenamiento
function getTrainingTypeColors(type) {
    const trainingType = trainingTypes.find(t => t.value === type);
    return trainingType ? { backgroundColor: trainingType.backgroundColor, textColor: trainingType.textColor } : {};
}

// Funciones del calendario
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Días en el mes actual

    // Ajustar el primer día de la semana para que empiece en lunes
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    // Añadir días vacíos al principio del mes
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }

    // Generar días del mes
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = i;
        day.appendChild(dayNumber);

        const date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const dayTrainings = trainings.filter(t => t.date === date);

        dayTrainings.forEach(training => {
            const trainingElement = document.createElement('div');
            trainingElement.className = `training-item ${training.type}`;
            if (training.completed) trainingElement.classList.add('completed');
            trainingElement.textContent = training.title.slice(0, 1);

            const { backgroundColor, textColor } = getTrainingTypeColors(training.type);
            trainingElement.style.backgroundColor = backgroundColor;
            trainingElement.style.color = textColor;

            day.appendChild(trainingElement);
        });

        day.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openModal(date);
        });

        calendar.appendChild(day);
    }

    const lastDayOfTheMonth = new Date(currentYear, currentMonth + 1, 0).getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Ajustar el primer día de la semana para que empiece en lunes
    const adjustedLastDay = (lastDayOfTheMonth === 0) ? 0 : 7 - lastDayOfTheMonth;

    // Añadir días vacíos al principio del mes
    for (let i = 0; i < adjustedLastDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }

    // Actualizar el nombre del mes
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('calendarMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
    renderTrainingList();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
    renderTrainingList();
}

// Funciones de la lista de entrenamientos
function renderTrainingList() {
    const list = document.getElementById('trainingList');
    list.innerHTML = '';

    const currentMonthTrainings = trainings.filter(training => {
        const [year, month] = training.date.split('-');
        return parseInt(year) === currentYear && parseInt(month) === currentMonth + 1;
    });

    if(currentMonthTrainings.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No hay entrenamientos este mes';
        list.appendChild(emptyMessage);
    }

    currentMonthTrainings.forEach(training => {
        const item = document.createElement('div');
        item.addEventListener('click', () => openEditModal(training));
        item.className = 'training-list-item';
        
        const info = document.createElement('div');
        info.innerHTML = `
            <strong>${training.title}</strong><br>
            <small>${training.date} - ${training.type}</small>
        `;

        const actions = document.createElement('div');
        actions.className = 'training-actions';
        
        const completeButton = document.createElement('button');
        completeButton.textContent = training.completed ? '✓' : '○';
        completeButton.onclick = (e) => {
            e.stopPropagation(); // Detener la propagación del evento click
            toggleComplete(training.id);
        };
        completeButton.classList.add('list-item-button');

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑';
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Detener la propagación del evento click
            deleteTraining(training.id);
        };
        deleteButton.classList.add('list-item-button');

        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        item.appendChild(info);
        item.appendChild(actions);
        list.appendChild(item);
    });
}

let editingTrainingId = null;

function openEditModal(training) {
    const modal = document.getElementById('addTrainingModal');
    const trainingDateInput = document.getElementById('trainingDate');
    const trainingTitleInput = document.getElementById('trainingTitle');
    const trainingDescriptionInput = document.getElementById('trainingDescription');
    const trainingTypeSelect = document.getElementById('trainingType');
    const trainingDurationInput = document.getElementById('trainingDuration');

    trainingDateInput.value = training.date;
    trainingTitleInput.value = training.title;
    trainingDescriptionInput.value = training.description;
    trainingTypeSelect.value = training.type;
    trainingDurationInput.value = training.duration;

    editingTrainingId = training.id;

    modal.style.display = 'block';
}

// Funciones de gestión de entrenamientos
function toggleComplete(id) {
    trainings = trainings.map(training =>
        training.id === id ? {...training, completed: !training.completed} : training
    );
    saveTrainings();
    renderCalendar();
    renderTrainingList();
}

function deleteTraining(id) {
    trainings = trainings.filter(training => training.id !== id);
    saveTrainings();
    renderCalendar();
    renderTrainingList();
}

// Funciones del modal
function openModal(date) {
    const modal = document.getElementById('addTrainingModal');
    const trainingDateInput = document.getElementById('trainingDate');
    const trainingTitleInput = document.getElementById('trainingTitle');
    const trainingDescriptionInput = document.getElementById('trainingDescription');
    const trainingTypeSelect = document.getElementById('trainingType');
    const trainingDurationInput = document.getElementById('trainingDuration');

    trainingDateInput.value = date || '';
    trainingTitleInput.value = '';
    trainingDescriptionInput.value = '';
    trainingTypeSelect.value = '';
    trainingDurationInput.value = '';

    editingTrainingId = null;

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('addTrainingModal');
    modal.style.display = 'none';
}

document.getElementById('addTrainingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (editingTrainingId) {
        const updatedTraining = {
            id: editingTrainingId,
            title: document.getElementById('trainingTitle').value,
            date: document.getElementById('trainingDate').value,
            type: document.getElementById('trainingType').value,
            description: document.getElementById('trainingDescription').value,
            duration: document.getElementById('trainingDuration').value,
            completed: trainings.find(t => t.id === editingTrainingId).completed
        };
        updateTraining(updatedTraining);
    }
    else {

        const newTraining = {
            id: trainings.length + 1,
            title: document.getElementById('trainingTitle').value,
            date: document.getElementById('trainingDate').value,
            type: document.getElementById('trainingType').value,
            description: document.getElementById('trainingDescription').value,
            duration: document.getElementById('trainingDuration').value,
            completed: false
        };
        
        addTraining(newTraining);
    }

    renderCalendar();
    renderTrainingList();
    closeModal();
    this.reset();
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = toast.className.replace(`show ${type}`, '');
    }, 3000);
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (localStorage.getItem(username)) {
        showToast('El usuario ya existe', 'error');
        return;
    }

    const encryptedPassword = btoa(password); // Encriptar la contraseña
    localStorage.setItem(username, encryptedPassword);
    showToast('Usuario registrado correctamente', 'success');
    showLogin();
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const storedPassword = localStorage.getItem(username);
    if (storedPassword && storedPassword === btoa(password)) {
        showToast('Inicio de sesión exitoso', 'success');
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';

        if (rememberMe) {
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPassword', storedPassword);
        } else {
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
        }
    } else {
        showToast('Usuario o contraseña incorrectos', 'error');
    }
});

function showRegister() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'flex';
}

function showLogin() {
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('addTrainingModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializar el calendario y la lista de entrenamientos
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderTrainingList();
    calculateStatistics();

    // Verificar si hay credenciales guardadas para login automático
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedUsername && savedPassword) {
        autoLogin(savedUsername, savedPassword);
    }
});

function autoLogin(username, password) {
    const storedPassword = localStorage.getItem(username);
    if (storedPassword && storedPassword === password) {
        showToast('Inicio de sesión automático exitoso', 'success');
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }
}

document.getElementById('loadJsonButton').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const importedTrainings = JSON.parse(e.target.result);
                trainings = [...trainings, ...importedTrainings];
                saveTrainings();
                renderCalendar();
                renderTrainingList();
                calculateStatistics();
                showToast('Entrenamientos cargados correctamente', 'success');
            };
            reader.readAsText(file);
        }
    };
    input.click();
});

document.getElementById('deleteAllButton').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los entrenamientos?')) {
        trainings = [];
        saveTrainings();
        renderCalendar();
        renderTrainingList();
        calculateStatistics();
        showToast('Todos los entrenamientos han sido eliminados', 'success');
    }
});

function showScreen(screenId, tabId) {
    document.getElementById('calendarScreen').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';

    document.getElementById('calendarTab').classList.remove('active');
    document.getElementById('statsTab').classList.remove('active');
    document.getElementById('settingsTab').classList.remove('active');
    document.getElementById(tabId).classList.add('active');

    // Mostrar u ocultar el botón para añadir entrenamiento
    if (screenId === 'calendarScreen') {
        document.getElementById('addTrainingButton').style.display = 'flex';
    } else {
        document.getElementById('addTrainingButton').style.display = 'none';
    }

    // Calcular estadísticas si se muestra la pantalla de estadísticas
    if (screenId === 'statsScreen') {
        calculateStatistics();
    }
}

function calculateStatistics(period = 'week') {
    const now = new Date();
    let filteredTrainings = [];

    if (period === 'week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
        filteredTrainings = trainings.filter(training => {
            const trainingDate = new Date(training.date);
            return trainingDate >= startOfWeek && trainingDate <= endOfWeek;
        });
    } else if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filteredTrainings = trainings.filter(training => {
            const trainingDate = new Date(training.date);
            return trainingDate >= startOfMonth && trainingDate <= endOfMonth;
        });
    } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        filteredTrainings = trainings.filter(training => {
            const trainingDate = new Date(training.date);
            return trainingDate >= startOfYear && trainingDate <= endOfYear;
        });
    }

    const totalTrainings = filteredTrainings.length;
    const completedTrainings = filteredTrainings.filter(training => training.completed).length;

    const trainingsByType = filteredTrainings.reduce((acc, training) => {
        acc[training.type] = acc[training.type] || { total: 0, completed: 0 };
        acc[training.type].total += 1;
        if (training.completed) {
            acc[training.type].completed += 1;
        }
        return acc;
    }, {});

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const trainingsByMonth = filteredTrainings.reduce((acc, training) => {
        const month = new Date(training.date).getMonth();
        acc[month] = acc[month] || { total: 0, completed: 0 };
        acc[month].total += 1;
        if (training.completed) {
            acc[month].completed += 1;
        }
        return acc;
    }, {});

    const totalCompletedDuration = filteredTrainings.reduce((acc, training) => {
        return acc + (training.completed ? parseFloat(training.duration || 0) : 0);
    }, 0);

    const averageDuration = (totalCompletedDuration / completedTrainings).toFixed(2);

    const weeks = new Set(filteredTrainings.map(training => {
        const date = new Date(training.date);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((date - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNumber}`;
    })).size;

    const averageTrainingsPerWeek = (totalTrainings / weeks).toFixed(2);

    document.getElementById('totalTrainings').textContent = `${completedTrainings} / ${totalTrainings}`;
    document.getElementById('trainingsByType').innerHTML = Object.entries(trainingsByType)
        .map(([type, counts]) => `<li class="training-type" style="background-color: ${getTypeColor(type)}">${capitalize(type)}: ${counts.completed} / ${counts.total}</li>`).join('');
    document.getElementById('trainingsByMonth').innerHTML = Object.entries(trainingsByMonth)
        .map(([month, counts]) => `<li>${monthNames[month]}: ${counts.completed} / ${counts.total}</li>`).join('');
    document.getElementById('totalDuration').textContent = `${totalCompletedDuration.toFixed(2)} horas`;
    document.getElementById('averageDuration').textContent = `${averageDuration} horas`;
    document.getElementById('averageTrainingsPerWeek').textContent = averageTrainingsPerWeek;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeColor(type) {
    const colors = {
        "cardio": "#ff9999",
        "fuerza": "#99ccff",
        "flexibilidad": "#99ff99"
        // Añade más tipos y colores según sea necesario
    };
    return colors[type.toLowerCase()] || "#cccccc";
}

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    renderTrainingList();
    calculateStatistics();

    // Verificar si hay credenciales guardadas para login automático
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedUsername && savedPassword) {
        autoLogin(savedUsername, savedPassword);
    }
});

function autoLogin(username, password) {
    const storedPassword = localStorage.getItem(username);
    if (storedPassword && storedPassword === password) {
        showToast('Inicio de sesión automático exitoso', 'success');
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }
}

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('savedUsername');
    localStorage.removeItem('savedPassword');
    showToast('Sesión cerrada correctamente', 'success');
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
});

document.getElementById('loadJsonButton').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const importedTrainings = JSON.parse(e.target.result);
                trainings = [...trainings, ...importedTrainings];
                saveTrainings();
                renderCalendar();
                renderTrainingList();
                calculateStatistics();
                showToast('Entrenamientos cargados correctamente', 'success');
            };
            reader.readAsText(file);
        }
    };
    input.click();
});

document.getElementById('deleteAllButton').addEventListener('click', function() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los entrenamientos?')) {
        trainings = [];
        saveTrainings();
        renderCalendar();
        renderTrainingList();
        calculateStatistics();
        showToast('Todos los entrenamientos han sido eliminados', 'success');
    }
});

function showScreen(screenId, tabId) {
    document.getElementById('calendarScreen').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';

    document.getElementById('calendarTab').classList.remove('active');
    document.getElementById('statsTab').classList.remove('active');
    document.getElementById('settingsTab').classList.remove('active');
    document.getElementById(tabId).classList.add('active');

    // Mostrar u ocultar el botón para añadir entrenamiento
    if (screenId === 'calendarScreen') {
        document.getElementById('addTrainingButton').style.display = 'flex';
    } else {
        document.getElementById('addTrainingButton').style.display = 'none';
    }

    // Calcular estadísticas si se muestra la pantalla de estadísticas
    if (screenId === 'statsScreen') {
        calculateStatistics();
    }
}

function changeStatsTab(tabId) {
    switch(tabId){
        case 'week':
            document.getElementById('stats-tab-week').classList.add('active-stats-tab');
            document.getElementById('stats-tab-month').classList.remove('active-stats-tab');
            document.getElementById('stats-tab-year').classList.remove('active-stats-tab');
            calculateStatistics('week');
            break;
        case 'month':
            document.getElementById('stats-tab-week').classList.remove('active-stats-tab');
            document.getElementById('stats-tab-month').classList.add('active-stats-tab');
            document.getElementById('stats-tab-year').classList.remove('active-stats-tab');
            calculateStatistics('month');
            break;
        case 'year':
            document.getElementById('stats-tab-week').classList.remove('active-stats-tab');
            document.getElementById('stats-tab-month').classList.remove('active-stats-tab');
            document.getElementById('stats-tab-year').classList.add('active-stats-tab');
            calculateStatistics('year');
    }
}