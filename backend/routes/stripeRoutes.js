const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/User');

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// ======================
// Create checkout session
// ======================
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured',
      });
    }

    const { userId, priceId, plan, successUrl, cancelUrl } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({
        success: false,
        message: 'userId and plan are required',
      });
    }

    // Define price mappings
    const prices = {
      premium: { amount: 1900, name: 'Premium Plan' }, // $19.00
      enterprise: { amount: 4900, name: 'Enterprise Plan' }, // $49.00
    };

    if (!prices[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: prices[plan].name,
              description: `FinTrack ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
            },
            unit_amount: prices[plan].amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.app.get('frontendUrl')}/dashboard/account?success=true`,
      cancel_url: cancelUrl || `${req.app.get('frontendUrl')}/dashboard/account?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
      },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message,
    });
  }
});

// ======================
// Stripe webhook handler
// ======================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).send('Payment service not configured');
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { userId, plan } = session.metadata;

        // Update user subscription
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        await User.findOneAndUpdate(
          { clerkId: userId },
          {
            subscriptionTier: plan,
            subscriptionEndDate,
          }
        );

        console.log(`Subscription activated for user ${userId}: ${plan}`);
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find user by customer ID and reset to free tier
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionTier: 'free',
            subscriptionEndDate: null,
          }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook handler error',
      error: error.message,
    });
  }
});

// ======================
// Get subscription status
// ======================
router.get('/subscription/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.userId }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      subscription: {
        tier: user.subscriptionTier || 'free',
        endDate: user.subscriptionEndDate,
        isActive: user.subscriptionEndDate ? new Date(user.subscriptionEndDate) > new Date() : false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message,
    });
  }
});

module.exports = router;
