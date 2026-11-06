import React, { useState, useEffect, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Upload, 
  X, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  ImageIcon,
  Share2,
  CalendarCheck,
  ShieldCheck,
  Check,
  Pin,
  PinOff
} from 'lucide-react';
import { AdminAnnouncement, AnnouncementStatus, AnnouncementPriority } from '../types';
import { AdminAnnouncementService } from '../services/adminAnnouncementService';
import { AdminAuthService } from '../services/adminAuthService';

const PRESET_COVERS = [
  { label: 'Sunday Worship Service', url: '/images/worship_service_poster.jpg' },
  { label: 'Theology Class 2027', url: '/images/theology_class_poster.png' },
  { label: 'Church Service Banner', url: '/images/church-service-banner.png' },
  { label: 'Beholding Jesus Cross', url: '/images/hero_cross.jpg' }
];

const CATEGORIES = [
  'Sunday Services',
  'Worship Team',
  'Multi Media',
  'Ushering Ministry',
  'Discipleship & Theology',
  'Youth & Campus',
  'Prayer & Fasting',
  'General Church',
  'Special Events'
];

interface AdminAnnouncementManagerProps {
  initialEditItem?: AdminAnnouncement | null;
  onClearInitialEdit?: () => void;
  openCreateOnMount?: boolean;
}

export const AdminAnnouncementManager: React.FC<AdminAnnouncementManagerProps> = ({
  initialEditItem,
  onClearInitialEdit,
  openCreateOnMount = false
}) => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AnnouncementStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<AdminAnnouncement | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>('published');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('normal');
  const [formEventDate, setFormEventDate] = useState('');
  const [formExpirationDate, setFormExpirationDate] = useState('');
  const [formTargetAudience, setFormTargetAudience] = useState('all');
  const [formAuthorName, setFormAuthorName] = useState('Pastor Daniel Santos');
  const [formAuthorRole, setFormAuthorRole] = useState('Senior Pastor');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCustomUrl, setFormCustomUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview target
  const [previewTarget, setPreviewTarget] = useState<AdminAnnouncement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await AdminAnnouncementService.getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (initialEditItem) {
      handleOpenEdit(initialEditItem);
      onClearInitialEdit?.();
    } else if (openCreateOnMount) {
      handleOpenCreate();
    }
  }, [initialEditItem, openCreateOnMount]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Sunday Services');
    setFormDescription('');
    setFormStatus('published');
    setFormPriority('normal');
    setFormEventDate('');
    setFormExpirationDate('');
    setFormTargetAudience('all');
    setFormAuthorName('Pastor Daniel Santos');
    setFormAuthorRole('Senior Pastor');
    setFormImageUrl('');
    setFormCustomUrl('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: AdminAnnouncement) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category || 'General Church');
    setFormDescription(item.description || item.content || '');
    setFormStatus(item.status || 'published');
    setFormPriority(item.priority || 'normal');
    setFormEventDate(item.event_date ? item.event_date.split('T')[0] : '');
    setFormExpirationDate(item.expiration_date ? item.expiration_date.split('T')[0] : '');
    setFormTargetAudience(item.target_audience || 'all');
    setFormAuthorName(item.author_name || 'Pastor Daniel Santos');
    setFormAuthorRole(item.author_role || 'Senior Pastor');
    setFormImageUrl(item.image_url || item.cover_image || '');
    setFormCustomUrl('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await AdminAnnouncementService.uploadCoverPhoto(file);
      setFormImageUrl(url);
    } catch (err: any) {
      setFormError('Failed to upload image: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Announcement title is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Announcement description is required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const activeImageUrl = formCustomUrl.trim() ? formCustomUrl.trim() : formImageUrl;

    try {
      await AdminAnnouncementService.saveAnnouncement({
        id: editingId || undefined,
        title: formTitle.trim(),
        description: formDescription.trim(),
        content: formDescription.trim(),
        category: formCategory,
        status: formStatus,
        priority: formPriority,
        event_date: formEventDate ? new Date(formEventDate).toISOString() : undefined,
        expiration_date: formExpirationDate ? new Date(formExpirationDate).toISOString() : undefined,
        target_audience: formTargetAudience,
        author_name: formAuthorName,
        author_role: formAuthorRole,
        image_url: activeImageUrl || undefined,
        cover_image: activeImageUrl || undefined
      });

      setIsFormModalOpen(false);
      await fetchList();
    } catch (err: any) {
      setFormError('Failed to save announcement: ' + (err?.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: AdminAnnouncement) => {
    const nextStatus: AnnouncementStatus = item.status === 'published' ? 'draft' : 'published';
    await AdminAnnouncementService.saveAnnouncement({
      id: item.id,
      status: nextStatus
    });
    await fetchList();
  };

  const handleTogglePin = async (item: AdminAnnouncement) => {
    const isCurrentlyPinned = item.priority === 'pinned';
    const nextPriority: AnnouncementPriority = isCurrentlyPinned ? 'normal' : 'pinned';
    
    // Optimistic UI update
    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, priority: nextPriority, is_important: !isCurrentlyPinned } : a));

    await AdminAnnouncementService.togglePin(item.id, !isCurrentlyPinned);
    await fetchList();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await AdminAnnouncementService.deleteAnnouncement(deleteCandidate.id);
      setDeleteCandidate(null);
      await fetchList();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const handleOpenPreviewModal = (item: AdminAnnouncement) => {
    setPreviewTarget(item);
    setIsPreviewModalOpen(true);
  };

  // Filtered List
  const filtered = announcements.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ? true : item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">Announcements CMS</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5ECE8] text-[#8C5858] border border-[#EBDCD5]">
              {announcements.length} Total
            </span>
          </div>
          <p className="text-xs text-[#78716E] mt-1">
            Create, schedule, and publish official church broadcasts to the member landing page
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C5858] hover:bg-[#724444] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DBD4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'published', 'draft', 'scheduled'] as const).map((s) => {
            const active = statusFilter === s;
            const count = s === 'all' 
              ? announcements.length 
              : announcements.filter(a => a.status === s).length;

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1F1D1D] text-white shadow-xs'
                    : 'text-[#6B6360] hover:text-[#1F1D1D] hover:bg-[#F8F3F0]'
                }`}
              >
                <span>{s}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-[#F0E6E1] text-[#78716E]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C8380]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] placeholder-[#A09894] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
            />
          </div>
        </div>
      </div>

      {/* Announcements List Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#78716E]">
            <div className="w-6 h-6 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Synchronizing announcements from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Megaphone className="w-10 h-10 text-[#C4B7B0] mx-auto" />
            <div className="text-sm font-semibold text-[#1F1D1D]">No matching announcements found</div>
            <p className="text-xs text-[#78716E] max-w-sm mx-auto">
              Try adjusting your search filters or click below to create a new church announcement.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-[#8C5858] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Create Announcement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EFE6E1]">
            {filtered.map((item) => {
              const isPublished = item.status === 'published';
              const hasCover = !!(item.image_url || item.cover_image);

              return (
                <div 
                  key={item.id} 
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF6F3] transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Cover Thumbnail */}
                    <div 
                      onClick={() => handleOpenPreviewModal(item)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F5ECE8] border border-[#E8DBD4] shrink-0 overflow-hidden cursor-pointer group relative flex items-center justify-center"
                    >
                      {hasCover ? (
                        <>
                          <img 
                            src={item.image_url || item.cover_image} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </>
                      ) : (
                        <Megaphone className="w-7 h-7 text-[#8C5858]/60" />
                      )}
                    </div>

                    {/* Announcement Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'scheduled'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>

                        {/* Category */}
                        <span className="text-[10px] font-semibold text-[#8C5858] bg-[#F5ECE8] px-2 py-0.5 rounded-full border border-[#EBDCD5]">
                          {item.category}
                        </span>

                        {/* Priority */}
                        {item.priority === 'pinned' && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            ★ Pinned Hero
                          </span>
                        )}

                        {/* Event Date badge if present */}
                        {item.event_date && (
                          <span className="text-[10px] font-medium text-[#5C5654] bg-white px-2 py-0.5 rounded-full border border-[#E8DBD4] flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-[#8C5858]" />
                            {new Date(item.event_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#1F1D1D] leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#6B6360] line-clamp-2 leading-relaxed">
                        {item.description || item.content}
                      </p>

                      <div className="text-[11px] text-[#8C8380] flex items-center gap-3 pt-1">
                        <span>By <strong>{item.author_name}</strong> ({item.author_role})</span>
                        <span>&bull;</span>
                        <span>Audience: <strong className="capitalize">{item.target_audience}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#F5ECE8] w-full md:w-auto justify-end">
                    {/* 1-Click Pin / Unpin Button */}
                    <button
                      onClick={() => handleTogglePin(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        item.priority === 'pinned'
                          ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-xs'
                          : 'bg-white hover:bg-[#F8F3F0] text-[#5C5654] border-[#E8DBD4]'
                      }`}
                      title={item.priority === 'pinned' ? 'Unpin from Member Hero' : 'Pin to Member Hero (Top)'}
                    >
                      {item.priority === 'pinned' ? (
                        <>
                          <PinOff className="w-3.5 h-3.5 text-purple-700" />
                          <span>Unpin</span>
                        </>
                      ) : (
                        <>
                          <Pin className="w-3.5 h-3.5 text-[#78716E]" />
                          <span>Pin Hero</span>
                        </>
                      )}
                    </button>

                    {/* Fast Status Toggle */}
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isPublished
                          ? 'bg-white hover:bg-amber-50 text-[#78716E] hover:text-amber-700 border-[#E8DBD4]'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                      }`}
                      title={isPublished ? 'Unpublish to Draft' : 'Publish live to member app'}
                    >
                      {isPublished ? 'Set to Draft' : 'Publish Live'}
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => handleOpenPreviewModal(item)}
                      className="p-2 rounded-lg text-[#5C5654] hover:text-[#1F1D1D] hover:bg-[#EBDCD5]/40 border border-[#E8DBD4] transition-colors"
                      title="Preview how members see this"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-[#5C5654] hover:text-[#1F1D1D] hover:bg-[#EBDCD5]/40 border border-[#E8DBD4] transition-colors"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteCandidate(item)}
                      className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8DBD4] shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#FAF6F3] border-b border-[#E8DBD4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#8C5858] text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1F1D1D]">
                    {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                  </h3>
                  <p className="text-[11px] text-[#78716E]">
                    Saves to Supabase <code className="text-[#8C5858]">church_announcements</code> and updates landing page
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-[#78716E] hover:text-[#1F1D1D] hover:bg-[#EBDCD5]/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Sunday Worship Service & Expository Teaching"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-sm text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 font-medium"
                />
              </div>

              {/* Category, Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AnnouncementStatus)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 font-semibold"
                  >
                    <option value="published">Published (Live to members)</option>
                    <option value="draft">Draft (Hidden from members)</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Display Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Importance</option>
                    <option value="pinned">Pinned (Hero Section)</option>
                  </select>
                </div>
              </div>

              {/* Event Date & Expiration Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8C5858]" />
                    <span>Event Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8C5858]" />
                    <span>Expiration Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formExpirationDate}
                    onChange={(e) => setFormExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30"
                  />
                </div>
              </div>

              {/* Description / Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                  Announcement Description / Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the announcement, service times, location, scripture theme, or ministry instructions..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs sm:text-sm text-[#1F1D1D] focus:outline-none focus:ring-2 focus:ring-[#8C5858]/30 leading-relaxed"
                />
              </div>

              {/* Cover Photo Upload & Presets */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#FAF6F3] border border-[#EBDCD5]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4A4543] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8C5858]" />
                    <span>Cover Photo / Poster</span>
                  </label>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => { setFormImageUrl(''); setFormCustomUrl(''); }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Upload or Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD0C8] hover:border-[#8C5858] text-xs font-semibold text-[#1F1D1D] flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#8C5858]" />
                        <span>Upload Custom Photo</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-[#8C8380]">or choose preset:</span>

                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormImageUrl(preset.url)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                        formImageUrl === preset.url
                          ? 'bg-[#8C5858] text-white border-[#8C5858]'
                          : 'bg-white text-[#5C5654] border-[#E8DBD4] hover:bg-[#F8F3F0]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Preview Thumbnail in form */}
                {formImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-[#E8DBD4] h-36 bg-black/5 flex items-center justify-center">
                    <img 
                      src={formImageUrl} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
                      Active Cover Photo
                    </div>
                  </div>
                )}
              </div>

              {/* Author Info & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A4543] mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={formTargetAudience}
                    onChange={(e) => setFormTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#DDD0C8] rounded-xl text-xs text-[#1F1D1D]"
                  >
                    <option value="all">All Church Members</option>
                    <option value="worship">Worship Ministry Only</option>
                    <option value="multimedia">Multi Media Team</option>
                    <option value="ushering">Ushering Team</option>
                    <option value="youth">Youth & Campus</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E8DBD4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DDD0C8] text-xs font-semibold text-[#5C5654] hover:bg-[#F8F3F0]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#8C5858] hover:bg-[#724444] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{formStatus === 'published' ? 'Publish Announcement' : 'Save Announcement'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL (Shows exact landing page card view) */}
      {isPreviewModalOpen && previewTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8DBD4] shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-3.5 bg-[#FAF6F3] border-b border-[#E8DBD4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C5858]" />
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#1F1D1D]">
                  Member App Landing Page Preview
                </span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-[#78716E] hover:text-[#1F1D1D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Card */}
            <div className="p-6 bg-[#F8F3F0]">
              <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-lg overflow-hidden">
                {/* Cover Image */}
                {(previewTarget.image_url || previewTarget.cover_image) ? (
                  <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                    <img 
                      src={previewTarget.image_url || previewTarget.cover_image} 
                      alt={previewTarget.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#8C5858]">
                        {previewTarget.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-r from-[#8C5858] to-[#5F3A3A] p-4 flex items-center text-white">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                      {previewTarget.category}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  {previewTarget.event_date && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C5858]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(previewTarget.event_date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}

                  <h3 className="font-serif font-bold text-lg text-[#1F1D1D] leading-snug">
                    {previewTarget.title}
                  </h3>

                  <p className="text-xs text-[#5C5654] leading-relaxed whitespace-pre-line">
                    {previewTarget.description || previewTarget.content}
                  </p>

                  <div className="pt-3 border-t border-[#F5ECE8] flex items-center justify-between text-xs text-[#8C8380]">
                    <span>{previewTarget.author_name} &bull; {previewTarget.author_role}</span>
                    <span className="capitalize">{previewTarget.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-[#FAF6F3] border-t border-[#E8DBD4] flex items-center justify-between text-xs text-[#78716E]">
              <span>This is how regular members see your post.</span>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#1F1D1D] text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8DBD4] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#1F1D1D]">Delete Announcement?</h3>
              <p className="text-xs text-[#6B6360]">
                Are you sure you want to permanently delete:
              </p>
              <p className="text-xs font-semibold text-[#1F1D1D] px-2 py-1 bg-[#FAF6F3] rounded-lg mt-2 truncate">
                "{deleteCandidate.title}"
              </p>
              <p className="text-[11px] text-[#8C8380] pt-1">
                This will remove the announcement from Supabase and the church member landing page.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl border border-[#DDD0C8] text-xs font-semibold text-[#5C5654] hover:bg-[#F8F3F0]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
