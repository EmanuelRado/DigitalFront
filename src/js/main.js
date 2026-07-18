/* ================================================================
   DIGITALFRONT — Main JS
   Shared functionality: navbar, scroll animations, utilities
   Loaded on every page.
   ================================================================ */

import { initSupabase } from './supabase.js';

/* ================================================================
   1. INITIALIZATION
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initNavbar();
  initScrollReveal();
  initScrollProgress();
  setActiveNavLink();
});


/* ================================================================
   2. NAVBAR
   ================================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!navbar) return;

  // Scroll behavior — add glass background
  let lastScrollY = 0;
  const handleScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }

    lastScrollY = scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Hamburger menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('modal-open', isOpen);
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.classList.remove('modal-open');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        hamburger.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.classList.remove('modal-open');
      }
    });
  }
}


/* ================================================================
   3. ACTIVE NAV LINK
   ================================================================ */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const filename = currentPath.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar-link, .mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkFile = href.split('/').pop();

    if (
      linkFile === filename ||
      (filename === '' && linkFile === 'index.html') ||
      (filename === 'index.html' && linkFile === 'index.html')
    ) {
      link.classList.add('is-active');
    }
  });
}


/* ================================================================
   4. SCROLL REVEAL (Intersection Observer)
   ================================================================ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .stagger-children');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach(el => observer.observe(el));
}


/* ================================================================
   5. SCROLL PROGRESS BAR
   ================================================================ */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}


/* ================================================================
   6. FAQ ACCORDION
   ================================================================ */
export function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      // Toggle current item
      item.classList.toggle('is-open', !isOpen);
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0';
      }
    });
  });
}


/* ================================================================
   7. SMOOTH SCROLL TO ANCHOR
   ================================================================ */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const targetId = link.getAttribute('href');
  if (targetId === '#') return;

  const target = document.querySelector(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});


/* ================================================================
   8. UTILITY: Format Date
   ================================================================ */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 250) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
