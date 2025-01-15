<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="flex h-screen w-screen">
	{@render children()}
</div>
