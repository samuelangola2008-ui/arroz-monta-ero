(function () {
    'use strict';

    const PHONE = '573113378336';
    const DISH_NAME = 'Arroz Montañero';
    const DISH_PRICE = 10000;

    let qty = 1;

    const $ = (id) => document.getElementById(id);

    const dishCard = $('dishCard');
    const formCard = $('formCard');
    const qtyValue = $('qtyValue');
    const orderTotal = $('orderTotal');
    const formSummary = $('formSummary');
    const toastContainer = $('toastContainer');

    function formatCOP(n) {
        return '$' + n.toLocaleString('es-CO');
    }

    function updateDishUI() {
        qtyValue.textContent = qty;
        const total = DISH_PRICE * qty;
        orderTotal.textContent = formatCOP(total);
        formSummary.textContent = `${DISH_NAME} x${qty} — ${formatCOP(total)}`;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function goToForm() {
        dishCard.classList.add('hidden');
        formCard.classList.add('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => $('ord-name').focus(), 300);
    }

    function goToDish() {
        formCard.classList.remove('open');
        dishCard.classList.remove('hidden');
    }

    function sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent.trim();
    }

    function validateForm() {
        let valid = true;
        const fields = [
            { id: 'ord-name', group: 'fg-name', test: v => v.length >= 2 },
            { id: 'ord-whatsapp', group: 'fg-whatsapp', test: v => /^[\d\s\-\+]{7,20}$/.test(v) },
            { id: 'ord-address', group: 'fg-address', test: v => v.length >= 5 },
            { id: 'ord-neighborhood', group: 'fg-neighborhood', test: v => v.length >= 2 },
            { id: 'ord-payment', group: 'fg-payment', test: v => v !== '' }
        ];
        fields.forEach(f => {
            const el = $(f.id);
            const group = $(f.group);
            const val = el.value.trim();
            if (!f.test(val)) {
                group.classList.add('invalid');
                valid = false;
            } else {
                group.classList.remove('invalid');
            }
        });
        return valid;
    }

    function getFormData() {
        return {
            name: sanitize($('ord-name').value),
            whatsapp: sanitize($('ord-whatsapp').value),
            address: sanitize($('ord-address').value),
            neighborhood: sanitize($('ord-neighborhood').value),
            reference: sanitize($('ord-reference').value),
            payment: $('ord-payment').value,
            notes: sanitize($('ord-notes').value)
        };
    }

    function generateWhatsAppMessage(data) {
        const total = DISH_PRICE * qty;
        let msg = '🍽️ *NUEVO PEDIDO - DELICIAS DE LA NEGRA* 🍽️\n\n';
        msg += '━━━ PEDIDO ━━━\n';
        msg += `• ${DISH_NAME} x${qty} = ${formatCOP(total)}\n`;
        msg += `*TOTAL: ${formatCOP(total)}*\n\n`;
        msg += '━━━ DATOS DEL CLIENTE ━━━\n';
        msg += `👤 *Nombre:* ${data.name}\n`;
        msg += `📱 *WhatsApp:* ${data.whatsapp}\n`;
        msg += `📍 *Dirección:* ${data.address}\n`;
        msg += `🏘️ *Barrio:* ${data.neighborhood}\n`;
        if (data.reference) msg += `📌 *Referencia:* ${data.reference}\n`;
        msg += `💳 *Pago:* ${data.payment}\n`;
        if (data.notes) msg += `📝 *Observaciones:* ${data.notes}\n`;
        msg += '\n✅ _Gracias por tu pedido. Te contactaremos pronto._';
        return encodeURIComponent(msg);
    }

    function resetForm() {
        ['ord-name', 'ord-whatsapp', 'ord-address', 'ord-neighborhood', 'ord-reference', 'ord-notes'].forEach(id => $(id).value = '');
        $('ord-payment').value = '';
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));
    }

    function init() {
        updateDishUI();

        $('qtyMinus').addEventListener('click', () => {
            if (qty > 1) {
                qty--;
                updateDishUI();
            }
        });
        $('qtyPlus').addEventListener('click', () => {
            qty++;
            updateDishUI();
        });

        $('orderBtn').addEventListener('click', goToForm);
        $('formBack').addEventListener('click', goToDish);

        $('sendOrderBtn').addEventListener('click', () => {
            if (!validateForm()) {
                showToast('⚠️ Por favor corrige los campos marcados');
                return;
            }
            const data = getFormData();
            const msg = generateWhatsAppMessage(data);
            window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank', 'noopener,noreferrer');
            showToast('✅ Pedido enviado por WhatsApp');
            resetForm();
            qty = 1;
            updateDishUI();
            setTimeout(goToDish, 600);
        });

        document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
            el.addEventListener('input', function () {
                const group = this.closest('.form-group');
                if (group) group.classList.remove('invalid');
                if (/<[^>]*>/.test(this.value)) {
                    this.value = this.value.replace(/<[^>]*>/g, '');
                }
            });
            el.addEventListener('blur', function () {
                this.value = this.value.trim();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();