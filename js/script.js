document.addEventListener("DOMContentLoaded", () => {
    let foodData = {};
    const search = document.getElementById("search");
    const tbody = document.getElementById("tbody");
    const table = tbody.closest("table");
    let tomSelectInstance;
    let tfoot = null;

    // Criação da linha vazia inicial
    const emptyRow = document.createElement("tr");
    emptyRow.id = "emptyRow";
    emptyRow.innerHTML = `<td colspan="7" class="text-center text-muted">Nenhum alimento adicionado</td>`;
    tbody.appendChild(emptyRow);

    // Carregar os dados dos alimentos e iniciar TomSelect
    fetch("/data/TACO.json")
        .then(response => response.json())
        .then(data => {
            foodData = Object.fromEntries(data.map(item => [item.description, item]));
            initializeTomSelect();
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));

    function initializeTomSelect() {
        tomSelectInstance = new TomSelect(search, {
            options: getAvailableFoodOptions(),
            optgroups: getOptGroups(),
            onChange: addFoodRow,
            openOnFocus: true,
            render: {
                no_results: () => `<div class="text-muted p-2">Nenhum resultado encontrado</div>`,
            },
            placeholder: "Pesquisar alimento..."
        });
    }

    function getAvailableFoodOptions() {
        const selectedFoods = new Set([...tbody.querySelectorAll("tr[data-food]")].map(row => row.getAttribute("data-food")));
        return Object.values(foodData)
            .filter(item => !selectedFoods.has(item.description))
            .map(item => ({
                value: item.description,
                text: item.description,
                optgroup: item.category
            }));
    }

    function getOptGroups() {
        return Array.from(new Set(Object.values(foodData).map(item => item.category)))
            .map(cat => ({ value: cat, label: cat }));
    }

    function updateFoodOptions() {
        if (!tomSelectInstance) return;
        tomSelectInstance.clearOptions();
        tomSelectInstance.addOptions(getAvailableFoodOptions());
        tomSelectInstance.settings.optgroups = getOptGroups();
    }

    function addFoodRow(foodName) {
        if (!foodName || document.querySelector(`[data-food='${foodName}']`)) return;

        const food = foodData[foodName];
        const newRow = document.createElement("tr");
        newRow.setAttribute("data-food", foodName);
        newRow.innerHTML = `
            <td class="text-nowrap">${foodName}</td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control quantity" value="100" maxlength="3">
                    <span class="input-group-text">g</span>
                </div>
            </td>
            <td class="calories"></td>
            <td class="d-none d-lg-table-cell carbs"></td>
            <td class="d-none d-lg-table-cell proteins"></td>
            <td class="d-none d-lg-table-cell lipids"></td>
            <td>
                <a href="javascript:void(0);" class="link-danger remove-food">
                    <i class="bi bi-x-circle" style="font-size: 2rem;"></i>
                </a>
            </td>
        `;
        tbody.appendChild(newRow);
        tomSelectInstance.clear();
        updateRowValues(newRow, food);
        updateTotals();
        updateFoodOptions();
    }

    function updateRowValues(row, food) {
        const qtyInput = row.querySelector(".quantity");

        function filterNumericInput(event) {
            const newValue = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
            event.target.value = newValue.substring(0, 3); // Limita a 3 dígitos
        }

        function updateValues() {
            const qty = parseFloat(qtyInput.value) || 0;
            row.querySelector(".calories").textContent = `${((food.energy_kcal * qty) / 100).toFixed(2).replace('.', ',')} kcal`;
            row.querySelector(".carbs").textContent = `${((food.carbohydrate_g * qty) / 100).toFixed(2).replace('.', ',')} g`;
            row.querySelector(".proteins").textContent = `${((food.protein_g * qty) / 100).toFixed(2).replace('.', ',')} g`;
            row.querySelector(".lipids").textContent = `${((food.lipid_g * qty) / 100).toFixed(2).replace('.', ',')} g`;
            updateTotals();
        }

        // Aplica o filtro e atualiza os valores
        qtyInput.addEventListener("input", filterNumericInput);
        qtyInput.addEventListener("input", updateValues);
        updateValues();
    }

    function updateTotals() {
        const rows = tbody.querySelectorAll("tr[data-food]");
        const hasFood = rows.length > 0;
        let totalWgt = 0, totalCal = 0, totalCarb = 0, totalProt = 0, totalLip = 0;

        rows.forEach(row => {
            const qty = parseFloat(row.querySelector(".quantity").value) || 0;
            totalWgt += qty;
            totalCal += parseFloat(row.querySelector(".calories").textContent.replace(',', '.')) || 0;
            totalCarb += parseFloat(row.querySelector(".carbs").textContent.replace(',', '.')) || 0;
            totalProt += parseFloat(row.querySelector(".proteins").textContent.replace(',', '.')) || 0;
            totalLip += parseFloat(row.querySelector(".lipids").textContent.replace(',', '.')) || 0;
        });

        emptyRow.style.display = hasFood ? "none" : "";

        if (!hasFood) {
            if (tfoot) {
                tfoot.remove();
                tfoot = null;
            }
            return;
        }

        if (!tfoot) {
            tfoot = document.createElement("tfoot");
            tfoot.innerHTML = `
                <tr>
                    <td class="fw-bold">Total</td>
                    <td id="totalWeight" class="fw-bold"></td>
                    <td id="totalCalories" class="fw-bold"></td>
                    <td id="totalCarbs" class="d-none d-lg-table-cell fw-bold"></td>
                    <td id="totalProteins" class="d-none d-lg-table-cell fw-bold"></td>
                    <td id="totalLipids" class="d-none d-lg-table-cell fw-bold"></td>
                    <td></td>
                </tr>`;
            table.appendChild(tfoot);
        }

        document.getElementById("totalWeight").textContent = `${totalWgt.toFixed(2).replace('.', ',')} g`;
        document.getElementById("totalCalories").textContent = `${totalCal.toFixed(2).replace('.', ',')} kcal`;
        document.getElementById("totalCarbs").textContent = `${totalCarb.toFixed(2).replace('.', ',')} g`;
        document.getElementById("totalProteins").textContent = `${totalProt.toFixed(2).replace('.', ',')} g`;
        document.getElementById("totalLipids").textContent = `${totalLip.toFixed(2).replace('.', ',')} g`;
    }

    document.addEventListener("click", event => {
        if (event.target.closest(".remove-food")) {
            event.target.closest("tr").remove();
            updateTotals();
            updateFoodOptions();
        }
    });
});
