import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, Calendar, Sparkles, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MemberRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  role_title?: string;
  avatar?: string;
  created_at?: string;
}

export const AdminMembersView: React.FC = () => {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('church_members_auth')
          .select('id, name, username, email, role, role_title, avatar, created_at')
          .order('created_at', { ascending: false });

        if (data && !error) {
          setMembers(data as MemberRow[]);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error fetching members from Supabase:', err);
      }
    }

    // Local fallback if table offline
    setMembers([
      {
        id: 'usr-owner-001',
        name: 'John Miko Sarsalijo',
        username: 'johnmiko',
        email: 'johnmiko@beholdingjesus.org',
        role: 'super_admin',
        role_title: 'App Owner & Finance Manager',
        avatar: '/images/avatar-john-miko.png',
        created_at: '2026-11-01T00:00:00Z'
      },
      {
        id: 'usr-pastor-001',
        name: 'Pastor Daniel Santos',
        username: 'pastordaniel',
        email: 'pastor@beholdingjesus.org',
        role: 'ministry_leader',
        role_title: 'Senior Pastor',
        avatar: '',
        created_at: '2026-11-01T00:00:00Z'
      }
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role_title && m.role_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">Registered Members Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5ECE8] text-[#8C5858] border border-[#EBDCD5]">
              {members.length} Total
            </span>
          </div>
          <p className="text-xs text-[#78716E] mt-1">
            Accounts stored securely in Supabase <code className="text-[#8C5858]">church_members_auth</code>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8380]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] placeholder-[#A09894] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 shadow-2xs"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#78716E]">
            <div className="w-6 h-6 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading member directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716E]">
            No members found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F3] border-b border-[#E8DBD4] text-[#78716E] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Username & Contact</th>
                  <th className="py-3 px-4">Role & Ministry</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE6E1]">
                {filtered.map((member) => {
                  const isSuperAdmin = member.role === 'super_admin';

                  return (
                    <tr key={member.id} className="hover:bg-[#FAF6F3]/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F5ECE8] border border-[#E8DBD4] flex items-center justify-center font-bold text-xs text-[#8C5858] overflow-hidden shrink-0">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#1F1D1D] flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isSuperAdmin && (
                                <span className="p-0.5 rounded-full bg-[#8C5858] text-white" title="Designated Super Admin">
                                  <ShieldCheck className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#78716E]">ID: {member.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Username & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1F1D1D]">@{member.username}</div>
                        <div className="text-[11px] text-[#78716E] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#8C5858]" />
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1F1D1D]">
                          {member.role_title || 'Church Member'}
                        </div>
                        <div className="text-[11px] text-[#8C8380] capitalize">
                          {member.role.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Access Level Badge */}
                      <td className="py-3.5 px-4">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8C5858]/10 text-[#8C5858] border border-[#8C5858]/20">
                            <ShieldCheck className="w-3 h-3" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F5ECE8] text-[#5C5654] border border-[#E8DBD4]">
                            <UserCheck className="w-3 h-3" />
                            Member Access
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#78716E]">
                        {member.created_at ? new Date(member.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 2026'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
