// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Close mobile menu when a link is clicked
const navItems = document.querySelectorAll('.nav-links a');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks) {
            navLinks.style.display = 'none';
        }
    });
});

// Contact Form Submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const subject = contactForm.querySelectorAll('input[type="text"]')[1].value;
        const message = contactForm.querySelector('textarea').value;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Save to admin panel if function exists
        if (typeof addInquiryFromWebsite === 'function') {
            addInquiryFromWebsite(name, email, subject, message, '');
        } else {
            // Store in localStorage directly
            let inquiries = JSON.parse(localStorage.getItem('admin_inquiries') || '[]');
            inquiries.push({
                name,
                email,
                subject,
                message,
                phone: '',
                date: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('admin_inquiries', JSON.stringify(inquiries));
        }
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and portfolio items
document.querySelectorAll('.service-card, .portfolio-item, .team-member, .testimonial-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// Add active class to navbar on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 0) {
        navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Observe stat elements and animate counters
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('h3');
            if (statNumber && !statNumber.classList.contains('animated')) {
                const target = parseInt(statNumber.textContent);
                animateCounter(statNumber, target);
                statNumber.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statObserver.observe(stat);
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.cta-button, .submit-button').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .cta-button, .submit-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    }
});

// Service card tabs (if needed in future)
function initializeServiceTabs() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

initializeServiceTabs();

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website loaded successfully!');
    
    // Add animation to header
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        hero.style.animation = 'fadeIn 0.8s ease forwards';
    }
});

// Add fade-in animation
const fadeInStyle = document.createElement('style');
fadeInStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeInStyle);

// Intersection Observer for lazy animations
const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.8s ease forwards';
            lazyObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    lazyObserver.observe(section);
});

// Load Team Members from Admin Panel
function loadTeamMembers() {
    const teamGrid = document.getElementById('teamGrid');
    if (!teamGrid) return;
    
    const storedTeam = localStorage.getItem('admin_team');
    const teamMembers = storedTeam ? JSON.parse(storedTeam) : [];
    
    if (teamMembers.length === 0) {
        // Show placeholder if no team members
        teamGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Team members will appear here. Add them via the <a href="admin.html">Admin Dashboard</a>.</p>';
        return;
    }
    
    // Clear placeholder
    teamGrid.innerHTML = '';
    
    // Add team members
    teamMembers.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        
        const imageStyle = member.photo ? `style="background: url('${member.photo}') center/cover no-repeat;"` : '';
        
        memberDiv.innerHTML = `
            <div class="member-image" ${imageStyle}>
                <i class="fas fa-user-circle"></i>
            </div>
            <h3>${member.name}</h3>
            <p>${member.position}</p>
            <p>${member.bio}</p>
        `;
        
        teamGrid.appendChild(memberDiv);
    });
}

// Load team members when page loads
document.addEventListener('DOMContentLoaded', loadTeamMembers);
