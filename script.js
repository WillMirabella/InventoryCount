document.addEventListener("DOMContentLoaded", () => {
    const sizes = JSON.parse(localStorage.getItem('sizes')) || {};

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

    function parseCSV(file, callback) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const rows = text.split("\n").slice(1); // Skip header
            const data = rows.map(row => row.split(",").map(cell => cell.trim()));
            callback(data);
        };
        reader.readAsText(file);
    }

    document.getElementById("upload-add-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("add-file-input");
        if (fileInput.files.length === 0) return;

        parseCSV(fileInput.files[0], (data) => {
            data.forEach(([tissue_id, size]) => {
                if (size) {
                    sizes[size] = (sizes[size] || 0) + 1;
                }
            });
            updateTable();
        });
    });

    document.getElementById("upload-remove-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("remove-file-input");
        if (fileInput.files.length === 0) return;

        parseCSV(fileInput.files[0], (data) => {
            data.forEach(([tissue_id, size]) => {
                if (size && sizes[size]) {
                    sizes[size] = Math.max(0, sizes[size] - 1);
                    if (sizes[size] === 0) {
                        delete sizes[size];
                    }
                }
            });
            updateTable();
        });
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

    // Initial table update
    updateTable();
});
