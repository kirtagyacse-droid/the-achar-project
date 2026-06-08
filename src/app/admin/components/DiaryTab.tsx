"use client";
import React, { useState } from 'react';
import { BlogPost } from '../AdminClient';

interface DiaryTabProps {
  blogPosts: BlogPost[];
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

export default function DiaryTab({ blogPosts, setBlogPosts }: DiaryTabProps) {
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    coverImage: '',
    isPublished: false
  });

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert('Title and content are required');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      
      if (res.ok) {
        setBlogPosts(prev => [data.blogPost, ...prev]);
        setNewPost({ title: '', content: '', coverImage: '', isPublished: false });
        alert('Diary entry saved successfully!');
      } else {
        alert(data.message || 'Failed to create diary entry');
      }
    } catch (err) {
      console.error('Error creating blog post', err);
      alert('Error creating blog post');
    }
  };

  return (
    <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
      {/* Create Post Form */}
      <div className="admin-premium-card" style={{ margin: 0 }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>✍️ Write a Diary Entry</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Publish seasonal achar updates, grandfatherly recipes, or sun-drying logs in Aunty&apos;s Diary.
        </p>

        <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Preparing the Summer Mango Curing Jars"
              className="form-control"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            />
            {newPost.title && (
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'block', marginTop: '4px' }}>
                Slug: <code>{newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}</code>
              </span>
            )}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Cover Image URL (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. /uploads/keri-ka-khatta.jpg"
              className="form-control"
              value={newPost.coverImage}
              onChange={e => setNewPost({ ...newPost, coverImage: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label>Diary Content (Paragraphs) *</label>
            <textarea 
              required
              rows={8}
              placeholder="Write your seasonal notes, pickling milestones, or general thoughts here..."
              className="form-control"
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              style={{ lineHeight: '1.6', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="is-published-chk"
              checked={newPost.isPublished}
              onChange={e => setNewPost({ ...newPost, isPublished: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="is-published-chk" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', textTransform: 'none' }}>
              Publish entry immediately (visible in the public diary feed)
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-submit-pickle"
            style={{ marginTop: '10px', margin: 0 }}
          >
            💾 Publish Entry
          </button>
        </form>
      </div>

      {/* Existing Posts List */}
      <div className="admin-premium-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>📖 Published Notes & Logs</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          All previously written blog posts and grandmaternal diaries.
        </p>

        {blogPosts.length === 0 ? (
          <p className="no-items-text" style={{ padding: '60px 0', textAlign: 'center' }}>
            No entries have been written yet. Start writing on the left!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '6px' }}>
            {blogPosts.map(post => (
              <div 
                key={post.id}
                style={{
                  border: '1px solid var(--admin-border)',
                  backgroundColor: '#FAFAFA',
                  padding: '16px',
                  borderRadius: '2px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--admin-text)', fontWeight: '600' }}>{post.title}</h4>
                  <span 
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      textTransform: 'uppercase',
                      backgroundColor: post.isPublished ? 'var(--admin-success-light)' : '#E4E4E7',
                      color: post.isPublished ? 'var(--admin-success)' : 'var(--admin-muted)',
                      border: `1px solid ${post.isPublished ? 'rgba(21, 128, 61, 0.1)' : 'var(--admin-border)'}`
                    }}
                  >
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '4px' }}>
                  Slug: <code>{post.slug}</code> • Date: {new Date(post.createdAt).toLocaleDateString('en-IN')}
                </div>

                <p 
                  style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--admin-text)', 
                    marginTop: '10px', 
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
