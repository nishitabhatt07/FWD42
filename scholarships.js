document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scholarship-form');
    const saveButton = document.getElementById('save-student-details');
    const message = document.getElementById('scholarship-form-message');

    if (!form || !saveButton || !message) {
        return;
    }

    saveButton.addEventListener('click', () => {
        if (!form.reportValidity()) {
            return;
        }

        message.textContent = 'Demo only: your details were not saved or sent.';
    });

    form.addEventListener('input', () => {
        message.textContent = '';
    });
});
