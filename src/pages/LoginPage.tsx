import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    if (!isSupabaseConfigured) {
      // 演示模式：直接登录
      localStorage.setItem('weekend-planner-user', JSON.stringify({ email, id: 'demo-user' }));
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase!.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('登录链接已发送到您的邮箱！');
      }
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // 演示模式直接登录
    localStorage.setItem('weekend-planner-user', JSON.stringify({ 
      email: 'demo@example.com', 
      id: 'demo-user' 
    }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] p-4 flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="text-gray-600">
            ← 返回
          </button>
        </div>

        <Card className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">登录</h1>
          <p className="text-gray-500 mb-6">登录后可保存和同步行程</p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '发送中...' : '发送登录链接'}
            </Button>
          </form>
        </Card>

        {/* Demo */}
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-3">或者</div>
            <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
              演示模式（无需登录）
            </Button>
          </div>
        </Card>

        {/* Status */}
        <div className="mt-4 text-center text-xs text-gray-400">
          {isSupabaseConfigured ? '✅ Supabase 已配置' : '⚠️ 演示模式'}
        </div>
      </div>
    </div>
  );
}
