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
	demand: 10000,
	marketing_cost: 50,
	production_cost: 8,
	sabotage_cost: 20000,
	sabotage_chance: 0.7,
	starting_cash: 30000,
	total_marketing: 0,
	max_price: 40,
	players: []
};

let usa: Country = {
	name: 'USA',
	demand: 7000,
	marketing_cost: 55,
	production_cost: 10,
	sabotage_cost: 25000,
	sabotage_chance: 0.8,
	starting_cash: 35000,
	total_marketing: 0,
	max_price: 50,
	players: []
};
export { china, usa };
