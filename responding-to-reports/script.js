// In script.js
document.addEventListener('DOMContentLoaded', function() {
    // --- Flatpickr Initialization ---
    flatpickr("#single-date", {});
    flatpickr("#start-date", {});
    flatpickr("#end-date", {});
    flatpickr("#report-date", {});
    flatpickr(".datepicker", {});

    // --- Auto-resize textarea function ---
    window.autoResize = function(textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
    };

    // Attach autoResize to all textareas initially and on input
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResize(textarea); // Initial resize in case of pre-filled content
        textarea.addEventListener('input', () => autoResize(textarea));
    });

    // --- Multi-Step Form Logic ---
    const formSections = document.querySelectorAll('.form-section');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const submitButton = document.querySelector('.submit-button');
    const stepDots = document.querySelectorAll('.step-dot');

    let currentSectionIndex = 0; // Start at the first section (index 0)

    function showSection(index) {
        // Hide all sections
        formSections.forEach((section, i) => {
            section.classList.remove('active');
            stepDots[i].classList.remove('active');
            stepDots[i].removeAttribute('aria-current');
        });

        // Show the current section
        formSections[index].classList.add('active');
        stepDots[index].classList.add('active');
        stepDots[index].setAttribute('aria-current', 'step');

        // Update button states
        prevButton.disabled = (index === 0); // Disable prev on first section
        nextButton.style.display = (index === formSections.length - 1) ? 'none' : 'inline-block'; // Hide next on last
        submitButton.style.display = (index === formSections.length - 1) ? 'inline-block' : 'none'; // Show submit on last
       
        // Re-initialize flatpickr for the new active section's date pickers
        // This handles cases where flatpickr might not render correctly on hidden elements
        const activeDatepickers = formSections[index].querySelectorAll('.datepicker, #single-date, #start-date, #end-date, #report-date');
        activeDatepickers.forEach(input => {
             // Only re-initialize if flatpickr hasn't already been initialized on it
             if (!input._flatpickr) {
                 flatpickr(input, {});
             }
        });

        // Re-run autoResize for textareas in the newly active section
        formSections[index].querySelectorAll('textarea').forEach(textarea => {
            autoResize(textarea);
        });

        // Scroll to the top of the page smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // For a smooth scrolling effect
        });
    }

    // Event Listeners for Navigation Buttons
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentSectionIndex > 0) {
                currentSectionIndex--;
                showSection(currentSectionIndex);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentSectionIndex < formSections.length - 1) {
                currentSectionIndex++;
                showSection(currentSectionIndex);
            }
        });
    }

    if (submitButton) {
        submitButton.addEventListener('click', function() {
            // In a real application, you'd collect and send form data here
            alert('Assessment Submitted! (This is a placeholder action)');
            // You might redirect the user or show a success message
        });
    }

    // Event Listeners for Step Dots (optional, but good for UX)
    stepDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSectionIndex = index;
            showSection(currentSectionIndex);
        });
    });

    // --- Reset Form Function ---
    const resetButton = document.querySelector('.reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function(event) {
            // Clear all text inputs
            document.querySelectorAll('input[type="text"]').forEach(input => {
                input.value = '';
            });

            // Clear all checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });

            // Clear all radio buttons
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });

            // Clear all textareas
            document.querySelectorAll('textarea').forEach(textarea => {
                textarea.value = '';
                autoResize(textarea); // Resize them back to their minimum height
            });

            // Clear all contenteditable elements
            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.innerHTML = '';
            });

            // After clearing, reset to the first section
            currentSectionIndex = 0;
            showSection(currentSectionIndex);
        });
    }

    // Initial display of the first section when the page loads
    showSection(currentSectionIndex);
});