module.exports = {
    purge: {
        enabled: true,
        content: ['./index.html']
    },
    darkMode: 'media', // or 'media' or 'class'
    theme: {
        extend: {
            backgroundImage: theme => ({
            })
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}