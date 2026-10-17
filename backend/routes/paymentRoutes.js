const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { protect } = require('../middleware/authMiddleware');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', protect, async (req, res) => {
    try {
        const { items, email, couponCode, discountPrice } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Items are required' });
        }

        const lineItems = items.map(item => {
            const productData = { name: item.name };

            // Stripe requires valid, public URLs for images (no localhost or relative paths)
            if (item.image && item.image.startsWith('https://')) {
                productData.images = [item.image];
            }

            return {
                price_data: {
                    currency: 'inr',
                    product_data: productData,
                    unit_amount: Math.round(parseFloat(item.price) * 100),
                },
                quantity: item.quantity,
            };
        });

        const sessionPayload = {
            payment_method_types: ['card'],
            customer_email: email,
            billing_address_collection: 'required',
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/my-orders?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
        };

        if (discountPrice && parseFloat(discountPrice) > 0) {
            try {
                const stripeCoupon = await stripe.coupons.create({
                    amount_off: Math.round(parseFloat(discountPrice) * 100),
                    currency: 'inr',
                    duration: 'once',
                    name: couponCode ? `Coupon (${couponCode})` : 'Promotional Discount',
                });
                sessionPayload.discounts = [{ coupon: stripeCoupon.id }];
            } catch (couponError) {
                console.warn('Stripe coupon creation note:', couponError.message);
            }
        }

        const session = await stripe.checkout.sessions.create(sessionPayload);

        res.json({ url: session.url });

    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
