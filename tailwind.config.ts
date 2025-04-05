import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					'50': 'rgb(251, 240, 240)',
					'100': 'rgb(246, 224, 224)',
					'200': 'rgb(238, 200, 200)',
					'300': 'rgb(229, 169, 169)',
					'400': 'rgb(213, 131, 131)',
					'500': 'rgb(192, 86, 86)',
					'600': 'rgb(180, 51, 51)',
					'700': 'rgb(157, 29, 29)',
					'800': 'rgb(125, 20, 20)',
					'900': 'rgb(98, 18, 18)',
					'950': 'rgb(56, 8, 8)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				courage: {
					'50': 'rgb(251, 240, 240)',
					'100': 'rgb(246, 224, 224)',
					'200': 'rgb(238, 200, 200)',
					'300': 'rgb(229, 169, 169)',
					'400': 'rgb(213, 131, 131)',
					'500': 'rgb(192, 86, 86)',
					'600': 'rgb(180, 51, 51)',
					'700': 'rgb(157, 29, 29)',
					'800': 'rgb(125, 20, 20)',
					'900': 'rgb(98, 18, 18)',
					'950': 'rgb(56, 8, 8)',
				},
				vitality: {
					'50': 'rgb(254, 242, 242)',
					'100': 'rgb(254, 226, 226)',
					'200': 'rgb(254, 202, 202)',
					'300': 'rgb(252, 165, 165)',
					'400': 'rgb(248, 113, 113)',
					'500': 'rgb(239, 68, 68)',
					'600': 'rgb(220, 38, 38)',
					'700': 'rgb(185, 28, 28)',
					'800': 'rgb(153, 27, 27)',
					'900': 'rgb(127, 29, 29)',
					'950': 'rgb(69, 10, 10)',
				},
				growth: {
					'50': 'rgb(245, 243, 255)',
					'100': 'rgb(237, 233, 254)',
					'200': 'rgb(220, 215, 254)',
					'300': 'rgb(202, 191, 253)',
					'400': 'rgb(173, 150, 251)',
					'500': 'rgb(139, 92, 246)',
					'600': 'rgb(124, 58, 237)',
					'700': 'rgb(109, 40, 217)',
					'800': 'rgb(91, 33, 182)',
					'900': 'rgb(76, 29, 149)',
					'950': 'rgb(46, 16, 101)',
				},
				calmness: {
					'50': 'rgb(245, 243, 255)',
					'100': 'rgb(237, 233, 254)',
					'200': 'rgb(220, 215, 254)',
					'300': 'rgb(202, 191, 253)',
					'400': 'rgb(173, 150, 251)',
					'500': 'rgb(139, 92, 246)',
					'600': 'rgb(124, 58, 237)',
					'700': 'rgb(109, 40, 217)',
					'800': 'rgb(91, 33, 182)',
					'900': 'rgb(76, 29, 149)',
					'950': 'rgb(46, 16, 101)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'slide-out': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-out': 'slide-out 0.3s ease-out',
				'float': 'float 6s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
