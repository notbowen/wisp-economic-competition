import { china, usa } from '$lib/country';
import type { Player } from '$lib/player';
import type { Handle } from '@sveltejs/kit';
import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;
let game_queue: Record<string, { player_data: Player; ws: WebSocket }> = {};
let game_ongoing = false;

const join = (data: any, ws: WebSocket) => {
	if (game_queue[data.username]) return;

	// Update country marketing
	let country = data.country === 'China' ? china : usa;
	let other_country = data.country === 'China' ? usa : china;

	country.total_marketing += 20;

	// Add user to country players
	country.players.push(data.username);
	other_country.players.push(data.username);

	game_queue[data.username] = {
		ws,
		player_data: {
			username: data.username,
			country,
			cash: country.starting_cash,
			marketing: 20,
			demand: country.demand * (20 / country.total_marketing),
			price: country.max_price / 2
		}
	};

	// Update the rest of the player's demand
	for (var player in game_queue) {
		if (player !== data.username && game_queue[player].player_data.country === country) {
			game_queue[player].player_data.demand = country.demand * (20 / country.total_marketing);
		}
	}
};

const gameloop = async () => {
	game_ongoing = true;

	const TOTAL_TIME = 3 * 60;
	const ROUND_TIME = 10;

	const loops = TOTAL_TIME / ROUND_TIME;

	// Push updates to all users to init clients
	for (var player in game_queue) {
		game_queue[player].ws.send(
			JSON.stringify({ event: 'update', data: game_queue[player].player_data })
		);
	}

	for (let i = 0; i < loops; i++) {
		console.log(`Starting round ${i + 1} of ${loops}`);

		// Wait for round to end
		await new Promise((r) => setTimeout(r, ROUND_TIME * 1000));

		// Update the user's balance to reflect profit
		for (var player in game_queue) {
			let player_data = game_queue[player].player_data;
			game_queue[player].player_data.cash +=
				player_data.demand * (player_data.price - player_data.country.production_cost) -
				player_data.marketing * player_data.country.marketing_cost;

			game_queue[player].ws.send(
				JSON.stringify({ event: 'update', data: game_queue[player].player_data })
			);
		}
	}

	// Send the end of the game
	for (var player in game_queue) {
		game_queue[player].ws.send(JSON.stringify({ event: 'end', data: null }));
	}

	game_ongoing = false;
};

const update_player = (player: string, new_data: any) => {
	// Update the player's data
	let original_data = game_queue[player].player_data;

	// Calculate change in total marketing
	let marketing_delta = new_data.marketing - original_data.marketing;
	original_data.country.total_marketing += marketing_delta;

	// Update the player's data
	game_queue[player].player_data.marketing = new_data.marketing;
	game_queue[player].player_data.price = new_data.price;

	// Recalculate every player within that country's demand
	for (var player in game_queue) {
		let player_data = game_queue[player].player_data;
		if (player_data.country === original_data.country) {
			player_data.demand =
				original_data.country.demand *
				(player_data.marketing / original_data.country.total_marketing) *
				(1 - player_data.price / player_data.country.max_price);
		}
	}

	// Push the update to the user
	for (var player in game_queue) {
		game_queue[player].ws.send(
			JSON.stringify({ event: 'update', data: game_queue[player].player_data })
		);
	}
};

const sabotage_player = (saboteur: string, target: string) => {
	const success = Math.random() < game_queue[saboteur].player_data.country.sabotage_chance;
	let victim;
	if (success) {
		victim = target;
	} else {
		victim = saboteur;
	}

	// Update the player's data
	game_queue[victim].player_data.cash -= game_queue[victim].player_data.country.sabotage_cost;
	game_queue[victim].ws.send(
		JSON.stringify({ event: 'update', data: game_queue[victim].player_data })
	);

	// Alert the victim
	game_queue[victim].ws.send(
		JSON.stringify({
			event: 'sabotage',
			data:
				(success ? `You've been sabotaged by ${saboteur}!` : 'Sabotage failed!') +
				` You lost $${game_queue[victim].player_data.country.sabotage_cost}`
		})
	);

	// Alert the saboteur if they succeeded
	if (success) {
		game_queue[saboteur].ws.send(
			JSON.stringify({
				event: 'sabotage',
				data: `You've sabotaged ${victim}! They lost $${game_queue[victim].player_data.country.sabotage_cost}!`
			})
		);
	}
};

const handle_event = (event: string, data: any, ws: WebSocket) => {
	if (event === 'join') join(data, ws);
	else if (event === 'start' && !game_ongoing) gameloop();
	else if (event === 'update') update_player(data.username, data);
	else if (event === 'sabotage') sabotage_player(data.saboteur, data.target);
};

const remove_player = (ws: WebSocket) => {
	// Remove player
	for (var player in game_queue) {
		if (game_queue[player].ws === ws) {
			let player_data = game_queue[player].player_data;

			// Remove player from country
			player_data.country.players = player_data.country.players.filter((p) => p !== player);
			let other_country = player_data.country.name === 'China' ? usa : china;
			other_country.players = other_country.players.filter((p) => p !== player);

			// Update the country's total marketing
			player_data.country.total_marketing -= player_data.marketing;

			//  Remove player from game queue
			delete game_queue[player];
			break;
		}
	}

	// Update the rest of the player's demand
	for (var player in game_queue) {
		let player_data = game_queue[player].player_data;
		player_data.demand =
			player_data.country.demand * (player_data.marketing / player_data.country.total_marketing);
	}

	// Push the update to the user
	if (!game_ongoing) return;
	for (var player in game_queue) {
		game_queue[player].ws.send(
			JSON.stringify({ event: 'update', data: game_queue[player].player_data })
		);
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	// Lazy initialization of the WebSocket server (runs once)
	if (!wss) {
		wss = new WebSocketServer({ port: 6969 });

		wss.on('connection', (ws) => {
			console.log('Client connected');

			ws.on('message', (message) => {
				let decoded = JSON.parse(message.toString());
				handle_event(decoded.event, decoded.data, ws);
				console.log('Received message:', decoded);
			});

			ws.on('close', () => {
				remove_player(ws);
				console.log('Client disconnected');
			});
		});
	}

	return resolve(event);
};
