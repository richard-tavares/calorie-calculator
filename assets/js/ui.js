import { getItems, getTotals, isEmpty } from './store.js';

let tomSelectInstance = null;
let allFoodData = {};

const fmt = (n) => (Number.parseFloat(n) || 0).toFixed(1).replace('.', ',');

function formatFoodName(description) {
    const idx = description.indexOf(', ');
    if (idx === -1) return `<span class="food-main">${description}</span>`;
    return `<span class="food-main">${description.slice(0, idx)}</span><span class="food-details">${description.slice(idx)}</span>`;
}

export function initSearch(element, foodData, onSelect) {
    allFoodData = foodData;
    tomSelectInstance = new TomSelect(element, {
        options: Object.values(foodData).map(item => ({
            value: item.description,
            text: item.description,
            optgroup: item.category
        })),
        optgroups: Array.from(new Set(Object.values(foodData).map(item => item.category)))
            .sort((a, b) => a.localeCompare(b, 'pt-BR'))
            .map(cat => ({ value: cat, label: cat })),
        optgroupField: 'optgroup',
        lockOptgroupOrder: true,
        onChange: onSelect,
        openOnFocus: true,
        render: {
            option: (data) => {
                const idx = data.text.indexOf(', ');
                const main = idx > -1 ? data.text.slice(0, idx) : data.text;
                const details = idx > -1 ? data.text.slice(idx) : '';
                return `<div class="ts-opt">
                    <span class="ts-opt-main">${main}</span>${details ? `<span class="ts-opt-details">${details}</span>` : ''}
                </div>`;
            },
            no_results: () => `<div class="text-muted p-2">Nenhum resultado encontrado</div>`,
        },
        placeholder: "Pesquisar alimento..."
    });
}

export function onFoodAdded(foodName) {
    if (!tomSelectInstance) return;
    tomSelectInstance.clear(true);
    tomSelectInstance.removeOption(foodName);
    tomSelectInstance.refreshOptions(false);
}

export function onFoodRemoved(foodName) {
    if (!tomSelectInstance || !allFoodData[foodName]) return;
    const food = allFoodData[foodName];
    tomSelectInstance.addOption({ value: foodName, text: foodName, optgroup: food.category });
}

export function renderMeal(listEl, totalsEl) {
    listEl.innerHTML = '';

    if (isEmpty()) {
        listEl.innerHTML = `<p class="text-center text-muted py-3">Nenhum alimento adicionado</p>`;
        totalsEl.classList.add('d-none');
        return;
    }

    for (const { food, quantity } of getItems()) {
        listEl.appendChild(createFoodCard(food, quantity));
    }

    updateTotals(totalsEl);
}

function createFoodCard(food, quantity) {
    const qty = Number.parseFloat(quantity) || 0;
    const card = document.createElement('div');
    card.className = 'card mb-2 food-card';
    card.dataset.food = food.description;
    card.innerHTML = `
        <div class="card-body py-1 px-3">
            <div class="food-row d-flex flex-wrap">
                <div class="food-name text-truncate">${formatFoodName(food.description)}</div>
                <div class="food-values d-flex gap-2 gap-md-3">
                    <div class="nutrient-col text-center d-none d-lg-block">
                        <div class="nutrient-value"><span class="sodium">${fmt((Number.parseFloat(food.sodium_mg) || 0) * qty / 100)}</span> <span class="nutrient-unit">mg</span></div>
                        <div class="nutrient-label">Sódio</div>
                    </div>
                    <div class="nutrient-sep d-none d-lg-block" aria-hidden="true"></div>
                    <div class="nutrient-col text-center">
                        <div class="nutrient-value"><span class="lipids">${fmt((Number.parseFloat(food.lipid_g) || 0) * qty / 100)}</span> <span class="nutrient-unit">g</span></div>
                        <div class="nutrient-label">Lipídeos</div>
                    </div>
                    <div class="nutrient-sep d-none d-lg-block" aria-hidden="true"></div>
                    <div class="nutrient-col text-center d-none d-lg-block">
                        <div class="nutrient-value"><span class="fiber">${fmt((Number.parseFloat(food.fiber_g) || 0) * qty / 100)}</span> <span class="nutrient-unit">g</span></div>
                        <div class="nutrient-label">Fibras</div>
                    </div>
                    <div class="nutrient-sep" aria-hidden="true"></div>
                    <div class="nutrient-col text-center">
                        <div class="nutrient-value"><span class="proteins">${fmt((Number.parseFloat(food.protein_g) || 0) * qty / 100)}</span> <span class="nutrient-unit">g</span></div>
                        <div class="nutrient-label">Proteínas</div>
                    </div>
                    <div class="nutrient-sep" aria-hidden="true"></div>
                    <div class="nutrient-col text-center">
                        <div class="nutrient-value"><span class="carbs">${fmt((Number.parseFloat(food.carbohydrate_g) || 0) * qty / 100)}</span> <span class="nutrient-unit">g</span></div>
                        <div class="nutrient-label">Carboidratos</div>
                    </div>
                    <div class="nutrient-sep" aria-hidden="true"></div>
                    <div class="nutrient-col text-center">
                        <div class="nutrient-value fw-bold"><span class="calories">${fmt((Number.parseFloat(food.energy_kcal) || 0) * qty / 100)}</span> <span class="nutrient-unit">kcal</span></div>
                        <div class="nutrient-label">Calorias</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="food-footer d-flex justify-content-center px-3 py-2">
            <button class="food-remove" aria-label="Remover"><i class="bi bi-x-lg"></i></button>
            <div class="d-flex flex-column align-items-center gap-1">
                <div class="input-group input-group-sm portion-group">
                    <button class="btn btn-secondary portion-add" type="button"><i class="bi bi-plus-lg"></i></button>
                    <input type="text" inputmode="numeric" class="form-control portion-input text-end" value="${qty}">
                    <span class="input-group-text">g</span>
                </div>
                <span class="nutrient-label">Porção</span>
            </div>
        </div>
    `;
    return card;
}

export function updateCardValues(card, food, quantity) {
    const qty = Number.parseFloat(quantity) || 0;
    card.querySelector('.calories').textContent = fmt((Number.parseFloat(food.energy_kcal) || 0) * qty / 100);
    card.querySelector('.carbs').textContent = fmt((Number.parseFloat(food.carbohydrate_g) || 0) * qty / 100);
    card.querySelector('.proteins').textContent = fmt((Number.parseFloat(food.protein_g) || 0) * qty / 100);
    card.querySelector('.lipids').textContent = fmt((Number.parseFloat(food.lipid_g) || 0) * qty / 100);
    card.querySelector('.fiber').textContent = fmt((Number.parseFloat(food.fiber_g) || 0) * qty / 100);
    card.querySelector('.sodium').textContent = fmt((Number.parseFloat(food.sodium_mg) || 0) * qty / 100);
}

export function updateTotals(totalsEl) {
    if (isEmpty()) {
        totalsEl.classList.add('d-none');
        return;
    }

    const { cal, carb, prot, lip, fiber, sodium } = getTotals();
    document.getElementById('total-cal').textContent = fmt(cal);
    document.getElementById('total-carb').textContent = fmt(carb);
    document.getElementById('total-prot').textContent = fmt(prot);
    document.getElementById('total-lip').textContent = fmt(lip);
    document.getElementById('total-fiber').textContent = fmt(fiber);
    document.getElementById('total-sodium').textContent = fmt(sodium);
    totalsEl.classList.remove('d-none');
}
