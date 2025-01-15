<script>
	import { send } from '$lib/websocket';

	function startGame() {
		send('start', {});
	}
</script>

<button on:click={startGame}>Start Game</button>
