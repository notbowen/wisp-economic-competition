import { china, usa } from '$lib/country';
import type { Player } from '$lib/player';
import type { Handle } from '@sveltejs/kit';
import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;
let game_queue: Record<string, { player_data: Player; ws: WebSocket }> = {};

const join = (data: any, ws: WebSocket) => {
	if (game_queue[data.username]) return;

	// Update country marketing
	let country = data.country === 'China' ? china : usa;
	country.total_marketing += 20;

	game_queue[data.username] = {
		ws,
		player_data: {
			username: data.username,
			country,
			cash: country.starting_cash,
			marketing: 20,
			sabotage: null,
			demand: country.demand * (20 / country.total_marketing),
			price: country.max_price / 2,
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
		await new Promise(r => setTimeout(r, ROUND_TIME * 1000));

		// Update the user's balance to reflect profit
		for (var player in game_queue) {
			let player_data = game_queue[player].player_data;
			game_queue[player].player_data.cash += player_data.demand * (player_data.price - player_data.country.production_cost) - (player_data.marketing * player_data.country.marketing_cost);

			game_queue[player].ws.send(
				JSON.stringify({ event: 'update', data: game_queue[player].player_data })
			);
		}
	}

	// Send the end of the game
	for (var player in game_queue) {
		game_queue[player].ws.send(JSON.stringify({ event: 'end', data: null }));
	}
};

const update_player = (player: string, new_data: any) => {
	// Update the player's data
	let original_data = game_queue[player].player_data;

	// Calculate change in total marketing
	let marketing_delta = new_data.marketing - original_data.marketing;
	original_data.country.total_marketing += marketing_delta;

	// Update the player's data
	game_queue[player].player_data = new_data;

	// Recalculate every player within that country's demand
	for (var player in game_queue) {
		let player_data = game_queue[player].player_data;
		if (player_data.country === original_data.country) {
			player_data.demand = original_data.country.demand * (player_data.marketing / original_data.country.total_marketing);
		}
	}

	// Push the update to the user
	for (var player in game_queue) {
		game_queue[player].ws.send(JSON.stringify({ event: 'update', data: game_queue[player].player_data }));
	}
};

const handle_event = (event: string, data: any, ws: WebSocket) => {
	if (event === 'join') join(data, ws);
	else if (event === 'start') gameloop();
	else if (event === 'update') update_player(data.username, data);
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
				console.log('Client disconnected');
			});
		});
	}

	return resolve(event);
};
