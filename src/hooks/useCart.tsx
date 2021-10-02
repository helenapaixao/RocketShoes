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
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {

      const responseApiStock = await api.get(`/stock/${productId}`);
      const reponseStock: Stock = responseApiStock.data;

      if (reponseStock.amount < 1) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const index = cart.findIndex((product) => product.id === productId)

      if (index >= 0) {
        const newAmount = cart[index].amount + 1

        if (reponseStock.amount < newAmount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }

        const newCart = cart
        newCart[index].amount += 1

        setCart([...newCart])
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        const responseApi = await api.get(`products/${productId}`);
        const responseData: Product = responseApi.data;

        if (responseData.id === productId) {
          responseData.amount = 1

          const newCart = [...cart, responseData]
          setCart(newCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        }
      }
      toast.success('Produto adicionado ao carrinho');
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const index = cart.findIndex((p) => p.id === productId);

      if (index < 0) {
        toast.error('Erro na remoção do produto');
        return;
      }

      const filteredProduct = cart.filter(
        (product) => product.id !== productId
      );
      setCart([...filteredProduct]);

      localStorage.setItem(
        '@RocketShoes:cart',
        JSON.stringify(filteredProduct)
      );
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      const responseApi = await api.get(`/stock/${productId}`);
      const responseData: Stock = responseApi.data;

      if (responseData.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      const index = cart.findIndex((item) => item.id === productId);

      cart[index].amount = amount

      const newCart = [...cart]

      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
