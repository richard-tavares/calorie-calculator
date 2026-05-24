import { loadFoodData } from './data.js';
import { addFood, removeFood, updateQuantity, isEmpty } from './store.js';
import { initSearch, onFoodAdded, onFoodRemoved, renderMeal, updateCardValues, updateTotals } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const searchEl = document.getElementById('food-search');
    const listEl = document.getElementById('food-list');
    const totalsEl = document.getElementById('meal-totals');
    const toggleBtn = document.getElementById('theme-toggle');

    toggleBtn.addEventListener('click', () => {
        const next = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.bsTheme = next;
        localStorage.setItem('theme', next);
    });

    let foodData = {};

    try {
        foodData = await loadFoodData();
    } catch (err) {
        listEl.innerHTML = `<p class="text-center text-danger py-3">${err.message}</p>`;
        return;
    }

    initSearch(searchEl, foodData, (foodName) => {
        if (!foodName) return;
        if (addFood(foodData[foodName])) {
            renderMeal(listEl, totalsEl);
            onFoodAdded(foodName);
        }
    });

    listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.food-remove');
        if (!btn) return;
        const card = btn.closest('.food-card');
        if (!card) return;
        const foodName = card.dataset.food;
        removeFood(foodName);
        renderMeal(listEl, totalsEl);
        onFoodRemoved(foodName);
    });

    listEl.addEventListener('click', (e) => {
        if (!e.target.closest('.portion-add')) return;
        const card = e.target.closest('.food-card');
        if (!card) return;
        const input = card.querySelector('.portion-input');
        const val = Math.min(9999, (Number.parseInt(input.value, 10) || 0) + 50);
        input.value = val;
        const foodName = card.dataset.food;
        updateQuantity(foodName, val);
        updateCardValues(card, foodData[foodName], val);
        if (!isEmpty()) updateTotals(totalsEl);
    });

    listEl.addEventListener('beforeinput', (e) => {
        if (!e.target.classList.contains('portion-input')) return;
        if (e.data && !/^\d+$/.test(e.data)) e.preventDefault();
    });

    listEl.addEventListener('input', (e) => {
        if (!e.target.classList.contains('portion-input')) return;
        e.target.value = e.target.value.replace(/\D/g, '');
        const parsed = Number.parseInt(e.target.value, 10);
        const val = Number.isNaN(parsed) ? 0 : Math.min(9999, Math.max(0, parsed));
        const card = e.target.closest('.food-card');
        if (!card) return;
        const foodName = card.dataset.food;
        updateQuantity(foodName, val);
        updateCardValues(card, foodData[foodName], val);
        if (!isEmpty()) updateTotals(totalsEl);
    });
});
