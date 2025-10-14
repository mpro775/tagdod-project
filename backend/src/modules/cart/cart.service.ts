import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartItem } from './schemas/cart.schema';
import { Variant } from '../catalog/schemas/variant.schema';
import { VariantPrice } from '../catalog/schemas/variant-price.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';

type ItemView = { itemId: string; variantId: string; qty: number };

type CartLine = {
  itemId: string;
  variantId: string;
  qty: number;
  unit: { base: number; final: number; currency: string; appliedRule: unknown };
  lineTotal: number;
};

// Optional promotions interface (duck-typing)
interface PromotionsLike {
  preview(input: { variantId: string; currency: string; qty: number; accountType: 'any'|'customer'|'engineer'|'wholesale' }): Promise<{
    finalPrice: number; basePrice: number; appliedRule: unknown;
  } | null>;
}

@Injectable()
export class CartService {
  private MAX_ITEMS = 200;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(VariantPrice.name) private priceModel: Model<VariantPrice>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
    @Optional() private promotions?: PromotionsLike,
  ) {}

  // ---------- helpers
  private async getOrCreateUserCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) cart = await this.cartModel.create({ userId: new Types.ObjectId(userId), items: [] });
    return cart;
  }
  private async getOrCreateGuestCart(deviceId: string) {
    let cart = await this.cartModel.findOne({ deviceId });
    if (!cart) cart = await this.cartModel.create({ deviceId, items: [] });
    return cart;
  }

  private ensureCapacity(cart: Cart) {
    if (cart.items.length > this.MAX_ITEMS) {
      throw new Error('Cart capacity exceeded');
    }
  }

  private toView(cart: Cart): ItemView[] {
    return (cart.items || []).map((ci: CartItem) => ({
      itemId: String(ci._id),
      variantId: String(ci.variantId),
      qty: ci.qty,
    }));
  }

  // ---------- user cart
  async getUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    return { items: this.toView(cart) };
  }
  async addUserItem(userId: string, variantId: string, qty: number) {
    const cart = await this.getOrCreateUserCart(userId);
    const exist = cart.items.find((it: CartItem) => String(it.variantId) === String(variantId));
    if (exist) exist.qty = Math.min(999, exist.qty + qty);
    else cart.items.push({ variantId: new Types.ObjectId(variantId), qty, addedAt: new Date() });
    this.ensureCapacity(cart);
    await cart.save();
    return { items: this.toView(cart) };
  }
  async updateUserItem(userId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateUserCart(userId);
    const it = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    if (!it) return { items: this.toView(cart) };
    it.qty = qty;
    await cart.save();
    return { items: this.toView(cart) };
  }
  async removeUserItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    ((cart.items as Types.DocumentArray<CartItem>).id(itemId) as unknown as Types.Subdocument & { remove(): void })?.remove();
    await cart.save();
    return { items: this.toView(cart) };
  }
  async clearUserCart(userId: string) {
    const cart = await this.getOrCreateUserCart(userId);
    cart.items = [];
    await cart.save();
    return { items: [] };
  }

  // ---------- guest cart
  async getGuestCart(deviceId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    return { items: this.toView(cart) };
  }
  async addGuestItem(deviceId: string, variantId: string, qty: number) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    const exist = cart.items.find((it: CartItem) => String(it.variantId) === String(variantId));
    if (exist) exist.qty = Math.min(999, exist.qty + qty);
    else cart.items.push({ variantId: new Types.ObjectId(variantId), qty, addedAt: new Date() });
    this.ensureCapacity(cart);
    await cart.save();
    return { items: this.toView(cart) };
  }
  async updateGuestItem(deviceId: string, itemId: string, qty: number) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    const it = (cart.items as Types.DocumentArray<CartItem>).id(itemId);
    if (!it) return { items: this.toView(cart) };
    it.qty = qty;
    await cart.save();
    return { items: this.toView(cart) };
  }
  async removeGuestItem(deviceId: string, itemId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    ((cart.items as Types.DocumentArray<CartItem>).id(itemId) as unknown as Types.Subdocument & { remove(): void })?.remove();
    await cart.save();
    return { items: this.toView(cart) };
  }
  async clearGuestCart(deviceId: string) {
    const cart = await this.getOrCreateGuestCart(deviceId);
    cart.items = [];
    await cart.save();
    return { items: [] };
  }

  // ---------- merge guest → user
  async merge(deviceId: string, userId: string) {
    const guest = await this.getOrCreateGuestCart(deviceId);
    const user = await this.getOrCreateUserCart(userId);
    for (const g of guest.items) {
      const u = user.items.find((x: CartItem) => String(x.variantId) === String(g.variantId));
      if (u) u.qty = Math.min(999, u.qty + g.qty);
      else user.items.push({ variantId: g.variantId, qty: g.qty, addedAt: g.addedAt });
    }
    await user.save();
    guest.items = [];
    await guest.save();
    return { items: this.toView(user) };
  }

  // ---------- preview
  async previewByCart(
    cart: Cart, 
    currency: string, 
    accountType: 'any'|'customer'|'engineer'|'wholesale',
    userId?: string
  ) {
    // Gather prices and totals
    const lines: CartLine[] = [];
    let subtotal = 0;
    let wholesaleDiscountPercent = 0;
    let wholesaleDiscountAmount = 0;

    // جلب قدرات المستخدم لتطبيق خصم التاجر
    if (userId) {
      const caps = await this.capsModel.findOne({ userId }).lean();
      if (caps && caps.wholesale_capable && caps.wholesale_discount_percent > 0) {
        wholesaleDiscountPercent = caps.wholesale_discount_percent;
      }
    }

    for (const it of cart.items) {
      const vp = await this.priceModel.findOne({ variantId: it.variantId, currency }).lean();
      if (!vp) continue; // skip items without price in selected currency

      let final = vp.amount;
      let base = vp.amount;
      let appliedRule = null;

      // تطبيق العروض الترويجية أولاً
      if (this.promotions && typeof this.promotions.preview === 'function') {
        const res = await this.promotions.preview({
          variantId: String(it.variantId), currency, qty: it.qty, accountType,
        });
        if (res) { final = res.finalPrice; base = res.basePrice; appliedRule = res.appliedRule; }
      }

      // تطبيق خصم التاجر بعد العروض الترويجية
      if (wholesaleDiscountPercent > 0) {
        final = final * (1 - wholesaleDiscountPercent / 100);
      }

      const lineTotal = final * it.qty;
      subtotal += lineTotal;

      lines.push({
        itemId: String((it as unknown as { _id: string })._id),
        variantId: String(it.variantId),
        qty: it.qty,
        unit: { base, final, currency, appliedRule },
        lineTotal,
      });
    }

    // حساب مبلغ الخصم الإجمالي للتاجر
    if (wholesaleDiscountPercent > 0) {
      const subtotalBeforeWholesaleDiscount = lines.reduce((sum, line) => {
        const priceBeforeWholesaleDiscount = line.unit.final / (1 - wholesaleDiscountPercent / 100);
        return sum + (priceBeforeWholesaleDiscount * line.qty);
      }, 0);
      wholesaleDiscountAmount = subtotalBeforeWholesaleDiscount - subtotal;
    }

    return {
      currency, 
      subtotal, 
      items: lines,
      meta: { 
        count: lines.length,
        wholesaleDiscountPercent,
        wholesaleDiscountAmount: Math.round(wholesaleDiscountAmount * 100) / 100,
      },
    };
  }

  async previewUser(userId: string, currency: string, accountType: 'any'|'customer'|'engineer'|'wholesale' = 'any') {
    const cart = await this.getOrCreateUserCart(userId);
    return this.previewByCart(cart, currency, accountType, userId);
  }

  async previewGuest(deviceId: string, currency: string, accountType: 'any'|'customer'|'engineer'|'wholesale' = 'any') {
    const cart = await this.getOrCreateGuestCart(deviceId);
    return this.previewByCart(cart, currency, accountType);
  }
}
