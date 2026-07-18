/* ================================================================
   DIGITALFRONT — Contact Form JS
   Form validation, submission, loading/success states
   ================================================================ */

import { submitContactForm, initSupabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const errorEl = document.getElementById('form-error');
  const successEl = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    // Gather values
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const businessType = document.getElementById('contact-business-type').value;
    const budgetRange = document.getElementById('contact-budget').value;
    const message = document.getElementById('contact-message').value.trim();

    // Validation
    if (!name) { showError('Please enter your name.'); return; }
    if (!email || !isValidEmail(email)) { showError('Please enter a valid email address.'); return; }
    if (!message) { showError('Please enter a message.'); return; }

    // Loading state
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Submit
    try {
      const result = await submitContactForm({
        name,
        email,
        phone,
        business_type: businessType,
        budget_range: budgetRange,
        message,
      });

      if (result.success) {
        showSuccess();
      } else {
        // If Supabase not configured, simulate success (demo mode)
        if (result.error?.includes('not initialized') || result.error?.includes('YOUR_')) {
          await simulateSuccess();
        } else {
          showError(result.error || 'Something went wrong. Please try again.');
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }
      }
    } catch {
      // Demo mode fallback
      await simulateSuccess();
    }
  });

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function hideError() {
    if (errorEl) errorEl.style.display = 'none';
  }

  function showSuccess() {
    form.style.display = 'none';
    if (successEl) successEl.classList.add('is-visible');
  }

  async function simulateSuccess() {
    // Simulate network delay for demo
    await new Promise(r => setTimeout(r, 1500));
    showSuccess();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
