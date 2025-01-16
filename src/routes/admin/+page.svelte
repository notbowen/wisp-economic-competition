<script>
	import { admin, send } from '$lib/websocket';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	let authenticated = import.meta.env.DEV;
	let password = '';
	let game_started = false;
	let game_ended = false;
	let remaining_time = 60;

	function startGame() {
		game_started = true;
		updateTime();
		send('start', {});
	}

	function updateTime() {
		remaining_time -= 1;
		if (remaining_time <= 0) {
			game_ended = true;
		}
		setTimeout(updateTime, 1000);
	}

	function checkPassword() {
		if (password === 'root@wisp2024') {
			authenticated = true;
		}
	}

	onMount(() => {
		send('join', { username: 'admin@wisp2024' });
	});
</script>

{#if !authenticated}
	<div class="mx-auto flex h-full flex-col items-center justify-center">
		<h1 class="my-4 text-xl font-bold">Admin Login</h1>
		<div class="flex flex-col gap-2">
			<Input bind:value={password} placeholder="Password" type="password" />
			<Button on:click={checkPassword}>Check</Button>
		</div>
	</div>
{:else}
	<div class="mx-auto flex h-full w-full flex-col">
		<div class="my-10">
			{#if !game_started}
				<div class="flex justify-center">
					<Button on:click={startGame}>Start Game</Button>
				</div>
			{:else if !game_ended}
				<div class="text-center">
					<p class="text-xl">Time Remaining</p>
					<p class="my-4 text-4xl font-bold">{remaining_time} seconds</p>
				</div>
				<div class="text-center font-light text-sm">
					<p><span class="font-bold">{remaining_time % 10} seconds</span> till next round</p>
				</div>
			{:else}
				<div class="text-center">
					<p class="my-4 text-4xl font-bold">Game Ended</p>
				</div>
			{/if}

			<hr class="mx-auto my-5 w-2/3" />

			<h2 class="my-4 text-center font-bold">Round {$admin?.current_round ?? 0} of 10</h2>

			<div class="mx-auto flex w-1/3 flex-col gap-2">
				{#if $admin}
					{#each [...$admin.player_data].sort((a, b) => b.score - a.score) as team, index}
						<div class="flex">
							<p class="w-1/2"><span class="font-bold">{index + 1}.</span>&emsp;{team.name}</p>
							<p class="w-1/2 text-right">${team.score}</p>
						</div>
					{/each}				{:else}
					<p class="text-center">Waiting for players to join...</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
