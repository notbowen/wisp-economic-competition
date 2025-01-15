<script>
	import '../app.css';
	let { children } = $props();
</script>

<div class="flex h-screen w-screen">
	<div class="m-auto w-full max-w-sm px-4">
		{@render children()}
	</div>
</div>
