export async function loadFoodData() {
    const response = await fetch("data/TACO.json");
    if (!response.ok) throw new Error("Falha ao carregar dados nutricionais");
    const items = await response.json();
    return Object.fromEntries(items.map(item => [item.description, item]));
}
