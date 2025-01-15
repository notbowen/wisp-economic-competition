<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { player, send } from '$lib/websocket';
	import { Chart } from 'frappe-charts';
	import { Button } from '$lib/components/ui/button';

	let username = '';
	let country = '';
	let cashHistory: number[] = [];
	let chartContainer: HTMLElement;
	let chart: any;

	$: {
		if (currentPlayer && chartContainer && !chart) {
			cashHistory = [currentPlayer.cash];
			initChart();
		}
	}

	$: currentPlayer = $player;
	$: if (currentPlayer?.cash && chart) {
		if (currentPlayer.cash !== cashHistory[cashHistory.length - 1]) {
			cashHistory = [...cashHistory, currentPlayer.cash];
			updateChart();
		}
	}

	$: targetPlayer = undefined;

	const initChart = () => {
		chart = new Chart(chartContainer, {
			data: {
				labels: ['1'],
				datasets: [
					{
						name: 'Cash',
						values: cashHistory
					}
				]
			},
			type: 'line',
			height: 300,
			colors: ['#333333'],
			lineOptions: {
				hideDots: 0,
				regionFill: 1
			}
		});
	};

	const updateChart = () => {
		chart.update({
			labels: [...Array(cashHistory.length).keys()].map((i) => i + 1),
			datasets: [
				{
					values: cashHistory
				}
			]
		});
	};

	const updatePlayerState = () => {
		send('update', currentPlayer);
	};

	let canSabotage = true;

	const sabotagePlayer = () => {
		if (!targetPlayer || !canSabotage) return;
		send('sabotage', { saboteur: username, target: targetPlayer.value });

		// Disable sabotage and start cooldown
		canSabotage = false;
		setTimeout(() => {
			canSabotage = true;
		}, 10000);
	};

	onMount(() => {
		username = $page.url.searchParams.get('username') || '';
		country = $page.url.searchParams.get('country') || '';

		if (!username || !country) {
			goto('/');
			return;
		}

		if (country !== 'USA' && country !== 'China') {
			goto('/');
			return;
		}

		send('join', { username, country });
	});
</script>

<div class="mx-auto w-full max-w-sm px-4">
	{#if currentPlayer}
		<div class="my-5">
			<h1 class="text-center text-2xl font-bold">
				{username} - {country}
				{country === 'China' ? '🇨🇳' : '🇺🇸'}
			</h1>
			<div bind:this={chartContainer} class="mx-auto"></div>

			<div class="text-center">
				<p><span class="font-bold">Cash:</span> ${currentPlayer.cash.toFixed(2)}</p>
				<p><span class="font-bold">Your Demand:</span> {Math.round(currentPlayer.demand)}</p>
				<p>
					<span class="font-bold">Expected Profit:</span> ${(
						currentPlayer.demand * (currentPlayer.price - currentPlayer.country.production_cost) -
						currentPlayer.marketing * currentPlayer.country.marketing_cost
					).toFixed(2)}
				</p>
			</div>

			<hr class="my-5" />

			<div class="flex flex-col items-center justify-between">
				<p class="my-2 font-bold">Product Price (max: ${currentPlayer.country.max_price})</p>
				<div class="align-center flex gap-2">
					<Button
						on:click={() => {
							if (currentPlayer.price <= 0) return;
							currentPlayer.price -= 1;
							updatePlayerState();
						}}>-1</Button
					>
					<p class="flex w-40 items-center justify-center rounded-sm bg-gray-100">
						${currentPlayer.price}
					</p>
					<Button
						on:click={() => {
							if (currentPlayer.price >= currentPlayer.country.max_price) return;
							currentPlayer.price += 1;
							updatePlayerState();
						}}>+1</Button
					>
				</div>

				<p class="my-2 font-bold">
					Marketing ({currentPlayer.marketing} units = ${currentPlayer.marketing *
						currentPlayer.country.marketing_cost} per round)
				</p>
				<div class="align-center flex gap-2">
					<Button
						on:click={() => {
							if (currentPlayer.marketing <= 0) return;
							currentPlayer.marketing -= 1;
							updatePlayerState();
						}}>-1</Button
					>
					<p class="flex w-40 items-center justify-center rounded-sm bg-gray-100">
						{currentPlayer.marketing} units / {currentPlayer.country.total_marketing} units
					</p>
					<Button
						on:click={() => {
							currentPlayer.marketing += 1;
							updatePlayerState();
						}}>+1</Button
					>
				</div>

				<p class="my-2 font-bold">
					Sabotage (once per 10 secs, ±${currentPlayer.country.sabotage_cost})
				</p>
				<Select.Root selected={targetPlayer} onSelectedChange={(value) => (targetPlayer = value)}>
					<Select.Trigger class="w-64">
						<Select.Value placeholder="Player to sabotage" />
					</Select.Trigger>
					<Select.Content>
						{#if currentPlayer.country.players.filter((p) => p !== username).length > 0}
							{#each currentPlayer.country.players as player}
								{#if player !== username}
									<Select.Item value={player}>{player}</Select.Item>
								{/if}
							{/each}
						{:else}
							<Select.Item value="" disabled>No players to sabotage</Select.Item>
						{/if}
					</Select.Content>
				</Select.Root>
				<Button disabled={!canSabotage} on:click={sabotagePlayer} class="my-2 w-64">Sabotage</Button
				>
			</div>
		</div>
	{:else if currentPlayer === null}
		<p class="flex h-screen items-center justify-center text-center font-medium">
			Waiting for game start... <i class="fas fa-spinner fa-spin"></i>
		</p>
	{:else}
		<div class="text-center font-medium">
			<p>Game ended!</p>
			<p>Sorry for the bad UI; I was too lazy to design 🗿</p>
		</div>
	{/if}
</div>
