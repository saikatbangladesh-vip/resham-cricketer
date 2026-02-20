/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10B981',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#F59E0B',
                    foreground: '#0A0F1E',
                },
                background: '#0A0F1E',
                foreground: '#F1F5F9',
                muted: {
                    DEFAULT: '#1E293B',
                    foreground: '#94A3B8',
                },
                card: {
                    DEFAULT: '#111827',
                    foreground: '#F1F5F9',
                },
                border: 'rgba(255,255,255,0.08)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Rajdhani', 'Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease forwards',
                'scale-in': 'scaleIn 0.25s ease forwards',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 1.6s infinite',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #0A0F1E 0%, #0d1a0f 50%, #0A0F1E 100%)',
                'card-gradient': 'linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 100%)',
                'glow-gradient': 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
            },
        },
    },
    plugins: [],
}
