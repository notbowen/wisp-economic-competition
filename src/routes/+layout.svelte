<script>
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	let { children } = $props();
</script>

<Toaster />

<div class="flex h-screen w-screen">
	{@render children()}
</div>
