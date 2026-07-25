/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ ビルド時のTypeScript型エラーを無視してデプロイを強制実行する
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ ビルド時のESLintエラーを無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
