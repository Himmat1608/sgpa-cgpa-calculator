document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');

    // Check for saved theme preference, otherwise use system preference
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            // toggle icons
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
                themeToggleIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
                themeToggleIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    // --- Modal Logic ---
    const infoModal = document.getElementById('info-modal');
    const btnHowCalc = document.getElementById('btn-how-calculated');
    const btnCloseInfo = document.getElementById('btn-close-info');

    if (btnHowCalc && infoModal && btnCloseInfo) {
        btnHowCalc.addEventListener('click', () => {
            infoModal.classList.remove('hidden');
            infoModal.classList.add('flex');
        });
        const closeInfo = () => {
            infoModal.classList.add('hidden');
            infoModal.classList.remove('flex');
        };
        btnCloseInfo.addEventListener('click', closeInfo);
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeInfo();
        });
    }

    const settingsModal = document.getElementById('settings-modal');
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveScale = document.getElementById('btn-save-scale');
    const btnAddGrade = document.getElementById('btn-add-grade');
    const scaleContainer = document.getElementById('grading-scale-container');

    if (settingsModal && btnSettings && btnCloseSettings) {
        btnSettings.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            settingsModal.classList.add('flex');
            renderCustomScaleEditor();
        });
        const closeSettings = () => {
            settingsModal.classList.add('hidden');
            settingsModal.classList.remove('flex');
        };
        btnCloseSettings.addEventListener('click', closeSettings);
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `flex items-center w-full max-w-xs p-4 bg-white dark:bg-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 animate-slide-up ${type === 'error' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-secondary'}`;

        const icon = type === 'error' ? '<i class="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>' : '<i class="fa-solid fa-circle-check text-secondary text-xl"></i>';

        toast.innerHTML = `
            <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg">
                ${icon}
            </div>
            <div class="ms-3 text-sm font-medium text-gray-800 dark:text-gray-200">${message}</div>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.replace('animate-slide-up', 'opacity-0');
            toast.classList.add('transition-opacity', 'duration-300');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }



    // --- SGPA Calculator Logic ---
    const sgpaContainer = document.getElementById('subjects-container');
    if (sgpaContainer) {
        const btnAddSubject = document.getElementById('btn-add-subject');
        const btnCalculate = document.getElementById('btn-calculate');
        const btnReset = document.getElementById('btn-reset');
        const systemSelect = document.getElementById('system-select');

        // Grading Systems Data
        const gradingSystems = {
            'indian': {
                type: 'letter',
                scale: { 'O': 10, 'A+': 9.5, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'D': 4, 'F': 0-4 }
            },
            'alternate': {
                type: 'letter',
                scale: { '0': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'G (Pass)': 4, 'E': 0, 'F': 0 }
            },
            '10pt': {
                type: 'numeric',
                scale: null
            },
            '4pt': {
                type: 'letter',
                scale: { 'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 }
            },
            'custom': {
                type: 'letter',
                scale: { 'A': 10, 'B': 8, 'C': 6, 'F': 0 } // Default fallback
            }
        };

        let currentSystem = 'indian';

        // --- Render Grade Info Table ---
        function updateGradeInfoTable() {
            // Main page table (if it exists)
            const tableBody = document.getElementById('grade-table-body');
            const numericInfoContainer = document.getElementById('numeric-info-container');
            const gradeInfoContainer = document.getElementById('grade-info-container');

            // Modal page table (always exists if sgpa route)
            const modalTableBody = document.getElementById('modal-grade-table-body');
            const modalNumericInfoContainer = document.getElementById('modal-numeric-info-container');
            const modalGradeInfoContainer = document.getElementById('modal-grade-info-container');

            const system = gradingSystems[currentSystem];

            if (system.type === 'letter') {
                if (numericInfoContainer) numericInfoContainer.classList.add('hidden');
                if (gradeInfoContainer) gradeInfoContainer.classList.remove('hidden');
                if (modalNumericInfoContainer) modalNumericInfoContainer.classList.add('hidden');
                if (modalGradeInfoContainer) modalGradeInfoContainer.classList.remove('hidden');

                if (tableBody) tableBody.innerHTML = '';
                if (modalTableBody) modalTableBody.innerHTML = '';

                for (const [grade, point] of Object.entries(system.scale)) {
                    const row = `
                        <tr class="bg-white dark:bg-gray-800">
                            <td class="px-4 py-2 text-gray-900 dark:text-gray-100 font-medium">${grade}</td>
                            <td class="px-4 py-2 text-right text-gray-700 dark:text-gray-300">${point.toFixed(1)}</td>
                        </tr>
                    `;
                    if (tableBody) tableBody.insertAdjacentHTML('beforeend', row);
                    if (modalTableBody) modalTableBody.insertAdjacentHTML('beforeend', row);
                }
            } else {
                if (gradeInfoContainer) gradeInfoContainer.classList.add('hidden');
                if (numericInfoContainer) numericInfoContainer.classList.remove('hidden');
                if (modalGradeInfoContainer) modalGradeInfoContainer.classList.add('hidden');
                if (modalNumericInfoContainer) modalNumericInfoContainer.classList.remove('hidden');
            }
        }

        // --- subjects rows ---
        function getGradeInputHTML() {
            const system = gradingSystems[currentSystem];

            if (system.type === 'letter') {
                let options = '<option value="" disabled selected>Grade</option>';
                for (const [grade, point] of Object.entries(system.scale)) {
                    options += `<option value="${point}">${grade}</option>`;
                }
                return `
                    <select class="grade-input subject-grade w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm md:text-base cursor-pointer appearance-none shadow-sm" required>
                        ${options}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs letter-icon"></i>
                `;
            } else {
                return `
                    <input type="number" min="0" max="10" step="0.01" placeholder="Points" class="grade-input subject-grade w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm md:text-base shadow-sm" required>
                `;
            }
        }

        function reRenderGradeInputs() {
            document.querySelectorAll('.subject-row').forEach(row => {
                const gradeContainer = row.querySelector('.grade-container');

                // Preserve subject title and credits, only swap the grade input
                const currentVal = row.querySelector('.subject-grade').value;
                gradeContainer.innerHTML = getGradeInputHTML();

                // Note: since grading scale changes, a previous letter grade might not match 
                // the new scale option value. We could try to map it, but it's cleaner to reset it if it doesn't fit.
                // For number inputs, keeping value makes sense if it's within bounds.
                if (currentVal && gradingSystems[currentSystem].type === 'numeric' && !isNaN(currentVal)) {
                    const numInput = gradeContainer.querySelector('.subject-grade');
                    if (numInput && currentVal >= 0 && currentVal <= 10) {
                        numInput.value = currentVal;
                    }
                }
            });
        }

        function createSubjectRow() {
            const index = sgpaContainer.children.length + 1;
            const row = document.createElement('div');
            row.className = 'subject-row flex gap-3 animate-fade-in group';

            row.innerHTML = `
                <div class="flex-grow grid grid-cols-12 gap-3">
                    <div class="col-span-4 md:col-span-6">
                        <input type="text" placeholder="Subject ${index} (Optional)" class="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm md:text-base shadow-sm">
                    </div>
                    <div class="col-span-4 md:col-span-3">
                        <input type="number" min="0.5" step="0.5" placeholder="Credits" class="subject-credits w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm md:text-base shadow-sm" required>
                    </div>
                    <div class="col-span-4 md:col-span-3 relative grade-container">
                        ${getGradeInputHTML()}
                    </div>
                </div>
                <button type="button" class="btn-remove-subject flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 transition-all focus:outline-none opacity-50 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            row.querySelector('.btn-remove-subject').addEventListener('click', function () {
                if (sgpaContainer.children.length > 1) {
                    row.remove();
                } else {
                    showToast('At least one subject is required.', 'error');
                }
            });

            return row;
        }

        // Event listener for grading system change
        if (systemSelect) {
            systemSelect.addEventListener('change', (e) => {
                currentSystem = e.target.value;
                const btnSettings = document.getElementById('btn-settings');

                if (currentSystem === 'custom') {
                    btnSettings.classList.remove('hidden');
                } else {
                    btnSettings.classList.add('hidden');
                }

                updateGradeInfoTable();
                reRenderGradeInputs();
                showToast(`Switched to ${systemSelect.options[systemSelect.selectedIndex].text}`);
            });
        }

        // Initialize state
        updateGradeInfoTable();

        // Custom Scale logic
        function createGradeOptionRow(grade = '', point = '') {
            const row = document.createElement('div');
            row.className = 'flex gap-2 animate-fade-in custom-grade-row';
            row.innerHTML = `
                <input type="text" placeholder="Grade (e.g. A+)" value="${grade}" class="scale-grade w-1/2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all" required>
                <input type="number" step="0.01" min="0" placeholder="Points" value="${point}" class="scale-point w-1/2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all" required>
                <button type="button" class="btn-remove-scale w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            row.querySelector('.btn-remove-scale').addEventListener('click', () => {
                if (scaleContainer.children.length > 1) row.remove();
                else showToast('You must have at least one grade in the custom scale.', 'error');
            });
            return row;
        }

        function renderCustomScaleEditor() {
            scaleContainer.innerHTML = '';
            const customScale = gradingSystems['custom'].scale;
            for (const [g, p] of Object.entries(customScale)) {
                scaleContainer.appendChild(createGradeOptionRow(g, p));
            }
        }

        if (btnAddGrade) {
            btnAddGrade.addEventListener('click', () => {
                scaleContainer.appendChild(createGradeOptionRow());
            });
        }

        if (btnSaveScale) {
            btnSaveScale.addEventListener('click', () => {
                const rows = document.querySelectorAll('.custom-grade-row');
                const newScale = {};
                let valid = true;
                rows.forEach(row => {
                    const g = row.querySelector('.scale-grade').value.trim();
                    const p = row.querySelector('.scale-point').value;
                    if (g && p !== '') {
                        newScale[g] = parseFloat(p);
                    } else {
                        valid = false;
                    }
                });

                if (valid && Object.keys(newScale).length > 0) {
                    gradingSystems['custom'].scale = Object.fromEntries(
                        Object.entries(newScale).sort(([, a], [, b]) => b - a)
                    );
                    updateGradeInfoTable();
                    reRenderGradeInputs();
                    settingsModal.classList.add('hidden');
                    settingsModal.classList.remove('flex');
                    showToast('Custom grading scale saved and applied.');
                } else {
                    showToast('Please fill all grade and point fields properly.', 'error');
                }
            });
        }

        // --- PDF Export Logic ---
        const btnExportPdf = document.getElementById('btn-export-pdf');
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => {
                // temporarily hide buttons
                const toHide = document.querySelectorAll('.hide-on-pdf');
                toHide.forEach(el => el.classList.add('hidden'));

                const element = document.getElementById('pdf-content-area');

                // Keep the current state of theme on the export
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) document.documentElement.classList.remove('dark'); // html2pdf dark mode can sometimes be problematic, we'll strip it momentarily if we want a clean output, or keep it depending on preference. Let's keep the user's view, html2pdf v0.10.1 usually handles basic dark mode if bg is strictly styled.

                // Because inputs and selects don't always render values well in html2canvas (used by html2pdf),
                // we'll quickly replace input/selects with text spans for the render if it doesn't work, 
                // but html2pdf handles it decently. Let's try standard html2pdf default.

                const opt = {
                    margin: 0.5,
                    filename: 'SGPA_Result.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(element).save().then(() => {
                    // restore hidden buttons
                    toHide.forEach(el => el.classList.remove('hidden'));
                    if (isDark) document.documentElement.classList.add('dark');
                });
            });
        }

        // Init with 4 default subjects
        for (let i = 0; i < 4; i++) {
            sgpaContainer.appendChild(createSubjectRow());
        }

        btnAddSubject.addEventListener('click', () => {
            sgpaContainer.appendChild(createSubjectRow());
        });

        btnReset.addEventListener('click', () => {
            sgpaContainer.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                sgpaContainer.appendChild(createSubjectRow());
            }
            document.getElementById('sgpa-result').innerText = '--';
            document.getElementById('result-message').classList.add('hidden');
            document.getElementById('result-card').classList.remove('result-highlight');
        });

        btnCalculate.addEventListener('click', async () => {
            const rows = document.querySelectorAll('.subject-row');
            let subjects = [];
            let isValid = true;

            rows.forEach(row => {
                const credInput = row.querySelector('.subject-credits');
                const gradeInput = row.querySelector('.subject-grade');

                const credits = parseFloat(credInput.value);
                const grade_point = parseFloat(gradeInput.value);

                credInput.classList.remove('border-red-500');
                gradeInput.classList.remove('border-red-500');

                if (credInput.value.trim() !== '' && gradeInput.value !== '') {
                    if (credits > 0) {
                        // For 10 point numeric, enforce bounds here if we want
                        if (gradingSystems[currentSystem].type === 'numeric') {
                            if (grade_point < 0 || grade_point > 10) {
                                isValid = false;
                                gradeInput.classList.add('border-red-500');
                                showToast('Points must be between 0 and 10.', 'error');
                                return;
                            }
                        }
                        subjects.push({ credits, grade_point });
                    }
                } else if (credInput.value.trim() !== '' || gradeInput.value !== '') {
                    credInput.classList.add('border-red-500');
                    gradeInput.classList.add('border-red-500');
                    isValid = false;
                }
            });

            if (!isValid) {
                // Toast shown above for specific errors, or default here
                if (subjects.length === 0) showToast('Please fill all fields for entered subjects.', 'error');
                return;
            }

            if (subjects.length === 0) {
                showToast('Please enter at least one valid subject.', 'error');
                return;
            }

            const btnText = document.getElementById('calc-text');
            const btnSpinner = document.getElementById('calc-spinner');
            btnText.innerText = 'Calculating...';
            btnSpinner.classList.remove('hidden');
            btnCalculate.disabled = true;

            try {
                const res = await fetch('/api/calculate_sgpa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subjects })
                });

                const data = await res.json();

                setTimeout(() => {
                    btnText.innerText = 'Calculate SGPA';
                    btnSpinner.classList.add('hidden');
                    btnCalculate.disabled = false;

                    if (res.ok) {
                        const resCard = document.getElementById('result-card');
                        const resMsg = document.getElementById('result-message');

                        document.getElementById('sgpa-result').innerText = data.sgpa.toFixed(2);
                        resMsg.innerHTML = `Calculated across <b>${data.total_credits}</b> credits.`;
                        resMsg.classList.remove('hidden');

                        // Performance rating logic
                        const ratingEl = document.getElementById('performance-rating');
                        let ratingText = '';
                        let colorClass = '';

                        if (data.sgpa >= 9) {
                            ratingText = 'Excellent';
                            colorClass = 'text-green-500';
                        } else if (data.sgpa >= 8) {
                            ratingText = 'Very Good';
                            colorClass = 'text-teal-500';
                        } else if (data.sgpa >= 7) {
                            ratingText = 'Good';
                            colorClass = 'text-blue-500';
                        } else if (data.sgpa >= 6) {
                            ratingText = 'Average';
                            colorClass = 'text-yellow-500';
                        } else {
                            ratingText = 'Needs Improvement';
                            colorClass = 'text-red-500';
                        }

                        // Remove old color classes
                        ratingEl.className = 'font-semibold text-lg mb-2';
                        ratingEl.classList.add(colorClass);
                        ratingEl.innerText = ratingText;
                        ratingEl.classList.remove('hidden');

                        resCard.classList.remove('opacity-50');
                        resCard.classList.remove('result-highlight');
                        void resCard.offsetWidth;
                        resCard.classList.add('result-highlight');

                        const exportBtn = document.getElementById('btn-export-pdf');
                        if (exportBtn) exportBtn.classList.remove('hidden');

                    } else {
                        showToast(data.error || 'Calculation failed.', 'error');
                    }
                }, 600);

            } catch (err) {
                showToast('Server error during calculation.', 'error');
                btnText.innerText = 'Calculate SGPA';
                btnSpinner.classList.add('hidden');
                btnCalculate.disabled = false;
            }
        });
    }

    // --- CGPA Calculator Logic ---
    const cgpaContainer = document.getElementById('semesters-container');
    if (cgpaContainer) {
        const btnAddSemester = document.getElementById('btn-add-semester');
        const btnCalculateCGPA = document.getElementById('btn-calculate-cgpa');
        const btnResetCGPA = document.getElementById('btn-reset-cgpa');

        function createSemesterRow() {
            const index = cgpaContainer.children.length + 1;
            const row = document.createElement('div');
            row.className = 'semester-row flex gap-3 animate-fade-in group';

            row.innerHTML = `
                <div class="flex-grow grid grid-cols-12 gap-3">
                    <div class="col-span-4 flex items-center bg-gray-50 shadow-sm dark:bg-gray-800/50 rounded-xl px-4 text-gray-500 font-medium text-sm border border-transparent">
                        Semester <span class="semester-index ml-1">${index}</span>
                    </div>
                    <div class="col-span-4">
                        <input type="number" step="0.5" min="1" placeholder="Credits" class="semester-credits w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm md:text-base shadow-sm" required>
                    </div>
                    <div class="col-span-4">
                        <input type="number" step="0.01" min="0" max="10" placeholder="SGPA" class="semester-sgpa w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm md:text-base shadow-sm" required>
                    </div>
                </div>
                <button type="button" class="btn-remove-semester flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 transition-all focus:outline-none opacity-50 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            row.querySelector('.btn-remove-semester').addEventListener('click', function () {
                if (cgpaContainer.children.length > 1) {
                    row.remove();
                    reindexSemesters();
                } else {
                    showToast('At least one semester is required.', 'error');
                }
            });

            return row;
        }

        function reindexSemesters() {
            const rows = document.querySelectorAll('.semester-row');
            rows.forEach((row, idx) => {
                row.querySelector('.semester-index').innerText = idx + 1;
            });
        }

        for (let i = 0; i < 2; i++) {
            cgpaContainer.appendChild(createSemesterRow());
        }

        btnAddSemester.addEventListener('click', () => {
            cgpaContainer.appendChild(createSemesterRow());
            reindexSemesters();
        });

        btnResetCGPA.addEventListener('click', () => {
            cgpaContainer.innerHTML = '';
            for (let i = 0; i < 2; i++) {
                cgpaContainer.appendChild(createSemesterRow());
            }
            document.getElementById('cgpa-result').innerText = '--';
            document.getElementById('result-message-cgpa').classList.add('hidden');

            const resCard = document.getElementById('result-card-cgpa');
            resCard.classList.remove('opacity-100', 'border-secondary', 'shadow-2xl');
            resCard.classList.add('opacity-50', 'border-transparent');
        });

        btnCalculateCGPA.addEventListener('click', async () => {
            const rows = document.querySelectorAll('.semester-row');
            let semesters = [];
            let isValid = true;

            rows.forEach(row => {
                const credInput = row.querySelector('.semester-credits');
                const sgpaInput = row.querySelector('.semester-sgpa');

                const credits = parseFloat(credInput.value);
                const sgpa = parseFloat(sgpaInput.value);

                credInput.classList.remove('border-red-500');
                sgpaInput.classList.remove('border-red-500');

                if (credInput.value.trim() !== '' && sgpaInput.value.trim() !== '') {
                    if (credits > 0 && sgpa >= 0) {
                        semesters.push({ credits, sgpa });
                    }
                } else if (credInput.value.trim() !== '' || sgpaInput.value.trim() !== '') {
                    credInput.classList.add('border-red-500');
                    sgpaInput.classList.add('border-red-500');
                    isValid = false;
                }
            });

            if (!isValid) {
                showToast('Please fill all fields for entered semesters.', 'error');
                return;
            }

            if (semesters.length === 0) {
                showToast('Please enter at least one valid semester.', 'error');
                return;
            }

            const btnText = document.getElementById('calc-text-cgpa');
            const btnSpinner = document.getElementById('calc-spinner-cgpa');
            btnText.innerText = 'Calculating...';
            btnSpinner.classList.remove('hidden');
            btnCalculateCGPA.disabled = true;

            try {
                const res = await fetch('/api/calculate_cgpa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ semesters })
                });

                const data = await res.json();

                setTimeout(() => {
                    btnText.innerText = 'Calculate CGPA';
                    btnSpinner.classList.add('hidden');
                    btnCalculateCGPA.disabled = false;

                    if (res.ok) {
                        const resCard = document.getElementById('result-card-cgpa');
                        const resMsg = document.getElementById('result-message-cgpa');

                        document.getElementById('cgpa-result').innerText = data.cgpa.toFixed(2);
                        resMsg.innerHTML = `Calculated across <b>${data.total_credits}</b> credits.`;
                        resMsg.classList.remove('hidden');

                        resCard.classList.remove('opacity-50', 'border-transparent');
                        void resCard.offsetWidth;
                        resCard.classList.add('opacity-100', 'border-secondary', 'shadow-2xl');

                    } else {
                        showToast(data.error || 'Calculation failed.', 'error');
                    }
                }, 600);

            } catch (err) {
                showToast('Server error during calculation.', 'error');
                btnText.innerText = 'Calculate CGPA';
                btnSpinner.classList.add('hidden');
                btnCalculateCGPA.disabled = false;
            }
        });

        // --- CGPA Predictor Logic ---
        const predCurrent = document.getElementById('pred-current-cgpa');
        const predCompleted = document.getElementById('pred-completed-sems');
        const predRemaining = document.getElementById('pred-remaining-sems');
        const predExpected = document.getElementById('pred-expected-sgpa');
        const predResult = document.getElementById('pred-result');

        function calculatePrediction() {
            if (!predCurrent || !predCompleted || !predRemaining || !predExpected || !predResult) return;

            const current = parseFloat(predCurrent.value);
            const compSems = parseFloat(predCompleted.value);
            const remSems = parseFloat(predRemaining.value);
            const expSgpa = parseFloat(predExpected.value);

            if (isNaN(current) || isNaN(compSems) || isNaN(remSems) || isNaN(expSgpa)) {
                predResult.innerText = '--';
                return;
            }

            if (compSems <= 0 || remSems <= 0) {
                predResult.innerText = '--';
                return;
            }

            const totalSems = compSems + remSems;
            const finalCgpa = ((current * compSems) + (expSgpa * remSems)) / totalSems;

            predResult.innerText = finalCgpa.toFixed(2);

            // Optional styling based on result
            predResult.className = 'text-3xl font-bold transition-colors duration-300';
            if (finalCgpa >= 8.5) {
                predResult.classList.add('text-green-500');
            } else if (finalCgpa >= 7.0) {
                predResult.classList.add('text-teal-500');
            } else if (finalCgpa >= 6.0) {
                predResult.classList.add('text-yellow-500');
            } else {
                predResult.classList.add('text-red-500');
            }
        }

        if (predCurrent) {
            [predCurrent, predCompleted, predRemaining, predExpected].forEach(input => {
                input.addEventListener('input', calculatePrediction);
            });
        }
    }
});
