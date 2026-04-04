import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, ShieldCheck, Zap, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  is_admin: boolean;
  created_at: string;
}

export const AdminDashboard = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagVideoId, setDiagVideoId] = useState('');
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const runDiagnostics = async () => {
    if (!diagVideoId) return;
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const res = await fetch(`/api/youtube/metadata/${diagVideoId}`);
      const metadata = await res.json();
      
      const transRes = await fetch(`/api/youtube/transcript/${diagVideoId}`);
      const transcript = transRes.ok ? await transRes.json() : { error: 'Blocked/Unavailable' };
      
      setDiagResult({ metadata, transcript_status: transRes.status === 200 ? 'SUCCESS' : 'FAILED', data: metadata });
      toast.success('Diagnostics Complete');
    } catch (err) {
      toast.error('Diagnostics Failed');
    } finally {
      setDiagLoading(false);
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-500' },
    { label: 'Active Today', value: users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length.toString(), icon: Activity, color: 'text-emerald-500' },
    { label: 'Admin Roles', value: users.filter(u => u.is_admin).length.toString(), icon: ShieldCheck, color: 'text-purple-500' },
    { label: 'Server Status', value: 'Healthy', icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-up bg-[#030303] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">System Administration</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter">Control Center</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/'} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">Back to Workspace</Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">System Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <Card key={item.label} className="bg-white/[0.02] border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white/40">{item.label}</CardTitle>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">{item.value}</div>
              <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-tighter">Update synchronized</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white/[0.02] border-white/5 overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">User Database</CardTitle>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input placeholder="Filter users..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-primary/50" />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-tighter">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_admin ? (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">Administrator</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">Standard User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-white/30">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase text-white/40 hover:text-white">Profile</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">YouTube Extraction Diags</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Video ID (e.g. OCnKyUUJf6U)</p>
                <div className="flex gap-2">
                  <input 
                    value={diagVideoId}
                    onChange={(e) => setDiagVideoId(e.target.value)}
                    placeholder="Enter ID..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-primary/50 outline-none" 
                  />
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={runDiagnostics}
                    disabled={diagLoading || !diagVideoId}
                    className="bg-primary text-white h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    {diagLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'TEST'}
                  </Button>
                </div>
              </div>

              {diagResult && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in font-mono text-[10px] space-y-2">
                   <p className={diagResult.transcript_status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}>
                     TRANSCRIPT: {diagResult.transcript_status}
                   </p>
                   <p className="text-white/60">TITLE: {diagResult.metadata.title}</p>
                   <div className="h-24 overflow-auto bg-black/40 p-2 rounded border border-white/5 text-white/30 truncate">
                      {JSON.stringify(diagResult.data, null, 2)}
                   </div>
                </div>
              )}

              <p className="text-[9px] text-white/30 leading-relaxed italic">
                Tests extraction bypass using Backend Proxy strategy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">System Security</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-6 rounded-[24px] bg-red-500/5 border border-red-500/10 space-y-4">
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Auth Lockdown</span>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed font-medium">Google OAuth is active. All guest access vectors have been terminated.</p>
                <Button variant="outline" className="w-full text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest h-9">Emergency Reset</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
