document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const modeBtn = document.getElementById('modeBtn');
    const pageDashboardContext = body.dataset.dashboardContext;
    const calendarLink = document.querySelector('a[href*="academic-calendar.html"]');
    const linkedDashboardContext = calendarLink
        ? new URL(calendarLink.href).searchParams.get('dashboard')
        : null;
    const dashboardContext = pageDashboardContext === 'university' || pageDashboardContext === 'department'
        ? pageDashboardContext
        : linkedDashboardContext === 'university' || linkedDashboardContext === 'department'
            ? linkedDashboardContext
            : null;

    if (dashboardContext) {
        localStorage.setItem('sau-dashboard-context', dashboardContext);
    }

    const calendarContext = dashboardContext === 'university' || dashboardContext === 'department'
        ? dashboardContext
        : localStorage.getItem('sau-dashboard-context');
    if (calendarContext === 'university' || calendarContext === 'department') {
        document.querySelectorAll('a[href*="academic-calendar.html"]').forEach((link) => {
            link.setAttribute('href', `academic-calendar.html?dashboard=${calendarContext}`);
        });
    }

    const applyTheme = (darkMode) => {
        body.classList.toggle('dark', darkMode);
        if (modeBtn) {
            modeBtn.textContent = darkMode ? '☀️' : '🌙';
        }
        localStorage.setItem('sau-theme', darkMode ? 'dark' : 'light');
    };

    const savedTheme = localStorage.getItem('sau-theme');
    if (savedTheme === 'dark') {
        applyTheme(true);
    }

    if (modeBtn) {
        modeBtn.addEventListener('click', () => {
            applyTheme(!body.classList.contains('dark'));
        });
    }

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const scrollThreshold = 32;
        const isTopNavigation = () => window.matchMedia('(max-width: 980px)').matches;
        const getScrollPosition = () => Math.max(
            window.scrollY || 0,
            document.documentElement.scrollTop || 0,
            document.body.scrollTop || 0
        );
        const isPastScrollThreshold = () => isTopNavigation() && getScrollPosition() > scrollThreshold;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sidebar-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'site-navigation');
        toggle.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
        sidebar.id = 'site-navigation';

        const logo = sidebar.querySelector('.logo');
        if (logo) {
            logo.insertAdjacentElement('afterend', toggle);
        } else {
            sidebar.insertBefore(toggle, sidebar.firstChild);
        }

        const closeMenu = () => {
            sidebar.classList.remove('is-open');
            sidebar.classList.toggle('is-compact', isPastScrollThreshold());
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
        };

        const updateCompactState = () => {
            if (!isTopNavigation() && sidebar.classList.contains('is-open')) {
                sidebar.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
            }
            sidebar.classList.toggle(
                'is-compact',
                isTopNavigation() && (isPastScrollThreshold() || sidebar.classList.contains('is-open'))
            );
        };

        toggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.innerHTML = isOpen
                ? '<span aria-hidden="true">×</span><span>Close</span>'
                : '<span aria-hidden="true">☰</span><span>Menu</span>';
            updateCompactState();
        });

        sidebar.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        const handleScroll = () => {
            if (isPastScrollThreshold() && sidebar.classList.contains('is-open')) {
                closeMenu();
            }
            updateCompactState();
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        window.addEventListener('resize', updateCompactState);
        updateCompactState();
    }
});
