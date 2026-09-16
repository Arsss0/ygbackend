require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Увеличили лимит для загрузки фото Base64

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yg_spotted')
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- ЭНДПОИНТЫ ПРОФИЛЯ ---

// Авторизация / Получение или создание профиля по Telegram ID
app.post('/api/users/sync', async (req, res) => {
  const { telegramId, username, name } = req.body;
  try {
    let user = await User.findOne({ telegramId });
    if (!user) {
      user = await User.create({ telegramId, username, name });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновление профиля (имя, био, аватарка)
app.put('/api/users/:id', async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { name, bio, avatarUrl }, 
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ЭНДПОИНТЫ ПОДПИСОК ---

// Подписаться / Отписаться
app.post('/api/users/follow', async (req, res) => {
  const { currentUserId, targetUserId } = req.body;
  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Отписка
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Подписка
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ЭНДПОИНТЫ ПОСТОВ ---

// Получить все посты (Лента)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name username avatarUrl')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать новый пост
app.post('/api/posts', async (req, res) => {
  const { authorId, text, imageUrl } = req.body;
  try {
    const newPost = await Post.create({ author: authorId, text, imageUrl });
    const populatedPost = await newPost.populate('author', 'name username avatarUrl');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Поставить / Убрать лайк
app.post('/api/posts/:id/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likesCount: post.likes.length, hasLiked: !hasLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));