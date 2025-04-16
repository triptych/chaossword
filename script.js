// The Chaos Sword Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
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
