import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createPaymentIntent(bookingId: string, customerId: string) {
    const booking = await this.bookingsService.findOne(bookingId);
    const amount = Math.round((booking.totalAmount + booking.depositAmount) * 100); // Convert to cents

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: booking.currency.toLowerCase(),
      customer: customerId,
      metadata: {
        bookingId: booking.id,
        renterId: booking.renterId,
        ownerId: booking.ownerId,
      },
      // Hold funds for marketplace
      capture_method: 'manual',
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.capture(paymentIntentId);
    
    // Update booking payment status
    const bookingId = paymentIntent.metadata.bookingId;
    await this.bookingsService.updatePaymentStatus(bookingId, 'paid' as any);

    return paymentIntent;
  }

  @OnEvent('booking.completed')
  async handleBookingCompleted(payload: { bookingId: string; ownerId: string; payoutAmount: number }) {
    // Transfer funds to owner's Stripe Connect account
    const booking = await this.bookingsService.findOne(payload.bookingId);
    
    // Get owner's Stripe account ID
    // const owner = await this.usersService.findOne(payload.ownerId);
    // if (!owner.stripeAccountId) return;

    // Create transfer
    // await this.stripe.transfers.create({
    //   amount: Math.round(payload.payoutAmount * 100),
    //   currency: booking.currency.toLowerCase(),
    //   destination: owner.stripeAccountId,
    //   metadata: { bookingId: payload.bookingId },
    // });
  }

  async refundPayment(paymentIntentId: string, amount?: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  async createConnectAccount(email: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    return account;
  }

  async createConnectAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  }
}