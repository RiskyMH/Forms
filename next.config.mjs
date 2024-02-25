/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        useLightningcss: true,
        ppr: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/login',
                permanent: false,
            },
            {
                source: '/dashboard',
                destination: '/login?from=/dashboard',
                permanent: false,
                missing: [
                    { type: 'cookie', key: 'token' }
                ]
            },
            {
                source: '/login',
                destination: '/:from?from=',
                permanent: false,
                has: [
                    { type: 'cookie', key: 'token' },
                    { type: 'query', key: 'from' }
                ]
            },
            {
                source: '/login',
                destination: '/dashboard',
                permanent: false,
                has: [
                    { type: 'cookie', key: 'token' }
                ],
                missing: [
                    { type: 'query', key: 'from' }
                ]
            },
            {
                source: '/editor/:id',
                destination: '/login?from=/editor/:id',
                permanent: false,
                missing: [
                    { type: 'cookie', key: 'token' }
                ]
            },

        ];
    }
};

export default nextConfig;
