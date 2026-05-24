const meal = new Map();

export function addFood(food, quantity = 100) {
    if (meal.has(food.description)) return false;
    meal.set(food.description, { food, quantity });
    return true;
}

export function removeFood(name) {
    return meal.delete(name);
}

export function updateQuantity(name, quantity) {
    const entry = meal.get(name);
    if (entry) entry.quantity = quantity;
}

export function getItems() {
    return [...meal.values()];
}

export function getTotals() {
    let weight = 0, cal = 0, carb = 0, prot = 0, lip = 0, fiber = 0, sodium = 0;
    for (const { food, quantity } of meal.values()) {
        const q = Number.parseFloat(quantity) || 0;
        weight += q;
        cal += ((Number.parseFloat(food.energy_kcal) || 0) * q) / 100;
        carb += ((Number.parseFloat(food.carbohydrate_g) || 0) * q) / 100;
        prot += ((Number.parseFloat(food.protein_g) || 0) * q) / 100;
        lip += ((Number.parseFloat(food.lipid_g) || 0) * q) / 100;
        fiber += ((Number.parseFloat(food.fiber_g) || 0) * q) / 100;
        sodium += ((Number.parseFloat(food.sodium_mg) || 0) * q) / 100;
    }
    return { weight, cal, carb, prot, lip, fiber, sodium };
}

export function isEmpty() {
    return meal.size === 0;
}
