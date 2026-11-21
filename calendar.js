document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('academic-calendar-grid');
    const monthLabel = document.getElementById('calendar-month-label');
    const agenda = document.getElementById('calendar-agenda');
    const details = document.getElementById('selected-day-details');
    const selectedDayTitle = document.getElementById('selected-day-title');
    const previousButton = document.getElementById('previous-month');
    const nextButton = document.getElementById('next-month');
    const dashboardLink = document.getElementById('calendar-dashboard-link');

    if (!calendarGrid || !monthLabel || !agenda || !details || !selectedDayTitle ||
        !previousButton || !nextButton) {
        return;
    }

    const schedule = [
        {
            title: 'Commencement of Academic Session',
            label: 'Continuing students and first-year PG and PhD students',
            start: '2026-07-27',
            end: '2026-07-27',
            category: 'Academic session',
            type: 'session'
        },
        {
            title: 'Commencement of Academic Session',
            label: 'First-year UG students',
            start: '2026-08-10',
            end: '2026-08-10',
            category: 'Academic session',
            type: 'session'
        },
        {
            title: 'Mid-Semester Examinations',
            label: 'Monsoon Semester',
            start: '2026-10-12',
            end: '2026-10-16',
            category: 'Examinations',
            type: 'examination'
        },
        {
            title: 'End-Semester Examinations',
            label: 'Monsoon Semester',
            start: '2026-11-26',
            end: '2026-12-10',
            category: 'Examinations',
            type: 'examination'
        },
        {
            title: 'Winter Vacation',
            label: 'Winter break',
            start: '2026-12-11',
            end: '2027-01-10',
            category: 'Vacation',
            type: 'vacation'
        },
        {
            title: 'Submission of Grades to the Examinations Division',
            label: 'Monsoon Semester',
            start: '2026-12-16',
            end: '2026-12-16',
            category: 'Grade deadline',
            type: 'deadline'
        },
        {
            title: 'Commencement of Winter Semester',
            label: 'Winter Semester begins',
            start: '2027-01-11',
            end: '2027-01-11',
            category: 'Academic session',
            type: 'session'
        },
        {
            title: 'Mid-Semester Examinations',
            label: 'Winter Semester',
            start: '2027-03-15',
            end: '2027-03-19',
            category: 'Examinations',
            type: 'examination'
        },
        {
            title: 'End-Semester Examinations',
            label: 'Winter Semester',
            start: '2027-05-10',
            end: '2027-05-25',
            category: 'Examinations',
            type: 'examination'
        },
        {
            title: 'Summer Vacation',
            label: 'Summer break',
            start: '2027-05-26',
            end: '2027-07-25',
            category: 'Vacation',
            type: 'vacation'
        },
        {
            title: 'Submission of Grades to the Examinations Division',
            label: 'Winter Semester',
            start: '2027-05-28',
            end: '2027-05-28',
            category: 'Grade deadline',
            type: 'deadline'
        }
    ];

    const academicStartMonth = '2026-07';
    const academicEndMonth = '2027-07';
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
    const monthFormatter = new Intl.DateTimeFormat('en-IN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
    const longDateFormatter = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });

    const makeDate = (year, monthIndex, day) => new Date(Date.UTC(year, monthIndex, day));
    const dateKey = (date) => date.toISOString().slice(0, 10);
    const monthKey = (date) => dateKey(makeDate(date.getUTCFullYear(), date.getUTCMonth(), 1)).slice(0, 7);
    const parseDate = (value) => {
        const [year, month, day] = value.split('-').map(Number);
        return makeDate(year, month - 1, day);
    };
    const monthStartForKey = (value) => {
        const [year, month] = value.split('-').map(Number);
        return makeDate(year, month - 1, 1);
    };
    const eventsForDate = (key) => schedule.filter((item) => item.start <= key && item.end >= key);
    const monthEvents = (key) => schedule.filter((item) => item.start.slice(0, 7) <= key && item.end.slice(0, 7) >= key);
    const formatDate = (value) => dateFormatter.format(parseDate(value));
    const formatRange = (item) => item.start === item.end
        ? formatDate(item.start)
        : `${formatDate(item.start)} – ${formatDate(item.end)}`;

    const now = new Date();
    const todayKey = dateKey(makeDate(now.getFullYear(), now.getMonth(), now.getDate()));
    const todayMonth = todayKey.slice(0, 7);
    let visibleMonth = monthStartForKey(
        todayMonth < academicStartMonth
            ? academicStartMonth
            : todayMonth > academicEndMonth
                ? academicEndMonth
                : todayMonth
    );
    let selectedDate = todayKey;

    if (dashboardLink) {
        const requestedDashboard = new URLSearchParams(window.location.search).get('dashboard');
        const savedDashboard = localStorage.getItem('sau-dashboard-context');
        const dashboard = requestedDashboard === 'university' || requestedDashboard === 'department'
            ? requestedDashboard
            : savedDashboard === 'university' || savedDashboard === 'department'
                ? savedDashboard
                : 'department';
        dashboardLink.href = `${dashboard}-dashboard.html`;
    }

    const setDefaultSelectedDate = () => {
        const visibleKey = monthKey(visibleMonth);
        const days = monthEvents(visibleKey)
            .flatMap((item) => {
                const firstDay = item.start.slice(0, 7) < visibleKey
                    ? `${visibleKey}-01`
                    : item.start;
                const lastDay = item.end.slice(0, 7) > visibleKey
                    ? dateKey(makeDate(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 0))
                    : item.end;
                const dates = [];
                for (let cursor = parseDate(firstDay); dateKey(cursor) <= lastDay; cursor = makeDate(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1)) {
                    dates.push(dateKey(cursor));
                }
                return dates;
            })
            .sort();
        const upcoming = days.find((day) => day >= todayKey);
        selectedDate = eventsForDate(todayKey).length && todayKey.slice(0, 7) === visibleKey
            ? todayKey
            : upcoming || days[0] || `${visibleKey}-01`;
    };

    const createDot = (type) => {
        const dot = document.createElement('span');
        dot.className = `calendar-dot calendar-dot--${type}`;
        dot.setAttribute('aria-hidden', 'true');
        return dot;
    };

    const renderSelectedDate = () => {
        const selectedEvents = eventsForDate(selectedDate);
        selectedDayTitle.textContent = `Schedule for ${longDateFormatter.format(parseDate(selectedDate))}`;
        details.replaceChildren();

        if (!selectedEvents.length) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'calendar-empty-message';
            emptyMessage.textContent = 'No academic schedule items are listed for this date.';
            details.appendChild(emptyMessage);
            return;
        }

        selectedEvents.forEach((item) => {
            const card = document.createElement('article');
            card.className = 'calendar-event-detail';
            card.appendChild(createDot(item.type));

            const content = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = item.title;
            const label = document.createElement('p');
            label.className = 'calendar-event-date';
            label.textContent = `${item.label} · ${formatRange(item)}`;
            content.append(title, label);
            card.appendChild(content);

            const category = document.createElement('span');
            category.className = 'calendar-category';
            category.textContent = item.category;
            card.appendChild(category);
            details.appendChild(card);
        });
    };

    const renderAgenda = () => {
        const key = monthKey(visibleMonth);
        const items = monthEvents(key);
        agenda.replaceChildren();

        if (!items.length) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'calendar-empty-message';
            emptyMessage.textContent = 'No academic schedule items are listed for this month.';
            agenda.appendChild(emptyMessage);
            return;
        }

        items.forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'calendar-agenda-item';
            const itemStartMonth = item.start.slice(0, 7);
            const itemEndMonth = item.end.slice(0, 7);
            const firstVisibleDate = itemStartMonth < key
                ? `${key}-01`
                : item.start;
            const lastVisibleDate = itemEndMonth > key
                ? dateKey(makeDate(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 0))
                : item.end;
            button.dataset.date = firstVisibleDate;
            button.setAttribute('aria-label', `${item.title}, ${item.label}, ${formatRange(item)}`);
            if (eventsForDate(selectedDate).includes(item)) {
                button.classList.add('is-selected');
            }
            button.appendChild(createDot(item.type));

            const text = document.createElement('span');
            const label = document.createElement('span');
            label.className = 'calendar-agenda-label';
            label.textContent = `${item.title} · ${item.label}`;
            const date = document.createElement('span');
            date.className = 'calendar-agenda-date';
            date.textContent = firstVisibleDate === item.start && lastVisibleDate === item.end
                ? formatRange(item)
                : `${formatDate(firstVisibleDate)} – ${formatDate(lastVisibleDate)}`;
            text.append(label, date);
            button.appendChild(text);
            button.addEventListener('click', () => {
                selectedDate = firstVisibleDate;
                render();
            });
            agenda.appendChild(button);
        });
    };

    const renderCalendar = () => {
        const year = visibleMonth.getUTCFullYear();
        const month = visibleMonth.getUTCMonth();
        const key = monthKey(visibleMonth);
        const firstWeekday = makeDate(year, month, 1).getUTCDay();
        const daysInMonth = makeDate(year, month + 1, 0).getUTCDate();
        const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

        monthLabel.textContent = monthFormatter.format(visibleMonth);
        calendarGrid.setAttribute('aria-label', `Academic schedule for ${monthLabel.textContent}`);
        calendarGrid.replaceChildren();

        for (let cell = 0; cell < cellCount; cell += 1) {
            const dayNumber = cell - firstWeekday + 1;
            if (dayNumber < 1 || dayNumber > daysInMonth) {
                const emptyCell = document.createElement('span');
                emptyCell.className = 'calendar-empty';
                emptyCell.setAttribute('aria-hidden', 'true');
                calendarGrid.appendChild(emptyCell);
                continue;
            }

            const date = makeDate(year, month, dayNumber);
            const keyForDate = dateKey(date);
            const dayEvents = eventsForDate(keyForDate);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'calendar-day';
            button.dataset.date = keyForDate;
            button.setAttribute('aria-pressed', String(keyForDate === selectedDate));
            const eventLabels = dayEvents.map((item) => `${item.title}: ${item.label}`);
            button.setAttribute(
                'aria-label',
                `${longDateFormatter.format(date)}${eventLabels.length ? `. ${eventLabels.join('. ')}` : ''}`
            );
            if (keyForDate === selectedDate) {
                button.classList.add('is-selected');
            }
            if (keyForDate === todayKey) {
                button.classList.add('is-today');
            }

            const number = document.createElement('span');
            number.className = 'calendar-day-number';
            number.textContent = String(dayNumber);
            button.appendChild(number);

            const dots = document.createElement('span');
            dots.className = 'calendar-day-dots';
            dots.setAttribute('aria-hidden', 'true');
            const seenTypes = new Set();
            dayEvents.forEach((item) => {
                if (!seenTypes.has(item.type)) {
                    dots.appendChild(createDot(item.type));
                    seenTypes.add(item.type);
                }
            });
            button.appendChild(dots);
            button.addEventListener('click', () => {
                selectedDate = keyForDate;
                render();
            });
            calendarGrid.appendChild(button);
        }

        const previousMonth = monthKey(makeDate(year, month - 1, 1));
        const nextMonth = monthKey(makeDate(year, month + 1, 1));
        previousButton.disabled = previousMonth < academicStartMonth;
        nextButton.disabled = nextMonth > academicEndMonth;
    };

    const render = () => {
        renderCalendar();
        renderAgenda();
        renderSelectedDate();
    };

    previousButton.addEventListener('click', () => {
        visibleMonth = makeDate(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() - 1, 1);
        setDefaultSelectedDate();
        render();
    });

    nextButton.addEventListener('click', () => {
        visibleMonth = makeDate(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 1);
        setDefaultSelectedDate();
        render();
    });

    setDefaultSelectedDate();
    render();
});
