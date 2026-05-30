import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, MessageCircle, Search, Menu, X, LogOut, Edit2, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Animation variants
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const scaleIn = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } };

const Blog = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ title: '', excerpt: '', content: '', category: 'Technology' });

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, [token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
    setLoading(false);
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage('home');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', excerpt: '', content: '', category: 'Technology' });
        fetchPosts();
        setCurrentPage('blog');
      }
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pages
  const HomePage = () => (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-20"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="px-8 py-6 flex justify-between items-center">
          <motion.h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" whileHover={{ scale: 1.05 }}>
            ✨ Animated Blog
          </motion.h1>
          <nav className="hidden md:flex gap-8">
            {['home', 'blog', token ? 'create' : 'login'].map((item) => (
              <motion.button
                key={item}
                onClick={() => setCurrentPage(item)}
                className="text-lg font-semibold text-purple-200 hover:text-pink-400 transition"
                whileHover={{ scale: 1.1, letterSpacing: '0.05em' }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </motion.button>
            ))}
          </nav>
        </motion.header>

        {/* Hero Section */}
        <motion.section className="px-8 py-32 text-center" variants={staggerContainer} initial="initial" animate="animate">
          <motion.h2 variants={fadeInUp} className="text-7xl font-black mb-6 leading-tight">
            Stories That<br /><span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Inspire</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Welcome to a space where creativity meets technology. Explore handcrafted articles with stunning animations and interactive experiences.
          </motion.p>
          <motion.button
            variants={scaleIn}
            onClick={() => setCurrentPage('blog')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold text-lg hover:shadow-lg transition"
          >
            Explore Articles
          </motion.button>
        </motion.section>

        {/* Floating stats */}
        <motion.section className="px-8 py-20 flex justify-around">
          {[{ label: 'Articles', value: posts.length }, { label: 'Authors', value: '1' }, { label: 'Readers', value: '∞' }].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="text-center"
            >
              <motion.p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                {stat.value}
              </motion.p>
              <p className="text-purple-300 text-lg mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="text-purple-400" size={32} />
      </motion.div>
    </motion.div>
  );

  const BlogListPage = () => (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Latest Articles
          </h1>

          {/* Search Bar */}
          <motion.div className="mb-12 relative" whileHover={{ scale: 1.02 }}>
            <Search className="absolute left-4 top-3 text-purple-400" size={24} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3 rounded-full bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 transition"
            />
          </motion.div>
        </motion.div>

        {loading ? (
          <motion.div className="text-center py-20">
            <motion.div
              className="inline-block w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
                onClick={() => {
                  setSelectedPost(post);
                  setCurrentPage('post');
                }}
                className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-8 cursor-pointer backdrop-blur-sm hover:border-purple-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <motion.span className="text-sm text-pink-400 font-semibold uppercase tracking-widest">
                      {post.category}
                    </motion.span>
                    <h2 className="text-3xl font-black mt-2 text-white hover:text-pink-300 transition">
                      {post.title}
                    </h2>
                    <p className="text-purple-300 mt-3 leading-relaxed">{post.excerpt}</p>
                    <div className="flex gap-6 mt-6 text-sm text-purple-400">
                      <span>By {post.author_name}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="ml-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Heart className="text-white" size={24} />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const PostPage = () => (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-8">
        <motion.button
          onClick={() => setCurrentPage('blog')}
          className="mb-8 text-purple-400 hover:text-pink-400 font-semibold flex items-center gap-2"
          whileHover={{ x: -5 }}
        >
          ← Back to Articles
        </motion.button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-12 backdrop-blur-sm"
        >
          <motion.h1 className="text-5xl font-black mb-4">{selectedPost.title}</motion.h1>
          <motion.div className="flex gap-4 text-purple-300 text-sm mb-8 border-b border-purple-500/30 pb-8">
            <span>By {selectedPost.author_name}</span>
            <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
            <span className="bg-pink-500/20 px-3 py-1 rounded-full text-pink-300">{selectedPost.category}</span>
          </motion.div>

          <motion.div
            className="prose prose-invert max-w-none mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {selectedPost.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-lg leading-8 text-purple-100 mb-4">
                {paragraph}
              </p>
            ))}
          </motion.div>

          <motion.div className="flex gap-4 pt-8 border-t border-purple-500/30">
            <motion.button whileHover={{ scale: 1.1 }} className="flex items-center gap-2 text-purple-400 hover:text-pink-400">
              <Heart size={24} /> Like
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} className="flex items-center gap-2 text-purple-400 hover:text-pink-400">
              <MessageCircle size={24} /> Comment
            </motion.button>
          </motion.div>
        </motion.article>
      </div>
    </motion.div>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
            className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm space-y-6"
          >
            <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              Welcome Back
            </h1>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold hover:shadow-lg transition"
            >
              Login
            </motion.button>

            <p className="text-center text-purple-300">
              Demo: test@test.com / password123
            </p>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const CreatePostPage = () => (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
      <div className="max-w-2xl mx-auto px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Create New Article
          </h1>
        </motion.div>

        <motion.form
          onSubmit={handleCreatePost}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <input
            type="text"
            placeholder="Article Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 text-lg font-semibold"
          />

          <input
            type="text"
            placeholder="Excerpt (short summary)"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white focus:outline-none focus:border-purple-400"
          >
            <option className="bg-slate-900">Technology</option>
            <option className="bg-slate-900">Design</option>
            <option className="bg-slate-900">Business</option>
            <option className="bg-slate-900">Lifestyle</option>
          </select>

          <textarea
            placeholder="Article Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows="12"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 resize-none"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold hover:shadow-lg transition"
          >
            Publish Article
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );

  // Main render
  return (
    <div className="font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-black/20 backdrop-blur-lg border-b border-purple-500/20 flex justify-between items-center">
        <motion.button
          onClick={() => setCurrentPage('home')}
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400"
          whileHover={{ scale: 1.1 }}
        >
          ✨ Animated Blog
        </motion.button>

        <div className="hidden md:flex gap-6">
          {user && <span className="text-purple-300">Welcome, {user.name}</span>}
          {user && <motion.button onClick={handleLogout} whileHover={{ scale: 1.1 }} className="text-pink-400"><LogOut size={20} /></motion.button>}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'blog' && <BlogListPage />}
          {currentPage === 'post' && <PostPage />}
          {currentPage === 'login' && <LoginPage />}
          {currentPage === 'create' && user && <CreatePostPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Blog;
