import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		sveltekit(),
	],
	server: {
		host: '0.0.0.0',
		port: 8080,

	}
})
