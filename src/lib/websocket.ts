import { writable } from 'svelte/store';
import type { Player } from './player';
import type { Admin } from './admin';
import { toast } from 'svelte-sonner';
import { WS_URL } from './config';

const player = writable<Player | null | undefined | 'ongoing' | 'loading'>(null);
const admin = writable<Admin | null>(null);
const socket = new WebSocket(WS_URL);

socket.addEventListener('open', (event) => {
	console.log('Connected to server');
});

socket.addEventListener('message', (event) => {
	let data = JSON.parse(event.data);

	if (data.event === 'update') {
		console.log('Received update:', data.data);
		player.set(data.data);
	} else if (data.event === 'sabotage') {
		toast.error('Sabotage!', {
			description: data.data
		});
	} else if (data.event === 'end') {
		player.set(undefined);
	} else if (data.event === 'ongoing') {
		player.set('ongoing');
	} else if (data.event === 'loading') {
		player.set('loading');
	} else if (data.event === 'admin') {
		admin.set(data.data);
		console.log('Received admin update:', data.data);
	}
});

const send = async (event: string, data: any) => {
	for (let attempts = 0; attempts < 5; attempts++) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({ event, data }));
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error('Failed to send message: WebSocket is not connected after 5 attempts');
};

export { socket, send, player, admin };
