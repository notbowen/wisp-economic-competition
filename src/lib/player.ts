import type { Country } from "./country";

export interface Player {
	username: string;
	cash: number;
	marketing: number;
	sabotage: string | null;
	country: Country;
	demand: number;
	price: number;
}