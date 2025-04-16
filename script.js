// The Chaos Sword Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Custom Sword Cursor Implementation
    function initCustomCursor() {
        // Add the sword-cursor class to the body for global cursor control
        document.body.classList.add('sword-cursor');

        // Create sword cursor element using SVG
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');

        // Create SVG sword using data URI
        const swordSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
            <g transform="rotate(-15, 16, 16)">
                <!-- Sword handle -->
                <rect x="14" y="20" width="4" height="8" rx="1" fill="#8B4513" />
                <rect x="13" y="19" width="6" height="2" rx="1" fill="#d4a13b" />

                <!-- Guard -->
                <rect x="8" y="18" width="16" height="2" rx="1" fill="#d4a13b" />

                <!-- Blade -->
                <path d="M16,18 L16,3 L19,6 L16,4 L13,6 L16,3 Z" fill="#e0e0e0" />

                <!-- Blade shine -->
                <path d="M16,18 L16,3 L17,5 L16,4 Z" fill="#ffffff" opacity="0.7" />
            </g>

            <!-- Magical glow -->
            <circle cx="16" cy="16" r="14" fill="url(#glow)" opacity="0.2" />

            <!-- Gradients for glow -->
            <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stop-color="#3a7bd5" stop-opacity="0.8" />
                    <stop offset="100%" stop-color="#3a7bd5" stop-opacity="0" />
                </radialGradient>
            </defs>
        </svg>
        `;

        // Set the cursor content
        cursor.innerHTML = swordSvg;
        document.body.appendChild(cursor);

        // Track mouse movement to update cursor position
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            // Create magical particles with each mouse movement
            createMagicalParticle(e.clientX, e.clientY);
        });

        // Ensure cursor is visible when entering window
        document.addEventListener('mouseenter', (e) => {
            cursor.style.display = 'block';
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', (e) => {
            cursor.style.display = 'none';
        });
    }

    // Function to create magical particles
    function createMagicalParticle(x, y) {
        // Don't create particles on every mouse movement to avoid overloading
        if (Math.random() > 0.3) return;

        const particle = document.createElement('div');
        particle.classList.add('cursor-particle');

        // Random size for particles
        const size = Math.random() * 6 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Set initial position at cursor
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Create random movement direction
        const tx = (Math.random() - 0.5) * 40;
        const ty = (Math.random() - 0.5) * 40;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        // Random color for particles (magical effect)
        const colors = [
            'rgba(58, 123, 213, 0.8)',    // Primary blue
            'rgba(212, 161, 59, 0.8)',    // Secondary gold
            'rgba(231, 76, 60, 0.8)',     // Fire red
            'rgba(52, 152, 219, 0.8)',    // Water blue
            'rgba(241, 196, 15, 0.8)',    // Air yellow
            'rgba(46, 204, 113, 0.8)'     // Earth green
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 ${size}px ${color}`;

        // Add to DOM
        document.body.appendChild(particle);

        // Remove after animation completes
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    // Initialize the custom cursor
    initCustomCursor();
    // Navigation highlighting on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    // Function to highlight active navigation item
    function highlightNav() {
        let scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Call highlightNav on scroll
    window.addEventListener('scroll', highlightNav);

    // Character icon animations
    const characterIcons = document.querySelectorAll('.character-icon');

    characterIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            // Create elemental particle effect
            const particleCount = 10;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('span');
                particle.classList.add('elemental-particle');

                // Determine which element based on icon class
                if (this.classList.contains('sword-icon')) {
                    particle.classList.add('fire-particle');
                } else if (this.classList.contains('artifact-icon')) {
                    particle.classList.add('water-particle');
                } else if (this.classList.contains('villain-icon')) {
                    particle.classList.add('dark-particle');
                } else if (this.classList.contains('ally-icon')) {
                    particle.classList.add('air-particle');
                }

                // Set random positions and animations
                const size = Math.random() * 6 + 3;
                const xPos = Math.random() * 70 + 10;
                const yPos = Math.random() * 70 + 10;
                const animDuration = Math.random() * 1 + 0.5;

                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${xPos}%`;
                particle.style.top = `${yPos}%`;
                particle.style.animationDuration = `${animDuration}s`;

                this.appendChild(particle);

                // Remove particle after animation
                setTimeout(() => {
                    particle.remove();
                }, animDuration * 1000);
            }
        });
    });

    // Artifact list hover effect - add subtle glow effect based on element
    const artifactItems = document.querySelectorAll('.artifact-list li');

    artifactItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            const colors = [
                'rgba(231, 76, 60, 0.2)',   // Fire/Chaos (red)
                'rgba(52, 152, 219, 0.2)',  // Water/Order (blue)
                'rgba(241, 196, 15, 0.2)',  // Air/Knowledge (yellow)
                'rgba(46, 204, 113, 0.2)'   // Earth/Stability (green)
            ];

            this.style.boxShadow = `0 0 20px ${colors[index]}`;
        });

        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
        });
    });

    // Add smooth reveal animations for elements as they scroll into view
    const fadeElements = document.querySelectorAll('.character-card, .element, .story-quote');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => {
        element.classList.add('fade-element');
        fadeObserver.observe(element);
    });

    // Book cover effect - subtle glow pulse
    const bookCover = document.querySelector('.book-cover');

    if (bookCover) {
        // Initial setup
        let glowIntensity = 0;
        let increasing = true;
        const maxGlow = 20;
        const minGlow = 5;
        const glowColor = '58, 123, 213'; // blue-gold primary color RGB

        // Pulse animation
        function pulseGlow() {
            if (increasing) {
                glowIntensity += 0.2;
                if (glowIntensity >= maxGlow) {
                    increasing = false;
                }
            } else {
                glowIntensity -= 0.2;
                if (glowIntensity <= minGlow) {
                    increasing = true;
                }
            }

            bookCover.style.boxShadow = `
                0 10px 30px rgba(0, 0, 0, 0.5),
                0 0 ${glowIntensity}px rgba(${glowColor}, 0.5),
                0 0 ${glowIntensity * 2}px rgba(212, 161, 59, 0.3)
            `;

            requestAnimationFrame(pulseGlow);
        }

        // Start the pulse effect after a short delay
        setTimeout(() => {
            requestAnimationFrame(pulseGlow);
        }, 1000);
    }

    // Add special effect for element sections - subtle background animation
    const elementSections = document.querySelectorAll('.element');

    elementSections.forEach(section => {
        const elementType = section.classList[1]; // fire, water, air, or earth
        let backgroundOpacity = 0.02;
        let opacityIncreasing = true;

        function animateElementBackground() {
            if (opacityIncreasing) {
                backgroundOpacity += 0.001;
                if (backgroundOpacity >= 0.08) {
                    opacityIncreasing = false;
                }
            } else {
                backgroundOpacity -= 0.001;
                if (backgroundOpacity <= 0.02) {
                    opacityIncreasing = true;
                }
            }

            let color;
            switch(elementType) {
                case 'fire':
                    color = '231, 76, 60';
                    break;
                case 'water':
                    color = '52, 152, 219';
                    break;
                case 'air':
                    color = '241, 196, 15';
                    break;
                case 'earth':
                    color = '46, 204, 113';
                    break;
                default:
                    color = '0, 0, 0';
            }

            section.style.background = `linear-gradient(to bottom, rgba(${color}, ${backgroundOpacity + 0.04}), rgba(${color}, ${backgroundOpacity}))`;

            requestAnimationFrame(animateElementBackground);
        }

        section.addEventListener('mouseenter', function() {
            requestAnimationFrame(animateElementBackground);
        });
    });

    // Add CSS for the animations
    const style = document.createElement('style');
    style.textContent = `
        .active {
            color: var(--secondary-color) !important;
        }

        .fade-element {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }

        .elemental-particle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.8;
            animation: float-away 1s ease-out forwards;
        }

        .fire-particle {
            background: linear-gradient(135deg, #e74c3c, #ff7763);
            box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
        }

        .water-particle {
            background: linear-gradient(135deg, #3498db, #7cc3ff);
            box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
        }

        .air-particle {
            background: linear-gradient(135deg, #f1c40f, #ffe066);
            box-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
        }

        .dark-particle {
            background: linear-gradient(135deg, #2c3e50, #4a6282);
            box-shadow: 0 0 10px rgba(44, 62, 80, 0.5);
        }

        @keyframes float-away {
            0% {
                transform: scale(0) translate(0, 0);
                opacity: 0.8;
            }
            100% {
                transform: scale(1) translate(var(--tx), var(--ty));
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);

    // Set random directions for particles
    document.querySelectorAll('.elemental-particle').forEach(particle => {
        const tx = (Math.random() - 0.5) * 100;
        const ty = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
    });
});
