import type { Country } from "./country";

export interface Player {
	username: string;
	cash: number;
	marketing: number;
	country: Country;
	demand: number;
	price: number;
}