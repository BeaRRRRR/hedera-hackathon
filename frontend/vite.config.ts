import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import esLint from 'vite-plugin-eslint'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load environment variables
    const env = loadEnv(mode, process.cwd(), '');
    
    console.log('Loaded API_HOST:', env.VITE_API_HOST);
    
    return {
        server: {
            host: '::',
            port: 8080,
            proxy: {
                '/api': {
                    target:
                        env.VITE_API_HOST ||
                        'https://b983-178-127-9-102.ngrok-free.app',
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path,
                },
            },
        },
        build: {
            rollupOptions: {
                external: [
                    // '@solana/kit',
                    // '@solana-program/memo',
                    // '@solana-program/system',
                //     '@solana-program/token',
                ],
            },
        },
        plugins: [
            nodePolyfills({
                globals: {
                    Buffer: true,
                    global: true,
                    process: true,
                },
                protocolImports: true,
            }),
            esLint(),
            react(),
            mode === 'development' && componentTagger(),
        ].filter(Boolean),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                // "@solana/web3.js": require.resolve("@solana/web3.js"), // helps vite find the package
            },
        },
        define: {
            global: 'globalThis',
        },
        optimizeDeps: {
            include: ['buffer'],
        },
    };
});
