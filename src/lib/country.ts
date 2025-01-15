export interface Country {
	demand: number;
	marketing_cost: number;
	production_cost: number;
	sabotage_cost: number;
	sabotage_chance: number;
	starting_cash: number;
	total_marketing: number;
	max_price: number;
}

let china: Country = {
	demand: 12000,
	marketing_cost: 100,
	production_cost: 8,
	sabotage_cost: 1000,
	sabotage_chance: 0.5,
	starting_cash: 20000,
	total_marketing: 0,
	max_price: 20,
};

let usa: Country = {
	demand: 8000,
	marketing_cost: 75,
	production_cost: 15,
	sabotage_cost: 1500,
	sabotage_chance: 0.75,
	starting_cash: 25000,
	total_marketing: 0,
	max_price: 30,
};

export { china, usa };
