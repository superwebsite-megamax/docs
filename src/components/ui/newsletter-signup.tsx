"use client";
import { useState } from 'react';
export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { const subs = JSON.parse(localStorage.getItem('newsletter_subs') || '[]'); if (!subs.includes(email)) { subs.push(email); localStorage.setItem('newsletter_subs', JSON.stringify(subs)); } setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); }
  };
  return (
    <div className="glass-effect rounded-2xl p-8 text-center max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-2 gradient-text">Stay Updated</h3>
      <p className="text-gray-400 text-sm mb-4">Get the latest entertainment news.</p>
      {subscribed ? <div className="text-green-400 font-semibold animate-fade-in">✓ Subscribed!</div> : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-netflix-red text-sm" required />
          <button type="submit" className="px-6 py-2 bg-netflix-red text-white rounded-lg font-semibold hover:bg-red-700 text-sm">Subscribe</button>
        </form>
      )}
    </div>
  );
}
