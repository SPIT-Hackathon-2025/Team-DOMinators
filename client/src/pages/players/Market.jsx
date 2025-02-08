// Market.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, ShoppingCart, Plus, X } from 'lucide-react';
import { auth, db, storage } from '../../components/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

const Market = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'new',
    rarity: 'Rare',
    imageFile: null
  });
  const handlePurchase = (product) => {
    toast.success(`Successfully purchased ${product.name}!`, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch user's products
  useEffect(() => {
    if (auth.currentUser) {
      const fetchUserProducts = async () => {
        try {
          const q = query(
            collection(db, "products"),
            where("sellerId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          const userProductsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserProducts(userProductsData);
        } catch (error) {
          console.error("Error fetching user products:", error);
        }
      };
      fetchUserProducts();
    }
  }, [auth.currentUser]);

  const uploadImageToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRETKEY,
          "Content-Type": "multipart/form-data",
        },
      });
      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw new Error("Failed to upload image to IPFS");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (!newProduct.imageFile) {
        throw new Error("Please select an image");
      }
  
      if (!auth.currentUser) {
        throw new Error("Please sign in to sell products");
      }
  
      // Upload to IPFS first
      let imageUrl;
      try {
        const formData = new FormData();
        formData.append("file", newProduct.imageFile);
  
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRETKEY,
            "Content-Type": "multipart/form-data",
          },
        });
        
        imageUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      } catch (error) {
        console.error("IPFS upload error:", error);
        throw new Error("Failed to upload image. Please try again.");
      }
  
      // Create product data object
      const newProductData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        condition: newProduct.condition,
        rarity: newProduct.rarity,
        imageUrl: imageUrl,
        sellerId: auth.currentUser.uid,
        sellerName: auth.currentUser.displayName || 'Anonymous',
        createdAt: new Date().toISOString(),
        priceUSD: (parseFloat(newProduct.price) * 0.012).toFixed(2)
      };
  
      // Add to Firestore
      const docRef = await addDoc(collection(db, "products"), newProductData);
      
      // Add to local state with the new document ID
      const productWithId = { id: docRef.id, ...newProductData };
      setProducts(prev => [...prev, productWithId]);
      
      if (auth.currentUser.uid === newProductData.sellerId) {
        setUserProducts(prev => [...prev, productWithId]);
      }
  
      // Success!
      setIsDialogOpen(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        condition: 'new',
        rarity: 'Rare',
        imageFile: null
      });
  
      // Show success message
      alert('Product added successfully!');
  
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.message || 'Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === 'all' || product.condition === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // const ProductCard = ({ product, index }) => (
  //   <motion.div
  //     initial={{ opacity: 0, scale: 0.9 }}
  //     whileInView={{ opacity: 1, scale: 1 }}
  //     viewport={{ once: true }}
  //     transition={{ delay: index * 0.1 }}
  //     whileHover={{ y: -10 }}
  //     className="bg-gray-800 rounded-xl overflow-hidden"
  //   >
  //     <div className="aspect-w-1 aspect-h-1 flex items-center justify-center my-10">
  //       <img src={product.imageUrl} alt={product.name} className="w-40 h-40 object-cover" />
  //     </div>
  //     <div className="p-4">
  //       <div className="flex justify-between items-center mb-2">
  //         <h3 className="text-lg font-semibold">{product.name}</h3>
  //         <motion.span
  //           whileHover={{ scale: 1.1 }}
  //           className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
  //             product.rarity === 'Legendary' ? 'bg-yellow-600' :
  //             product.rarity === 'Epic' ? 'bg-purple-600' :
  //             'bg-blue-600'
  //           }`}
  //         >
  //           <Star size={12} />
  //           {product.rarity}
  //         </motion.span>
  //       </div>
  //       <p className="text-gray-400 mb-2">{product.description}</p>
  //       <div className="flex justify-between items-center">
  //         <span className="text-purple-400 flex items-center gap-1">
  //           <Shield size={16} />
  //           {product.price} ESPX
  //         </span>
  //         <motion.button
  //           whileHover={{ scale: 1.05 }}
  //           whileTap={{ scale: 0.95 }}
  //           className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
  //         >
  //           <ShoppingCart size={16} />
  //           Buy Now
  //         </motion.button>
  //       </div>
  //     </div>
  //   </motion.div>
  // );

  const ProductCard = ({ product, index }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 rounded-xl overflow-hidden"
    >
      <div className="aspect-w-1 aspect-h-1 flex items-center justify-center my-10">
        <img src={product.imageUrl} alt={product.name} className="w-40 h-40 object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <motion.span
            whileHover={{ scale: 1.1 }}
            className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
              product.rarity === 'Legendary' ? 'bg-yellow-600' :
              product.rarity === 'Epic' ? 'bg-purple-600' :
              'bg-blue-600'
            }`}
          >
            <Star size={12} />
            {product.rarity}
          </motion.span>
        </div>
        <p className="text-gray-400 mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-purple-400 flex items-center gap-1">
            <Shield size={16} />
            {product.price} ESPX
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
            onClick={() => handlePurchase(product)}
          >
            <ShoppingCart size={16} />
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="min-h-screen bg-gray-900 py-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl font-bold mb-4">Gaming Marketplace</h2>
          <p className="text-xl text-gray-400">Discover and trade premium gaming gear</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'buy'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('buy')}
          >
            Buy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'sell'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActiveTab('sell')}
          >
            Sell
          </motion.button>
        </div>

        {/* Buy Tab Content */}
        {activeTab === 'buy' && (
          <div>
            <div className="flex gap-4 mb-8">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Sell Tab Content */}
        {activeTab === 'sell' && (
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-8 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus size={20} />
              Sell New Product
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {userProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Sell Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setIsDialogOpen(false)}
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-4 text-white">Sell Your Product</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Price (ESPX)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Condition</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.condition}
                    onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Rarity</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.rarity}
                    onChange={(e) => setNewProduct({...newProduct, rarity: e.target.value})}
                  >
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProduct({...newProduct, imageFile: e.target.files[0]})}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin">⚬</span>
                        Processing...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Market;

