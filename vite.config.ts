import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // LAN上の他デバイス（iPhone等）からアクセス可能にする
    port: 3000,
  },
});
