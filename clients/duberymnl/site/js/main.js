'use strict';

/* ─── Smooth Scroll for anchor links ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── Product Card → pre-select model + scroll to form ─────── */
document.querySelectorAll('[data-model]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var model = this.getAttribute('data-model');
    var select = document.getElementById('product_model');
    var orderSection = document.getElementById('order');

    if (select) select.value = model;
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── Form Validation & Submit ──────────────────────────────── */
(function () {
  var form = document.getElementById('order-form');
  var successMsg = document.getElementById('success-message');
  if (!form) return;

  var fields = [
    {
      id: 'name',
      validate: function (v) {
        if (!v) return 'Full name is required.';
        if (v.length < 2) return 'Please enter your full name.';
        return '';
      }
    },
    {
      id: 'email',
      validate: function (v) {
        if (!v) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
        return '';
      }
    },
    {
      id: 'contact_number',
      validate: function (v) {
        if (!v) return 'Contact number is required.';
        var digits = v.replace(/\D/g, '');
        if (digits.length < 10) return 'Please enter a valid PH mobile number.';
        return '';
      }
    },
    {
      id: 'address',
      validate: function (v) {
        if (!v) return 'Address is required.';
        if (v.length < 10) return 'Please enter your complete Metro Manila address.';
        return '';
      }
    },
    {
      id: 'product_model',
      validate: function (v) {
        if (!v) return 'Please select a product model.';
        return '';
      }
    }
  ];

  function showError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.toggle('is-error', !!message);
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldId) {
    showError(fieldId, '');
  }

  /* live clear on interaction */
  fields.forEach(function (field) {
    var el = document.getElementById(field.id);
    if (!el) return;
    var event = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(event, function () { clearError(field.id); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;

    fields.forEach(function (field) {
      var el = document.getElementById(field.id);
      var value = el ? el.value.trim() : '';
      var error = field.validate(value);
      showError(field.id, error);
      if (error) valid = false;
    });

    if (!valid) return;

    /* Success — no network request */
    form.hidden = true;
    if (successMsg) successMsg.hidden = false;
  });
})();
