<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema),
		dataType: 'json'
	});

	const { form: formData, enhance } = form;

	$: selectedCountry = $formData.country
		? {
				label: $formData.country,
				value: $formData.country
			}
		: undefined;
</script>

<div class="m-auto w-full max-w-sm px-4">
	<h1 class="my-5 text-center text-2xl font-bold">Group 1 - Economic Competition</h1>

	<form method="POST" use:enhance>
		<Form.Field {form} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input {...attrs} bind:value={$formData.username} />
			</Form.Control>
			<Form.Description>Name displayed on the leaderboard.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="country">
			<Form.Control let:attrs>
				<Form.Label>Country</Form.Label>
				<Select.Root
					selected={selectedCountry}
					onSelectedChange={(v) => {
						v && ($formData.country = v.value);
					}}
				>
					<Select.Trigger {...attrs}>
						<Select.Value placeholder="Select a country" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="China" label="China" />
						<Select.Item value="USA" label="USA" />
					</Select.Content>
				</Select.Root>
				<input hidden bind:value={$formData.country} name={attrs.name} />
			</Form.Control>
			<Form.Description>Select your host country.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button class="my-4">Submit</Form.Button>
	</form>
</div>
