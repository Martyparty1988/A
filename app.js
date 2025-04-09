// Aplikace pro pracovní výkazy a finance

// Globální proměnné
const APP_DATA = {
    workLogs: [],
    financeRecords: [],
    taskCategories: [],
    expenseCategories: [],
    debts: [],
    debtPayments: [],
    rentSettings: { amount: 0, day: 1 }
};

// Stav časovače
const timerState = {
    running: false,
    startTime: null,
    pausedTime: 0,
    timerInterval: null,
    person: 'maru',
    activity: '',
    note: '',
    rates: {
        'maru': 275,
        'marty': 400
    }
};

// Po načtení dokumentu inicializujeme aplikaci
document.addEventListener('DOMContentLoaded', function() {
    // Inicializace aplikace
    initApp();
});

// Inicializace aplikace
function initApp() {
    // Nastavení aktuálního roku v patičce
    document.getElementById('footer-year').textContent = new Date().getFullYear();
    
    // Inicializace lokálního úložiště
    initializeLocalStorage();
    
    // Načtení dat z lokálního úložiště
    loadDataFromLocalStorage();
    
    // Inicializace navigace
    initNavigation();
    
    // Inicializace časovače
    initTimer();
    
    // Inicializace formulářů
    initManualEntryForm();
    initFinanceForm();
    initDebtForms();
    
    // Inicializace filtrů a přehledů
    initFilters();
    initCharts();
    
    // Inicializace exportů
    initExports();
    
    // Inicializace nastavení
    initSettings();
    
    // Zobrazení dat
    displayWorkLogs();
    displayFinanceRecords();
    displayDeductions();
    displayDebts();
    updateDebtOptions();
    
    // Nastavení aktuálního data do formulářů
    setCurrentDateToForms();
}

// Inicializace lokálního úložiště
function initializeLocalStorage() {
    if (!localStorage.getItem('workLogs')) {
        localStorage.setItem('workLogs', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('financeRecords')) {
        localStorage.setItem('financeRecords', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('taskCategories')) {
        const defaultTaskCategories = ['Administrativa', 'Marketing', 'Programování', 'Grafika', 'Schůzky'];
        localStorage.setItem('taskCategories', JSON.stringify(defaultTaskCategories));
    }
    
    if (!localStorage.getItem('expenseCategories')) {
        const defaultExpenseCategories = ['Bydlení', 'Jídlo', 'Doprava', 'Zábava', 'Ostatní'];
        localStorage.setItem('expenseCategories', JSON.stringify(defaultExpenseCategories));
    }
    
    if (!localStorage.getItem('debts')) {
        localStorage.setItem('debts', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('debtPayments')) {
        localStorage.setItem('debtPayments', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('rentSettings')) {
        localStorage.setItem('rentSettings', JSON.stringify({ amount: 0, day: 1 }));
    }
}

// Načtení dat z lokálního úložiště
function loadDataFromLocalStorage() {
    try {
        APP_DATA.workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
        APP_DATA.financeRecords = JSON.parse(localStorage.getItem('financeRecords')) || [];
        APP_DATA.taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
        APP_DATA.expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || [];
        APP_DATA.debts = JSON.parse(localStorage.getItem('debts')) || [];
        APP_DATA.debtPayments = JSON.parse(localStorage.getItem('debtPayments')) || [];
        APP_DATA.rentSettings = JSON.parse(localStorage.getItem('rentSettings')) || { amount: 0, day: 1 };
        
        // Naplnění select boxů kategoriemi
        populateCategorySelects();
        
        // Zobrazení kategorií v nastavení
        displayCategories();
        
        // Zobrazení nastavení nájmu
        displayRentSettings();
        
    } catch (error) {
        console.error('Chyba při načítání dat z úložiště:', error);
        alert('Nastala chyba při načítání dat. Některá data nemusí být zobrazena správně.');
    }
}

// Naplnění select boxů kategoriemi
function populateCategorySelects() {
    // Kategorie úkolů
    const taskSelects = [
        document.getElementById('timer-activity'),
        document.getElementById('manual-activity'),
        document.getElementById('filter-activity')
    ];
    
    taskSelects.forEach(select => {
        if (!select) return;
        
        // Odstranění všech možností kromě první (placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Přidání možností
        APP_DATA.taskCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
    
    // Kategorie výdajů
    const expenseSelect = document.getElementById('finance-category');
    if (expenseSelect) {
        // Odstranění všech možností kromě první (placeholder)
        while (expenseSelect.options.length > 1) {
            expenseSelect.remove(1);
        }
        
        // Přidání možností
        APP_DATA.expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            expenseSelect.appendChild(option);
        });
    }
}

// Inicializace navigace
function initNavigation() {
    // Navigační odkazy
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Odstranění třídy active ze všech odkazů a sekcí
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            
            // Přidání třídy active k aktuálnímu odkazu a cílové sekci
            this.classList.add('active');
            
            const targetSection = document.getElementById(this.getAttribute('data-section'));
            if (targetSection) {
                targetSection.classList.add('active');
                // Skrytí mobilního menu po kliknutí
                document.querySelector('.main-nav').classList.remove('show');
            }
        });
    });
    
    // Tlačítko pro zobrazení/skrytí mobilního menu
    const menuToggle = document.getElementById('toggle-menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.main-nav').classList.toggle('show');
        });
    }
}

// Inicializace časovače
function initTimer() {
    // DOM elementy
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const stopBtn = document.getElementById('timer-stop');
    const personRadios = document.getElementsByName('timer-person');
    const activitySelect = document.getElementById('timer-activity');
    const noteInput = document.getElementById('timer-note-input');
    
    // Inicializace UI
    updateTimerDisplay('00:00:00');
    
    // Event listenery pro ovládání časovače
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopTimer);
    }
    
    // Poslouchání změny osoby
    personRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            timerState.person = this.value;
            updateTimerInfo();
        });
    });
    
    // Poslouchání změny aktivity
    if (activitySelect) {
        activitySelect.addEventListener('change', function() {
            timerState.activity = this.value;
            updateTimerInfo();
        });
    }
    
    // Poslouchání změny poznámky
    if (noteInput) {
        noteInput.addEventListener('input', function() {
            timerState.note = this.value;
        });
    }
}

// Spuštění časovače
function startTimer() {
    if (!timerState.activity) {
        alert('Prosím, vyberte nejprve úkol.');
        return;
    }
    
    // Aktualizace stavu tlačítek
    document.getElementById('timer-start').disabled = true;
    document.getElementById('timer-pause').disabled = false;
    document.getElementById('timer-stop').disabled = false;
    
    // Nastavení stavu časovače
    timerState.running = true;
    
    if (!timerState.startTime) {
        // První spuštění
        timerState.startTime = new Date().getTime() - timerState.pausedTime;
    } else {
        // Pokračování po pauze
        timerState.startTime = new Date().getTime() - timerState.pausedTime;
    }
    
    // Spuštění intervalu
    timerState.timerInterval = setInterval(updateTimer, 1000);
    
    // Aktualizace zobrazení v hlavičce
    updateHeaderTimerVisibility(true);
}

// Pozastavení časovače
function pauseTimer() {
    if (!timerState.running) return;
    
    // Aktualizace stavu tlačítek
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
    
    // Nastavení stavu časovače
    timerState.running = false;
    clearInterval(timerState.timerInterval);
    
    // Uložení času pozastavení
    timerState.pausedTime = new Date().getTime() - timerState.startTime;
}

// Zastavení a uložení časovače
function stopTimer() {
    if (!timerState.startTime) return;
    
    // Výpočet celkového času
    const endTime = new Date().getTime();
    const totalTime = endTime - timerState.startTime;
    const totalHours = totalTime / (1000 * 60 * 60);
    
    // Výpočet výdělku
    const rate = timerState.rates[timerState.person];
    const earnings = totalHours * rate;
    
    // Vytvoření záznamu práce
    const workLog = {
        id: generateId(),
        person: timerState.person,
        activity: timerState.activity,
        note: timerState.note,
        startTime: new Date(timerState.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: totalTime,
        earnings: Math.round(earnings)
    };
    
    // Uložení do úložiště
    saveWorkLog(workLog);
    
    // Reset časovače
    resetTimer();
    
    // Oznámení uživateli
    alert(`Záznam byl uložen. Výdělek: ${Math.round(earnings)} Kč`);
    
    // Obnovení zobrazení záznamů
    displayWorkLogs();
    displayDeductions();
}

// Aktualizace časovače každou sekundu
function updateTimer() {
    if (!timerState.running || !timerState.startTime) return;
    
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - timerState.startTime;
    
    // Formátování času
    const formattedTime = formatTime(elapsedTime);
    updateTimerDisplay(formattedTime);
    
    // Aktualizace výdělku
    updateEarningsDisplay(elapsedTime);
    
    // Aktualizace časovače v hlavičce
    updateHeaderTimer(formattedTime);
}

// Formátování milisekund na HH:MM:SS
function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    
    seconds = seconds % 60;
    minutes = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Aktualizace zobrazení časovače
function updateTimerDisplay(timeString) {
    const timerDisplay = document.getElementById('timer-time');
    if (timerDisplay) {
        timerDisplay.textContent = timeString;
    }
}

// Aktualizace informací o časovači
function updateTimerInfo() {
    const personDisplay = document.getElementById('timer-person');
    const activityDisplay = document.getElementById('timer-activity-display');
    
    // Formátování jména osoby
    const personName = timerState.person.charAt(0).toUpperCase() + timerState.person.slice(1);
    
    // Aktualizace informací o časovači
    if (personDisplay) {
        personDisplay.textContent = personName;
    }
    
    if (activityDisplay) {
        activityDisplay.textContent = timerState.activity ? timerState.activity : '';
    }
    
    // Aktualizace časovače v hlavičce
    const headerPersonDisplay = document.getElementById('header-timer-person');
    const headerActivityDisplay = document.getElementById('header-timer-activity');
    
    if (headerPersonDisplay) {
        headerPersonDisplay.textContent = personName;
    }
    
    if (headerActivityDisplay) {
        headerActivityDisplay.textContent = timerState.activity ? timerState.activity : '';
    }
}

// Aktualizace zobrazení výdělku
function updateEarningsDisplay(elapsedTime) {
    const earningsDisplay = document.getElementById('timer-earnings');
    if (!earningsDisplay) return;
    
    const hours = elapsedTime / (1000 * 60 * 60);
    const rate = timerState.rates[timerState.person];
    const earnings = hours * rate;
    
    earningsDisplay.textContent = `${Math.round(earnings)} Kč`;
}

// Aktualizace časovače v hlavičce
function updateHeaderTimer(timeString) {
    const headerTimerTime = document.getElementById('header-timer-time');
    if (headerTimerTime) {
        headerTimerTime.textContent = timeString;
    }
}

// Aktualizace viditelnosti časovače v hlavičce
function updateHeaderTimerVisibility(visible) {
    const headerTimer = document.getElementById('header-timer');
    if (headerTimer) {
        if (visible) {
            headerTimer.classList.remove('hidden');
        } else {
            headerTimer.classList.add('hidden');
        }
    }
}

// Reset časovače do výchozího stavu
function resetTimer() {
    // Vyčištění stavu časovače
    timerState.running = false;
    timerState.startTime = null;
    timerState.pausedTime = 0;
    clearInterval(timerState.timerInterval);
    
    // Reset UI
    updateTimerDisplay('00:00:00');
    document.getElementById('timer-start').disabled = false;
    document.getElementById('timer-pause').disabled = true;
    document.getElementById('timer-stop').disabled = true;
    document.getElementById('timer-earnings').textContent = '';
    
    // Skrytí časovače v hlavičce
    updateHeaderTimerVisibility(false);
}

// Uložení pracovního záznamu do úložiště
function saveWorkLog(workLog) {
    try {
        APP_DATA.workLogs.push(workLog);
        localStorage.setItem('workLogs', JSON.stringify(APP_DATA.workLogs));
    } catch (error) {
        console.error('Chyba při ukládání pracovního záznamu:', error);
        alert('Nastala chyba při ukládání záznamu.');
    }
}

// Generování unikátního ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Inicializace formuláře ručního zadání
function initManualEntryForm() {
    const manualEntryForm = document.getElementById('manual-entry-form');
    
    if (manualEntryForm) {
        manualEntryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Získání hodnot z formuláře
            const id = document.getElementById('edit-log-id').value;
            const person = document.getElementById('manual-person').value;
            const date = document.getElementById('manual-date').value;
            const startTime = document.getElementById('manual-start-time').value;
            const endTime = document.getElementById('manual-end-time').value;
            const breakTime = parseInt(document.getElementById('manual-break-time').value) || 0;
            const activity = document.getElementById('manual-activity').value;
            const note = document.getElementById('manual-note').value;
            
            // Validace
            if (!date || !startTime || !endTime) {
                alert('Prosím, vyplňte všechna povinná pole (datum, začátek, konec).');
                return;
            }
            
            if (!activity) {
                alert('Prosím, vyberte úkol.');
                return;
            }
            
            // Vytvoření objektů Date
            const startDate = new Date(`${date}T${startTime}`);
            const endDate = new Date(`${date}T${endTime}`);
            
            // Kontrola, zda je konec po začátku
            if (endDate <= startDate) {
                alert('Čas konce musí být pozdější než čas začátku.');
                return;
            }
            
            // Výpočet trvání v milisekundách (mínus přestávka)
            const durationMs = endDate - startDate - (breakTime * 60 * 1000);
            
            if (durationMs <= 0) {
                alert('Doba práce po odečtení přestávky musí být větší než 0.');
                return;
            }
            
            // Výpočet výdělku
            const durationHours = durationMs / (1000 * 60 * 60);
            const rate = timerState.rates[person];
            const earnings = durationHours * rate;
            
            // Vytvoření/aktualizace záznamu
            const workLog = {
                id: id || generateId(),
                person: person,
                activity: activity,
                note: note,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                duration: durationMs,
                earnings: Math.round(earnings),
                breakTime: breakTime
            };
            
            // Uložení záznamu
            if (id) {
                // Editace existujícího záznamu
                const index = APP_DATA.workLogs.findIndex(log => log.id === id);
                if (index !== -1) {
                    APP_DATA.workLogs[index] = workLog;
                }
            } else {
                // Přidání nového záznamu
                APP_DATA.workLogs.push(workLog);
            }
            
            // Uložení do úložiště
            localStorage.setItem('workLogs', JSON.stringify(APP_DATA.workLogs));
            
            // Reset formuláře
            manualEntryForm.reset();
            document.getElementById('edit-log-id').value = '';
            document.getElementById('save-log-button').innerHTML = '<i class="fas fa-plus"></i> Přidat záznam';
            document.getElementById('cancel-edit-button').style.display = 'none';
            
            // Obnovení zobrazení záznamů
            displayWorkLogs();
            displayDeductions();
            
            // Nastavení aktuálního data
            setCurrentDateToForms();
            
            // Oznámení uživateli
            alert('Záznam byl úspěšně uložen.');
        });
        
        // Tlačítko pro zrušení úpravy
        const cancelEditButton = document.getElementById('cancel-edit-button');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', function() {
                manualEntryForm.reset();
                document.getElementById('edit-log-id').value = '';
                document.getElementById('save-log-button').innerHTML = '<i class="fas fa-plus"></i> Přidat záznam';
                cancelEditButton.style.display = 'none';
                
                // Nastavení aktuálního data
                setCurrentDateToForms();
            });
        }
    }
}

// Inicializace formuláře financí
function initFinanceForm() {
    const financeForm = document.getElementById('finance-form');
    
    if (financeForm) {
        financeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Získání hodnot z formuláře
            const id = document.getElementById('edit-finance-id').value;
            const type = document.getElementById('finance-type').value;
            const date = document.getElementById('finance-date').value;
            const description = document.getElementById('finance-description').value;
            const category = document.getElementById('finance-category').value;
            const amount = parseFloat(document.getElementById('finance-amount').value);
            const currency = document.getElementById('finance-currency').value;
            
            // Validace
            if (!date || !description || isNaN(amount) || amount <= 0) {
                alert('Prosím, vyplňte všechna povinná pole a zadejte platnou částku.');
                return;
            }
            
            // Vytvoření/aktualizace záznamu
            const financeRecord = {
                id: id || generateId(),
                type: type,
                date: date,
                description: description,
                category: category,
                amount: amount,
                currency: currency
            };
            
            // Uložení záznamu
            if (id) {
                // Editace existujícího záznamu
                const index = APP_DATA.financeRecords.findIndex(record => record.id === id);
                if (index !== -1) {
                    APP_DATA.financeRecords[index] = financeRecord;
                }
            } else {
                // Přidání nového záznamu
                APP_DATA.financeRecords.push(financeRecord);
            }
            
            // Uložení do úložiště
            localStorage.setItem('financeRecords', JSON.stringify(APP_DATA.financeRecords));
            
            // Reset formuláře
            financeForm.reset();
            document.getElementById('edit-finance-id').value = '';
            document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-plus"></i> Přidat';
            document.getElementById('cancel-finance-edit-button').style.display = 'none';
            
            // Obnovení zobrazení záznamů
            displayFinanceRecords();
            
            // Nastavení aktuálního data
            setCurrentDateToForms();
            
            // Oznámení uživateli
            alert('Finanční záznam byl úspěšně uložen.');
        });
        
        // Tlačítko pro zrušení úpravy
        const cancelEditButton = document.getElementById('cancel-finance-edit-button');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', function() {
                financeForm.reset();
                document.getElementById('edit-finance-id').value = '';
                document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-plus"></i> Přidat';
                cancelEditButton.style.display = 'none';
                
                // Nastavení aktuálního data
                setCurrentDateToForms();
            });
        }
    }
}

// Inicializace formulářů dluhů
function initDebtForms() {
    // Formulář dluhu
    const debtForm = document.getElementById('debt-form');
    
    if (debtForm) {
        debtForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Získání hodnot z formuláře
            const id = document.getElementById('edit-debt-id').value;
            const person = document.getElementById('debt-person').value;
            const description = document.getElementById('debt-description').value;
            const amount = parseFloat(document.getElementById('debt-amount').value);
            const currency = document.getElementById('debt-currency').value;
            const date = document.getElementById('debt-date').value;
            const dueDate = document.getElementById('debt-due-date').value;
            
            // Validace
            if (!description || isNaN(amount) || amount <= 0 || !date) {
                alert('Prosím, vyplňte všechna povinná pole a zadejte platnou částku.');
                return;
            }
            
            // Vytvoření/aktualizace záznamu
            const debt = {
                id: id || generateId(),
                person: person,
                description: description,
                amount: amount,
                currency: currency,
                date: date,
                dueDate: dueDate,
                remaining: amount // Počáteční zbývající částka je celková částka
            };
            
            // Uložení záznamu
            if (id) {
                // Editace existujícího záznamu
                const index = APP_DATA.debts.findIndex(d => d.id === id);
                if (index !== -1) {
                    // Zachovat zbývající částku (je aktualizována při splátkách)
                    debt.remaining = APP_DATA.debts[index].remaining;
                    APP_DATA.debts[index] = debt;
                }
            } else {
                // Přidání nového záznamu
                APP_DATA.debts.push(debt);
            }
            
            // Uložení do úložiště
            localStorage.setItem('debts', JSON.stringify(APP_DATA.debts));
            
            // Reset formuláře
            debtForm.reset();
            document.getElementById('edit-debt-id').value = '';
            document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-plus"></i> Přidat dluh';
            document.getElementById('cancel-debt-edit-button').style.display = 'none';
            
            // Obnovení zobrazení dluhů
            displayDebts();
            updateDebtOptions();
            
            // Nastavení aktuálního data
            setCurrentDateToForms();
            
            // Oznámení uživateli
            alert('Dluh byl úspěšně uložen.');
        });
        
        // Tlačítko pro zrušení úpravy
        const cancelEditButton = document.getElementById('cancel-debt-edit-button');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', function() {
                debtForm.reset();
                document.getElementById('edit-debt-id').value = '';
                document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-plus"></i> Přidat dluh';
                cancelEditButton.style.display = 'none';
                
                // Nastavení aktuálního data
                setCurrentDateToForms();
            });
        }
    }
    
    // Formulář splátky
    const paymentForm = document.getElementById('payment-form');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Získání hodnot z formuláře
            const debtId = document.getElementById('payment-debt-id').value;
            const amount = parseFloat(document.getElementById('payment-amount').value);
            const date = document.getElementById('payment-date').value;
            const note = document.getElementById('payment-note').value;
            
            // Validace
            if (!debtId || isNaN(amount) || amount <= 0 || !date) {
                alert('Prosím, vyplňte všechna povinná pole a zadejte platnou částku.');
                return;
            }
            
            // Najít dluh
            const debtIndex = APP_DATA.debts.findIndex(d => d.id === debtId);
            if (debtIndex === -1) {
                alert('Vybraný dluh nebyl nalezen.');
                return;
            }
            
            const debt = APP_DATA.debts[debtIndex];
            
            // Kontrola, zda splátka není větší než zbývající dluh
            if (amount > debt.remaining) {
                alert(`Částka splátky (${amount} ${debt.currency}) nemůže být větší než zbývající dluh (${debt.remaining} ${debt.currency}).`);
                return;
            }
            
            // Vytvoření záznamu splátky
            const payment = {
                id: generateId(),
                debtId: debtId,
                amount: amount,
                date: date,
                note: note
            };
            
            // Přidání záznamu
            APP_DATA.debtPayments.push(payment);
            
            // Aktualizace zbývající částky dluhu
            debt.remaining -= amount;
            
            // Uložení do úložiště
            localStorage.setItem('debtPayments', JSON.stringify(APP_DATA.debtPayments));
            localStorage.setItem('debts', JSON.stringify(APP_DATA.debts));
            
            // Reset formuláře
            paymentForm.reset();
            
            // Obnovení zobrazení dluhů
            displayDebts();
            
            // Nastavení aktuálního data
            setCurrentDateToForms();
            
            // Oznámení uživateli
            alert('Splátka byla úspěšně uložena.');
        });
    }
}

// Aktualizace možností dluhů pro splátky
function updateDebtOptions() {
    const paymentDebtSelect = document.getElementById('payment-debt-id');
    
    if (paymentDebtSelect) {
        // Odstranění všech možností kromě první (placeholder)
        while (paymentDebtSelect.options.length > 1) {
            paymentDebtSelect.remove(1);
        }
        
        // Přidání možností pouze pro dluhy, které ještě nejsou splacené
        APP_DATA.debts.forEach(debt => {
            if (debt.remaining > 0) {
                const personName = debt.person.charAt(0).toUpperCase() + debt.person.slice(1);
                const option = document.createElement('option');
                option.value = debt.id;
                option.textContent = `${personName}: ${debt.description} (${debt.remaining} ${debt.currency})`;
                paymentDebtSelect.appendChild(option);
            }
        });
    }
}

// Inicializace filtrů
function initFilters() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            displayWorkLogs();
            updateCharts();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            document.getElementById('filter-person').value = '';
            document.getElementById('filter-activity').value = '';
            document.getElementById('filter-start-date').value = '';
            document.getElementById('filter-end-date').value = '';
            
            displayWorkLogs();
            updateCharts();
        });
    }
    
    // Posluchači pro typ grafu
    const chartTypeButtons = document.querySelectorAll('.chart-options button');
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            chartTypeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateCharts();
        });
    });
}

// Inicializace grafů
function initCharts() {
    // Při prvním načtení zobrazíme výchozí graf
    updateCharts();
}

// Aktualizace grafů
function updateCharts() {
    // Získání filtrovaných dat
    const filteredLogs = getFilteredWorkLogs();
    
    // Kontrola, zda jsou data k dispozici
    if (filteredLogs.length === 0) {
        document.getElementById('chart-area').style.display = 'none';
        document.getElementById('chart-no-data').style.display = 'block';
        return;
    }
    
    document.getElementById('chart-area').style.display = 'block';
    document.getElementById('chart-no-data').style.display = 'none';
    
    // Získání typu grafu
    const activeChartButton = document.querySelector('.chart-options button.active');
    const chartType = activeChartButton ? activeChartButton.getAttribute('data-chart-type') : 'person';
    
    // Příprava dat pro graf
    let chartData;
    let chartLabels;
    
    if (chartType === 'person') {
        // Graf podle osoby
        const personData = {};
        
        filteredLogs.forEach(log => {
            if (!personData[log.person]) {
                personData[log.person] = 0;
            }
            personData[log.person] += log.duration / (1000 * 60 * 60); // Převod na hodiny
        });
        
        chartLabels = Object.keys(personData).map(person => person.charAt(0).toUpperCase() + person.slice(1));
        chartData = Object.values(personData);
        
    } else if (chartType === 'activity') {
        // Graf podle úkolu
        const activityData = {};
        
        filteredLogs.forEach(log => {
            if (!activityData[log.activity]) {
                activityData[log.activity] = 0;
            }
            activityData[log.activity] += log.duration / (1000 * 60 * 60); // Převod na hodiny
        });
        
        chartLabels = Object.keys(activityData);
        chartData = Object.values(activityData);
        
    } else if (chartType === 'month') {
        // Graf podle měsíce
        const monthData = {};
        
        filteredLogs.forEach(log => {
            const date = new Date(log.startTime);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthData[monthYear]) {
                monthData[monthYear] = 0;
            }
            monthData[monthYear] += log.duration / (1000 * 60 * 60); // Převod na hodiny
        });
        
        // Seřazení měsíců chronologicky
        const sortedMonths = Object.keys(monthData).sort();
        
        // Formátování popisků měsíců
        chartLabels = sortedMonths.map(monthYear => {
            const [year, month] = monthYear.split('-');
            const monthNames = [
                'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
                'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        });
        
        chartData = sortedMonths.map(month => monthData[month]);
    }
    
    // Získání kontextu plátna
    const ctx = document.getElementById('chart-area').getContext('2d');
    
    // Zničení starého grafu, pokud existuje
    if (window.workChart) {
        window.workChart.destroy();
    }
    
    // Barvy
    const backgroundColors = [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)'
    ];
    
    // Vytvoření nového grafu
    window.workChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Odpracováno hodin',
                data: chartData.map(hours => Math.round(hours * 100) / 100), // Zaokrouhlení na 2 desetinná místa
                backgroundColor: backgroundColors.slice(0, chartLabels.length),
                borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hodiny'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const hours = parseFloat(context.raw);
                            return `${hours.toFixed(2)} h`;
                        }
                    }
                }
            }
        }
    });
}

// Inicializace exportů
function initExports() {
    // Export pracovních záznamů
    const exportWorkLogsBtn = document.getElementById('export-work-logs');
    if (exportWorkLogsBtn) {
        exportWorkLogsBtn.addEventListener('click', function() {
            exportWorkLogsToCSV();
        });
    }
    
    // Export finančních záznamů
    const exportFinanceBtn = document.getElementById('export-finance');
    if (exportFinanceBtn) {
        exportFinanceBtn.addEventListener('click', function() {
            exportFinanceToCSV();
        });
    }
    
    // Export srážek
    const exportDeductionsBtn = document.getElementById('export-deductions');
    if (exportDeductionsBtn) {
        exportDeductionsBtn.addEventListener('click', function() {
            exportDeductionsToCSV();
        });
    }
    
    // Export dluhů
    const exportDebtsBtn = document.getElementById('export-debts');
    if (exportDebtsBtn) {
        exportDebtsBtn.addEventListener('click', function() {
            exportDebtsToCSV();
        });
    }
    
    // Záloha dat
    const backupDataBtn = document.getElementById('backup-data');
    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', function() {
            backupData();
        });
    }
    
    // Obnovení dat
    const importDataInput = document.getElementById('import-data-input');
    if (importDataInput) {
        importDataInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                restoreData(file);
            }
        });
    }
    
    // Smazání všech dat
    const clearAllDataBtn = document.getElementById('clear-all-data');
    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', function() {
            if (confirm('POZOR: Tato akce smaže všechna data aplikace. Pokračovat?')) {
                clearAllData();
            }
        });
    }
}

// Export pracovních záznamů do CSV
function exportWorkLogsToCSV() {
    // Získání filtrovaných záznamů
    const filteredLogs = getFilteredWorkLogs();
    
    if (filteredLogs.length === 0) {
        alert('Žádné záznamy k exportu.');
        return;
    }
    
    // Hlavička CSV
    let csvContent = 'ID,Osoba,Úkol,Poznámka,Začátek,Konec,Doba (h),Výdělek (Kč)\n';
    
    // Přidání řádků
    filteredLogs.forEach(log => {
        const startDate = new Date(log.startTime);
        const endDate = new Date(log.endTime);
        const durationHours = log.duration / (1000 * 60 * 60);
        
        const row = [
            log.id,
            log.person,
            log.activity,
            log.note || '',
            formatDateTime(startDate),
            formatDateTime(endDate),
            (Math.round(durationHours * 100) / 100).toString().replace('.', ','),
            log.earnings
        ];
        
        // Escapování textových hodnot
        const escapedRow = row.map(value => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += escapedRow.join(',') + '\n';
    });
    
    // Vytvoření a stažení souboru
    downloadCSV(csvContent, 'pracovni-zaznamy.csv');
}

// Export finančních záznamů do CSV
function exportFinanceToCSV() {
    if (APP_DATA.financeRecords.length === 0) {
        alert('Žádné finanční záznamy k exportu.');
        return;
    }
    
    // Hlavička CSV
    let csvContent = 'ID,Typ,Popis,Částka,Měna,Datum,Kategorie\n';
    
    // Přidání řádků
    APP_DATA.financeRecords.forEach(record => {
        const type = record.type === 'income' ? 'Příjem' : 'Výdaj';
        
        const row = [
            record.id,
            type,
            record.description,
            record.amount.toString().replace('.', ','),
            record.currency,
            record.date,
            record.category || ''
        ];
        
        // Escapování textových hodnot
        const escapedRow = row.map(value => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += escapedRow.join(',') + '\n';
    });
    
    // Vytvoření a stažení souboru
    downloadCSV(csvContent, 'financni-zaznamy.csv');
}

// Export srážek do CSV
function exportDeductionsToCSV() {
    // Získání dat srážek
    const deductionsData = calculateDeductions();
    
    if (deductionsData.length === 0) {
        alert('Žádné srážky k exportu.');
        return;
    }
    
    // Hlavička CSV
    let csvContent = 'Osoba,Měsíc,Celkem odpracováno (h),Hrubý výdělek (Kč),Srážka (Kč)\n';
    
    // Přidání řádků
    deductionsData.forEach(deduction => {
        const row = [
            deduction.person,
            deduction.month,
            deduction.hoursWorked.toString().replace('.', ','),
            deduction.grossEarnings,
            deduction.deduction
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Vytvoření a stažení souboru
    downloadCSV(csvContent, 'srazky.csv');
}

// Export dluhů do CSV
function exportDebtsToCSV() {
    if (APP_DATA.debts.length === 0) {
        alert('Žádné dluhy k exportu.');
        return;
    }
    
    // Hlavička CSV
    let csvContent = 'ID,Osoba,Popis,Celková částka,Zbývající částka,Měna,Datum vzniku,Datum splatnosti\n';
    
    // Přidání řádků
    APP_DATA.debts.forEach(debt => {
        const row = [
            debt.id,
            debt.person,
            debt.description,
            debt.amount.toString().replace('.', ','),
            debt.remaining.toString().replace('.', ','),
            debt.currency,
            debt.date,
            debt.dueDate || ''
        ];
        
        // Escapování textových hodnot
        const escapedRow = row.map(value => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += escapedRow.join(',') + '\n';
    });
    
    // Přidání informací o splátkách
    csvContent += '\n\nSplátky\n';
    csvContent += 'ID,ID dluhu,Částka,Datum,Poznámka\n';
    
    // Přidání řádků splátky
    APP_DATA.debtPayments.forEach(payment => {
        const row = [
            payment.id,
            payment.debtId,
            payment.amount.toString().replace('.', ','),
            payment.date,
            payment.note || ''
        ];
        
        // Escapování textových hodnot
        const escapedRow = row.map(value => {
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += escapedRow.join(',') + '\n';
    });
    
    // Vytvoření a stažení souboru
    downloadCSV(csvContent, 'dluhy.csv');
}

// Záloha dat
function backupData() {
    // Vytvoření objektu s daty
    const backupObj = {
        workLogs: APP_DATA.workLogs,
        financeRecords: APP_DATA.financeRecords,
        taskCategories: APP_DATA.taskCategories,
        expenseCategories: APP_DATA.expenseCategories,
        debts: APP_DATA.debts,
        debtPayments: APP_DATA.debtPayments,
        rentSettings: APP_DATA.rentSettings,
        version: '1.0'
    };
    
    // Převod na JSON
    const jsonContent = JSON.stringify(backupObj, null, 2);
    
    // Vytvoření a stažení souboru
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pracovni-vykazy-zaloha-${formatDateFileName(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Obnovení dat
function restoreData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validace dat
            if (!data.version || !data.workLogs || !data.financeRecords) {
                throw new Error('Neplatný formát záložního souboru.');
            }
            
            // Potvrzení od uživatele
            if (confirm('Tato akce přepíše všechna aktuální data. Pokračovat?')) {
                // Uložení dat do úložiště
                localStorage.setItem('workLogs', JSON.stringify(data.workLogs || []));
                localStorage.setItem('financeRecords', JSON.stringify(data.financeRecords || []));
                localStorage.setItem('taskCategories', JSON.stringify(data.taskCategories || []));
                localStorage.setItem('expenseCategories', JSON.stringify(data.expenseCategories || []));
                localStorage.setItem('debts', JSON.stringify(data.debts || []));
                localStorage.setItem('debtPayments', JSON.stringify(data.debtPayments || []));
                localStorage.setItem('rentSettings', JSON.stringify(data.rentSettings || { amount: 0, day: 1 }));
                
                // Načtení dat z úložiště
                loadDataFromLocalStorage();
                
                // Obnovení zobrazení
                displayWorkLogs();
                displayFinanceRecords();
                displayDeductions();
                displayDebts();
                displayCategories();
                displayRentSettings();
                updateDebtOptions();
                
                // Oznámení uživateli
                alert('Data byla úspěšně obnovena.');
            }
        } catch (error) {
            console.error('Chyba při obnovení dat:', error);
            alert('Nastala chyba při obnovení dat. Zkontrolujte, zda je soubor ve správném formátu.');
        }
    };
    
    reader.readAsText(file);
}

// Smazání všech dat
function clearAllData() {
    // Smazání dat z úložiště
    localStorage.removeItem('workLogs');
    localStorage.removeItem('financeRecords');
    localStorage.removeItem('taskCategories');
    localStorage.removeItem('expenseCategories');
    localStorage.removeItem('debts');
    localStorage.removeItem('debtPayments');
    localStorage.removeItem('rentSettings');
    
    // Inicializace lokálního úložiště s výchozími hodnotami
    initializeLocalStorage();
    
    // Načtení dat z úložiště
    loadDataFromLocalStorage();
    
    // Obnovení zobrazení
    displayWorkLogs();
    displayFinanceRecords();
    displayDeductions();
    displayDebts();
    displayCategories();
    displayRentSettings();
    updateDebtOptions();
    
    // Oznámení uživateli
    alert('Všechna data byla smazána.');
}

// Inicializace nastavení
function initSettings() {
    // Přidání kategorie úkolů
    const addTaskCategoryBtn = document.getElementById('add-task-category');
    const newTaskCategoryInput = document.getElementById('new-task-category');
    
    if (addTaskCategoryBtn && newTaskCategoryInput) {
        addTaskCategoryBtn.addEventListener('click', function() {
            const category = newTaskCategoryInput.value.trim();
            
            if (category) {
                // Kontrola, zda kategorie již neexistuje
                if (APP_DATA.taskCategories.includes(category)) {
                    alert('Tato kategorie úkolů již existuje.');
                    return;
                }
                
                // Přidání kategorie
                APP_DATA.taskCategories.push(category);
                localStorage.setItem('taskCategories', JSON.stringify(APP_DATA.taskCategories));
                
                // Obnovení zobrazení
                displayCategories();
                populateCategorySelects();
                
                // Vyčištění vstupu
                newTaskCategoryInput.value = '';
            }
        });
    }
    
    // Přidání kategorie výdajů
    const addExpenseCategoryBtn = document.getElementById('add-expense-category');
    const newExpenseCategoryInput = document.getElementById('new-expense-category');
    
    if (addExpenseCategoryBtn && newExpenseCategoryInput) {
        addExpenseCategoryBtn.addEventListener('click', function() {
            const category = newExpenseCategoryInput.value.trim();
            
            if (category) {
                // Kontrola, zda kategorie již neexistuje
                if (APP_DATA.expenseCategories.includes(category)) {
                    alert('Tato kategorie výdajů již existuje.');
                    return;
                }
                
                // Přidání kategorie
                APP_DATA.expenseCategories.push(category);
                localStorage.setItem('expenseCategories', JSON.stringify(APP_DATA.expenseCategories));
                
                // Obnovení zobrazení
                displayCategories();
                populateCategorySelects();
                
                // Vyčištění vstupu
                newExpenseCategoryInput.value = '';
            }
        });
    }
    
    // Uložení nastavení nájmu
    const saveRentSettingsBtn = document.getElementById('save-rent-settings');
    
    if (saveRentSettingsBtn) {
        saveRentSettingsBtn.addEventListener('click', function() {
            const amount = parseFloat(document.getElementById('rent-amount').value) || 0;
            const day = parseInt(document.getElementById('rent-day').value) || 1;
            
            // Validace
            if (day < 1 || day > 31) {
                alert('Den splatnosti musí být v rozmezí 1-31.');
                return;
            }
            
            // Uložení nastavení
            APP_DATA.rentSettings = {
                amount: amount,
                day: day
            };
            
            localStorage.setItem('rentSettings', JSON.stringify(APP_DATA.rentSettings));
            
            // Oznámení uživateli
            alert('Nastavení nájmu bylo uloženo.');
        });
    }
}

// Zobrazení kategorií v nastavení
function displayCategories() {
    // Kategorie úkolů
    const taskCategoriesList = document.getElementById('task-categories-list');
    
    if (taskCategoriesList) {
        taskCategoriesList.innerHTML = '';
        
        if (APP_DATA.taskCategories.length === 0) {
            taskCategoriesList.innerHTML = '<li class="empty-placeholder">Žádné kategorie úkolů.</li>';
        } else {
            APP_DATA.taskCategories.forEach(category => {
                const li = document.createElement('li');
                
                // Zobrazení kategorie
                li.innerHTML = `
                    <span>${category}</span>
                    <button type="button" class="delete-button" data-category="${category}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                // Tlačítko pro smazání
                const deleteBtn = li.querySelector('button');
                deleteBtn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    // Potvrzení od uživatele
                    if (confirm(`Opravdu chcete smazat kategorii "${category}"?`)) {
                        // Odstranění kategorie
                        APP_DATA.taskCategories = APP_DATA.taskCategories.filter(c => c !== category);
                        localStorage.setItem('taskCategories', JSON.stringify(APP_DATA.taskCategories));
                        
                        // Obnovení zobrazení
                        displayCategories();
                        populateCategorySelects();
                    }
                });
                
                taskCategoriesList.appendChild(li);
            });
        }
    }
    
    // Kategorie výdajů
    const expenseCategoriesList = document.getElementById('expense-categories-list');
    
    if (expenseCategoriesList) {
        expenseCategoriesList.innerHTML = '';
        
        if (APP_DATA.expenseCategories.length === 0) {
            expenseCategoriesList.innerHTML = '<li class="empty-placeholder">Žádné kategorie výdajů.</li>';
        } else {
            APP_DATA.expenseCategories.forEach(category => {
                const li = document.createElement('li');
                
                // Zobrazení kategorie
                li.innerHTML = `
                    <span>${category}</span>
                    <button type="button" class="delete-button" data-category="${category}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                // Tlačítko pro smazání
                const deleteBtn = li.querySelector('button');
                deleteBtn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    
                    // Potvrzení od uživatele
                    if (confirm(`Opravdu chcete smazat kategorii "${category}"?`)) {
                        // Odstranění kategorie
                        APP_DATA.expenseCategories = APP_DATA.expenseCategories.filter(c => c !== category);
                        localStorage.setItem('expenseCategories', JSON.stringify(APP_DATA.expenseCategories));
                        
                        // Obnovení zobrazení
                        displayCategories();
                        populateCategorySelects();
                    }
                });
                
                expenseCategoriesList.appendChild(li);
            });
        }
    }
}

// Zobrazení nastavení nájmu
function displayRentSettings() {
    const rentAmount = document.getElementById('rent-amount');
    const rentDay = document.getElementById('rent-day');
    
    if (rentAmount && rentDay) {
        rentAmount.value = APP_DATA.rentSettings.amount;
        rentDay.value = APP_DATA.rentSettings.day;
    }
}

// Zobrazení pracovních záznamů
function displayWorkLogs() {
    const workLogsAccordion = document.getElementById('work-logs-accordion');
    
    if (workLogsAccordion) {
        // Získání filtrovaných záznamů
        const filteredLogs = getFilteredWorkLogs();
        
        // Seřazení záznamů podle data (od nejnovějšího)
        filteredLogs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        if (filteredLogs.length === 0) {
            workLogsAccordion.innerHTML = '<div class="accordion-empty">Žádné záznamy k zobrazení. Zkuste změnit filtry nebo přidejte záznam v sekci Docházka.</div>';
        } else {
            workLogsAccordion.innerHTML = '';
            
            // Seskupení záznamů podle dne
            const logsByDay = {};
            
            filteredLogs.forEach(log => {
                const date = new Date(log.startTime);
                const dateKey = formatDate(date);
                
                if (!logsByDay[dateKey]) {
                    logsByDay[dateKey] = [];
                }
                
                logsByDay[dateKey].push(log);
            });
            
            // Seřazení dnů od nejnovějšího
            const sortedDays = Object.keys(logsByDay).sort((a, b) => new Date(b) - new Date(a));
            
            // Vytvoření accordion pro každý den
            sortedDays.forEach(day => {
                const logs = logsByDay[day];
                const totalHours = logs.reduce((total, log) => total + log.duration / (1000 * 60 * 60), 0);
                const totalEarnings = logs.reduce((total, log) => total + log.earnings, 0);
                
                const accordionItem = document.createElement('div');
                accordionItem.className = 'accordion-item';
                
                // Hlavička accordionu
                const header = document.createElement('div');
                header.className = 'accordion-header';
                header.innerHTML = `
                    <div>
                        <strong>${day}</strong> (${logs.length} ${logs.length === 1 ? 'záznam' : logs.length >= 2 && logs.length <= 4 ? 'záznamy' : 'záznamů'})
                    </div>
                    <div>
                        <span>${Math.round(totalHours * 100) / 100} h</span> | 
                        <span>${totalEarnings} Kč</span>
                    </div>
                `;
                
                // Obsah accordionu
                const content = document.createElement('div');
                content.className = 'accordion-content';
                
                // Tabulka záznamů
                let contentHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Osoba</th>
                                <th>Úkol</th>
                                <th>Čas</th>
                                <th>Trvání</th>
                                <th>Výdělek</th>
                                <th>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                logs.forEach(log => {
                    const startDate = new Date(log.startTime);
                    const endDate = new Date(log.endTime);
                    const durationHours = log.duration / (1000 * 60 * 60);
                    
                    const personName = log.person.charAt(0).toUpperCase() + log.person.slice(1);
                    
                    contentHTML += `
                        <tr>
                            <td>${personName}</td>
                            <td>${log.activity}${log.note ? `<br><small>${log.note}</small>` : ''}</td>
                            <td>${formatTime(startDate)} - ${formatTime(endDate)}</td>
                            <td>${Math.round(durationHours * 100) / 100} h</td>
                            <td>${log.earnings} Kč</td>
                            <td>
                                <button type="button" class="edit-log-button" data-id="${log.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button type="button" class="delete-log-button" data-id="${log.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                contentHTML += `
                        </tbody>
                    </table>
                `;
                
                content.innerHTML = contentHTML;
                
                // Přidání event listenerů pro tlačítka úpravy a smazání
                accordionItem.appendChild(header);
                accordionItem.appendChild(content);
                workLogsAccordion.appendChild(accordionItem);
                
                // Event listener pro rozbalení/sbalení accordionu
                header.addEventListener('click', function() {
                    content.classList.toggle('active');
                });
            });
            
            // Přidání event listenerů pro tlačítka úpravy a smazání
            const editLogButtons = workLogsAccordion.querySelectorAll('.edit-log-button');
            const deleteLogButtons = workLogsAccordion.querySelectorAll('.delete-log-button');
            
            editLogButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Zabrání rozbalení accordionu
                    
                    const id = this.getAttribute('data-id');
                    editWorkLog(id);
                });
            });
            
            deleteLogButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Zabrání rozbalení accordionu
                    
                    const id = this.getAttribute('data-id');
                    
                    // Potvrzení od uživatele
                    if (confirm('Opravdu chcete smazat tento záznam?')) {
                        deleteWorkLog(id);
                    }
                });
            });
        }
    }
}

// Získání filtrovaných pracovních záznamů
function getFilteredWorkLogs() {
    // Získání hodnot filtrů
    const filterPerson = document.getElementById('filter-person').value;
    const filterActivity = document.getElementById('filter-activity').value;
    const filterStartDate = document.getElementById('filter-start-date').value;
    const filterEndDate = document.getElementById('filter-end-date').value;
    
    // Filtrování záznamů
    return APP_DATA.workLogs.filter(log => {
        // Filtr podle osoby
        if (filterPerson && log.person !== filterPerson) {
            return false;
        }
        
        // Filtr podle úkolu
        if (filterActivity && log.activity !== filterActivity) {
            return false;
        }
        
        // Filtr podle data začátku
        if (filterStartDate) {
            const logDate = new Date(log.startTime);
            const startDate = new Date(filterStartDate);
            startDate.setHours(0, 0, 0, 0);
            
            if (logDate < startDate) {
                return false;
            }
        }
        
        // Filtr podle data konce
        if (filterEndDate) {
            const logDate = new Date(log.startTime);
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            
            if (logDate > endDate) {
                return false;
            }
        }
        
        return true;
    });
}

// Úprava pracovního záznamu
function editWorkLog(id) {
    // Nalezení záznamu
    const log = APP_DATA.workLogs.find(log => log.id === id);
    
    if (log) {
        // Převod časů
        const startDate = new Date(log.startTime);
        const endDate = new Date(log.endTime);
        
        // Formátování dat pro formulář
        const dateFormat = startDate.toISOString().split('T')[0];
        const startTimeFormat = startDate.toTimeString().slice(0, 5);
        const endTimeFormat = endDate.toTimeString().slice(0, 5);
        
        // Naplnění formuláře
        document.getElementById('edit-log-id').value = log.id;
        document.getElementById('manual-person').value = log.person;
        document.getElementById('manual-date').value = dateFormat;
        document.getElementById('manual-start-time').value = startTimeFormat;
        document.getElementById('manual-end-time').value = endTimeFormat;
        document.getElementById('manual-break-time').value = log.breakTime || 0;
        document.getElementById('manual-activity').value = log.activity;
        document.getElementById('manual-note').value = log.note || '';
        
        // Změna textu tlačítka
        document.getElementById('save-log-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
        
        // Zobrazení tlačítka pro zrušení úpravy
        document.getElementById('cancel-edit-button').style.display = 'inline-block';
        
        // Přepnutí na sekci "Docházka"
        document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('section').forEach(section => section.classList.remove('active'));
        
        document.querySelector('.main-nav a[data-section="dochazka"]').classList.add('active');
        document.getElementById('dochazka').classList.add('active');
        
        // Skrytí mobilního menu
        document.querySelector('.main-nav').classList.remove('show');
        
        // Scrollování na formulář
        document.querySelector('.manual-entry').scrollIntoView({ behavior: 'smooth' });
    }
}

// Smazání pracovního záznamu
function deleteWorkLog(id) {
    // Odstranění záznamu
    APP_DATA.workLogs = APP_DATA.workLogs.filter(log => log.id !== id);
    
    // Uložení do úložiště
    localStorage.setItem('workLogs', JSON.stringify(APP_DATA.workLogs));
    
    // Obnovení zobrazení
    displayWorkLogs();
    displayDeductions();
    updateCharts();
}

// Zobrazení finančních záznamů
function displayFinanceRecords() {
    const financeTable = document.getElementById('finance-table');
    
    if (financeTable) {
        if (APP_DATA.financeRecords.length === 0) {
            financeTable.innerHTML = '<tr><td colspan="7" class="text-center empty-placeholder">Žádné finanční záznamy.</td></tr>';
        } else {
            // Seřazení záznamů podle data (od nejnovějšího)
            const sortedRecords = [...APP_DATA.financeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            financeTable.innerHTML = '';
            
            sortedRecords.forEach(record => {
                const tr = document.createElement('tr');
                
                // Typ (příjem/výdaj)
                const typeText = record.type === 'income' ? 'Příjem' : 'Výdaj';
                const typeClass = record.type === 'income' ? 'text-success' : 'text-danger';
                
                // Formátování data
                const date = new Date(record.date);
                const formattedDate = formatDate(date);
                
                tr.innerHTML = `
                    <td class="${typeClass}">${typeText}</td>
                    <td>${record.description}</td>
                    <td>${record.amount} ${record.currency}</td>
                    <td>${record.currency}</td>
                    <td>${formattedDate}</td>
                    <td>${record.category || '-'}</td>
                    <td>
                        <button type="button" class="edit-finance-button" data-id="${record.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="delete-finance-button" data-id="${record.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                financeTable.appendChild(tr);
            });
            
            // Přidání event listenerů pro tlačítka úpravy a smazání
            const editFinanceButtons = financeTable.querySelectorAll('.edit-finance-button');
            const deleteFinanceButtons = financeTable.querySelectorAll('.delete-finance-button');
            
            editFinanceButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    editFinanceRecord(id);
                });
            });
            
            deleteFinanceButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    
                    // Potvrzení od uživatele
                    if (confirm('Opravdu chcete smazat tento finanční záznam?')) {
                        deleteFinanceRecord(id);
                    }
                });
            });
        }
    }
}

// Úprava finančního záznamu
function editFinanceRecord(id) {
    // Nalezení záznamu
    const record = APP_DATA.financeRecords.find(record => record.id === id);
    
    if (record) {
        // Naplnění formuláře
        document.getElementById('edit-finance-id').value = record.id;
        document.getElementById('finance-type').value = record.type;
        document.getElementById('finance-date').value = record.date;
        document.getElementById('finance-description').value = record.description;
        document.getElementById('finance-category').value = record.category || '';
        document.getElementById('finance-amount').value = record.amount;
        document.getElementById('finance-currency').value = record.currency;
        
        // Změna textu tlačítka
        document.getElementById('save-finance-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
        
        // Zobrazení tlačítka pro zrušení úpravy
        document.getElementById('cancel-finance-edit-button').style.display = 'inline-block';
        
        // Přepnutí na sekci "Finance"
        document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('section').forEach(section => section.classList.remove('active'));
        
        document.querySelector('.main-nav a[data-section="finance"]').classList.add('active');
        document.getElementById('finance').classList.add('active');
        
        // Skrytí mobilního menu
        document.querySelector('.main-nav').classList.remove('show');
        
        // Scrollování na formulář
        document.querySelector('.finance-entry').scrollIntoView({ behavior: 'smooth' });
    }
}

// Smazání finančního záznamu
function deleteFinanceRecord(id) {
    // Odstranění záznamu
    APP_DATA.financeRecords = APP_DATA.financeRecords.filter(record => record.id !== id);
    
    // Uložení do úložiště
    localStorage.setItem('financeRecords', JSON.stringify(APP_DATA.financeRecords));
    
    // Obnovení zobrazení
    displayFinanceRecords();
}

// Zobrazení srážek
function displayDeductions() {
    const deductionsTable = document.getElementById('deductions-summary-table');
    
    if (deductionsTable) {
        // Výpočet srážek
        const deductionsData = calculateDeductions();
        
        if (deductionsData.length === 0) {
            deductionsTable.innerHTML = '<tr><td colspan="5" class="text-center empty-placeholder">Žádné záznamy pro výpočet srážek.</td></tr>';
        } else {
            deductionsTable.innerHTML = '';
            
            deductionsData.forEach(deduction => {
                const tr = document.createElement('tr');
                
                // Formátování jména osoby
                const personName = deduction.person.charAt(0).toUpperCase() + deduction.person.slice(1);
                
                tr.innerHTML = `
                    <td>${personName}</td>
                    <td>${deduction.month}</td>
                    <td>${deduction.hoursWorked.toFixed(2)} h</td>
                    <td>${deduction.grossEarnings} Kč</td>
                    <td>${deduction.deduction} Kč</td>
                `;
                
                deductionsTable.appendChild(tr);
            });
        }
    }
}

// Výpočet srážek
function calculateDeductions() {
    // Vytvoření map pro srážky podle osoby a měsíce
    const deductionsByPersonAndMonth = {};
    
    // Procházení záznamů
    APP_DATA.workLogs.forEach(log => {
        const startDate = new Date(log.startTime);
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const monthYear = `${month.toString().padStart(2, '0')}/${year}`;
        
        // Klíč pro mapu (osoba-měsíc)
        const key = `${log.person}-${monthYear}`;
        
        if (!deductionsByPersonAndMonth[key]) {
            deductionsByPersonAndMonth[key] = {
                person: log.person,
                month: monthYear,
                hoursWorked: 0,
                grossEarnings: 0
            };
        }
        
        // Přidání hodin a výdělku
        deductionsByPersonAndMonth[key].hoursWorked += log.duration / (1000 * 60 * 60);
        deductionsByPersonAndMonth[key].grossEarnings += log.earnings;
    });
    
    // Převod map na pole a výpočet srážek
    const deductionsArray = Object.values(deductionsByPersonAndMonth).map(deduction => {
        // Výpočet srážky podle osoby
        let deductionAmount = 0;
        
        if (deduction.person === 'maru') {
            // Maru: 1/3 (cca 33.33%)
            deductionAmount = Math.round(deduction.grossEarnings / 3);
        } else if (deduction.person === 'marty') {
            // Marty: 50%
            deductionAmount = Math.round(deduction.grossEarnings * 0.5);
        }
        
        return {
            ...deduction,
            deduction: deductionAmount
        };
    });
    
    // Seřazení podle měsíce (od nejnovějšího) a osoby
    return deductionsArray.sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/');
        const [bMonth, bYear] = b.month.split('/');
        
        // Porovnání podle roku a měsíce
        if (aYear !== bYear) {
            return parseInt(bYear) - parseInt(aYear);
        }
        
        if (aMonth !== bMonth) {
            return parseInt(bMonth) - parseInt(aMonth);
        }
        
        // Porovnání podle osoby
        return a.person.localeCompare(b.person);
    });
}

// Zobrazení dluhů
function displayDebts() {
    const debtsList = document.getElementById('debts-list');
    
    if (debtsList) {
        if (APP_DATA.debts.length === 0) {
            debtsList.innerHTML = '<div class="accordion-empty">Žádné dluhy k zobrazení. Přidejte dluh níže.</div>';
        } else {
            debtsList.innerHTML = '';
            
            // Seřazení dluhů podle data vzniku (od nejnovějšího)
            const sortedDebts = [...APP_DATA.debts].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedDebts.forEach(debt => {
                // Formátování jména osoby
                const personName = debt.person.charAt(0).toUpperCase() + debt.person.slice(1);
                
                // Výpočet splacené částky
                const payments = APP_DATA.debtPayments.filter(payment => payment.debtId === debt.id);
                const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
                const remaining = debt.remaining;
                const progress = debt.amount > 0 ? (totalPaid / debt.amount) * 100 : 0;
                
                // Status (splaceno/aktivní)
                const isFullyPaid = remaining <= 0;
                const statusClass = isFullyPaid ? 'debt-paid' : 'debt-active';
                const statusText = isFullyPaid ? 'Splaceno' : 'Aktivní';
                
                // Datum splatnosti
                const dueDate = debt.dueDate ? formatDate(new Date(debt.dueDate)) : 'Neurčeno';
                
                // Formátování data vzniku
                const creationDate = formatDate(new Date(debt.date));
                
                // Vytvoření accordionu pro dluh
                const accordionItem = document.createElement('div');
                accordionItem.className = `accordion-item ${statusClass}`;
                
                // Hlavička accordionu
                const header = document.createElement('div');
                header.className = 'accordion-header';
                header.innerHTML = `
                    <div>
                        <strong>${personName}</strong>: ${debt.description}
                        <span class="debt-status">${statusText}</span>
                    </div>
                    <div>
                        <span>${remaining} ${debt.currency} / ${debt.amount} ${debt.currency}</span>
                    </div>
                `;
                
                // Obsah accordionu
                const content = document.createElement('div');
                content.className = 'accordion-content';
                
                let contentHTML = `
                    <div class="debt-details">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <p><strong>Dlužník:</strong> ${personName}</p>
                        <p><strong>Popis:</strong> ${debt.description}</p>
                        <p><strong>Celková částka:</strong> ${debt.amount} ${debt.currency}</p>
                        <p><strong>Zbývá splatit:</strong> ${remaining} ${debt.currency}</p>
                        <p><strong>Splaceno:</strong> ${totalPaid} ${debt.currency} (${Math.round(progress)}%)</p>
                        <p><strong>Datum vzniku:</strong> ${creationDate}</p>
                        <p><strong>Datum splatnosti:</strong> ${dueDate}</p>
                    </div>
                `;
                
                // Přidání seznamu splátek, pokud existují
                if (payments.length > 0) {
                    contentHTML += `
                        <div class="debt-payments">
                            <h4>Historie splátek</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Datum</th>
                                        <th>Částka</th>
                                        <th>Poznámka</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    // Seřazení splátek podle data (od nejnovějšího)
                    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    sortedPayments.forEach(payment => {
                        const paymentDate = formatDate(new Date(payment.date));
                        
                        contentHTML += `
                            <tr>
                                <td>${paymentDate}</td>
                                <td>${payment.amount} ${debt.currency}</td>
                                <td>${payment.note || '-'}</td>
                            </tr>
                        `;
                    });
                    
                    contentHTML += `
                                </tbody>
                            </table>
                        </div>
                    `;
                }
                
                // Přidání tlačítek pro úpravu a smazání
                contentHTML += `
                    <div class="debt-actions">
                        <button type="button" class="edit-debt-button" data-id="${debt.id}">
                            <i class="fas fa-edit"></i> Upravit dluh
                        </button>
                        <button type="button" class="delete-debt-button delete-button" data-id="${debt.id}">
                            <i class="fas fa-trash-alt"></i> Smazat dluh
                        </button>
                    </div>
                `;
                
                content.innerHTML = contentHTML;
                
                // Přidání event listenerů pro tlačítka
                accordionItem.appendChild(header);
                accordionItem.appendChild(content);
                debtsList.appendChild(accordionItem);
                
                // Event listener pro rozbalení/sbalení accordionu
                header.addEventListener('click', function() {
                    content.classList.toggle('active');
                });
            });
            
            // Přidání event listenerů pro tlačítka úpravy a smazání
            const editDebtButtons = debtsList.querySelectorAll('.edit-debt-button');
            const deleteDebtButtons = debtsList.querySelectorAll('.delete-debt-button');
            
            editDebtButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Zabrání rozbalení accordionu
                    
                    const id = this.getAttribute('data-id');
                    editDebt(id);
                });
            });
            
            deleteDebtButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Zabrání rozbalení accordionu
                    
                    const id = this.getAttribute('data-id');
                    
                    // Potvrzení od uživatele
                    if (confirm('Opravdu chcete smazat tento dluh a všechny jeho splátky?')) {
                        deleteDebt(id);
                    }
                });
            });
        }
    }
}

// Úprava dluhu
function editDebt(id) {
    // Nalezení dluhu
    const debt = APP_DATA.debts.find(debt => debt.id === id);
    
    if (debt) {
        // Naplnění formuláře
        document.getElementById('edit-debt-id').value = debt.id;
        document.getElementById('debt-person').value = debt.person;
        document.getElementById('debt-description').value = debt.description;
        document.getElementById('debt-amount').value = debt.amount;
        document.getElementById('debt-currency').value = debt.currency;
        document.getElementById('debt-date').value = debt.date;
        document.getElementById('debt-due-date').value = debt.dueDate || '';
        
        // Změna textu tlačítka
        document.getElementById('save-debt-button').innerHTML = '<i class="fas fa-save"></i> Uložit změny';
        
        // Zobrazení tlačítka pro zrušení úpravy
        document.getElementById('cancel-debt-edit-button').style.display = 'inline-block';
        
        // Přepnutí na sekci "Srážky"
        document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('section').forEach(section => section.classList.remove('active'));
        
        document.querySelector('.main-nav a[data-section="srazky"]').classList.add('active');
        document.getElementById('srazky').classList.add('active');
        
        // Skrytí mobilního menu
        document.querySelector('.main-nav').classList.remove('show');
        
        // Scrollování na formulář
        document.querySelector('.debt-entry').scrollIntoView({ behavior: 'smooth' });
    }
}

// Smazání dluhu
function deleteDebt(id) {
    // Odstranění dluhu
    APP_DATA.debts = APP_DATA.debts.filter(debt => debt.id !== id);
    
    // Odstranění splátek dluhu
    APP_DATA.debtPayments = APP_DATA.debtPayments.filter(payment => payment.debtId !== id);
    
    // Uložení do úložiště
    localStorage.setItem('debts', JSON.stringify(APP_DATA.debts));
    localStorage.setItem('debtPayments', JSON.stringify(APP_DATA.debtPayments));
    
    // Obnovení zobrazení
    displayDebts();
    updateDebtOptions();
}

// Nastavení aktuálního data do formulářů
function setCurrentDateToForms() {
    const today = new Date().toISOString().split('T')[0];
    
    // Nastavení data pro ruční zadání záznamu
    const manualDate = document.getElementById('manual-date');
    if (manualDate && !manualDate.value) {
        manualDate.value = today;
    }
    
    // Nastavení data pro finanční záznam
    const financeDate = document.getElementById('finance-date');
    if (financeDate && !financeDate.value) {
        financeDate.value = today;
    }
    
    // Nastavení data pro dluh
    const debtDate = document.getElementById('debt-date');
    if (debtDate && !debtDate.value) {
        debtDate.value = today;
    }
    
    // Nastavení data pro splátku
    const paymentDate = document.getElementById('payment-date');
    if (paymentDate && !paymentDate.value) {
        paymentDate.value = today;
    }
}

// Pomocné funkce pro formátování

// Formátování data
function formatDate(date) {
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
}

// Formátování času
function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Formátování data a času
function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

// Formátování data pro název souboru
function formatDateFileName(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// Stažení CSV souboru
function downloadCSV(content, filename) {
    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
function exportDeductions() {
    try {
        const workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
        
        if (workLogs.length === 0) {
            alert('Žádné záznamy pro výpočet srážek.');
            return;
        }
        
        // Výpočet srážek podle měsíců
        const deductionsByMonth = {};
        
        workLogs.forEach(log => {
            const date = new Date(log.startTime);
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthKey = `${month}-${log.person}`;
            
            if (!deductionsByMonth[monthKey]) {
                deductionsByMonth[monthKey] = {
                    person: log.person,
                    month: month,
                    totalDuration: 0,
                    totalEarnings: 0
                };
            }
            
            deductionsByMonth[monthKey].totalDuration += log.duration;
            deductionsByMonth[monthKey].totalEarnings += log.earnings;
        });
        
        // Příprava dat pro CSV
        const summaryData = Object.values(deductionsByMonth);
        
        // Seřazení podle data a osoby
        summaryData.sort((a, b) => {
            if (a.month !== b.month) {
                return b.month.localeCompare(a.month);
            }
            return a.person.localeCompare(b.person);
        });
        
        // Kontrola, zda je měsíc kompletní
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Filtrace kompletních měsíců
        const completeMonths = summaryData.filter(summary => summary.month !== currentMonth);
        
        if (completeMonths.length === 0) {
            alert('Žádné kompletní měsíce pro výpočet srážek.');
            return;
        }
        
        // Vytvoření CSV dat
        let csvContent = 'Osoba,Měsíc,Celkem odpracováno (h),Hrubý výdělek (Kč),Srážka (%),Srážka (Kč)\n';
        
        completeMonths.forEach(summary => {
            const person = summary.person === 'maru' ? 'Maru' : 'Marty';
            const [year, month] = summary.month.split('-');
            const monthText = new Date(year, month - 1, 1).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
            
            // Výpočet srážky
            const deductionRate = DEDUCTION_RATES[summary.person] * 100;
            const deduction = Math.round(summary.totalEarnings * DEDUCTION_RATES[summary.person]);
            
            // Formátování doby
            const hours = (summary.totalDuration / (1000 * 60 * 60)).toFixed(2);
            
            csvContent += `${person},${monthText},${hours},${summary.totalEarnings.toFixed(0)},${deductionRate.toFixed(2)},${deduction}\n`;
        });
        
        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `srazky-export-${dateStr}.csv`;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu srážek:', error);
        alert('Chyba při exportu srážek.');
    }
}

function exportDebts() {
    try {
        const debts = JSON.parse(localStorage.getItem('debts')) || [];
        const payments = JSON.parse(localStorage.getItem('debtPayments')) || [];
        
        if (debts.length === 0) {
            alert('Žádné dluhy k exportu.');
            return;
        }
        
        // Vytvoření CSV dat pro dluhy
        let csvContent = 'Osoba,Popis,Celková částka,Měna,Datum vzniku,Datum splatnosti,Zaplaceno,Zbývá\n';
        
        debts.forEach(debt => {
            const person = debt.person === 'maru' ? 'Maru' : 'Marty';
            const dateCreated = new Date(debt.date).toLocaleDateString('cs-CZ');
            const dateDue = debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('cs-CZ') : '';
            
            // Výpočet zaplacené částky
            const debtPayments = payments.filter(p => p.debtId === debt.id);
            const totalPaid = debtPayments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = debt.amount - totalPaid;
            
            // Popis (escapování uvozovek)
            const description = `"${debt.description.replace(/"/g, '""')}"`;
            
            csvContent += `${person},${description},${debt.amount.toFixed(2)},${debt.currency},${dateCreated},${dateDue},${totalPaid.toFixed(2)},${remaining.toFixed(2)}\n`;
        });
        
        // Export do souboru
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const dateStr = now.toISOString().substring(0, 10);
        const filename = `dluhy-export-${dateStr}.csv`;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Chyba při exportu dluhů:', error);
        alert('Chyba při exportu dluhů.');
    }
}

// Pomocná funkce pro generování ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}