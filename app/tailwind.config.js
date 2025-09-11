/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'poppins',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'gradient-gray': 'linear-gradient(135deg,#1a1a1a,#0d0d0d)',
  			card: 'linear-gradient(135deg,#333,#000,#00153d)'
  		},
  		boxShadow: {
  			card: '0 0 0 0.1em #fff'
  		},
  		colors: {
  			yellow: 'rgba(255,204,0,.9)',
  			business: '#0b0',
  			design: '#f64a8a',
  			marketing: '#fe6f00',
  			product: '#1e90ff',
  			tech: '#1b2cc1',
  			linkedIn: '#0a66c2',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			xxs: '0.625rem'
  		},
  		animation: {
  			overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  			contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)'
  		},
  		keyframes: {
  			overlayShow: {
  				from: {
  					opacity: 0
  				},
  				to: {
  					opacity: 1
  				}
  			},
  			contentShow: {
  				from: {
  					opacity: 0,
  					transform: 'translate(-50%, -48%) scale(0.96)'
  				},
  				to: {
  					opacity: 1,
  					transform: 'translate(-50%, -50%) scale(1)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
