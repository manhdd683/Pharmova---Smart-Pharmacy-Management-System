import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
  ) {}

  // Lấy giỏ hàng của người dùng hiện tại
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
    });

    if (!cart) {
      cart = this.cartsRepository.create({ user: { id: userId } });
      await this.cartsRepository.save(cart);
    }
    return cart;
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    
    let cartItem = await this.cartItemsRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemsRepository.save(cartItem);
    } else {
      cartItem = this.cartItemsRepository.create({
        cart: { id: cart.id },
        product: { id: productId },
        quantity: quantity,
      });
      await this.cartItemsRepository.save(cartItem);
    }

    return this.getCart(userId);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(userId: string, cartItemId: string): Promise<Cart> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: cartItemId, cart: { user: { id: userId } } },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await this.cartItemsRepository.remove(cartItem);
    return this.getCart(userId);
  }
}