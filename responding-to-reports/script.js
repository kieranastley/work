// In script.js
document.addEventListener('DOMContentLoaded', function () {

    // --- Flatpickr Initialization ---
    // Initialize Flatpickr instances for existing date inputs
    flatpickr("#single-date", {});
    flatpickr("#start-date", {});
    flatpickr("#end-date", {});
    flatpickr("#report-date", {});

    // Initialize Flatpickr for the new datepicker class in the table
    flatpickr(".datepicker", {});

    // --- Auto-resize textarea function ---
    window.autoResize = function (textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
    };

    // Attach autoResize to all textareas initially and on input
    document.querySelectorAll('textarea').forEach(textarea => {
        autoResize(textarea); // Initial resize in case of pre-filled content
        textarea.addEventListener('input', () => autoResize(textarea));
    });

    // --- Multi-Step Form Navigation Logic ---
    const formSections = document.querySelectorAll('.form-section');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const submitButton = document.querySelector('.submit-button'); // Assuming submitButton is the new PDF button
    const stepDots = document.querySelectorAll('.step-dot');

    let currentSectionIndex = 0; // Start at the first section (index 0)

    function showSection(index) {
        // Hide all sections
        formSections.forEach((section, i) => {
            section.classList.remove('active');
            section.style.display = 'none'; // Ensure display is none for inactive sections
            stepDots[i].classList.remove('active');
            stepDots[i].removeAttribute('aria-current');
        });

        // Show the current section
        formSections[index].classList.add('active');
        formSections[index].style.display = 'block'; // Ensure display is block for active section
        stepDots[index].classList.add('active');
        stepDots[index].setAttribute('aria-current', 'step');

        // Update button states
        prevButton.disabled = (index === 0); // Disable prev on first section
        nextButton.style.display = (index === formSections.length - 1) ? 'none' : 'inline-block'; // Hide next on last

        // Show/hide submit button (or PDF button) based on the last section
        if (submitButton) {
            submitButton.style.display = (index === formSections.length - 1) ? 'inline-block' : 'none';
        }
        // Assuming pdf-actions is wrapped around the submit button in your HTML for PDF
        const pdfActionsDiv = document.querySelector('.pdf-actions');
        if (pdfActionsDiv) {
            pdfActionsDiv.style.display = (index === formSections.length - 1) ? 'block' : 'none';
        }

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
        });
    }

    // Event Listeners for Navigation Buttons
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            if (currentSectionIndex > 0) {
                currentSectionIndex--;
                showSection(currentSectionIndex);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (currentSectionIndex < formSections.length - 1) {
                currentSectionIndex++;
                showSection(currentSectionIndex);
            }
        });
    }

    // --- Reset Form Function ---
    const resetButton = document.querySelector('.reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function (event) {

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


    // --- PDF Generation Logic ---
    const downloadPdfButton = document.getElementById('download-pdf'); // Ensure your submit button has id="download-pdf"

    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', () => {
            const form = document.querySelector('.container'); // Or the specific element to convert

            // Clone the form to modify it for PDF generation without affecting original display
            const formClone = form.cloneNode(true);

            // Make all sections visible for PDF generation
            formClone.querySelectorAll('.form-section').forEach(section => {
                section.classList.add('active'); // Ensure 'active' class is present for CSS rules
                section.style.display = 'block'; // Force display block
            });

            // Remove elements not needed in PDF from the clone
            formClone.querySelectorAll('.form-navigation, .actions, .pdf-actions, .step-indicator').forEach(el => el.remove());

            // Apply specific styles for PDF content to the clone
            formClone.style.maxWidth = 'none'; // Allow content to span full width
            formClone.style.margin = '0';
            formClone.style.padding = '0'; // Remove container padding

            const opt = {
                margin: [0.5, 0.5, 1.0, 0.5], // Top, Left, Bottom, Right margins (Bottom increased for footer)
                filename: 'psychosocial-report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    scrollY: 0 // Prevents scrolling issues if content is partially scrolled
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(formClone).set(opt).toPdf().get('pdf').then((pdf) => {
                const totalPages = pdf.internal.getNumberOfPages();
                pdf.setFontSize(8);
                pdf.setTextColor(100);

                const footerText = `DRAFT - FOR CONSULTATION PURPOSES ONLY\nThis document has been prepared for informal feedback and does not represent formal NSW Government policy or an approved SafeWork NSW publication. Content is subject to change.`;

                // Calculate properties for text wrapping
                const pageHeight = pdf.internal.pageSize.getHeight();
                const pageWidth = pdf.internal.pageSize.getWidth();
                const marginHorizontal = opt.margin[1] + opt.margin[3]; // Left + Right margin
                const availableWidth = pageWidth - marginHorizontal;

                // Split text into lines that fit the available width
                const splitText = pdf.splitTextToSize(footerText, availableWidth);
                const lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor; // Height of a single line
                const footerHeight = splitText.length * lineHeight;

                // Calculate yPosition to place footer at the bottom margin area
                const bottomMargin = opt.margin[2]; // Get the explicit bottom margin (1.0 inch)
                // Position start of footer text to be vertically centered within the bottom margin area
                const yPositionStart = pageHeight - bottomMargin + (bottomMargin - footerHeight) / 2;

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    // Loop through split lines and add them
                    splitText.forEach((line, index) => {
                        pdf.text(line, opt.margin[1], yPositionStart + (index * lineHeight));
                    });
                }
                pdf.save(opt.filename); // ADDED: This line triggers the PDF download!
            });
        });
    }
});