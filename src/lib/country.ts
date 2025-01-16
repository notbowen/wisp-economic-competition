export interface Country {
	name: string;
	demand: number;
	marketing_cost: number;
	production_cost: number;
	sabotage_cost: number;
	sabotage_chance: number;
	starting_cash: number;
	total_marketing: number;
	max_price: number;
	players: string[];
}

let china: Country = {
	name: 'China',
	demand: 6000,
	marketing_cost: 80,
	production_cost: 10,
	sabotage_cost: 10000,
	sabotage_chance: 0.5,
	starting_cash: 20000,
	total_marketing: 0,
	max_price: 20,
	players: []
};

let usa: Country = {
	name: 'USA',
	demand: 4000,
	marketing_cost: 75,
	production_cost: 13,
	sabotage_cost: 13000,
	sabotage_chance: 0.6,
	starting_cash: 23000,
	total_marketing: 0,
	max_price: 30,
	players: []
};

export { china, usa };
