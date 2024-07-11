import React from "react";
import axios from "axios";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";

//Define cart state with atom as state
const cartState = atom({
  key: "cartState", //unique
  default: [],
});

//Define the Total state using selector as we need to compute the total of price
const cartTotalState = selector({
  key: "cartTotalState",
  get: ({ get }) => {
    const cart = get(cartState);

    const total = cart.reduce((prev, curr) => prev + curr.price, 0);

    return {
      total,
    };
  },
});

//Fetch remote api using selector method from Recoil
const productsQuery = selector({
  key: "Products", //has to be unique
  get: async () => {
    try {
      const res = await axios("https://fakestoreapi.com/products");
      return res.data || [];
    } catch (error) {
      console.log(`ERROR: \n${error}`);
      return [];
    }
  },
});

//creating a view to display the products
const FakeProducts = ({ onAddCartItem }) => {
  //Get the products list from Recoil state
  const dummyProducts = useRecoilValue(productsQuery);

  return (
    <>
      <div className="l-flex">
        <div className="l-fg3">
          {dummyProducts.map((product) => (
            <div className="card" key={product.id}>
              <img src={product.image} alt="" />
              <div className="card-body">
                <h2>{product.title}</h2>
                <h5>{product.category}</h5>
                <p>{product.description}</p>
                <h5>
                  (${product.price}){" "}
                  <button onClick={() => onAddCartItem(product)}>Add</button>
                </h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

//view for shopping basket
const Basket = ({ total, products, onRemoveCartItem }) => {
  return (
    <>
      <div className="title">
        Your basket {!products.length ? "" : products.length}
      </div>
      <div className="basket">
        {!products.length
          ? "No Items"
          : products.map((product) => (
              <p key={product.id}>
                {product.title} (${product.price})
                <button onClick={() => onRemoveCartItem(product)}>
                  Remove
                </button>
              </p>
            ))}
      </div>
      {!products.length ? "" : <div className="total">TOTAL: ${total}</div>}
    </>
  );
};

const App = () => {
  //Set the state like react legacy useState
  const [cart, setCart] = useRecoilState(cartState);

  //Set the cart total
  const [{ total }, setTotalFromSelector] = useRecoilState(cartTotalState);

  //Add product to basket
  const AddCartItem = (product) => {
    setCart((cart) =>
      cart.find((item) => item.id === product.id) ? cart : [...cart, product]
    );
  };

  //Remove product from basket
  const RemoveCartItem = (product) => {
    setCart((cart) => cart.filter((item) => item.id !== product.id));
  };

  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <FakeProducts onAddCartItem={AddCartItem}></FakeProducts>
      </React.Suspense>

      <div className="floatcart">
        <Basket
          total={total}
          setCart={setTotalFromSelector}
          products={cart}
          onRemoveCartItem={RemoveCartItem}
        />
      </div>
    </div>
  );
};

export default App;
