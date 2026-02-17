// MLK Apartments — Main JS

document.addEventListener('DOMContentLoaded', () => {

    // Navbar shrink on scroll
    const navbar = document.getElementById('mainNav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                // Close mobile nav if open
                const navCollapse = document.getElementById('navbarNav');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navCollapse)?.hide();
                }
            }
        });
    });

    // Simple form handler
    const form = document.getElementById('tourForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-circle"></i> Request Sent!';
            btn.disabled = true;
            btn.classList.add('btn-success');
            btn.classList.remove('btn-gold');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-gold');
                form.reset();
            }, 3000);
        });
    }
});
