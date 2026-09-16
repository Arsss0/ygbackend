import React, { useEffect, useState, useRef } from 'react';
import { Camera, MessageSquare, User, Heart, Send, Edit3, Check, Users, UserPlus, Grid, Image as ImageIcon, ZoomIn, Crop } from "lucide-react";

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // feed | explore | profile
  
  // Данные профиля
  const [profileName, setProfileName] = useState(() => localStorage.getItem('yg_profile_name') || 'Арсен');
  const [profileBio, setProfileBio] = useState(() => localStorage.getItem('yg_profile_bio') || 'Եղվարդ • React Developer 💻');
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('yg_avatar_url') || null);
  const [isEditing, setIsEditing] = useState(false);

  // Подписки и Подписчики
  const [followers, setFollowers] = useState(12);
  const [following, setFollowing] = useState(5);
  const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' | 'following' | null

  // Посты
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'YG Spotted',
      username: 'yg_official',
      avatar: null,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60',
      description: 'Кто сегодня был возле школы около 14:00? Отпишитесь в комменты! 👀',
      likes: 24,
      time: '15 мин назад'
    }
  ]);

  // Новая публикация
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  
  // Кадрирование Аватарки
  const [tempImage, setTempImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);

  const avatarInputRef = useRef(null);
  const postImageInputRef = useRef(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
          const tgUser = tg.initDataUnsafe.user;
          setUser(tgUser);
        }
      } catch (e) {
        console.error("Telegram WebApp Error:", e);
      }
    }
  }, []);

  // Создание нового поста
  const handleCreatePost = () => {
    if (!newPostText && !newPostImage) return;

    const newPost = {
      id: Date.now(),
      author: profileName,
      username: user?.username || 'yg_user',
      avatar: avatarUrl,
      image: newPostImage,
      description: newPostText,
      likes: 0,
      time: 'Только что'
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setNewPostImage(null);
  };

  // Выбор изображения для поста
  const handlePostImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPostImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Выбор и зум аватарки
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setZoom(1);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCroppedAvatar = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = tempImage;

    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const minDim = Math.min(img.width, img.height);
      const cropSize = minDim / zoom;
      const startX = (img.width - cropSize) / 2;
      const startY = (img.height - cropSize) / 2;

      ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, size, size);
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setAvatarUrl(croppedDataUrl);
      localStorage.setItem('yg_avatar_url', croppedDataUrl);
      setIsCropping(false);
    };
  };

  return (
    <div style={{ 
      background: 'radial-gradient(circle at top, #1e1e2e 0%, #0f0f15 100%)', 
      color: '#f3f4f6', 
      minHeight: '100vh', 
      padding: '16px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      paddingBottom: '90px',
      boxSizing: 'border-box'
    }}>
      
      {/* Шапка Glassmorphism */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', padding: '12px 16px', 
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(16px)', 
        borderRadius: '16px', 
        border: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '19px', fontWeight: '800', background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            YG Spotted ⚡
          </h1>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Егвард • Social Network</span>
        </div>
        <div style={{ fontSize: '12px', background: 'rgba(99, 102, 241, 0.15)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontWeight: '600' }}>
          @{user?.username || 'yeghvard'}
        </div>
      </header>

      <main>
        {/* ЛЕНТА ПОСТОВ */}
        {activeTab === 'feed' && (
          <div>
            {/* Создание поста */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(12px)', 
              padding: '16px', borderRadius: '20px', 
              marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' 
            }}>
              <textarea 
                placeholder="Что нового в Егварде? Поделись фото или спотом..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '12px', resize: 'none', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }}
                rows={3}
              />

              {/* Превью выбранного фото для поста */}
              {newPostImage && (
                <div style={{ position: 'relative', marginTop: '10px' }}>
                  <img src={newPostImage} alt="Post preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button onClick={() => setNewPostImage(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer' }}>✕</button>
                </div>
              )}

              <input type="file" accept="image/*" ref={postImageInputRef} style={{ display: 'none' }} onChange={handlePostImageSelect} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                <button onClick={() => postImageInputRef.current.click()} style={{ background: 'rgba(255, 255, 255, 0.06)', border: 'none', color: '#c084fc', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                  <ImageIcon size={16} /> Добавить фото
                </button>
                <button onClick={handleCreatePost} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Send size={15} /> Постить
                </button>
              </div>
            </div>

            {/* Карточки Постов */}
            {posts.map((post) => (
              <div key={post.id} style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                backdropFilter: 'blur(10px)', 
                borderRadius: '20px', padding: '16px', 
                marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                    {post.avatar ? <img src={post.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : post.author[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{post.author}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>@{post.username} • {post.time}</div>
                  </div>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e5e7eb', lineHeight: '1.5' }}>{post.description}</p>

                {post.image && (
                  <img src={post.image} alt="Post content" style={{ width: '100%', borderRadius: '14px', marginBottom: '12px', objectFit: 'cover', maxHeight: '350px' }} />
                )}

                <div style={{ display: 'flex', gap: '18px', color: '#9ca3af', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Heart size={18} color="#ec4899" /> {post.likes}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><MessageSquare size={18} /> Ответить</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ПОИСК И ПОДПИСКИ */}
        {activeTab === 'explore' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> Найти жителей Егварда
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 16px 0' }}>Подписывайся, чтобы видеть их новые публикации в своей ленте.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Ален Григорян', 'Давид Саргсян', 'Мариам Арутюнян'].map((name, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{name[0]}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{name}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Егвард • Участник</div>
                    </div>
                  </div>
                  <button style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    Подписаться
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ПИН-КАРТОЧКА ПРОФИЛЯ */}
        {activeTab === 'profile' && (
          <div>
            <input type="file" accept="image/*" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarSelect} />

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(16px)', 
              borderRadius: '24px', padding: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => isEditing && avatarInputRef.current.click()}
                    style={{ 
                      width: '82px', height: '82px', borderRadius: '50%', 
                      background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #6366f1, #a855f7)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '32px', fontWeight: 'bold', border: '3px solid #a855f7',
                      cursor: isEditing ? 'pointer' : 'default', overflow: 'hidden'
                    }}
                  >
                    {!avatarUrl && profileName[0]}
                  </div>
                </div>

                {/* Подписчики & Подписки */}
                <div style={{ display: 'flex', gap: '16px', textAlign: 'center' }}>
                  <div onClick={() => setShowFollowModal('followers')} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{followers}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Подписчики</div>
                  </div>
                  <div onClick={() => setShowFollowModal('following')} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>{following}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Подписки</div>
                  </div>
                </div>
              </div>

              {/* Имя и О себе */}
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px' }} />
                  <input type="text" value={profileBio} onChange={(e) => setProfileBio(e.target.value)} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px' }} />
                  <button onClick={() => { localStorage.setItem('yg_profile_name', profileName); localStorage.setItem('yg_profile_bio', profileBio); setIsEditing(false); }} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>Сохранить</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{profileName}</h2>
                    <button onClick={() => setIsEditing(true)} style={{ background: 'rgba(255,255,255,0.06)', color: '#c084fc', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit3 size={14} /> Редактировать
                    </button>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#9ca3af' }}>{profileBio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Зум модалка */}
      {isCropping && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #a855f7' }}>
            <img src={tempImage} alt="Crop preview" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
          </div>
          <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '60%', marginTop: '20px', accentColor: '#a855f7' }} />
          <button onClick={applyCroppedAvatar} style={{ marginTop: '20px', background: '#a855f7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Готово</button>
        </div>
      )}

      {/* Навигация */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(15, 15, 21, 0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', justifyContent: 'space-around', 
        padding: '14px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button onClick={() => setActiveTab('feed')} style={{ background: 'none', border: 'none', color: activeTab === 'feed' ? '#a855f7' : '#6b7280', cursor: 'pointer' }}><Grid size={22} /></button>
        <button onClick={() => setActiveTab('explore')} style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#a855f7' : '#6b7280', cursor: 'pointer' }}><Users size={22} /></button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#a855f7' : '#6b7280', cursor: 'pointer' }}><User size={22} /></button>
      </nav>

    </div>
  );
}

export default App;