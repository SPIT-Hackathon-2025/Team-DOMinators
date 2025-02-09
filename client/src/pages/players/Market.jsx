import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Star, Shield, ShoppingCart, Plus, X } from 'lucide-react';
import { auth, db, storage } from '../../components/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import abi from '../../../abi.json'
import axios from 'axios';

const CONTRACT_ADDRESS = "0x1aEC03d66c2Caee890AdAE3aF87E397e26F5456b"; // Replace with your contract address
const TOKEN_CONTRACT_ADDRESS = "0x005dD250CD4122793E359D438B446524D6c61aA2"; // Replace with your token contract address
const CONTRACT_ABI = abi;
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const Market = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [products, setProducts] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userProducts, setUserProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [allNFTs, setAllNFTs] = useState([]);
  const [groupedNFTs, setGroupedNFTs] = useState({});
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [gameTypes, setGameTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('buy');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'new',
    rarity: 'Rare',
    imageFile: null
  });
  // Initialize Ethers and Contracts
  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const gameContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        const tokenContractInstance = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, web3Signer);

        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(gameContract);
        setTokenContract(tokenContractInstance);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const userBalance = await gameContract.getUserBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(userBalance));

        await fetchAllNFTs(gameContract);
      }
    };
    initEthers();
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
  // Fetch All NFTs
  const fetchAllNFTs = async (contractInstance) => {
    setIsLoading(true);
    try {
      const filter = contractInstance.filters.NFTMinted();
      const events = await contractInstance.queryFilter(filter);

      const nfts = await Promise.all(events.map(async (event) => {
        const { owner, tokenId, tokenURI, ipfsHash, price, gameType } = event.args;
        const currentOwner = await contractInstance.ownerOf(tokenId);
        const details = await contractInstance.nftDetails(tokenId);

        return {
          tokenId: tokenId.toString(),
          owner: currentOwner,
          tokenURI,
          ipfsHash,
          price: ethers.utils.formatEther(price),
          gameType,
          forSale: details.forSale,
        };
      }));

      setAllNFTs(nfts);

      const grouped = nfts.reduce((acc, nft) => {
        if (!acc[nft.gameType]) {
          acc[nft.gameType] = [];
        }
        acc[nft.gameType].push(nft);
        return acc;
      }, {});

      setGroupedNFTs(grouped);
      setGameTypes(['all', ...Object.keys(grouped)]);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
    setIsLoading(false);
  };

  // Handle NFT Trade
  const handleTradeNFT = async (tokenId) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const details = await contract.nftDetails(tokenId);
      if (!details.forSale) {
        throw new Error("This NFT is not for sale");
      }

      const price = details.price;

      // Approve token spending
      const tokenApproval = await tokenContract.approve(CONTRACT_ADDRESS, price);
      await tokenApproval.wait();
      console.log("Token approval successful");

      // Execute trade
      const tradeTx = await contract.tradeNFT(tokenId);
      await tradeTx.wait();
      console.log("Trade successful");

      setSuccess('NFT traded successfully!');
      await fetchAllNFTs(contract);
      await loadTransactionHistory(tokenId);
    } catch (err) {
      setError(err.message);
      console.error("Trade error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Transaction History
  const loadTransactionHistory = async (tokenId) => {
    try {
      const history = await contract.getTransactionHistory(tokenId);
      const validTransactions = history.filter(
        (tx) => tx.from !== ethers.constants.AddressZero && tx.to !== ethers.constants.AddressZero
      );
      setTransactions(validTransactions);
    } catch (err) {
      console.error("History loading error:", err);
      setError("Failed to load transaction history");
    }
  };

  // NFT Card Component
  const NFTCard = ({ nft }) => (
    <motion.div
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-lg font-semibold mb-2 text-white">Token ID: {nft.tokenId}</p>
      <p className="text-sm text-gray-300 truncate mb-1">Owner: {nft.owner}</p>
      <p className="text-sm text-gray-300 mb-1">Price: {nft.price} ESPX</p>
      <p className="text-sm text-gray-300 mb-1">Game Type: {nft.gameType}</p>
      <p className="text-sm text-gray-300 truncate mb-3">IPFS Hash: {nft.ipfsHash}</p>
      {nft.forSale && nft.owner !== account && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTradeNFT(nft.tokenId)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Buy NFT
        </motion.button>
      )}
    </motion.div>
  );

  // Format Address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format Timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

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
              activeTab === 'assets'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700/50 text-gray-300'
            }`}
            onClick={() => setActiveTab('assets')}
          >
            Assets
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === 'e-commerce'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700/50 text-gray-300'
            }`}
            onClick={() => setActiveTab('e-commerce')}
          >
            E-commerce
          </motion.button>
        </div>

        {/* Assets Tab Content */}
        {activeTab === 'assets' && (
          <div className="space-y-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {gameTypes.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading NFTs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedType === 'all'
                  ? allNFTs.map((nft) => <NFTCard key={nft.tokenId} nft={nft} />)
                  : groupedNFTs[selectedType]?.map((nft) => (
                      <NFTCard key={nft.tokenId} nft={nft} />
                    ))}
              </div>
            )}

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-4 text-left font-semibold">From</th>
                        <th className="p-4 text-left font-semibold">To</th>
                        <th className="p-4 text-left font-semibold">Price</th>
                        <th className="p-4 text-left font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="p-4">{formatAddress(tx.from)}</td>
                          <td className="p-4">{formatAddress(tx.to)}</td>
                          <td className="p-4">{ethers.utils.formatEther(tx.price)} ESPX</td>
                          <td className="p-4">{formatTimestamp(tx.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                <p className="font-medium">Success:</p>
                <p>{success}</p>
              </div>
            )}
          </div>
        )}
       {/* E-commerce Tab Content */}
       {activeTab === 'e-commerce' && (
          <div>
            {/* Sub Tabs for E-commerce */}
            <div className="flex space-x-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-lg font-medium ${
                  activeSubTab === 'buy'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
                onClick={() => setActiveSubTab('buy')}
              >
                Buy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-lg font-medium ${
                  activeSubTab === 'sell'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
                onClick={() => setActiveSubTab('sell')}
              >
                Sell
              </motion.button>
            </div>

            {/* Buy Sub Tab Content */}
            {activeSubTab === 'buy' && (
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

            {/* Sell Sub Tab Content */}
            {activeSubTab === 'sell' && (
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
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Price (ESPX)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Condition</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                    value={newProduct.condition}
                    onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
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
                    onChange={(e) => setNewProduct({ ...newProduct, rarity: e.target.value })}
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
                    onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.files[0] })}
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