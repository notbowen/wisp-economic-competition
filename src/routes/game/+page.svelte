<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { player, send } from '$lib/websocket';
	import { Chart } from 'frappe-charts';

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

	function initChart() {
		chart = new Chart(chartContainer, {
			data: {
				labels: ['Turn 1'],
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
	}

	function updateChart() {
		chart.update({
			labels: [...Array(cashHistory.length).keys()].map((i) => `Turn ${i + 1}`),
			datasets: [
				{
					values: cashHistory
				}
			]
		});
	}

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

{#if currentPlayer}
	<div>
	<h1 class="text-center font-bold text-2xl">Cash History</h1>
	<div bind:this={chartContainer} class="mx-auto"></div>
	</div>
{:else}
	<p class="text-center font-medium">
		Waiting for game start... <i class="fas fa-spinner fa-spin"></i>
	</p>
{/if}
