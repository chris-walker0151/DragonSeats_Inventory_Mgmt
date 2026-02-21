export const APP_NAME = "Dragon Seats";
export const APP_SUBTITLE = "Inventory Management";

export const WAREHOUSES = [
    { code: "CLE", name: "Cleveland", location: "cleveland_warehouse" as const, color: "var(--hub-cle)" },
    { code: "KC", name: "Kansas City", location: "kansas_city_warehouse" as const, color: "var(--hub-kc)" },
    { code: "JAX", name: "Jacksonville", location: "jacksonville_warehouse" as const, color: "var(--hub-jax)" },
] as const;

export const ITEMS_PER_PAGE = 50;
