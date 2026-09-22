/**
 * United SSD Chem - Mobile-Responsive Website Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Mobile Menu Toggle & Overlay
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const menuOverlay = document.getElementById('menuOverlay');
  const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

  function openMenu() {
    if (navLinks) navLinks.classList.add('active');
    if (menuOverlay) menuOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-bars');
      toggleIcon.classList.add('fa-times');
    }
  }

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('active');
    if (menuOverlay) menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    if (toggleIcon) {
      toggleIcon.classList.remove('fa-times');
      toggleIcon.classList.add('fa-bars');
    }
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when tapping on menu overlay
    if (menuOverlay) {
      menuOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when any nav item is clicked
    document.querySelectorAll('.nav-item').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Auto-close menu if screen resized beyond mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // 2. Product "Inquire Now" Button Action
  const requirementInput = document.getElementById('requirement');
  const contactSection = document.getElementById('contact');
  const fullNameInput = document.getElementById('fullName');

  document.querySelectorAll('.btn-inquire').forEach((button) => {
    button.addEventListener('click', (e) => {
      const productName = e.target.getAttribute('data-product');

      if (requirementInput && productName) {
        requirementInput.value = `I am interested in ordering: ${productName}.\nPlease share pricing, purity details, and delivery timelines.`;
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }

      if (fullNameInput) {
        setTimeout(() => {
          fullNameInput.focus();
        }, 400);
      }
    });
  });

  // 3. Contact Form Submission (Sends to chemicalshop67@gmail.com)
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const web3formsKeyInput = document.getElementById('web3formsKey');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('fullName')?.value?.trim();
      const phoneVal = document.getElementById('phone')?.value?.trim();
      const requirementVal = document.getElementById('requirement')?.value?.trim();
      const accessKey = web3formsKeyInput?.value?.trim();

      if (!nameVal || !phoneVal || !requirementVal) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.style.display = 'block';
          formStatus.innerHTML = `
            <div class="status-header">
              <i class="fas fa-exclamation-circle" style="color: #EF4444;"></i>
              <h4 style="color: #991B1B;">Incomplete Details</h4>
            </div>
            <p>Please fill in your name, phone number, and chemical requirement.</p>
          `;
        }
        return;
      }

      // If Web3Forms Access Key is configured, send silently in the background
      if (accessKey) {
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Requirement';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Requirement...';
        }

        try {
          const formData = new FormData(contactForm);
          formData.append('subject', `New Requirement: ${nameVal} (${phoneVal}) - United SSD Chem`);
          formData.append('from_name', 'United SSD Chem Website');

          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (response.status === 200 || data.success) {
            if (formStatus) {
              formStatus.className = 'form-status success';
              formStatus.style.display = 'block';
              formStatus.innerHTML = `
                <div class="status-header">
                  <i class="fas fa-check-circle"></i>
                  <h4>Requirement Sent Successfully!</h4>
                </div>
                <p>Thank you, <strong>${nameVal}</strong>! Your requirement has been received. Our sales team will contact you at <strong>${phoneVal}</strong> shortly.</p>
              `;
            }
            contactForm.reset();
            return;
          } else {
            if (formStatus) {
              formStatus.className = 'form-status error';
              formStatus.style.display = 'block';
              formStatus.innerHTML = `
                <div class="status-header">
                  <i class="fas fa-exclamation-circle" style="color: #EF4444;"></i>
                  <h4 style="color: #991B1B;">Web3Forms Notice</h4>
                </div>
                <p>${data.message || 'Could not send submission. Please verify your Access Key.'}</p>
              `;
            }
            return;
          }
        } catch (err) {
          console.warn('Web3Forms send failed, proceeding with direct email fallback:', err);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      }

      // Primary Direct Email Handler (100% Reliable, zero third-party dependency)
      const recipient = 'chemicalshop67@gmail.com';
      const subject = `Chemical Requirement from ${nameVal} (${phoneVal}) - United SSD Chem`;
      const bodyText = `Hello United SSD Chem,

Here are my inquiry details:
- Name: ${nameVal}
- Phone / WhatsApp: ${phoneVal}
- Requirement:
${requirementVal}

Please provide pricing, purity specs, and delivery timeline.

Thank you,
${nameVal}`;

      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      const whatsappText = `Hello United SSD Chem, my name is ${nameVal} (Phone: ${phoneVal}). My chemical requirement: ${requirementVal}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

      // Trigger the default mail client
      window.location.href = mailtoUrl;

      // Show immediate clear feedback with 1-click send options
      if (formStatus) {
        formStatus.className = 'form-status success';
        formStatus.style.display = 'block';
        formStatus.innerHTML = `
          <div class="status-header">
            <i class="fas fa-check-circle"></i>
            <h4>Inquiry Ready for ${recipient}</h4>
          </div>
          <p>Thank you, <strong>${nameVal}</strong>! Your email has been prepared with all details pre-filled. If your email app did not open automatically, click an option below:</p>
          <div class="status-actions">
            <a href="${gmailWebUrl}" target="_blank" class="status-btn btn btn-primary">
              <i class="fas fa-envelope"></i> Send Directly via Gmail Web
            </a>
            <a href="${mailtoUrl}" class="status-btn btn btn-outline">
              <i class="fas fa-paper-plane"></i> Send via Default Mail App (Outlook / Apple Mail)
            </a>
            <a href="${whatsappUrl}" target="_blank" class="status-btn btn btn-whatsapp">
              <i class="fab fa-whatsapp"></i> Send via WhatsApp
            </a>
          </div>
        `;
      }

      contactForm.reset();
    });
  }
});
