import React, { useState, useEffect } from 'react';
import { FileText, Shield, Search, Filter, RefreshCw, Calendar, Clock, Sparkles } from 'lucide-react';
import { AdminAuditLog } from '../types';
import { AdminAnnouncementService } from '../services/adminAnnouncementService';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await AdminAnnouncementService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performed_by_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">Administrative Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5ECE8] text-[#8C5858] border border-[#EBDCD5]">
              {logs.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-[#78716E] mt-1">
            Immutable log of announcements created, published, modified, and deleted by Super Admin
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DDD0C8] hover:bg-[#FAF7F5] text-xs font-semibold text-[#1F1D1D] shadow-2xs self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8C5858] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DBD4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Action Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'CREATE_ANNOUNCEMENT', 'EDIT_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'LOGIN'].map((act) => {
            const active = actionFilter === act;
            const label = act === 'all' ? 'All Activities' : act.replace('_ANNOUNCEMENT', '').replace('_', ' ');
            return (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize ${
                  active
                    ? 'bg-[#1F1D1D] text-white shadow-xs'
                    : 'text-[#6B6360] hover:bg-[#F8F3F0]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8380]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit events..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] placeholder-[#A09894] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#78716E]">
            <div className="w-6 h-6 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading audit events...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716E]">
            No audit records found matching your filters.
          </div>
        ) : (
          <div className="divide-y divide-[#EFE6E1]">
            {filtered.map((log) => {
              const dateStr = new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              const actionColor = 
                log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-200' :
                log.action.includes('PUBLISH') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                log.action.includes('EDIT') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF6F3] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${actionColor}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-medium text-[#78716E]">
                        Entity: <code className="bg-[#FAF7F5] px-1 py-0.5 rounded text-[#1F1D1D]">{log.entity_type}</code>
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#1F1D1D] pt-0.5">
                      {log.details}
                    </p>

                    <div className="text-[11px] text-[#8C8380]">
                      Performed by <strong className="text-[#1F1D1D]">{log.performed_by_name}</strong> (ID: {log.performed_by})
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-[#78716E] shrink-0 self-start sm:self-center">
                    <div className="font-medium text-[#1F1D1D]">{dateStr}</div>
                    <div className="text-[#8C8380]">{timeStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
