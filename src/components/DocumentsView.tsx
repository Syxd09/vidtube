import React from 'react';
import { FileText, Download, Search, Clock, ChevronRight, FileJson, FileCode } from 'lucide-react';
import type { SummaryData } from '@/lib/youtube';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface DocumentsViewProps {
  summaries: SummaryData[];
  onSelect: (s: SummaryData) => void;
}

export function DocumentsView({ summaries, onSelect }: DocumentsViewProps) {
  const [query, setQuery] = React.useState('');

  const filtered = summaries.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) || 
    s.author_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleExport = (type: string, summary: SummaryData) => {
    let content = '';
    let fileName = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

    if (type === 'md') {
      content = `# ${summary.title}\n\n` +
                `**Author**: ${summary.author_name}\n` +
                `**Video ID**: ${summary.video_id}\n` +
                `**Date**: ${new Date(summary.created_at || '').toLocaleDateString()}\n\n` +
                `## Overview\n${summary.overview || 'No overview available.'}\n\n` +
                `## Strategic Summary\n${summary.summary}\n\n` +
                `## Key Strategic Insights\n` +
                (summary.key_points ? summary.key_points.map(kp => `- ${kp}`).join('\n') : 'No key points available.');
      fileName += '.md';
    } else {
      content = JSON.stringify(summary, null, 2);
      fileName += '.json';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Successfully exported ${summary.title} as ${type.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col min-h-full p-8 animate-fade-up">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Knowledge Base</h2>
            <h1 className="text-4xl font-black text-white tracking-tighter">Documents</h1>
          </div>
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Filter documents..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-semibold text-white placeholder:text-white/20 outline-none focus:border-primary/30 transition-all"
            />
          </div>
        </header>

        <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <FileText className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <p className="text-xl font-bold text-white/20 uppercase tracking-widest">No documents found</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-white/20 uppercase tracking-widest">Document Title</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-white/20 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-white/20 uppercase tracking-widest">Last Modified</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onSelect(s)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all">
                          <FileText className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{s.title}</span>
                          <span className="text-[10px] font-medium text-white/20 uppercase tracking-tight">{s.author_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-primary/60 px-2 py-1 rounded-lg bg-primary/5 uppercase tracking-tighter">
                        {s.tags?.[0] || 'General'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-white/30">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleExport('md', s); }} className="h-8 w-8 hover:bg-white/10 text-white/40">
                          <FileCode className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleExport('json', s); }} className="h-8 w-8 hover:bg-white/10 text-white/40">
                          <FileJson className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
