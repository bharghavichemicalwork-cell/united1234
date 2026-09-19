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

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('fullName')?.value?.trim();
      const phoneVal = document.getElementById('phone')?.value?.trim();
      const requirementVal = document.getElementById('requirement')?.value?.trim();

      if (!nameVal || !phoneVal || !requirementVal) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.style.display = 'flex';
          formStatus.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <div><strong>Incomplete Details</strong><br>Please fill in your name, phone number, and chemical requirement.</div>
          `;
        }
        return;
      }

      // Set Loading State on Button
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Requirement';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Requirement...';
      }

      if (formStatus) {
        formStatus.style.display = 'none';
      }

      try {
        const response = await fetch('https://formsubmit.co/ajax/chemicalshop67@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: nameVal,
            phone: phoneVal,
            requirement: requirementVal,
            _subject: `New Requirement from ${nameVal} (${phoneVal}) - United SSD Chem`,
            _template: 'table'
          })
        });

        const data = await response.json();

        if (response.ok || data.success === 'true' || data.success === true) {
          if (formStatus) {
            formStatus.className = 'form-status success';
            formStatus.style.display = 'flex';
            formStatus.innerHTML = `
              <i class="fas fa-check-circle"></i>
              <div>
                <strong>Thank you, ${nameVal}!</strong><br>
                Your requirement has been sent directly to <strong>chemicalshop67@gmail.com</strong>.<br>
                Our team will call or WhatsApp you at <strong>${phoneVal}</strong> shortly.
              </div>
            `;
          }

          contactForm.reset();
        } else {
          // If AJAX API returns not ok, fallback to standard form submit
          contactForm.submit();
        }
      } catch (err) {
        // Network fallback to regular POST submission
        console.warn('AJAX submission failed, using standard submit:', err);
        contactForm.submit();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }
});
