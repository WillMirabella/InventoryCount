document.addEventListener("DOMContentLoaded", () => {
    const sizes = JSON.parse(localStorage.getItem('sizes')) || {};
    updateTable();

    document.getElementById("upload-add-form").addEventListener("submit", (event) => {
        event.preventDefault();
        handleFileUpload(document.getElementById("add-file-input"), true);
    });

    document.getElementById("upload-remove-form").addEventListener("submit", (event) => {
        event.preventDefault();
        handleFileUpload(document.getElementById("remove-file-input"), false);
    });

    document.getElementById("add-sizes-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const sizeInputs = document.querySelectorAll('#add-sizes-form input[name="size"]');
        const countInputs = document.querySelectorAll('#add-sizes-form input[name="count"]');
        sizeInputs.forEach((input, index) => {
            const size = input.value.trim();
            const count = parseInt(countInputs[index].value);
            if (size && count > 0) {
                sizes[size] = (sizes[size] || 0) + count;
            }
        });
        updateTable();
    });

    document.getElementById("remove-sizes-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const sizeInputs = document.querySelectorAll('#remove-sizes-form input[name="remove-size"]');
        const countInputs = document.querySelectorAll('#remove-sizes-form input[name="remove-count"]');
        sizeInputs.forEach((input, index) => {
            const size = input.value.trim();
            const count = parseInt(countInputs[index].value);
            if (size && count > 0 && sizes[size]) {
                sizes[size] = Math.max(0, sizes[size] - count);
                if (sizes[size] === 0) {
                    delete sizes[size];
                }
            }
        });
        updateTable();
    });

    document.getElementById("add-sizes-btn").addEventListener("click", () => {
        const container = document.getElementById("add-sizes-section");
        const newField = document.createElement("div");
        newField.classList.add("size-entry");
        newField.innerHTML = `
            <label for="size">Enter size:</label>
            <input type="text" name="size" required>
            <label for="count">Enter count:</label>
            <input type="number" name="count" min="1" required>
        `;
        container.appendChild(newField);
    });

    document.getElementById("add-remove-sizes-btn").addEventListener("click", () => {
        const container = document.getElementById("remove-sizes-section");
        const newField = document.createElement("div");
        newField.classList.add("remove-size-entry");
        newField.innerHTML = `
            <label for="remove-size">Enter size:</label>
            <input type="text" name="remove-size" required>
            <label for="remove-count">Enter count:</label>
            <input type="number" name="remove-count" min="1" required>
        `;
        container.appendChild(newField);
    });

    function handleFileUpload(fileInput, isAdd) {
        if (fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = e.target.result;

            if (file.name.endsWith(".csv")) {
                parseCSVData(data, isAdd);
            } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
                parseExcelData(data, isAdd);
            }
        };

        if (file.name.endsWith(".csv")) {
            reader.readAsText(file);
        } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
            reader.readAsArrayBuffer(file);
        }
    }

    function parseCSVData(data, isAdd) {
        const rows = data.split("\n").map(row => row.split(","));
        rows.forEach(([tissue_id, size]) => {
            if (size) {
                if (isAdd) {
                    sizes[size] = (sizes[size] || 0) + 1;
                } else if (sizes[size]) {
                    sizes[size] = Math.max(0, sizes[size] - 1);
                    if (sizes[size] === 0) {
                        delete sizes[size];
                    }
                }
            }
        });
        updateTable();
    }

    function parseExcelData(data, isAdd) {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        rows.forEach(([tissue_id, size]) => {
            if (size) {
                if (isAdd) {
                    sizes[size] = (sizes[size] || 0) + 1;
                } else if (sizes[size]) {
                    sizes[size] = Math.max(0, sizes[size] - 1);
                    if (sizes[size] === 0) {
                        delete sizes[size];
                    }
                }
            }
        });
        updateTable();
    }

    function updateTable() {
        const tbody = document.getElementById("size-counts-body");
        tbody.innerHTML = "";
        for (const [size, count] of Object.entries(sizes)) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${size}</td><td>${count}</td>`;
            tbody.appendChild(row);
        }
        localStorage.setItem('sizes', JSON.stringify(sizes));
    }
});
