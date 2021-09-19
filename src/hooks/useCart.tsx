import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes: cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get<Stock[]>(`/stock/${productId}`);

      const stock = response.data[0];


      if (stock.amount > 0) {
        const productExists = cart.find(p => p.id === productId);

        if (productExists) {
          productExists.amount += 1;
        } else {
          const response = await api.get<Product>(`/products/${productId}`);

          const product = response.data;

          product.amount = 1;

          setCart([...cart, product]);
        }

        localStorage.setItem('@RocketShoes: cart', JSON.stringify(cart));
      } else {
        toast.error('Produto sem estoque');
      }
      
    } catch {
      toast.error('Produto não encontrado');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter(p => p.id !== productId);

      setCart(newCart);

      localStorage.setItem('@RocketShoes: cart', JSON.stringify(newCart));





    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
