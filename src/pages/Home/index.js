import React, { Component } from "react";
import { ProductList } from "./styles";
import { MdAddShoppingCart } from "react-icons/md";
import { formatPrice} from '../../util/format'
import api from "../../services/api";

export default class Home extends Component {
  state = {
    products: []
  };

  async componentDidMount() {
    const response = await api.get("products");
    const data = response.data.map(product =>({
      ...product,
    }))

    this.setState({ products: response.data });
  }
  render() {
    const { products } = this.state;
    return (
      <ProductList>
        {products.map(product => (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title} </strong>
            <span>{formatPrice(product.price)}</span>
            <button type="button">
              <div>
                <MdAddShoppingCart size={16} color="#fff" />
              </div>
              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        ))}
      </ProductList>
    );
  }
}
