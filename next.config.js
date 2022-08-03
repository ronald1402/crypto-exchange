module.exports = {
    async redirects() {
        return [{
            source: '/history',
            destination: '/history/deposits',
            permanent: true,
        }]
    },
    images: {
        domains: ['cdn.jsdelivr.net']
    },
};