import React, { useState, useEffect } from 'react';
import { Users, Trophy, MessageSquare, TrendingUp, Star, Calendar, Plus, Send, Heart, MessageCircle } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../components/firebase';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import QRCode from 'qrcode';

// Initialize EmailJS
emailjs.init("1dc3pjtJ5L5DERdp8");  // your public key
// Dialog Component for New Event
const EventDialog = ({ isOpen, onClose, onSubmit }) => {
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    prize: '',
    description: '',
    requirements: '',
    maxParticipants: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.title}
            onChange={(e) => setEventData({...eventData, title: e.target.value})}
            required
          />
          <input
            type="date"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.date}
            onChange={(e) => setEventData({...eventData, date: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Prize Pool (ESPX)"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.prize}
            onChange={(e) => setEventData({...eventData, prize: e.target.value})}
            required
          />
          <textarea
            placeholder="Event Description"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.description}
            onChange={(e) => setEventData({...eventData, description: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Requirements"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.requirements}
            onChange={(e) => setEventData({...eventData, requirements: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Maximum Participants"
            className="w-full p-2 bg-gray-700 rounded text-white"
            value={eventData.maxParticipants}
            onChange={(e) => setEventData({...eventData, maxParticipants: e.target.value})}
            required
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Discussion Post Component
const DiscussionPost = ({ post, onComment, onLike }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    onComment(post.id, newComment);
    setNewComment('');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{post.title}</h3>
          <p className="text-gray-400 text-sm">By {post.authorName} • {new Date(post.timestamp?.toDate()).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center space-x-2 text-gray-400 hover:text-purple-500"
        >
          <Heart className={`w-5 h-5 ${post.likes?.includes(auth.currentUser?.uid) ? 'fill-purple-500 text-purple-500' : ''}`} />
          <span>{post.likes?.length || 0}</span>
        </button>
      </div>
      
      <p className="text-gray-300 mb-4">{post.content}</p>
      
      <div className="space-y-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-500 hover:text-purple-400"
        >
          {isExpanded ? 'Hide Comments' : `Show Comments (${post.comments?.length || 0})`}
        </button>
        
        {isExpanded && (
          <div className="space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={index} className="bg-gray-700 rounded p-4">
                <p className="text-sm text-gray-400 mb-1">{comment.authorName}</p>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
            
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-700 rounded p-2 text-white"
              />
              <button
                type="submit"
                className="p-2 bg-purple-600 rounded hover:bg-purple-500"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const featuredPlayers = [
    { id: 1, name: "Alex_Pro", rank: "Diamond", achievements: 145, rating: 4.8 },
    { id: 2, name: "CryptoGamer", rank: "Master", achievements: 230, rating: 4.9 },
    { id: 3, name: "NFTChampion", rank: "Platinum", achievements: 178, rating: 4.7 }
  ];
//   const upcomingEvents = [
//     { id: 1, title: "Winter Championship", date: "Feb 15, 2025", prize: "50,000 ESPX", participants: 1280 },
//     { id: 2, title: "Community Cup", date: "Feb 20, 2025", prize: "25,000 ESPX", participants: 640 },
//     { id: 3, title: "Pro League Season 5", date: "Mar 1, 2025", prize: "100,000 ESPX", participants: 320 }
//   ];

//   const discussions = [
//     { id: 1, title: "Best NFT strategies for beginners", author: "CryptoMaster", replies: 45, likes: 128 },
//     { id: 2, title: "Tournament preparation tips", author: "ProPlayer123", replies: 67, likes: 234 },
//     { id: 3, title: "Asset trading guide 2025", author: "TraderPro", replies: 89, likes: 345 }
//   ];

// Main Community Page Component
const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // Fetch posts and events on component mount
  useEffect(() => {
    const fetchData = async () => {
      const postsQuery = query(collection(db, 'communityPosts'), orderBy('timestamp', 'desc'));
      const eventsQuery = query(collection(db, 'events'), orderBy('date'));
      
      const [postsSnap, eventsSnap] = await Promise.all([
        getDocs(postsQuery),
        getDocs(eventsQuery)
      ]);

      setPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleNewPost = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      const postData = {
        ...newPost,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      };

      const docRef = await addDoc(collection(db, 'communityPosts'), postData);
      setPosts([{ id: docRef.id, ...postData }, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowNewPostForm(false);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Error creating post');
    }
  };

  const handleNewEvent = async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: serverTimestamp(),
        participants: [],
        createdBy: auth.currentUser.uid
      });
      setEvents([...events, { id: docRef.id, ...eventData }]);
      toast.success('Event created successfully!');
    } catch (error) {
      toast.error('Error creating event');
    }
  };
 
  
//   const handleJoinEvent = async (event) => {
//     try {
//       // Generate QR code for the event
//       const qrCodeData = {
//         eventId: event.id,
//         userId: auth.currentUser.uid,
//         timestamp: new Date().toISOString()
//       };
      
//       // Convert QR code data to image
//       const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData));
  
//       // Create HTML template for email
//       const htmlContent = `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
//           <div style="background-color: #7c3aed; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h1 style="color: white; margin: 0; text-align: center;">EspeonX Community Event</h1>
//           </div>
          
//           <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
//             <h2 style="color: #7c3aed; text-align: center;">${event.title}</h2>
//             <p style="text-align: center; color: #666;">Your registration has been confirmed!</p>
            
//             <div style="text-align: center; margin: 20px 0;">
//               <img src="${qrCodeImage}" alt="Event QR Code" style="width: 200px; height: 200px;"/>
//               <p style="color: #666; font-size: 14px;">Registration ID: ${event.id}</p>
//             </div>
            
//             <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
//               <h3 style="color: #333;">Event Details:</h3>
//               <ul style="color: #666; list-style: none; padding: 0;">
//                 <li style="margin: 10px 0;">📅 Date: ${new Date(event.date).toLocaleDateString()}</li>
//                 <li style="margin: 10px 0;">🏆 Prize Pool: ${event.prize} ESPX</li>
//                 <li style="margin: 10px 0;">👥 Maximum Participants: ${event.maxParticipants}</li>
//               </ul>
//             </div>
            
//             <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
//               <h3 style="color: #333;">Requirements:</h3>
//               <p style="color: #666;">${event.requirements}</p>
//             </div>
//           </div>
          
//           <div style="text-align: center; color: #666; font-size: 14px;">
//             <p>This is an automated message, please do not reply to this email.</p>
//             <p>© ${new Date().getFullYear()} EspeonX Community. All rights reserved.</p>
//           </div>
//         </div>
//       `;
  
//       // Prepare email template parameters
//       const templateParams = {
//         to_name: auth.currentUser.displayName || 'Community Member',
//         from_name: 'EspeonX Community Team',
//         to_email: 'khushi.parekh22@spit.ac.in',
//         event_title: event.title,
//         event_date: new Date(event.date).toLocaleDateString(),
//         html_content: htmlContent,
//         message: `Welcome to ${event.title}! We're excited to have you join us.`,
//         reply_to: 'noreply@espeonx.com'
//       };
  
//       // Send email using EmailJS
//       const response = await emailjs.send(
//         'service_4dv8j5e', // Replace with your EmailJS service ID
//        'template_iykrkjj', // Replace with your EmailJS template ID
//         templateParams,
//         '1dc3pjtJ5L5DERdp8'// Replace with your EmailJS public key
//       );
  
//       if (response.status === 200) {
//         // Update Firestore with participant data
//         const eventRef = doc(db, 'events', event.id);
//         await updateDoc(eventRef, {
//           participants: arrayUnion({
//             userId: auth.currentUser.uid,
//             email: auth.currentUser.email,
//             name: auth.currentUser.displayName || 'Anonymous',
//             joinedAt: serverTimestamp()
//           })
//         });
  
//         toast.success('Successfully joined the event! Check your email for confirmation.');
//       }
//     } catch (error) {
//         console.error('Email error:', error);
//         toast.error(`Failed to send email: ${error.text || error.message}`);
//       throw error; // Re-throw to handle in the calling function
//     }
//   };
  
//   const handleJoinEvent = async (eventId) => {
//     try {
//       const eventRef = doc(db, 'events', eventId);
//       await updateDoc(eventRef, {
//         participants: arrayUnion(auth.currentUser.uid)
//       });
//       toast.success('Successfully joined the event!');
//     } catch (error) {
//       toast.error('Error joining event');
//     }
//   };


const handleJoinEvent = async (eventId, eventData) => {
    try {
        // Validate inputs
        if (!eventId || !eventData) {
            throw new Error('Event data is required');
        }

        // Generate QR code for the event
        const qrCodeData = {
            eventId: eventId,
            userId: 'khushi.parekh22@spit.ac.in',
            timestamp: new Date().toISOString()
        };
        
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData));

        // Create HTML template for email
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #7c3aed; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="color: white; margin: 0; text-align: center;">EspeonX Community Event</h1>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #7c3aed; text-align: center;">${eventData.title}</h2>
                    <p style="text-align: center; color: #666;">Your registration has been confirmed!</p>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="${qrCodeImage}" alt="Event QR Code" style="width: 200px; height: 200px;"/>
                        <p style="color: #666; font-size: 14px;">Registration ID: ${eventId}</p>
                    </div>
                    
                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        <h3 style="color: #333;">Event Details:</h3>
                        <ul style="color: #666; list-style: none; padding: 0;">
                            <li style="margin: 10px 0;">📅 Date: ${new Date(eventData.date).toLocaleDateString()}</li>
                            <li style="margin: 10px 0;">🏆 Prize Pool: ${eventData.prize} ESPX</li>
                            <li style="margin: 10px 0;">👥 Maximum Participants: ${eventData.maxParticipants}</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        <h3 style="color: #333;">Requirements:</h3>
                        <p style="color: #666;">${eventData.requirements}</p>
                    </div>
                </div>
                
                <div style="text-align: center; color: #666; font-size: 14px;">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} EspeonX Community. All rights reserved.</p>
                </div>
            </div>
        `;

        // First, update Firestore with participant data
        const eventRef = doc(db, 'events', eventId);
        const participantData = {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            name: auth.currentUser?.displayName || 'Anonymous',
            joinedAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
        };

        await updateDoc(eventRef, {
            participants: arrayUnion(participantData)
        });

        // Then send the email
        const templateParams = {
            to_name: auth.currentUser?.displayName || 'Community Member',
            from_name: 'EspeonX Community Team',
            to_email: 'khushi.parekh22@spit.ac.in',
            event_title: eventData.title,
            event_date: new Date(eventData.date).toLocaleDateString(),
            html_content: htmlContent,
            message: `Welcome to ${eventData.title}! We're excited to have you join us.`,
            reply_to: 'noreply@espeonx.com'
        };

        const response = await emailjs.send(
            'service_4dv8j5e',
            'template_iykrkjj',
            templateParams,
            '1dc3pjtJ5L5DERdp8'
        );

        if (response.status === 200) {
            toast.success('Successfully joined the event! Check your email for confirmation.');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Detailed error:', {
            error: error,
            message: error.message,
            name: error.name
        });
        toast.error(`Failed to join event: ${error.message}`);
        throw error;
    }
};

const onJoinClick = async (event) => {
    try {
        await handleJoinEvent(event.id, event);
        // Handle success (e.g., update UI, refresh data)
    } catch (error) {
        // Handle error
        console.error('Failed to join event:', error);
    }
};
  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'communityPosts', postId);
      const postDoc = await getDoc(postRef);
      const currentLikes = postDoc.data().likes || [];
      const userId = auth.currentUser.uid;

      const newLikes = currentLikes.includes(userId)
        ? currentLikes.filter(id => id !== userId)
        : [...currentLikes, userId];

      await updateDoc(postRef, { likes: newLikes });
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: newLikes } : post
      ));
    } catch (error) {
      toast.error('Error updating like');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const postRef = doc(db, 'communityPosts', postId);
      const comment = {
        content,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email,
        timestamp: serverTimestamp()
      };

      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), comment] }
          : post
      ));
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 pb-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to the <span className="text-purple-500">EspeonX</span> Community
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Join thousands of players in shaping the future of decentralized gaming. 
          Own your achievements, trade assets, and participate in community-driven events.
        </p>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Users, label: "Active Players", value: "50,000+" },
          { icon: Trophy, label: "Tournaments", value: "1,200+" },
          { icon: MessageSquare, label: "Daily Discussions", value: "3,000+" },
          { icon: TrendingUp, label: "Assets Traded", value: "1M+" }
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-gray-800 rounded-lg p-6 text-center">
            <Icon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-white font-bold">{value}</h3>
            <p className="text-gray-400 text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Featured Players */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Star className="w-6 h-6 text-purple-500 mr-2" />
          Featured Players
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPlayers.map(player => (
            <div key={player.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{player.name}</h3>
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm text-white">
                  {player.rank}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>{player.achievements} Achievements</span>
                <span>⭐ {player.rating}/5.0</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'discussions'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'events'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </button>
          </div>
          
          {activeTab === 'discussions' ? (
            <button
              onClick={() => setShowNewPostForm(true)}
              className="px-4 py-2 bg-purple-600 rounded-lg flex items-center hover:bg-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          ) : (
            <button
              onClick={() => setShowEventDialog(true)}
              className="px-4 py-2 bg-purple-600 rounded-lg flex items-center hover:bg-purple-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'discussions' ? (
          <div className="space-y-6">
            {/* New Post Form */}
            {showNewPostForm && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Create New Post</h3>
                <form onSubmit={handleNewPost} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Post Title"
                    className="w-full p-3 bg-gray-700 rounded text-white"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="What's on your mind?"
                    className="w-full p-3 bg-gray-700 rounded text-white h-32"
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    required
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
                      className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts List */}
            {posts.map(post => (
              <DiscussionPost
                key={post.id}
                post={post}
                onComment={handleComment}
                onLike={handleLike}
                />
            ))}
          </div>
        ) : (
          // Events Tab Content
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  <Trophy className="w-6 h-6 text-purple-500" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-gray-300">{event.description}</p>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.participants?.length || 0} / {event.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center text-purple-500">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{event.prize} ESPX</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Requirements:</h4>
                  <p className="text-gray-300">{event.requirements}</p>
                </div>
                <button
    onClick={() => onJoinClick(event)}
    disabled={event.participants?.includes(auth.currentUser?.uid)}
    className={`w-full mt-4 py-2 rounded ${
        event.participants?.includes(auth.currentUser?.uid)
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-500'
    }`}
>
    {event.participants?.includes(auth.currentUser?.uid)
        ? 'Already Joined'
        : 'Join Event'}
</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Dialog */}
      <EventDialog
        isOpen={showEventDialog}
        onClose={() => setShowEventDialog(false)}
        onSubmit={handleNewEvent}
      />
    </div>
  );
};

export default CommunityPage;
