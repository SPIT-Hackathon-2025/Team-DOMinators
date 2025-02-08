import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Image, Clock, Plus, X, Calendar, LayoutGrid } from 'lucide-react';
import axios from 'axios';

// =========== CreateProjectModal Component ===========
const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fundingGoal: '',
    duration: 30,
    imageUrls: [], // Store IPFS URLs
    deadline: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [file, setFile] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFile(file); // Store the file for later upload
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadError('Please upload an image for the project.');
      return;
    }

    setUploading(true);

    try {
      // Upload the file to Pinata IPFS
      const fileData = new FormData();
      fileData.append("file", file);

      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRETKEY,
          "Content-Type": "multipart/form-data",
        },
      });

      const fileURL = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;

      // Create the project data
      const projectData = {
        ...formData,
        id: Date.now(),
        currentFunding: "0",
        status: "active",
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString(),
        imageUrls: [fileURL] // Store the IPFS URL
      };

      // Submit the project data
      await onSubmit(projectData);

      // Reset the form
      setFormData({
        name: '',
        description: '',
        fundingGoal: '',
        duration: 30,
        imageUrls: [],
        deadline: ''
      });
      setFile(null);
      onClose();
    } catch (error) {
      console.error('IPFS upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl w-full max-w-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Crowdfunding Project
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Game Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter game name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Game Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[120px]"
                  required
                  placeholder="Describe your game project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Funding Goal (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Campaign Duration (Days)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  {[15, 30, 45, 60, 90].map((days) => (
                    <option key={days} value={days}>
                      {days} Days
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Game Image</label>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      disabled={uploading}
                    />
                  </div>
                  
                  {uploading && (
                    <div className="text-sm text-purple-400">
                      Uploading image to IPFS...
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="text-sm text-red-400">
                      {uploadError}
                    </div>
                  )}

                  {file && (
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Game preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Upload one image showcasing your game</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg px-6 py-3 font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                type="submit"
                disabled={uploading}
              >
                <Plus className="w-5 h-5" />
                Create Project
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// =========== ProjectCard Component ===========
const ProjectCard = ({ project, onBackProject }) => {
  const { name, description, fundingGoal, currentFunding, duration, imageUrls } = project;
  const progress = (parseFloat(currentFunding) / parseFloat(fundingGoal)) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all min-h-screen"
    >
      {imageUrls && imageUrls.length > 0 && (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <img 
            src={imageUrls[0]}
            alt={`${name} preview`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-gray-300">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{currentFunding} / {fundingGoal} ETH</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="font-medium">{duration} days remaining</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
        onClick={() => onBackProject(project)}
      >
        <DollarSign className="w-5 h-5" />
        Back Project
      </motion.button>
    </motion.div>
  );
};

// =========== Main Crowdfunding Component ===========
const Crowdfunding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Load projects from localStorage on component mount
    const savedProjects = localStorage.getItem('crowdfundingProjects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    // Save projects to localStorage whenever they change
    localStorage.setItem('crowdfundingProjects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const handleBackProject = (project) => {
    // Add your backing logic here
    console.log('Backing project:', project);
  };

  const filteredProjects = projects.filter(project => {
    if (selectedTab === 'active') {
      return project.status === 'active';
    } else if (selectedTab === 'completed') {
      return project.status === 'completed';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Crowdfunding
          </h1>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </motion.button>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 border-b border-gray-700">
            <button
              className={`px-4 py-2 ${
                selectedTab === 'active'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setSelectedTab('active')}
            >
              Active Projects
            </button>
            <button
              className={`px-4 py-2 ${
                selectedTab === 'completed'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setSelectedTab('completed')}
            >
              Completed Projects
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onBackProject={handleBackProject}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No projects found.</p>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default Crowdfunding;