/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lqsogcxbyoxkdzxxeqll.supabase.co',
                port: '',
                pathname: '/storage/v1/object/sign/**',
            },
        ],
    },
};

export default nextConfig;
